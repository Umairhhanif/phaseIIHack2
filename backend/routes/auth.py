"""
Authentication routes and JWT verification dependency.

Provides verify_jwt FastAPI dependency for protected endpoints.
"""

from typing import Optional

import jwt
from fastapi import Depends, Header
from sqlmodel import Session, select

from database import get_session
from lib.auth import extract_token_from_header, verify_jwt_token
from lib.errors import UnauthorizedError
from models import User


async def verify_jwt(
    authorization: Optional[str] = Header(None),
    session: Session = Depends(get_session),
) -> User:
    """
    FastAPI dependency to verify JWT token and return authenticated user.

    Args:
        authorization: Authorization header (Bearer <token>)
        session: Database session

    Returns:
        User: Authenticated user object

    Raises:
        UnauthorizedError: If token is missing, invalid, or expired

    Example:
        @app.get("/api/{user_id}/tasks")
        async def get_tasks(
            user_id: str,
            current_user: User = Depends(verify_jwt)
        ):
            if current_user.id != user_id:
                raise ForbiddenError("Cannot access other user's tasks")
            # ... fetch tasks
    """
    # Extract token from Authorization header
    token = extract_token_from_header(authorization)
    if not token:
        raise UnauthorizedError("Missing or invalid Authorization header")

    # Verify token signature and expiry
    try:
        payload = verify_jwt_token(token)
    except jwt.ExpiredSignatureError:
        raise UnauthorizedError("Token has expired")
    except jwt.InvalidTokenError:
        raise UnauthorizedError("Invalid token")

    # Fetch user from database
    user_id = payload.get("user_id")
    if not user_id:
        raise UnauthorizedError("Invalid token payload")

    user = session.exec(select(User).where(User.id == user_id)).first()
    if not user:
        raise UnauthorizedError("User not found")

    return user
