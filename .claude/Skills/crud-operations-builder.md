# CRUD Operations Builder

**Name:** crud-operations-builder

**Purpose:** Generate complete CRUD endpoints for a resource

**Input:** Resource name, SQLModel model

**Output:** All 5 REST endpoints (list, create, get, update, delete) with JWT auth

**Usage:**
```
@crud-operations-builder for Task model
```

## Description

This skill generates a complete set of CRUD (Create, Read, Update, Delete) operations with the following features:
- List all resources (GET /resources)
- Create resource (POST /resources)
- Get single resource (GET /resources/{id})
- Update resource (PUT /resources/{id})
- Delete resource (DELETE /resources/{id})
- JWT authentication on all endpoints
- Database session management
- Error handling (404, 401, 403)
- Input validation
- Pagination support (list endpoint)

## Example Usage

### Basic CRUD for Model
```
@crud-operations-builder for Task model
```

### CRUD with Custom Permissions
```
@crud-operations-builder for Task model with user ownership check
```

### CRUD with Pagination
```
@crud-operations-builder for Task model with pagination limit 50
```

## Generated Code Structure

The skill will generate:
1. **Router file** (e.g., `routers/tasks.py`)
2. **List endpoint** with pagination
3. **Create endpoint** with validation
4. **Get endpoint** with 404 handling
5. **Update endpoint** with ownership check
6. **Delete endpoint** with soft delete option
7. **Request/Response schemas** using Pydantic
8. **JWT authentication** dependency
9. **Database queries** using SQLModel

## Integration Points

- **FastAPI**: Router and endpoint definitions
- **SQLModel**: Database queries and models
- **JWT Auth**: User authentication middleware
- **PostgreSQL**: Database operations
- **Pydantic**: Request/response validation

## Example Generated Router

```python
# routers/tasks.py

from fastapi import APIRouter, Depends, HTTPException, Query
from sqlmodel import Session, select
from typing import List, Optional
from uuid import UUID

from models import Task
from database import get_session
from auth import get_current_user

router = APIRouter(prefix="/tasks", tags=["tasks"])


# Schemas
class TaskCreate(BaseModel):
    title: str = Field(max_length=255)
    description: Optional[str] = None


class TaskUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=255)
    description: Optional[str] = None
    completed: Optional[bool] = None


class TaskResponse(BaseModel):
    id: UUID
    title: str
    description: Optional[str]
    completed: bool
    user_id: UUID
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


# 1. List all tasks (with pagination)
@router.get("", response_model=List[TaskResponse])
async def list_tasks(
    skip: int = Query(0, ge=0),
    limit: int = Query(50, ge=1, le=100),
    user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    List all tasks for the authenticated user.

    - **skip**: Number of records to skip (for pagination)
    - **limit**: Maximum number of records to return
    """
    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .offset(skip)
        .limit(limit)
    )
    tasks = session.exec(statement).all()
    return tasks


# 2. Create new task
@router.post("", response_model=TaskResponse, status_code=201)
async def create_task(
    task_data: TaskCreate,
    user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Create a new task for the authenticated user.

    - **title**: Task title (required, max 255 chars)
    - **description**: Task description (optional)
    """
    task = Task(
        **task_data.model_dump(),
        user_id=user_id,
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


# 3. Get single task
@router.get("/{task_id}", response_model=TaskResponse)
async def get_task(
    task_id: UUID,
    user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Get a specific task by ID.

    - **task_id**: UUID of the task to retrieve
    """
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check ownership
    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    return task


# 4. Update task
@router.put("/{task_id}", response_model=TaskResponse)
async def update_task(
    task_id: UUID,
    task_data: TaskUpdate,
    user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Update a task.

    - **task_id**: UUID of the task to update
    - **title**: New title (optional)
    - **description**: New description (optional)
    - **completed**: New completion status (optional)
    """
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check ownership
    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Update only provided fields
    update_data = task_data.model_dump(exclude_unset=True)
    for key, value in update_data.items():
        setattr(task, key, value)

    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task


# 5. Delete task
@router.delete("/{task_id}", status_code=204)
async def delete_task(
    task_id: UUID,
    user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    """
    Delete a task.

    - **task_id**: UUID of the task to delete
    """
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    # Check ownership
    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    session.delete(task)
    session.commit()

    return None
```

## Features

- **JWT Authentication**: All endpoints require valid JWT token
- **Ownership Check**: Users can only access their own resources
- **Pagination**: List endpoint supports skip/limit parameters
- **Validation**: Pydantic schemas validate input data
- **Error Handling**: Proper HTTP status codes (404, 401, 403)
- **Type Safety**: Full type hints throughout
- **Database Sessions**: Automatic session management
- **Response Models**: Consistent response structure
- **Partial Updates**: Update endpoint supports partial data

## Advanced Features

### Filtering
```python
@router.get("")
async def list_tasks(
    completed: Optional[bool] = None,
    user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = select(Task).where(Task.user_id == user_id)

    if completed is not None:
        statement = statement.where(Task.completed == completed)

    tasks = session.exec(statement).all()
    return tasks
```

### Soft Delete
```python
@router.delete("/{task_id}")
async def delete_task(
    task_id: UUID,
    user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    task = session.get(Task, task_id)

    if not task:
        raise HTTPException(status_code=404, detail="Task not found")

    if task.user_id != user_id:
        raise HTTPException(status_code=403, detail="Not authorized")

    # Soft delete
    task.deleted_at = datetime.utcnow()
    session.add(task)
    session.commit()

    return None
```

### Search
```python
@router.get("/search")
async def search_tasks(
    q: str = Query(..., min_length=1),
    user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session),
):
    statement = (
        select(Task)
        .where(Task.user_id == user_id)
        .where(Task.title.contains(q))
    )
    tasks = session.exec(statement).all()
    return tasks
```

## Usage in Main App

```python
# main.py

from fastapi import FastAPI
from routers import tasks

app = FastAPI()

# Include router
app.include_router(tasks.router)
```

## Testing

```python
# tests/test_tasks.py

import pytest
from fastapi.testclient import TestClient

def test_list_tasks(client: TestClient, auth_headers: dict):
    response = client.get("/tasks", headers=auth_headers)
    assert response.status_code == 200
    assert isinstance(response.json(), list)

def test_create_task(client: TestClient, auth_headers: dict):
    response = client.post(
        "/tasks",
        headers=auth_headers,
        json={"title": "Test Task"}
    )
    assert response.status_code == 201
    assert response.json()["title"] == "Test Task"
```
