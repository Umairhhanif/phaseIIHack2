# Error Response Specifications

**Feature**: `001-phase2-fullstack` | **Date**: 2025-12-29

## Overview

All API endpoints return standardized error responses in JSON format. This document defines the error response structure, status codes, and error types.

## Error Response Format

All error responses follow this structure:

```json
{
  "detail": "Human-readable error message"
}
```

For validation errors (422 Unprocessable Entity), Pydantic returns a detailed structure:

```json
{
  "detail": [
    {
      "loc": ["body", "field_name"],
      "msg": "Error message",
      "type": "error_type"
    }
  ]
}
```

---

## HTTP Status Codes

### 400 Bad Request

**Usage**: Validation errors caught by application logic (not Pydantic).

**Examples**:
```json
{
  "detail": "Title is required"
}
```

```json
{
  "detail": "Title cannot be empty"
}
```

```json
{
  "detail": "Invalid email format"
}
```

**When to Use**:
- Title empty after whitespace trimming
- Email format invalid (custom validation)
- Business rule violations

---

### 401 Unauthorized

**Usage**: Missing, invalid, or expired JWT token.

**Examples**:
```json
{
  "detail": "Invalid or expired token"
}
```

```json
{
  "detail": "Missing authorization header"
}
```

```json
{
  "detail": "Invalid email or password"
}
```

**When to Use**:
- No Authorization header provided
- JWT signature verification fails
- JWT token expired
- Invalid credentials during signin

**Security Note**: Generic error messages prevent credential enumeration.

---

### 403 Forbidden

**Usage**: Valid authentication but insufficient permissions.

**Examples**:
```json
{
  "detail": "Cannot access other user's tasks"
}
```

```json
{
  "detail": "Cannot create tasks for other users"
}
```

```json
{
  "detail": "Cannot update other user's tasks"
}
```

```json
{
  "detail": "Cannot delete other user's tasks"
}
```

**When to Use**:
- User ID in path parameter doesn't match authenticated user's ID
- Attempting to access another user's resources

**Security Note**: Enforces user data isolation.

---

### 404 Not Found

**Usage**: Resource does not exist or user doesn't have access.

**Examples**:
```json
{
  "detail": "Task not found"
}
```

```json
{
  "detail": "User not found"
}
```

**When to Use**:
- Task ID doesn't exist in database
- Task exists but belongs to different user (don't reveal existence)
- User ID doesn't exist

**Security Note**: Generic message prevents information leakage about other users' data.

---

### 409 Conflict

**Usage**: Resource already exists (duplicate constraint violation).

**Examples**:
```json
{
  "detail": "Email already registered"
}
```

**When to Use**:
- Attempting to register with existing email address (case-insensitive)

---

### 422 Unprocessable Entity

**Usage**: Pydantic validation errors (request body schema validation).

**Example**:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    },
    {
      "loc": ["body", "password"],
      "msg": "ensure this value has at least 8 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

**When to Use**:
- Required field missing in request body
- Field type mismatch (e.g., string provided for integer field)
- Field length constraints violated (handled by Pydantic)
- Field format validation failed (handled by Pydantic)

**Frontend Handling**: Parse `detail` array and display field-specific error messages.

---

### 500 Internal Server Error

**Usage**: Unexpected server errors (database connection failures, unhandled exceptions).

**Example**:
```json
{
  "detail": "Internal server error"
}
```

**When to Use**:
- Database connection lost
- Unhandled exceptions in application code
- Third-party service failures (e.g., Neon database unavailable)

**Logging**: Always log full stack trace for 500 errors (never expose to client).

**Security Note**: Never expose internal error details, stack traces, or database errors to clients.

---

## Error Handling Best Practices

### Backend (FastAPI)

**Custom Exception Handler**:
```python
from fastapi import HTTPException

# Validation error
raise HTTPException(status_code=400, detail="Title is required")

# Auth error
raise HTTPException(status_code=401, detail="Invalid or expired token")

# Permission error
raise HTTPException(status_code=403, detail="Cannot access other user's tasks")

# Not found
raise HTTPException(status_code=404, detail="Task not found")

# Conflict
raise HTTPException(status_code=409, detail="Email already registered")
```

**Generic Error Handler** (500 errors):
```python
@app.exception_handler(Exception)
async def generic_exception_handler(request, exc):
    logger.error(f"Unhandled exception: {exc}", exc_info=True)
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )
```

---

### Frontend (Next.js)

**API Client Error Handling**:
```typescript
// lib/api.ts
async function apiRequest(url: string, options: RequestInit) {
  try {
    const response = await fetch(url, options);

    if (!response.ok) {
      const error = await response.json();

      if (response.status === 401) {
        // Redirect to login
        router.push('/signin');
      } else if (response.status === 422) {
        // Parse Pydantic validation errors
        return { errors: error.detail };
      } else {
        // Show generic error message
        return { error: error.detail };
      }
    }

    return await response.json();
  } catch (err) {
    // Network error or JSON parse error
    return { error: "Unable to connect to server" };
  }
}
```

**Form Error Display** (422 validation errors):
```typescript
// Display field-specific errors from Pydantic
if (response.errors) {
  response.errors.forEach((err: any) => {
    const field = err.loc[err.loc.length - 1]; // Get field name
    setFieldError(field, err.msg);
  });
}
```

---

## Error Response Testing

All endpoints must have tests covering:
- [ ] 400 Bad Request scenarios
- [ ] 401 Unauthorized (missing/invalid token)
- [ ] 403 Forbidden (user ID mismatch)
- [ ] 404 Not Found
- [ ] 422 Unprocessable Entity (Pydantic validation)
- [ ] 500 Internal Server Error (simulated)

**Example Test**:
```python
def test_get_task_forbidden(client, user1_token, user2_task_id):
    """Test that user cannot access another user's task"""
    response = client.get(
        f"/api/user1_id/tasks/{user2_task_id}",
        headers={"Authorization": f"Bearer {user1_token}"}
    )
    assert response.status_code == 403
    assert response.json() == {"detail": "Cannot access other user's tasks"}
```

---

**Contract Status**: ✅ COMPLETE - Error response standards fully defined
