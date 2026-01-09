# API Contracts: Todo App - Phase II

**Feature**: `001-phase2-fullstack` | **Date**: 2025-12-29 | **Status**: Phase 1 Design

## Overview

This directory contains the complete API contract specifications for the Todo App Phase II backend. All endpoints follow RESTful conventions with JSON request/response bodies and JWT authentication.

## Contract Files

- **[auth-endpoints.md](auth-endpoints.md)** - User registration, login, JWT token issuance
- **[task-endpoints.md](task-endpoints.md)** - Task CRUD operations (Create, Read, Update, Delete, Toggle)
- **[error-responses.md](error-responses.md)** - Standardized error response formats

## API Base URL

- **Local Development**: `http://localhost:8000`
- **Production**: `https://api.yourdomain.com` (Railway/Render/Fly.io deployment)

## Authentication

All endpoints except `/auth/signup` and `/auth/signin` require JWT authentication.

**Header Format**:
```
Authorization: Bearer <jwt_token>
```

**Token Expiry**: 7 days

**Token Claims**:
```json
{
  "user_id": "uuid-string",
  "email": "user@example.com",
  "iat": 1234567890,
  "exp": 1234567890
}
```

## HTTP Status Codes

| Code | Meaning | Usage |
|------|---------|-------|
| 200 | OK | Successful GET, PUT, DELETE operations |
| 201 | Created | Successful POST operation (resource created) |
| 400 | Bad Request | Validation error (invalid input) |
| 401 | Unauthorized | Missing or invalid JWT token |
| 403 | Forbidden | Valid token but insufficient permissions (e.g., accessing another user's tasks) |
| 404 | Not Found | Resource does not exist |
| 422 | Unprocessable Entity | Request body validation failed (Pydantic validation) |
| 500 | Internal Server Error | Unexpected server error |

## Request/Response Format

All requests and responses use `Content-Type: application/json`.

**Success Response Example**:
```json
{
  "id": "uuid-string",
  "title": "Task title",
  "completed": false,
  "created_at": "2025-12-29T12:00:00Z"
}
```

**Error Response Example**:
```json
{
  "detail": "Error message describing what went wrong"
}
```

## CORS Configuration

Frontend origin must be whitelisted in backend CORS configuration:

```python
allow_origins=[os.getenv("FRONTEND_URL")]  # e.g., https://app.vercel.app
```

## Rate Limiting

Not implemented in Phase II (out of scope per specification).

## Versioning

API versioning not required in Phase II. All endpoints are considered v1.

---

**Next Steps**: Review individual contract files for detailed endpoint specifications.
