"""
JWT token generation and validation utilities.

Uses PyJWT library with BETTER_AUTH_SECRET for signing/verification.
Token expiry set to 7 days per specification.
"""

import os
from datetime import datetime, timedelta
from typing import Dict, Optional
from uuid import UUID

import jwt
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

BETTER_AUTH_SECRET = os.getenv("BETTER_AUTH_SECRET")
if not BETTER_AUTH_SECRET:
    raise ValueError("BETTER_AUTH_SECRET environment variable not set")

# Token configuration
JWT_ALGORITHM = "HS256"
JWT_EXPIRY_DAYS = 7


def create_jwt_token(user_id: UUID, email: str) -> str:
    """
    Generate JWT token for authenticated user.

    Args:
        user_id: User's unique identifier
        email: User's email address

    Returns:
        str: Signed JWT token

    Example:
        token = create_jwt_token(user.id, user.email)
        # Returns: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
    """
    now = datetime.utcnow()
    expiry = now + timedelta(days=JWT_EXPIRY_DAYS)

    payload = {
        "user_id": str(user_id),  # Convert UUID to string for JSON
        "email": email,
        "iat": now,  # Issued at
        "exp": expiry,  # Expiration time
    }

    token = jwt.encode(payload, BETTER_AUTH_SECRET, algorithm=JWT_ALGORITHM)
    return token


def verify_jwt_token(token: str) -> Dict[str, any]:
    """
    Verify and decode JWT token.

    Args:
        token: JWT token string

    Returns:
        Dict: Decoded token payload with user_id, email, iat, exp

    Raises:
        jwt.ExpiredSignatureError: Token has expired
        jwt.InvalidTokenError: Token is invalid or signature mismatch

    Example:
        try:
            payload = verify_jwt_token(token)
            user_id = payload["user_id"]
        except jwt.ExpiredSignatureError:
            raise UnauthorizedError("Token has expired")
        except jwt.InvalidTokenError:
            raise UnauthorizedError("Invalid token")
    """
    payload = jwt.decode(token, BETTER_AUTH_SECRET, algorithms=[JWT_ALGORITHM])
    return payload


def extract_token_from_header(authorization: Optional[str]) -> Optional[str]:
    """
    Extract JWT token from Authorization header.

    Args:
        authorization: Authorization header value (e.g., "Bearer <token>")

    Returns:
        str: Extracted token or None if header is invalid

    Example:
        token = extract_token_from_header("Bearer eyJhbGci...")
        # Returns: "eyJhbGci..."
    """
    if not authorization:
        return None

    parts = authorization.split()
    if len(parts) != 2 or parts[0].lower() != "bearer":
        return None

    return parts[1]
