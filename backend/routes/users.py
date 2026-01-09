"""
User registration and authentication endpoints.

Reference: contracts/auth-endpoints.md
"""

import bcrypt
from fastapi import APIRouter, Depends
from pydantic import BaseModel, EmailStr, Field
from sqlmodel import Session, func, select

from database import get_session
from lib.auth import create_jwt_token
from lib.errors import BadRequestError, UnauthorizedError, ValidationError
from models import User
from routes.auth import verify_jwt

router = APIRouter()


# Request/Response Models
class SignupRequest(BaseModel):
    """User registration request payload."""

    email: EmailStr = Field(..., description="User email address")
    password: str = Field(..., min_length=8, description="Password (min 8 characters)")
    name: str = Field(..., min_length=1, max_length=255, description="User display name")


class SigninRequest(BaseModel):
    """User sign-in request payload."""

    email: EmailStr
    password: str


class AuthResponse(BaseModel):
    """Authentication response with JWT token."""

    token: str
    user: dict  # User without password_hash


# Helper Functions
def hash_password(password: str) -> str:
    """Hash password using bcrypt with cost factor 12."""
    salt = bcrypt.gensalt(rounds=12)
    hashed = bcrypt.hashpw(password.encode("utf-8"), salt)
    return hashed.decode("utf-8")


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """Verify password against bcrypt hash."""
    return bcrypt.checkpw(plain_password.encode("utf-8"), hashed_password.encode("utf-8"))


def user_to_dict(user: User) -> dict:
    """Convert User to dict, excluding password_hash."""
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "created_at": user.created_at.isoformat(),
        "updated_at": user.updated_at.isoformat(),
    }


# Endpoints
@router.post("/signup", response_model=AuthResponse, status_code=201)
async def signup(
    data: SignupRequest, session: Session = Depends(get_session)
) -> AuthResponse:
    """
    Register new user account.

    Functional Requirements: FR-001, FR-002
    Security: Passwords hashed with bcrypt, emails stored lowercase
    """
    # Validate email format
    try:
        EmailStr._validate(data.email)
    except Exception:
        raise ValidationError("Invalid email format")

    # Check for existing user (case-insensitive email)
    existing = session.exec(
        select(User).where(User.email == data.email.lower())
    ).first()

    if existing:
        raise ValidationError("Email already registered")

    # Hash password
    password_hash = hash_password(data.password)

    # Create user using dict to avoid Pydantic v2 default_factory issues
    user_dict = {
        "email": data.email.lower(),  # Store email in lowercase
        "password_hash": password_hash,
        "name": data.name.strip(),
    }
    user = User.model_validate(user_dict)

    session.add(user)
    session.commit()
    session.refresh(user)

    # Generate JWT
    token = create_jwt_token(str(user.id), user.email)

    return AuthResponse(token=token, user=user_to_dict(user))


@router.post("/signin", response_model=AuthResponse)
async def signin(
    data: SigninRequest,
    session: Session = Depends(get_session),
) -> AuthResponse:
    """
    Authenticate user and issue JWT token.

    Functional Requirements: FR-004, FR-005
    """
    # Find user by email (case-insensitive)
    user = session.exec(
        select(User).where(func.lower(User.email) == data.email.lower())
    ).first()

    if not user:
        raise UnauthorizedError("Invalid email or password")

    # Verify password
    if not verify_password(data.password, user.password_hash):
        raise UnauthorizedError("Invalid email or password")

    # Generate JWT token
    token = create_jwt_token(user.id, user.email)

    return AuthResponse(token=token, user=user_to_dict(user))


@router.get("/me", response_model=dict)
async def get_current_user(
    current_user: User = Depends(verify_jwt),
) -> dict:
    """
    Get authenticated user profile.

    Requires JWT authentication.
    """
    return user_to_dict(current_user)
