# API Contract: Tag Management Endpoints

**Feature**: Task Organization Features
**Date**: 2025-12-31
**Status**: Complete

## Overview

CRUD operations for user-specific tags used to categorize tasks.

---

## GET /api/{user_id}/tags

Get all tags for a user, optionally with task counts.

### Request

```
GET /api/{user_id}/tags
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `with_counts` | boolean | No | false | Include task count for each tag |
| `q` | string | No | - | Search prefix for autocomplete |

### Response

```json
{
  "tags": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "name": "work",
      "color": "#3b82f6",
      "created_at": "2025-01-01T10:00:00Z",
      "task_count": 5
    },
    {
      "id": "550e8400-e29b-41d4-a716-446655440001",
      "name": "home",
      "color": "#10b981",
      "created_at": "2025-01-02T10:00:00Z",
      "task_count": 3
    }
  ]
}
```

### Response Schema

```typescript
interface TagListResponse {
  tags: TagDetail[];
}

interface TagDetail {
  id: string;
  name: string;
  color: string | null;
  created_at: string;  // ISO 8601 datetime
  task_count?: number;  // Only included if with_counts=true
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Unauthorized |
| 403 | Forbidden |
| 500 | Server error |

### Examples

**List all tags:**
```
GET /api/user-123/tags
```

**List with task counts:**
```
GET /api/user-123/tags?with_counts=true
```

**Autocomplete search:**
```
GET /api/user-123/tags?q=wo
```
Returns tags starting with "wo" (case-insensitive).

---

## POST /api/{user_id}/tags

Create a new tag.

### Request

```
POST /api/{user_id}/tags
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "name": "urgent",
  "color": "#ef4444"
}
```

### Request Schema

```typescript
interface CreateTagRequest {
  name: string;  // 1-50 chars, required
  color?: string | null;  // hex format #XXXXXX, optional
}
```

### Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "urgent",
  "color": "#ef4444",
  "created_at": "2025-01-01T10:00:00Z"
}
```

### Response Schema

```typescript
interface TagResponse {
  id: string;
  name: string;
  color: string | null;
  created_at: string;  // ISO 8601 datetime
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 201 | Created successfully |
| 400 | Validation error (name too long, invalid color) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 409 | Tag with same name already exists |
| 422 | Unprocessable entity (name conflict case-insensitive) |
| 500 | Server error |

### Validation Rules

- Name must be 1-50 characters after trimming whitespace
- Name must be unique per user (case-insensitive)
- Color must be valid 7-character hex code if provided
- Maximum 100 tags per user (soft limit)

---

## GET /api/{user_id}/tags/{tag_id}

Get a specific tag by ID.

### Request

```
GET /api/{user_id}/tags/{tag_id}
Authorization: Bearer <token>
```

### Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "work",
  "color": "#3b82f6",
  "created_at": "2025-01-01T10:00:00Z"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Tag not found |
| 500 | Server error |

---

## PUT /api/{user_id}/tags/{tag_id}

Update a tag's name and/or color.

### Request

```
PUT /api/{user_id}/tags/{tag_id}
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "name": "work-projects",
  "color": "#6366f1"
}
```

### Request Schema

```typescript
interface UpdateTagRequest {
  name?: string;  // 1-50 chars
  color?: string | null;  // hex format #XXXXXX, null to remove
}
```

### Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "name": "work-projects",
  "color": "#6366f1",
  "created_at": "2025-01-01T10:00:00Z"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Updated successfully |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Tag not found |
| 409 | Tag name already exists |
| 500 | Server error |

### Notes

- Updating a tag name updates all tasks with that tag
- Color change only affects future tag displays

---

## DELETE /api/{user_id}/tags/{tag_id}

Delete a tag and remove it from all associated tasks.

### Request

```
DELETE /api/{user_id}/tags/{tag_id}
Authorization: Bearer <token>
```

### Response

```
204 No Content
```

### Status Codes

| Code | Description |
|------|-------------|
| 204 | Deleted successfully |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Tag not found |
| 500 | Server error |

### Notes

- Deleting a tag removes it from all tasks (via cascade delete on TaskTag)
- This action cannot be undone

---

## POST /api/{user_id}/tags/{tag_id}/tasks/{task_id}

Add a tag to a task (alternative to updating task with tag_ids).

### Request

```
POST /api/{user_id}/tags/{tag_id}/tasks/{task_id}
Authorization: Bearer <token>
```

### Response

```
204 No Content
```

### Status Codes

| Code | Description |
|------|-------------|
| 204 | Tag added successfully |
| 400 | Task already has this tag |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Tag or task not found |
| 422 | Task already has maximum 10 tags |
| 500 | Server error |

---

## DELETE /api/{user_id}/tags/{tag_id}/tasks/{task_id}

Remove a tag from a task.

### Request

```
DELETE /api/{user_id}/tags/{tag_id}/tasks/{task_id}
Authorization: Bearer <token>
```

### Response

```
204 No Content
```

### Status Codes

| Code | Description |
|------|-------------|
| 204 | Tag removed successfully |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Tag or task not found, or tag not on task |
| 500 | Server error |

---

## Error Responses

All endpoints return standardized error responses:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request parameters",
    "details": {
      "field": "color",
      "reason": "Must be a valid hex color code (e.g., #3b82f6)"
    }
  }
}
```

### Common Error Codes

| Code | Description |
|------|-------------|
| `VALIDATION_ERROR` | Invalid request body or parameters |
| `UNAUTHORIZED` | Missing or invalid JWT token |
| `FORBIDDEN` | Cannot access requested resource |
| `NOT_FOUND` | Resource does not exist |
| `CONFLICT` | Resource already exists (duplicate name) |
| `TAG_LIMIT_EXCEEDED` | More than 10 tags on task |
| `USER_TAG_LIMIT_EXCEEDED` | More than 100 tags for user |
| `INTERNAL_ERROR` | Server-side error |

---

## Color Palette (Recommended)

Tags can use any valid hex color. The following are recommended for consistency:

| Name | Hex | Use Case |
|------|-----|----------|
| Blue | `#3b82f6` | Work, professional |
| Green | `#10b981` | Personal, home |
| Red | `#ef4444` | Urgent, important |
| Yellow | `#f59e0b` | Waiting, pending |
| Purple | `#8b5cf6` | Creative, projects |
| Pink | `#ec4899` | Health, fitness |
| Gray | `#6b7280` | Misc, other |
| Indigo | `#6366f1` | Development |
| Orange | `#f97316` | Finance |
| Teal | `#14b8a6` | Learning |
