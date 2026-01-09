# API Contract: Task Organization Endpoints

**Feature**: Task Organization Features
**Date**: 2025-12-31
**Status**: Complete

## Overview

Extends the existing task list endpoint with filter, search, and sort query parameters.

---

## GET /api/{user_id}/tasks

Get tasks with optional filtering, searching, and sorting.

### Request

```
GET /api/{user_id}/tasks
Authorization: Bearer <token>
```

### Query Parameters

| Parameter | Type | Required | Default | Description |
|-----------|------|----------|---------|-------------|
| `search` | string | No | - | Keyword to search in title and description |
| `status` | string | No | "all" | Filter by completion status: "all", "pending", "completed" |
| `priority` | string | No | "all" | Filter by priority: "all", "high", "medium", "low" |
| `tag_id` | uuid | No | - | Filter by specific tag (can repeat for multiple tags) |
| `sort` | string | No | "created_desc" | Sort order: "created_desc", "created_asc", "due_date_asc", "due_date_desc", "priority", "priority_reverse", "alpha", "alpha_reverse" |
| `limit` | int | No | 50 | Maximum results to return |
| `offset` | int | No | 0 | Pagination offset |

### Response

```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "550e8400-e29b-41d4-a716-446655440001",
      "title": "Complete project proposal",
      "description": "Write the Q1 project proposal document",
      "completed": false,
      "priority": "high",
      "due_date": "2025-01-15",
      "tags": [
        {
          "id": "550e8400-e29b-41d4-a716-446655440002",
          "name": "work",
          "color": "#3b82f6"
        }
      ],
      "created_at": "2025-01-01T10:00:00Z",
      "updated_at": "2025-01-02T14:30:00Z"
    }
  ],
  "total": 25,
  "limit": 50,
  "offset": 0
}
```

### Response Schema

```typescript
interface TaskListResponse {
  tasks: TaskWithTags[];
  total: number;      // Total matching tasks (before limit/offset)
  limit: number;
  offset: number;
}

interface TaskWithTags {
  id: string;
  user_id: string;
  title: string;
  description: string | null;
  completed: boolean;
  priority: "high" | "medium" | "low" | null;
  due_date: string | null;  // ISO 8601 date
  tags: TagSummary[];
  created_at: string;  // ISO 8601 datetime
  updated_at: string;  // ISO 8601 datetime
}

interface TagSummary {
  id: string;
  name: string;
  color: string | null;
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Unauthorized (missing or invalid token) |
| 403 | Forbidden (cannot access other user's tasks) |
| 500 | Server error |

### Examples

**Search for tasks:**
```
GET /api/user-123/tasks?search=proposal
```
Returns tasks where title or description contains "proposal".

**Filter by priority and status:**
```
GET /api/user-123/tasks?priority=high&status=pending
```
Returns high-priority tasks that are not completed.

**Filter by multiple tags:**
```
GET /api/user-123/tasks?tag_id=tag-1&tag_id=tag-2
```
Returns tasks that have BOTH tag-1 AND tag-2.

**Sort by due date:**
```
GET /api/user-123/tasks?sort=due_date_asc
```
Returns tasks ordered by due date (soonest first).

---

## POST /api/{user_id}/tasks (Extended)

Create a new task with optional priority, due date, and tags.

### Request

```
POST /api/{user_id}/tasks
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "title": "Complete project proposal",
  "description": "Write the Q1 project proposal document",
  "priority": "high",
  "due_date": "2025-01-15",
  "tag_ids": ["550e8400-e29b-41d4-a716-446655440000"]
}
```

### Request Schema

```typescript
interface CreateTaskRequest {
  title: string;  // 1-200 chars
  description?: string | null;  // max 1000 chars
  priority?: "high" | "medium" | "low";  // default: "medium"
  due_date?: string // ISO 860 | null; 1 date YYYY-MM-DD
  tag_ids?: string[];  // Max 10 tag IDs
}
```

### Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Complete project proposal",
  "description": "Write the Q1 project proposal document",
  "completed": false,
  "priority": "high",
  "due_date": "2025-01-15",
  "tags": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440002",
      "name": "work",
      "color": "#3b82f6"
    }
  ],
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-01T10:00:00Z"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 201 | Created successfully |
| 400 | Validation error (invalid title, too many tags, etc.) |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Tag not found |
| 500 | Server error |

---

## PUT /api/{user_id}/tasks/{task_id} (Extended)

Update task with optional priority, due date, and tag modifications.

### Request

```
PUT /api/{user_id}/tasks/{task_id}
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "title": "Updated task title",
  "description": "Updated description",
  "priority": "low",
  "due_date": "2025-02-01",
  "tag_ids": ["tag-1", "tag-2"]  // Replaces all tags
}
```

### Request Schema

```typescript
interface UpdateTaskRequest {
  title?: string;  // 1-200 chars
  description?: string | null;  // max 1000 chars
  priority?: "high" | "medium" | "low" | null;  // null clears priority
  due_date?: string | null;  // null clears due date
  tag_ids?: string[] | null;  // null keeps existing, [] clears all
}
```

### Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "550e8400-e29b-41d4-a716-446655440001",
  "title": "Updated task title",
  "description": "Updated description",
  "completed": false,
  "priority": "low",
  "due_date": "2025-02-01",
  "tags": [
    {
      "id": "tag-1",
      "name": "work",
      "color": "#3b82f6"
    },
    {
      "id": "tag-2",
      "name": "home",
      "color": "#10b981"
    }
  ],
  "created_at": "2025-01-01T10:00:00Z",
  "updated_at": "2025-01-02T15:00:00Z"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Updated successfully |
| 400 | Validation error |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Task or tag not found |
| 500 | Server error |

---

## PATCH /api/{user_id}/tasks/{task_id}/priority

Update only the priority of a task.

### Request

```
PATCH /api/{user_id}/tasks/{task_id}/priority
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "priority": "high"
}
```

### Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "priority": "high",
  "updated_at": "2025-01-02T15:00:00Z"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Updated successfully |
| 400 | Invalid priority value |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Task not found |
| 500 | Server error |

---

## PATCH /api/{user_id}/tasks/{task_id}/due-date

Update only the due date of a task.

### Request

```
PATCH /api/{user_id}/tasks/{task_id}/due-date
Authorization: Bearer <token>
Content-Type: application/json
```

### Request Body

```json
{
  "due_date": "2025-01-20"
}
```

### Response

```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "due_date": "2025-01-20",
  "updated_at": "2025-01-02T15:00:00Z"
}
```

### Status Codes

| Code | Description |
|------|-------------|
| 200 | Updated successfully |
| 400 | Invalid date format |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Task not found |
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
      "field": "priority",
      "reason": "Must be one of: high, medium, low"
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
| `TOO_MANY_TAGS` | More than 10 tags specified |
| `INTERNAL_ERROR` | Server-side error |
