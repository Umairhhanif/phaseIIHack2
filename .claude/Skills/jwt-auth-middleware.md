# JWT Auth Middleware

**Name:** jwt-auth-middleware

**Purpose:** Generate JWT verification middleware for FastAPI

**Input:** Secret key, token location (header/cookie)

**Output:** FastAPI dependency that extracts/validates JWT, returns user_id

**Usage:**
```
@jwt-auth-middleware create with BETTER_AUTH_SECRET
```

## Description

This skill generates complete JWT authentication middleware with the following features:
- JWT token extraction from headers or cookies
- Token signature verification
- Token expiration checking
- User ID extraction from token payload
- FastAPI dependency injection pattern
- Better Auth integration
- Error handling for invalid/expired tokens
- Optional vs required authentication

## Example Usage

### Basic JWT Middleware
```
@jwt-auth-middleware create with BETTER_AUTH_SECRET
```

### Header-Based Authentication
```
@jwt-auth-middleware create --location header --header-name Authorization
```

### Cookie-Based Authentication
```
@jwt-auth-middleware create --location cookie --cookie-name auth_token
```

### Optional Authentication
```
@jwt-auth-middleware create --optional
```

## Generated Code Structure

The skill will generate:
1. **Token extraction function** for headers/cookies
2. **Token verification function** using JWT library
3. **FastAPI dependency** for route injection
4. **Error handlers** for authentication failures
5. **User context object** with user_id and metadata
6. **Optional authentication** variant
7. **Token refresh logic** (if needed)

## Integration Points

- **FastAPI**: Dependency injection with `Depends()`
- **Better Auth**: JWT token format compatibility
- **PyJWT**: Token encoding/decoding library
- **Environment Variables**: Secret key from `.env`
- **HTTPException**: Proper error responses

## Example Generated Code

```python
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from jose import JWTError, jwt
from typing import Optional
import os

# Configuration
SECRET_KEY = os.getenv("BETTER_AUTH_SECRET")
ALGORITHM = "HS256"

security = HTTPBearer()

async def verify_token(
    credentials: HTTPAuthorizationCredentials = Depends(security)
) -> str:
    """
    Verify JWT token and return user_id.

    Raises:
        HTTPException: If token is invalid or expired
    """
    token = credentials.credentials

    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")

        if user_id is None:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid authentication credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )

        return user_id

    except JWTError:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )

async def get_current_user(user_id: str = Depends(verify_token)) -> str:
    """
    Get current authenticated user ID.
    Use this as a dependency in protected routes.
    """
    return user_id

# Optional authentication (doesn't raise error if no token)
async def get_current_user_optional(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(
        HTTPBearer(auto_error=False)
    )
) -> Optional[str]:
    """
    Get current user ID if authenticated, None otherwise.
    Use for routes that work with or without authentication.
    """
    if credentials is None:
        return None

    try:
        return await verify_token(credentials)
    except HTTPException:
        return None
```

## Usage in Routes

```python
from fastapi import APIRouter, Depends

router = APIRouter()

# Protected route - requires authentication
@router.get("/protected")
async def protected_route(user_id: str = Depends(get_current_user)):
    return {"user_id": user_id, "message": "Access granted"}

# Optional authentication route
@router.get("/optional")
async def optional_route(user_id: Optional[str] = Depends(get_current_user_optional)):
    if user_id:
        return {"user_id": user_id, "message": "Authenticated"}
    return {"message": "Anonymous access"}
```

## Features

- **Token Validation**: Signature and expiration verification
- **User Context**: Extract user_id and custom claims
- **Error Handling**: Proper HTTP 401 responses
- **Optional Auth**: Support for public/private endpoints
- **Better Auth Compatible**: Works with Better Auth JWT format
- **Cookie Support**: Extract tokens from secure HTTP-only cookies
- **Refresh Tokens**: Support for token refresh flows
- **Role-Based Access**: Extensible for permission checking

## Security Considerations

- Uses secure secret key from environment variables
- Validates token signature to prevent tampering
- Checks token expiration to prevent replay attacks
- Returns proper HTTP status codes for security events
- Supports HTTP-only cookies for XSS protection
- Compatible with Better Auth security best practices
