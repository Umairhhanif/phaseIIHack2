"""
Standardized error handlers and HTTP exceptions for the Todo App API.

Reference: contracts/error-responses.md
"""

from typing import Any, Dict, Optional

from fastapi import HTTPException, Request
from fastapi.responses import JSONResponse


class APIError(HTTPException):
    """Base exception for API errors with standardized format."""

    def __init__(
        self,
        status_code: int,
        error_code: str,
        message: str,
        details: Optional[Dict[str, Any]] = None,
    ):
        self.error_code = error_code
        self.details = details or {}
        super().__init__(status_code=status_code, detail=message)


# 400 Bad Request
class BadRequestError(APIError):
    """Invalid request data or malformed input."""

    def __init__(self, message: str = "Bad request", details: Optional[Dict] = None):
        super().__init__(
            status_code=400, error_code="BAD_REQUEST", message=message, details=details
        )


# 401 Unauthorized
class UnauthorizedError(APIError):
    """Missing or invalid authentication credentials."""

    def __init__(
        self, message: str = "Authentication required", details: Optional[Dict] = None
    ):
        super().__init__(
            status_code=401,
            error_code="UNAUTHORIZED",
            message=message,
            details=details,
        )


# 403 Forbidden
class ForbiddenError(APIError):
    """User lacks permission to access the resource."""

    def __init__(
        self, message: str = "Permission denied", details: Optional[Dict] = None
    ):
        super().__init__(
            status_code=403, error_code="FORBIDDEN", message=message, details=details
        )


# 404 Not Found
class NotFoundError(APIError):
    """Requested resource does not exist."""

    def __init__(
        self, message: str = "Resource not found", details: Optional[Dict] = None
    ):
        super().__init__(
            status_code=404, error_code="NOT_FOUND", message=message, details=details
        )


# 422 Unprocessable Entity
class ValidationError(APIError):
    """Request data fails validation rules."""

    def __init__(
        self, message: str = "Validation error", details: Optional[Dict] = None
    ):
        super().__init__(
            status_code=422, error_code="VALIDATION_ERROR", message=message, details=details
        )


# 500 Internal Server Error
class InternalServerError(APIError):
    """Unexpected server error."""

    def __init__(
        self, message: str = "Internal server error", details: Optional[Dict] = None
    ):
        super().__init__(
            status_code=500,
            error_code="INTERNAL_ERROR",
            message=message,
            details=details,
        )


def api_error_handler(request: Request, exc: APIError) -> JSONResponse:
    """
    Global exception handler for APIError instances.

    Returns standardized JSON error response per contracts/error-responses.md.
    """
    return JSONResponse(
        status_code=exc.status_code,
        content={
            "error": {
                "code": exc.error_code,
                "message": exc.detail,
                "details": exc.details,
            }
        },
    )


def validation_exception_handler(request: Request, exc: Exception) -> JSONResponse:
    """
    Handler for Pydantic validation errors (422 status).

    Formats validation errors into standardized error response.
    """
    if hasattr(exc, "errors"):
        # Pydantic ValidationError
        errors = exc.errors()
        details = {
            "validation_errors": [
                {
                    "field": ".".join(str(loc) for loc in error["loc"]),
                    "message": error["msg"],
                    "type": error["type"],
                }
                for error in errors
            ]
        }
    else:
        details = {}

    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": "VALIDATION_ERROR",
                "message": "Request validation failed",
                "details": details,
            }
        },
    )
