# Error Handler Generator

**Name:** error-handler-generator

**Purpose:** Generate consistent error handling for API routes

**Input:** Error types (validation, auth, not found, server)

**Output:** FastAPI exception handlers with proper HTTP status codes

**Usage:**
```
@error-handler-generator for all common errors
```

## Description

This skill generates comprehensive error handling for FastAPI applications with the following features:
- Custom exception classes
- Exception handlers for common errors
- Consistent error response format
- Proper HTTP status codes
- Error logging and tracking
- Validation error formatting
- Authentication error handling
- Database error handling

## Example Usage

### Generate All Error Handlers
```
@error-handler-generator for all common errors
```

### Specific Error Types
```
@error-handler-generator for validation and auth errors
```

### With Sentry Integration
```
@error-handler-generator with Sentry error tracking
```

## Generated Code Structure

The skill will generate:
1. **Custom exception classes** for different error types
2. **Exception handlers** with @app.exception_handler
3. **Error response models** for consistent format
4. **Logging configuration** for error tracking
5. **Validation error formatter** for Pydantic errors
6. **Database error handlers** for SQLAlchemy errors
7. **Authentication error handlers** for JWT errors

## Error Types Covered

1. **Validation Errors** (422) - Invalid request data
2. **Authentication Errors** (401) - Missing/invalid token
3. **Authorization Errors** (403) - Insufficient permissions
4. **Not Found Errors** (404) - Resource doesn't exist
5. **Conflict Errors** (409) - Resource already exists
6. **Server Errors** (500) - Internal server errors
7. **Database Errors** (500) - Database operation failures

## Example Generated Code

### errors.py - Custom Exceptions
```python
from fastapi import HTTPException, status

class AppException(Exception):
    """Base exception for application errors."""
    def __init__(self, message: str, status_code: int = 500):
        self.message = message
        self.status_code = status_code
        super().__init__(self.message)


class ValidationError(AppException):
    """Raised when request validation fails."""
    def __init__(self, message: str = "Validation error", errors: dict = None):
        super().__init__(message, status.HTTP_422_UNPROCESSABLE_ENTITY)
        self.errors = errors or {}


class AuthenticationError(AppException):
    """Raised when authentication fails."""
    def __init__(self, message: str = "Authentication failed"):
        super().__init__(message, status.HTTP_401_UNAUTHORIZED)


class AuthorizationError(AppException):
    """Raised when user lacks permission."""
    def __init__(self, message: str = "Insufficient permissions"):
        super().__init__(message, status.HTTP_403_FORBIDDEN)


class NotFoundError(AppException):
    """Raised when resource is not found."""
    def __init__(self, message: str = "Resource not found"):
        super().__init__(message, status.HTTP_404_NOT_FOUND)


class ConflictError(AppException):
    """Raised when resource already exists."""
    def __init__(self, message: str = "Resource already exists"):
        super().__init__(message, status.HTTP_409_CONFLICT)


class DatabaseError(AppException):
    """Raised when database operation fails."""
    def __init__(self, message: str = "Database operation failed"):
        super().__init__(message, status.HTTP_500_INTERNAL_SERVER_ERROR)
```

