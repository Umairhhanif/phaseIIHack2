# Task Management Endpoints

**Feature**: `001-phase2-fullstack` | **Date**: 2025-12-29

All task endpoints require JWT authentication and enforce user isolation.

---

## GET /api/{user_id}/tasks

List all tasks for authenticated user.

**Functional Requirements**: FR-009, FR-010, FR-014

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `user_id` (UUID): User identifier (must match authenticated user's ID)

**Query Parameters** (all optional):
- `completed` (boolean): Filter by completion status (e.g., `?completed=true`)
- `limit` (integer): Max tasks to return (default: 1000, max: 1000)
- `offset` (integer): Pagination offset (default: 0)

### Response

**Success (200 OK)**:
```json
{
  "tasks": [
    {
      "id": "550e8400-e29b-41d4-a716-446655440000",
      "user_id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "Buy groceries",
      "description": "Milk, eggs, bread",
      "completed": false,
      "created_at": "2025-12-29T12:00:00Z",
      "updated_at": "2025-12-29T12:00:00Z"
    },
    {
      "id": "770e8400-e29b-41d4-a716-446655440000",
      "user_id": "660e8400-e29b-41d4-a716-446655440000",
      "title": "Finish project report",
      "description": null,
      "completed": true,
      "created_at": "2025-12-28T10:30:00Z",
      "updated_at": "2025-12-29T09:15:00Z"
    }
  ],
  "total": 2
}
```

**Empty State (200 OK)**:
```json
{
  "tasks": [],
  "total": 0
}
```

**Error Responses**:

*401 Unauthorized* - Missing or invalid JWT:
```json
{
  "detail": "Invalid or expired token"
}
```

*403 Forbidden* - User ID mismatch:
```json
{
  "detail": "Cannot access other user's tasks"
}
```

### Business Logic

1. Extract JWT token and verify signature
2. Extract authenticated user_id from token claims
3. Compare authenticated user_id with path parameter user_id
4. If mismatch, return 403 Forbidden
5. Query tasks WHERE user_id = authenticated_user_id
6. Apply optional filters (completed status)
7. Sort by created_at DESC (newest first)
8. Apply pagination (limit, offset)
9. Return task list with total count

### Security Notes

- User isolation enforced via user_id check
- Database query MUST filter by user_id (defense in depth)
- No cross-user data leakage possible

---

## POST /api/{user_id}/tasks

Create a new task for authenticated user.

**Functional Requirements**: FR-007, FR-008, FR-017, FR-020

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters**:
- `user_id` (UUID): User identifier (must match authenticated user's ID)

**Body**:
```json
{
  "title": "Buy groceries",
  "description": "Milk, eggs, bread"
}
```

**Validation Rules**:
- `title`: Required, 1-200 characters (trimmed), cannot be only whitespace
- `description`: Optional, max 1000 characters

### Response

**Success (201 Created)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2025-12-29T12:00:00Z",
  "updated_at": "2025-12-29T12:00:00Z"
}
```

**Error Responses**:

*400 Bad Request* - Validation error:
```json
{
  "detail": "Title is required"
}
```

*401 Unauthorized* - Missing or invalid JWT:
```json
{
  "detail": "Invalid or expired token"
}
```

*403 Forbidden* - User ID mismatch:
```json
{
  "detail": "Cannot create tasks for other users"
}
```

*422 Unprocessable Entity* - Pydantic validation error:
```json
{
  "detail": [
    {
      "loc": ["body", "title"],
      "msg": "ensure this value has at least 1 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

### Business Logic

1. Verify JWT and extract authenticated user_id
2. Compare authenticated user_id with path parameter user_id
3. If mismatch, return 403 Forbidden
4. Trim whitespace from title
5. Validate title length (1-200 characters after trimming)
6. If title empty after trimming, return 400 Bad Request
7. Create task with user_id = authenticated_user_id
8. Set completed = false by default
9. Set created_at and updated_at to current UTC time
10. Return created task object

### Security Notes

- User isolation: Task always associated with authenticated user_id
- Title trimming prevents whitespace-only titles

---

## GET /api/{user_id}/tasks/{task_id}

Get a single task by ID.

**Functional Requirements**: FR-009, FR-014

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `user_id` (UUID): User identifier (must match authenticated user's ID)
- `task_id` (UUID): Task identifier

### Response

**Success (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": false,
  "created_at": "2025-12-29T12:00:00Z",
  "updated_at": "2025-12-29T12:00:00Z"
}
```

**Error Responses**:

*401 Unauthorized* - Missing or invalid JWT:
```json
{
  "detail": "Invalid or expired token"
}
```

*403 Forbidden* - User ID mismatch:
```json
{
  "detail": "Cannot access other user's tasks"
}
```

*404 Not Found* - Task not found or belongs to different user:
```json
{
  "detail": "Task not found"
}
```

### Business Logic

1. Verify JWT and extract authenticated user_id
2. Compare authenticated user_id with path parameter user_id
3. If mismatch, return 403 Forbidden
4. Query task WHERE id = task_id AND user_id = authenticated_user_id
5. If not found, return 404 Not Found
6. Return task object

### Security Notes

- User isolation: Query filters by both task_id and user_id
- 404 response doesn't reveal if task exists for other users

---

## PUT /api/{user_id}/tasks/{task_id}

Update an existing task.

**Functional Requirements**: FR-012, FR-014, FR-017, FR-019

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Path Parameters**:
- `user_id` (UUID): User identifier (must match authenticated user's ID)
- `task_id` (UUID): Task identifier

**Body**:
```json
{
  "title": "Buy groceries and cook dinner",
  "description": "Milk, eggs, bread, chicken"
}
```

**Validation Rules**:
- `title`: Optional, 1-200 characters (trimmed)
- `description`: Optional, max 1000 characters
- At least one field must be provided

### Response

**Success (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries and cook dinner",
  "description": "Milk, eggs, bread, chicken",
  "completed": false,
  "created_at": "2025-12-29T12:00:00Z",
  "updated_at": "2025-12-29T14:30:00Z"
}
```

**Error Responses**:

*400 Bad Request* - Empty title after trimming:
```json
{
  "detail": "Title cannot be empty"
}
```

*401 Unauthorized* - Missing or invalid JWT:
```json
{
  "detail": "Invalid or expired token"
}
```

*403 Forbidden* - User ID mismatch:
```json
{
  "detail": "Cannot update other user's tasks"
}
```

*404 Not Found* - Task not found:
```json
{
  "detail": "Task not found"
}
```

### Business Logic

1. Verify JWT and extract authenticated user_id
2. Compare authenticated user_id with path parameter user_id
3. If mismatch, return 403 Forbidden
4. Query task WHERE id = task_id AND user_id = authenticated_user_id
5. If not found, return 404 Not Found
6. If title provided, trim whitespace and validate length
7. Update only provided fields (partial update)
8. Set updated_at to current UTC time
9. Save changes to database
10. Return updated task object

### Security Notes

- User isolation: Update query filters by user_id
- Title trimming prevents whitespace-only updates

---

## PATCH /api/{user_id}/tasks/{task_id}/toggle

Toggle task completion status.

**Functional Requirements**: FR-011, FR-014, FR-019

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `user_id` (UUID): User identifier (must match authenticated user's ID)
- `task_id` (UUID): Task identifier

**Body**: None

### Response

**Success (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "user_id": "660e8400-e29b-41d4-a716-446655440000",
  "title": "Buy groceries",
  "description": "Milk, eggs, bread",
  "completed": true,
  "created_at": "2025-12-29T12:00:00Z",
  "updated_at": "2025-12-29T14:45:00Z"
}
```

**Error Responses**:

*401 Unauthorized* - Missing or invalid JWT:
```json
{
  "detail": "Invalid or expired token"
}
```

*403 Forbidden* - User ID mismatch:
```json
{
  "detail": "Cannot update other user's tasks"
}
```

*404 Not Found* - Task not found:
```json
{
  "detail": "Task not found"
}
```

### Business Logic

1. Verify JWT and extract authenticated user_id
2. Compare authenticated user_id with path parameter user_id
3. If mismatch, return 403 Forbidden
4. Query task WHERE id = task_id AND user_id = authenticated_user_id
5. If not found, return 404 Not Found
6. Toggle completed field: `task.completed = not task.completed`
7. Set updated_at to current UTC time
8. Save changes to database
9. Return updated task object

### Security Notes

- User isolation: Query filters by user_id
- Idempotent operation: Can toggle multiple times safely

---

## DELETE /api/{user_id}/tasks/{task_id}

Permanently delete a task.

**Functional Requirements**: FR-013, FR-014

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
```

**Path Parameters**:
- `user_id` (UUID): User identifier (must match authenticated user's ID)
- `task_id` (UUID): Task identifier

### Response

**Success (200 OK)**:
```json
{
  "message": "Task deleted successfully",
  "deleted_task_id": "550e8400-e29b-41d4-a716-446655440000"
}
```

**Error Responses**:

*401 Unauthorized* - Missing or invalid JWT:
```json
{
  "detail": "Invalid or expired token"
}
```

*403 Forbidden* - User ID mismatch:
```json
{
  "detail": "Cannot delete other user's tasks"
}
```

*404 Not Found* - Task not found:
```json
{
  "detail": "Task not found"
}
```

### Business Logic

1. Verify JWT and extract authenticated user_id
2. Compare authenticated user_id with path parameter user_id
3. If mismatch, return 403 Forbidden
4. Query task WHERE id = task_id AND user_id = authenticated_user_id
5. If not found, return 404 Not Found
6. Delete task from database (hard delete)
7. Return success message with deleted task ID

### Security Notes

- User isolation: Delete query filters by user_id
- No soft delete in Phase II (out of scope)
- Permanent deletion - no undo functionality

---

**Contract Status**: ✅ COMPLETE - All task CRUD endpoints fully specified
