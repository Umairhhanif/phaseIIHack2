"""
Chat endpoints for AI chatbot integration.

Provides POST /api/{user_id}/chat endpoint for conversational task management.
"""

import json
import os
import uuid
from datetime import datetime
from typing import List, Optional

from fastapi import APIRouter, Depends, Header, HTTPException, status
from pydantic import BaseModel, Field
from sqlmodel import Session, select

from database import get_session
from lib.auth import extract_token_from_header, verify_jwt_token
from models import Conversation, Message, MessageRole, User
from services.cohere import CohereClient
from mcp.tools import (
    add_task,
    complete_task,
    delete_task,
    find_task_by_title,
    get_current_user,
    list_tasks,
    update_task,
)


router = APIRouter()


class ChatRequest(BaseModel):
    """Chat API request payload."""

    message: str = Field(..., min_length=1, max_length=2000, description="User message")
    conversation_id: Optional[str] = Field(None, description="Existing conversation ID to resume")


class ChatResponse(BaseModel):
    """Chat API response."""

    conversation_id: str
    assistant_message: str
    tool_calls: List[dict] = []


def get_jwt_payload(authorization: str = Header(None)) -> dict:
    """
    Extract and verify JWT token from Authorization header.

    Args:
        authorization: Authorization header value

    Returns:
        Decoded JWT payload

    Raises:
        HTTPException: If token is invalid or missing
    """
    if not authorization:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Missing authorization header",
        )

    token = extract_token_from_header(authorization)
    if not token:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid authorization header format",
        )

    try:
        payload = verify_jwt_token(token)
        return payload
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Invalid token: {str(e)}",
        )


def tool_executor_wrapper(session: Session, user_id: uuid.UUID, user_email: str):
    """
    Create a tool executor function with session and user context.

    Args:
        session: Database session
        user_id: User ID from JWT
        user_email: User email from JWT

    Returns:
        Function that executes tool calls
    """

    def execute_tool(tool_name: str, params: dict) -> dict:
        """Execute a tool call with the given parameters."""
        print(f"Executing tool: {tool_name} with params: {params}")
        
        # Debug log
        try:
            with open("debug_log.txt", "a") as f:
                f.write(f"DEBUG: execute_tool {tool_name} params: {params}\n")
        except Exception:
            pass

        # Map tool names to functions
        tool_map = {
            "list_tasks": lambda: list_tasks(session, user_id, params.get("status"), params.get("tag")),
            "add_task": lambda: add_task(
                session,
                title=params.get("title") or params.get("task_title") or "Untitled Task",
                user_id=user_id,
                description=params.get("description"),
                priority=params.get("priority"),
                due_date=params.get("due_date"),
                tags=params.get("tags"),
            ),
            "complete_task": lambda: complete_task(session, params.get("task_id", ""), user_id),
            "delete_task": lambda: delete_task(session, params.get("task_id", ""), user_id),
            "update_task": lambda: update_task(session, params.get("task_id", ""), user_id, params),
            "get_current_user": lambda: get_current_user(user_id, user_email),
            "find_task_by_title": lambda: find_task_by_title(session, params.get("title", ""), user_id),
        }

        tool_func = tool_map.get(tool_name)
        if tool_func:
            return tool_func()
        else:
            return {"success": False, "error": f"Unknown tool: {tool_name}"}

    return execute_tool


