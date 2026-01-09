# Quickstart: Task Organization Features

**Feature**: Task Organization Features
**Date**: 2025-12-31
**Status**: Complete

## Prerequisites

- Python 3.13+ with UV package manager
- Node.js 20+ with npm/pnpm
- PostgreSQL database (Neon or local)
- Git

## Development Setup

### 1. Database Migration

```bash
# Run migrations to add new tables and columns
cd backend
uv run alembic upgrade head
```

The migration will:
- Add `priority` column (VARCHAR, default 'medium') to tasks table
- Add `due_date` column (DATE, nullable) to tasks table
- Create `tags` table for user-specific labels
- Create `task_tags` join table for many-to-many relationships
- Create indexes for filtering and sorting performance

### 2. Backend Development

```bash
cd backend

# Install dependencies
uv sync

# Run development server
uv run uvicorn main:app --reload

# Run tests
uv run pytest tests/ -v
```

**Key Files to Modify:**
- `models.py` - Add Priority enum, Tag model, TaskTag model
- `routes/tasks.py` - Add filter/sort parameters to list endpoint
- `routes/tags.py` - NEW file for tag CRUD operations

### 3. Frontend Development

```bash
cd frontend

# Install dependencies
npm install

# Run development server
npm run dev

# Run tests
npm run test
```

**Key Files to Modify:**
- `lib/types.ts` - Add Priority type, Tag interface, extend Task
- `lib/api.ts` - Add tag endpoints and filter params to task list
- `components/TaskList.tsx` - Add priority column, tag badges
- `components/TaskItem.tsx` - Add priority selector, tag badges
- `components/TaskForm.tsx` - Add priority dropdown, tag input
- `components/FilterBar.tsx` - NEW component for filter controls
- `components/SortDropdown.tsx` - NEW component for sort selector

## Testing

### Backend Unit Tests

```bash
cd backend
uv run pytest tests/unit/test_models.py -v
uv run pytest tests/unit/test_tags.py -v
```

### Backend Integration Tests

```bash
cd backend
uv run pytest tests/integration/test_task_organization.py -v
```

### Frontend Component Tests

```bash
cd frontend
npm run test -- --watchAll=false
```

## API Testing

### List Tasks with Filters

```bash
# Search for tasks
curl -X GET "http://localhost:8000/api/user-123/tasks?search=proposal" \
  -H "Authorization: Bearer <token>"

# Filter by priority and status
curl -X GET "http://localhost:8000/api/user-123/tasks?priority=high&status=pending" \
  -H "Authorization: Bearer <token>"

# Sort by due date
curl -X GET "http://localhost:8000/api/user-123/tasks?sort=due_date_asc" \
  -H "Authorization: Bearer <token>"

# Combined filter + search
curl -X GET "http://localhost:8000/api/user-123/tasks?search=work&priority=high&sort=alpha" \
  -H "Authorization: Bearer <token>"
```

### Tag Management

```bash
# Create a tag
curl -X POST "http://localhost:8000/api/user-123/tags" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"name": "work", "color": "#3b82f6"}'

# List all tags
curl -X GET "http://localhost:8000/api/user-123/tags?with_counts=true" \
  -H "Authorization: Bearer <token>"

# Create task with tags
curl -X POST "http://localhost:8000/api/user-123/tasks" \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"title": "Important task", "priority": "high", "tag_ids": ["tag-uuid-1"]}'
```

## Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Search results | < 500ms | Case-insensitive LIKE query |
| Filter results | < 200ms | Indexed column queries |
| Sort results | < 200ms | Database sort |
| Combined filter+search | < 300ms | Multiple query conditions |
| API response (p95) | < 200ms | Overall endpoint latency |

## Common Issues

### Filter Not Working

Ensure query parameter names match exactly:
- `status` not `Status`
- `priority` not `Priority`
- `tag_id` (singular, not plural)

### Tags Not Appearing on Tasks

- Check that tag_ids array is passed in request body
- Verify tag exists and belongs to user
- Ensure TaskTag join records were created

### Search Returns No Results

- Search is case-insensitive but requires exact word matching
- Partial words work (e.g., "prop" finds "proposal")
- Searches title AND description fields

## Next Steps

1. Run database migration
2. Add Tag model to `backend/models.py`
3. Add TaskTag model to `backend/models.py`
4. Update Task model with priority and due_date fields
5. Create `backend/routes/tags.py` with tag CRUD
6. Update `backend/routes/tasks.py` with filter/sort params
7. Update `frontend/lib/types.ts` with new types
8. Update `frontend/lib/api.ts` with new endpoints
9. Create filter and sort UI components
10. Test all functionality end-to-end