### error_handlers.py - Exception Handlers
```python
from fastapi import FastAPI, Request, status
from fastapi.responses import JSONResponse
from fastapi.exceptions import RequestValidationError
from pydantic import ValidationError as PydanticValidationError
from sqlalchemy.exc import IntegrityError, SQLAlchemyError
import logging

from errors import (
    AppException,
    ValidationError,
    AuthenticationError,
    AuthorizationError,
    NotFoundError,
    ConflictError,
    DatabaseError,
)

logger = logging.getLogger(__name__)


def setup_error_handlers(app: FastAPI):
    """Register all error handlers with the FastAPI app."""

    @app.exception_handler(AppException)
    async def app_exception_handler(request: Request, exc: AppException):
        """Handle custom application exceptions."""
        logger.error(f"Application error: {exc.message}", exc_info=True)

        return JSONResponse(
            status_code=exc.status_code,
            content={
                "error": {
                    "type": exc.__class__.__name__,
                    "message": exc.message,
                    "status_code": exc.status_code,
                }
            },
        )

    @app.exception_handler(RequestValidationError)
    async def validation_exception_handler(
        request: Request,
        exc: RequestValidationError
    ):
        """Handle FastAPI validation errors."""
        errors = {}
        for error in exc.errors():
            field = ".".join(str(loc) for loc in error["loc"][1:])
            errors[field] = error["msg"]

        logger.warning(f"Validation error: {errors}")

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "type": "ValidationError",
                    "message": "Request validation failed",
                    "status_code": 422,
                    "details": errors,
                }
            },
        )

    @app.exception_handler(PydanticValidationError)
    async def pydantic_validation_error_handler(
        request: Request,
        exc: PydanticValidationError
    ):
        """Handle Pydantic validation errors."""
        errors = {}
        for error in exc.errors():
            field = ".".join(str(loc) for loc in error["loc"])
            errors[field] = error["msg"]

        return JSONResponse(
            status_code=status.HTTP_422_UNPROCESSABLE_ENTITY,
            content={
                "error": {
                    "type": "ValidationError",
                    "message": "Data validation failed",
                    "status_code": 422,
                    "details": errors,
                }
            },
        )

    @app.exception_handler(IntegrityError)
    async def integrity_error_handler(
        request: Request,
        exc: IntegrityError
    ):
        """Handle database integrity errors (unique constraints, etc.)."""
        logger.error(f"Database integrity error: {str(exc)}", exc_info=True)

        # Check for common integrity violations
        error_msg = str(exc.orig)
        if "unique constraint" in error_msg.lower():
            message = "A record with this information already exists"
            status_code = status.HTTP_409_CONFLICT
        elif "foreign key constraint" in error_msg.lower():
            message = "Referenced resource does not exist"
            status_code = status.HTTP_400_BAD_REQUEST
        else:
            message = "Database constraint violation"
            status_code = status.HTTP_400_BAD_REQUEST

        return JSONResponse(
            status_code=status_code,
            content={
                "error": {
                    "type": "DatabaseError",
                    "message": message,
                    "status_code": status_code,
                }
            },
        )

    @app.exception_handler(SQLAlchemyError)
    async def sqlalchemy_error_handler(
        request: Request,
        exc: SQLAlchemyError
    ):
        """Handle general SQLAlchemy errors."""
        logger.error(f"Database error: {str(exc)}", exc_info=True)

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "type": "DatabaseError",
                    "message": "A database error occurred",
                    "status_code": 500,
                }
            },
        )

    @app.exception_handler(Exception)
    async def general_exception_handler(
        request: Request,
        exc: Exception
    ):
        """Handle all uncaught exceptions."""
        logger.error(f"Unhandled exception: {str(exc)}", exc_info=True)

        return JSONResponse(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            content={
                "error": {
                    "type": "InternalServerError",
                    "message": "An unexpected error occurred",
                    "status_code": 500,
                }
            },
        )
```

### main.py - Setup
```python
from fastapi import FastAPI
from error_handlers import setup_error_handlers

app = FastAPI()

# Setup error handlers
setup_error_handlers(app)
```

## Error Response Format

All errors follow a consistent JSON format:

```json
{
  "error": {
    "type": "ValidationError",
    "message": "Request validation failed",
    "status_code": 422,
    "details": {
      "email": "Invalid email format",
      "password": "Must be at least 8 characters"
    }
  }
}
```

## Usage in Routes

```python
from fastapi import APIRouter, Depends
from errors import NotFoundError, AuthorizationError

router = APIRouter()

@router.get("/tasks/{task_id}")
async def get_task(
    task_id: UUID,
    user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    task = session.get(Task, task_id)

    if not task:
        raise NotFoundError("Task not found")

    if task.user_id != user_id:
        raise AuthorizationError("You don't have access to this task")

    return task
```

## Logging Configuration

```python
# logging_config.py

import logging
import sys

def setup_logging():
    """Configure logging for the application."""

    # Create logger
    logger = logging.getLogger()
    logger.setLevel(logging.INFO)

    # Console handler
    console_handler = logging.StreamHandler(sys.stdout)
    console_handler.setLevel(logging.INFO)

    # Formatter
    formatter = logging.Formatter(
        '%(asctime)s - %(name)s - %(levelname)s - %(message)s'
    )
    console_handler.setFormatter(formatter)

    # Add handler
    logger.addHandler(console_handler)

    return logger
```

## Sentry Integration (Optional)

```python
# sentry_config.py

import sentry_sdk
from sentry_sdk.integrations.fastapi import FastApiIntegration
import os

def setup_sentry():
    """Initialize Sentry error tracking."""
    sentry_dsn = os.getenv("SENTRY_DSN")

    if sentry_dsn:
        sentry_sdk.init(
            dsn=sentry_dsn,
            integrations=[FastApiIntegration()],
            traces_sample_rate=1.0,
            environment=os.getenv("ENVIRONMENT", "development"),
        )
```

## Features

- **Consistent Format**: All errors use same JSON structure
- **Proper Status Codes**: HTTP status codes follow REST conventions
- **Detailed Errors**: Validation errors include field-level details
- **Error Logging**: All errors logged for debugging
- **Database Errors**: Special handling for SQLAlchemy errors
- **Custom Exceptions**: Type-safe exception classes
- **Sentry Support**: Optional error tracking integration
- **Type Safety**: Full type hints throughout

## Testing

```python
# tests/test_error_handlers.py

import pytest
from fastapi.testclient import TestClient

def test_not_found_error(client: TestClient):
    response = client.get("/tasks/nonexistent-id")
    assert response.status_code == 404
    assert response.json()["error"]["type"] == "NotFoundError"

def test_validation_error(client: TestClient):
    response = client.post("/tasks", json={"title": ""})
    assert response.status_code == 422
    assert "details" in response.json()["error"]
```
