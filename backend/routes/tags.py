"""
Tag management endpoints for task organization.

Reference: contracts/tag-management-endpoints.md
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlmodel import Session, select, and_

from database import get_session
from lib.errors import ForbiddenError, NotFoundError, ValidationError
from models import Tag, TaskTag, User
from routes.auth import verify_jwt

router = APIRouter()


# =============================================================================
# Pydantic Schemas
# =============================================================================

class TagDetail(BaseModel):
    """Full tag details for tag list responses."""
    id: str
    name: str
    color: Optional[str] = None
    created_at: str  # ISO 8601 datetime
    task_count: Optional[int] = None  # Only included if with_counts=true


class TagResponse(BaseModel):
    """Single tag response."""
    id: str
    name: str
    color: Optional[str] = None
    created_at: str  # ISO 8601 datetime


class CreateTagRequest(BaseModel):
    """Tag creation request."""
    name: str = Field(..., min_length=1, max_length=50, description="Tag name (1-50 chars)")
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$", description="Hex color code (#XXXXXX)")


class UpdateTagRequest(BaseModel):
    """Tag update request."""
    name: Optional[str] = Field(None, min_length=1, max_length=50)
    color: Optional[str] = Field(None, pattern=r"^#[0-9A-Fa-f]{6}$", description="Hex color code or null to remove")


# =============================================================================
# Helper Functions
# =============================================================================

def verify_user_access(user_id: str, current_user: User) -> None:
    """Verify that JWT user matches path user_id."""
    if str(current_user.id) != user_id:
        raise ForbiddenError("Cannot access other user's tags")


def tag_to_detail(tag: Tag, session: Session, include_count: bool = False) -> TagDetail:
    """Convert Tag model to detail response."""
    task_count = None
    if include_count:
        task_count = session.exec(
            select(TaskTag).where(TaskTag.tag_id == tag.id)
        ).count()

    return TagDetail(
        id=str(tag.id),
        name=tag.name,
        color=tag.color,
        created_at=tag.created_at.isoformat(),
        task_count=task_count,
    )


def tag_to_response(tag: Tag) -> TagResponse:
    """Convert Tag model to basic response."""
    return TagResponse(
        id=str(tag.id),
        name=tag.name,
        color=tag.color,
        created_at=tag.created_at.isoformat(),
    )


# =============================================================================
# List Tags Endpoint
# =============================================================================

@router.get("/{user_id}/tags")
async def list_tags(
    user_id: str,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
    with_counts: bool = Query(False, description="Include task count for each tag"),
    q: Optional[str] = Query(None, description="Search prefix for autocomplete"),
) -> dict:
    """
    Get all tags for a user, optionally with task counts.

    Functional Requirements: FR-002, FR-003
    """
    verify_user_access(user_id, current_user)
    user_uuid = UUID(user_id)

    # Build query
    query = select(Tag).where(Tag.user_id == user_uuid)

    # Apply autocomplete filter
    if q:
        query = query.where(Tag.name.ilike(f"{q}%"))

    # Apply sorting
    query = query.order_by(Tag.name.asc())

    # Execute
    tags = session.exec(query).all()

    # Convert to responses
    tag_details = [tag_to_detail(tag, session, with_counts) for tag in tags]

    return {"tags": tag_details}


# =============================================================================
# Create Tag Endpoint
# =============================================================================

@router.post("/{user_id}/tags", response_model=TagResponse, status_code=201)
async def create_tag(
    user_id: str,
    data: CreateTagRequest,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
) -> TagResponse:
    """
    Create a new tag.

    Functional Requirements: FR-002, FR-003
    """
    verify_user_access(user_id, current_user)
    user_uuid = UUID(user_id)

    # Validate and normalize name
    name = data.name.strip()
    if len(name) < 1:
        raise ValidationError("Tag name cannot be empty")

    if len(name) > 50:
        raise ValidationError("Tag name must be 50 characters or less")

    # Check for duplicate (case-insensitive)
    existing = session.exec(
        select(Tag).where(Tag.user_id == user_uuid, Tag.name.ilike(name))
    ).first()

    if existing:
        raise ValidationError(f"Tag '{name}' already exists")

    # Create tag using dict to avoid Pydantic v2 default_factory issues
    tag_dict = {
        "user_id": user_uuid,
        "name": name,
        "color": data.color,
    }
    tag = Tag.model_validate(tag_dict)

    session.add(tag)
    session.commit()
    session.refresh(tag)

    return tag_to_response(tag)


# =============================================================================
# Get Single Tag Endpoint
# =============================================================================

@router.get("/{user_id}/tags/{tag_id}", response_model=TagResponse)
async def get_tag(
    user_id: str,
    tag_id: str,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
) -> TagResponse:
    """
    Get a specific tag by ID.

    Functional Requirements: FR-003
    """
    verify_user_access(user_id, current_user)

    tag = session.exec(
        select(Tag).where(Tag.id == UUID(tag_id), Tag.user_id == UUID(user_id))
    ).first()

    if not tag:
        raise NotFoundError("Tag not found")

    return tag_to_response(tag)


# =============================================================================
# Update Tag Endpoint
# =============================================================================

@router.put("/{user_id}/tags/{tag_id}", response_model=TagResponse)
async def update_tag(
    user_id: str,
    tag_id: str,
    data: UpdateTagRequest,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
) -> TagResponse:
    """
    Update a tag's name and/or color.

    Functional Requirements: FR-003
    """
    verify_user_access(user_id, current_user)
    user_uuid = UUID(user_id)

    tag = session.exec(
        select(Tag).where(Tag.id == UUID(tag_id), Tag.user_id == user_uuid)
    ).first()

    if not tag:
        raise NotFoundError("Tag not found")

    # Update name if provided
    if data.name is not None:
        name = data.name.strip()
        if len(name) < 1:
            raise ValidationError("Tag name cannot be empty")

        if len(name) > 50:
            raise ValidationError("Tag name must be 50 characters or less")

        # Check for duplicate (case-insensitive)
        existing = session.exec(
            select(Tag).where(
                Tag.user_id == user_uuid,
                Tag.name.ilike(name),
                Tag.id != tag.id  # Exclude current tag
            )
        ).first()

        if existing:
            raise ValidationError(f"Tag '{name}' already exists")

        tag.name = name

    # Update color if provided
    if data.color is not None:
        tag.color = data.color

    session.add(tag)
    session.commit()
    session.refresh(tag)

    return tag_to_response(tag)


# =============================================================================
# Delete Tag Endpoint
# =============================================================================

@router.delete("/{user_id}/tags/{tag_id}", status_code=204)
async def delete_tag(
    user_id: str,
    tag_id: str,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
) -> None:
    """
    Delete a tag and remove it from all associated tasks.

    Functional Requirements: FR-003
    """
    verify_user_access(user_id, current_user)

    tag = session.exec(
        select(Tag).where(Tag.id == UUID(tag_id), Tag.user_id == UUID(user_id))
    ).first()

    if not tag:
        raise NotFoundError("Tag not found")

    # Delete from database (cascades to task_tags via foreign key)
    session.delete(tag)
    session.commit()


# =============================================================================
# Add Tag to Task Endpoint
# =============================================================================

@router.post("/{user_id}/tags/{tag_id}/tasks/{task_id}", status_code=204)
async def add_tag_to_task(
    user_id: str,
    tag_id: str,
    task_id: str,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
) -> None:
    """
    Add a tag to a task.

    Functional Requirements: FR-002
    """
    verify_user_access(user_id, current_user)

    # Verify tag exists and belongs to user
    tag = session.exec(
        select(Tag).where(Tag.id == UUID(tag_id), Tag.user_id == UUID(user_id))
    ).first()

    if not tag:
        raise NotFoundError("Tag not found")

    # Verify task exists and belongs to user
    from models import Task
    task = session.exec(
        select(Task).where(Task.id == UUID(task_id), Task.user_id == UUID(user_id))
    ).first()

    if not task:
        raise NotFoundError("Task not found")

    # Check if tag is already on task
    existing = session.exec(
        select(TaskTag).where(
            TaskTag.task_id == UUID(task_id),
            TaskTag.tag_id == UUID(tag_id)
        )
    ).first()

    if existing:
        raise ValidationError("Task already has this tag")

    # Check tag limit (10 tags per task)
    tag_count = session.exec(
        select(TaskTag).where(TaskTag.task_id == UUID(task_id))
    ).count()

    if tag_count >= 10:
        raise ValidationError("Task already has maximum 10 tags")

    # Create association
    task_tag = TaskTag(task_id=UUID(task_id), tag_id=UUID(tag_id))
    session.add(task_tag)
    session.commit()


# =============================================================================
# Remove Tag from Task Endpoint
# =============================================================================

@router.delete("/{user_id}/tags/{tag_id}/tasks/{task_id}", status_code=204)
async def remove_tag_from_task(
    user_id: str,
    tag_id: str,
    task_id: str,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
) -> None:
    """
    Remove a tag from a task.

    Functional Requirements: FR-002
    """
    verify_user_access(user_id, current_user)

    # Verify tag exists and belongs to user
    tag = session.exec(
        select(Tag).where(Tag.id == UUID(tag_id), Tag.user_id == UUID(user_id))
    ).first()

    if not tag:
        raise NotFoundError("Tag not found")

    # Verify task exists and belongs to user
    from models import Task
    task = session.exec(
        select(Task).where(Task.id == UUID(task_id), Task.user_id == UUID(user_id))
    ).first()

    if not task:
        raise NotFoundError("Task not found")

    # Find and delete the association
    task_tag = session.exec(
        select(TaskTag).where(
            TaskTag.task_id == UUID(task_id),
            TaskTag.tag_id == UUID(tag_id)
        )
    ).first()

    if not task_tag:
        raise NotFoundError("Task does not have this tag")

    session.delete(task_tag)
    session.commit()