@router.post("/api/{user_id}/chat", response_model=ChatResponse)
async def chat(
    user_id: str,
    request: ChatRequest,
    authorization: dict = Depends(get_jwt_payload),
    session: Session = Depends(get_session),
):
    """
    Chat endpoint for AI task management.

    Args:
        user_id: User ID from URL path
        request: Chat request with message and optional conversation_id
        authorization: JWT payload (extracted from header)
        session: Database session

    Returns:
        ChatResponse with conversation_id, assistant_message, and tool_calls

    Raises:
        HTTPException: For authorization or data errors
    """
    # Extract user info from JWT
    jwt_user_id = authorization.get("user_id")
    jwt_user_email = authorization.get("email")

    # Validate URL user_id matches JWT user_id (prevent cross-user access)
    if jwt_user_id != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch. You can only access your own data.",
        )

    # Parse user_id as UUID
    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )

    # Verify user exists
    user = session.exec(select(User).where(User.id == user_uuid)).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found",
        )

    # Get or create conversation
    conversation_id_str = request.conversation_id
    conversation_uuid: uuid.UUID

    if conversation_id_str:
        # Validate conversation belongs to user
        try:
            conversation_uuid = uuid.UUID(conversation_id_str)
            conversation = session.exec(
                select(Conversation)
                .where(Conversation.id == conversation_uuid)
                .where(Conversation.user_id == user_uuid)
            ).first()

            if not conversation:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Conversation not found",
                )
        except ValueError:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Invalid conversation ID format",
            )
    else:
        # Create new conversation using dict to avoid Pydantic v2 default_factory issues
        conversation_dict = {
            "user_id": user_uuid,
            "title": request.message[:50] if len(request.message) > 50 else request.message,
        }
        conversation = Conversation.model_validate(conversation_dict)
        session.add(conversation)
        session.commit()
        session.refresh(conversation)
        conversation_uuid = conversation.id

    # Load conversation history
    history_messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_uuid)
        .where(Message.user_id == user_uuid)
        .order_by(Message.created_at.asc())
    ).all()

    # Build history for AI
    history = [
        {"role": msg.role.value, "content": msg.content}
        for msg in history_messages[-20:]  # Limit to last 20 messages
    ]

    # Save user message using dict to avoid Pydantic v2 default_factory issues
    user_message_dict = {
        "conversation_id": conversation_uuid,
        "user_id": user_uuid,
        "role": MessageRole.USER,
        "content": request.message,
    }
    user_message = Message.model_validate(user_message_dict)
    session.add(user_message)

    # Initialize Cohere client and execute reasoning loop
    try:
        cohere_client = CohereClient()
        tool_executor = tool_executor_wrapper(session, user_uuid, jwt_user_email)

        assistant_message, tool_calls = cohere_client.chat(
            user_message=request.message,
            history=history,
            user_id=user_id,
            email=jwt_user_email,
            tool_executor=tool_executor,
        )

        # Save assistant response using dict to avoid Pydantic v2 default_factory issues
        assistant_msg_dict = {
            "conversation_id": conversation_uuid,
            "user_id": user_uuid,
            "role": MessageRole.ASSISTANT,
            "content": assistant_message,
            "tool_calls": json.dumps(tool_calls) if tool_calls else None,
        }
        assistant_msg = Message.model_validate(assistant_msg_dict)
        session.add(assistant_msg)

        # Update conversation timestamp
        conversation.updated_at = datetime.utcnow()
        session.commit()

        return ChatResponse(
            conversation_id=str(conversation_uuid),
            assistant_message=assistant_message,
            tool_calls=tool_calls,
        )

    except ValueError as e:
        # COHERE_API_KEY not configured
        session.rollback()
        return ChatResponse(
            conversation_id=str(conversation_uuid),
            assistant_message="AI chatbot is not configured. Please set COHERE_API_KEY in environment.",
            tool_calls=[],
        )
    except Exception as e:
        session.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Chat processing error: {str(e)}",
        )


@router.get("/api/{user_id}/conversations")
async def list_conversations(
    user_id: str,
    authorization: dict = Depends(get_jwt_payload),
    session: Session = Depends(get_session),
):
    """
    List all conversations for a user.

    Args:
        user_id: User ID from URL path
        authorization: JWT payload
        session: Database session

    Returns:
        List of conversations ordered by updated_at desc
    """
    # Validate user_id matches JWT
    if authorization.get("user_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch",
        )

    try:
        user_uuid = uuid.UUID(user_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid user ID format",
        )

    conversations = session.exec(
        select(Conversation)
        .where(Conversation.user_id == user_uuid)
        .order_by(Conversation.updated_at.desc())
    ).all()

    return {
        "conversations": [
            {
                "id": str(conv.id),
                "title": conv.title,
                "created_at": conv.created_at.isoformat(),
                "updated_at": conv.updated_at.isoformat(),
            }
            for conv in conversations
        ],
        "total": len(conversations),
    }


@router.get("/api/{user_id}/conversations/{conversation_id}/messages")
async def get_conversation_messages(
    user_id: str,
    conversation_id: str,
    authorization: dict = Depends(get_jwt_payload),
    session: Session = Depends(get_session),
):
    """
    Get all messages in a conversation.

    Args:
        user_id: User ID from URL path
        conversation_id: Conversation ID from URL path
        authorization: JWT payload
        session: Database session

    Returns:
        List of messages ordered by created_at asc
    """
    # Validate user_id matches JWT
    if authorization.get("user_id") != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="User ID mismatch",
        )

    try:
        user_uuid = uuid.UUID(user_id)
        conv_uuid = uuid.UUID(conversation_id)
    except ValueError:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid ID format",
        )

    # Validate conversation exists and belongs to user
    conversation = session.exec(
        select(Conversation)
        .where(Conversation.id == conv_uuid)
        .where(Conversation.user_id == user_uuid)
    ).first()

    if not conversation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Conversation not found",
        )

    # Get messages
    messages = session.exec(
        select(Message)
        .where(Message.conversation_id == conversation_id)
        .where(Message.user_id == user_uuid)
        .order_by(Message.created_at.asc())
    ).all()

    return {
        "messages": [
            {
                "id": str(msg.id),
                "role": msg.role.value,
                "content": msg.content,
                "created_at": msg.created_at.isoformat(),
            }
            for msg in messages
        ],
        "total": len(messages),
    }
