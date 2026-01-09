"""
Task CRUD endpoints with user isolation and organization features.

Reference: contracts/task-organization-endpoints.md
"""

from datetime import datetime
from typing import List, Optional
from uuid import UUID, uuid4

from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel, Field
from sqlmodel import Session, select, and_

from database import get_session
from lib.errors import ForbiddenError, NotFoundError, ValidationError
from models import Priority, Task, TaskTag, User
from routes.auth import verify_jwt

router = APIRouter()


# =============================================================================
# Pydantic Schemas
# =============================================================================

class TagSummary(BaseModel):
    """Simplified tag info for task responses."""
    id: str
    name: str
    color: Optional[str] = None


class TaskResponse(BaseModel):
    """Task response model with organization features."""
    id: str
    user_id: str
    title: str
    description: Optional[str]
    completed: bool
    priority: str  # "high" | "medium" | "low"
    due_date: Optional[str]  # ISO 8601 date
    tags: List[TagSummary] = []
    created_at: str  # ISO 8601 datetime
    updated_at: str  # ISO 8601 datetime


class TaskListResponse(BaseModel):
    """Paginated task list response."""
    tasks: List[TaskResponse]
    total: int
    limit: int
    offset: int


class CreateTaskRequest(BaseModel):
    """Task creation request payload with organization features."""
    title: str = Field(..., min_length=1, max_length=200, description="Task title")
    description: Optional[str] = Field(None, max_length=1000, description="Optional task description")
    priority: Optional[str] = Field(None, description="Priority: high, medium, low (default: medium)")
    due_date: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$", description="Due date YYYY-MM-DD")
    tag_ids: Optional[List[str]] = Field(None, description="Tag IDs to associate (max 10)")


class UpdateTaskRequest(BaseModel):
    """Task update request payload with organization features."""
    title: Optional[str] = Field(None, min_length=1, max_length=200)
    description: Optional[str] = Field(None, max_length=1000)
    priority: Optional[str] = Field(None, description="Priority: high, medium, low, or null to clear")
    due_date: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$", description="Due date YYYY-MM-DD or null")
    tag_ids: Optional[List[str]] = Field(None, description="Tag IDs to set (replaces existing), null keeps existing, [] clears all")


class UpdatePriorityRequest(BaseModel):
    """Priority update request."""
    priority: str = Field(..., description="Priority: high, medium, or low")


class UpdateDueDateRequest(BaseModel):
    """Due date update request."""
    due_date: Optional[str] = Field(None, pattern=r"^\d{4}-\d{2}-\d{2}$", description="Due date YYYY-MM-DD")


# =============================================================================
# Helper Functions
# =============================================================================

def task_to_response(task: Task, session: Session) -> TaskResponse:
    """Convert Task model to response dict with tags."""
    # Fetch tags for this task
    tag_links = session.exec(
        select(TaskTag).where(TaskTag.task_id == task.id)
    ).all()

    tags = []
    for link in tag_links:
        tag = session.exec(
            select(Tag).where(Tag.id == link.tag_id)
        ).first()
        if tag:
            tags.append(TagSummary(
                id=str(tag.id),
                name=tag.name,
                color=tag.color
            ))

    return TaskResponse(
        id=str(task.id),
        user_id=str(task.user_id),
        title=task.title,
        description=task.description,
        completed=task.completed,
        priority=task.priority.value if hasattr(task.priority, 'value') else str(task.priority),
        due_date=task.due_date.isoformat() if task.due_date else None,
        tags=tags,
        created_at=task.created_at.isoformat(),
        updated_at=task.updated_at.isoformat(),
    )


def verify_user_access(user_id: str, current_user: User) -> None:
    """Verify that JWT user matches path user_id."""
    if str(current_user.id) != user_id:
        raise ForbiddenError("Cannot access other user's tasks")


def validate_priority(priority: Optional[str]) -> Optional[Priority]:
    """Validate and convert priority string to enum."""
    if priority is None:
        return None
    priority_upper = priority.upper()
    for p in Priority:
        if p.value == priority.lower() or p.name == priority_upper:
            return p
    raise ValidationError(f"Invalid priority: {priority}. Must be 'high', 'medium', or 'low'")


def validate_tag_ids(tag_ids: Optional[List[str]], user_id: UUID, session: Session) -> List[UUID]:
    """Validate tag IDs exist and belong to user."""
    if not tag_ids:
        return []

    if len(tag_ids) > 10:
        raise ValidationError("Maximum 10 tags per task")

    uuids = []
    for tag_id in tag_ids:
        try:
            tag_uuid = UUID(tag_id)
        except ValueError:
            raise ValidationError(f"Invalid tag ID: {tag_id}")

        # Verify tag exists and belongs to user
        tag = session.exec(
            select(Tag).where(Tag.id == tag_uuid, Tag.user_id == user_id)
        ).first()
        if not tag:
            raise ValidationError(f"Tag not found: {tag_id}")

        uuids.append(tag_uuid)

    return uuids


# =============================================================================
# List Tasks Endpoint with Filter/Search/Sort
# =============================================================================

@router.get("/{user_id}/tasks", response_model=TaskListResponse)
async def list_tasks(
    user_id: str,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
    # Search
    search: Optional[str] = Query(None, description="Keyword search in title and description"),
    # Filters
    status: Optional[str] = Query("all", description="Filter by completion: all, pending, completed"),
    priority_filter: Optional[str] = Query(None, alias="priority", description="Filter by priority: high, medium, low"),
    tag_id: Optional[List[str]] = Query(None, alias="tag_id", description="Filter by tag IDs"),
    # Sort
    sort: str = Query("created_desc", description="Sort order: created_desc, created_asc, due_date_asc, due_date_desc, priority, priority_reverse, alpha, alpha_reverse"),
    # Pagination
    limit: int = Query(50, ge=1, le=100),
    offset: int = Query(0, ge=0),
) -> TaskListResponse:
    """
    Get tasks for user with filtering, searching, and sorting.

    Functional Requirements: FR-004, FR-005, FR-006, FR-007, FR-008, FR-009, FR-010, FR-011, FR-012, FR-015
    """
    verify_user_access(user_id, current_user)
    user_uuid = UUID(user_id)

    # Build base query
    query = select(Task).where(Task.user_id == user_uuid)

    # Apply search (case-insensitive ILIKE)
    if search:
        search_pattern = f"%{search}%"
        query = query.where(
            (Task.title.ilike(search_pattern)) |
            (Task.description.ilike(search_pattern))
        )

    # Apply status filter
    if status == "pending":
        query = query.where(Task.completed == False)
    elif status == "completed":
        query = query.where(Task.completed == True)

    # Apply priority filter
    if priority_filter:
        validated_priority = validate_priority(priority_filter)
        if validated_priority:
            query = query.where(Task.priority == validated_priority)

    # Apply tag filter (tasks must have ALL specified tags)
    if tag_id:
        for t_id in tag_id:
            tag_uuid = UUID(t_id)
            query = query.where(
                Task.id.in_(
                    select(TaskTag.task_id).where(TaskTag.tag_id == tag_uuid)
                )
            )

    # Get total count before pagination
    total_count = len(session.exec(query).all())

    # Apply sorting
    sort_lower = sort.lower()
    if sort_lower == "created_desc":
        query = query.order_by(Task.created_at.desc())
    elif sort_lower == "created_asc":
        query = query.order_by(Task.created_at.asc())
    elif sort_lower == "due_date_asc":
        query = query.order_by(Task.due_date.asc().nullsfirst())
    elif sort_lower == "due_date_desc":
        query = query.order_by(Task.due_date.desc().nullslast())
    elif sort_lower == "priority":
        # High (0), Medium (1), Low (2) - reverse for highest first
        query = query.order_by(Task.priority.desc())
    elif sort_lower == "priority_reverse":
        query = query.order_by(Task.priority.asc())
    elif sort_lower == "alpha":
        query = query.order_by(Task.title.asc())
    elif sort_lower == "alpha_reverse":
        query = query.order_by(Task.title.desc())
    else:
        query = query.order_by(Task.created_at.desc())

    # Apply pagination
    query = query.offset(offset).limit(limit)

    # Execute query
    tasks = session.exec(query).all()

    # Convert to response
    task_responses = [task_to_response(task, session) for task in tasks]

    return TaskListResponse(
        tasks=task_responses,
        total=total_count,
        limit=limit,
        offset=offset,
    )


# =============================================================================
# Create Task Endpoint
# =============================================================================

@router.post("/{user_id}/tasks", response_model=TaskResponse, status_code=201)
async def create_task(
    user_id: str,
    data: CreateTaskRequest,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
) -> TaskResponse:
    """
    Create new task with optional priority, due date, and tags.

    Functional Requirements: FR-001, FR-002, FR-007, FR-008
    """
    verify_user_access(user_id, current_user)
    user_uuid = UUID(user_id)

    # Validate title
    title = data.title.strip()
    if len(title) < 1:
        raise ValidationError("Title cannot be empty after trimming whitespace")

    # Validate priority
    priority = validate_priority(data.priority) or Priority.MEDIUM

    # Parse due date
    due_date = None
    if data.due_date:
        try:
            due_date = datetime.fromisoformat(data.due_date).date()
        except ValueError:
            raise ValidationError("Invalid due date format. Use YYYY-MM-DD")

    # Validate and get tag UUIDs
    tag_uuids = validate_tag_ids(data.tag_ids, user_uuid, session)

    # Create task
    task = Task(
        user_id=user_uuid,
        title=title,
        description=data.description,
        completed=False,
        priority=priority,
        due_date=due_date,
    )

    session.add(task)
    session.flush()  # Get the task ID

    # Add tag associations
    for tag_uuid in tag_uuids:
        task_tag = TaskTag(task_id=task.id, tag_id=tag_uuid)
        session.add(task_tag)

    session.commit()
    session.refresh(task)

    return task_to_response(task, session)


# =============================================================================
# Get Single Task
# =============================================================================

@router.get("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def get_task(
    user_id: str,
    task_id: str,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
) -> TaskResponse:
    """
    Get single task by ID.

    Functional Requirements: FR-014
    """
    verify_user_access(user_id, current_user)

    task = session.exec(
        select(Task).where(Task.id == UUID(task_id), Task.user_id == UUID(user_id))
    ).first()

    if not task:
        raise NotFoundError("Task not found")

    return task_to_response(task, session)


# =============================================================================
# Update Task Endpoint
# =============================================================================

@router.put("/{user_id}/tasks/{task_id}", response_model=TaskResponse)
async def update_task(
    user_id: str,
    task_id: str,
    data: UpdateTaskRequest,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
) -> TaskResponse:
    """
    Update task with optional priority, due date, and tag modifications.

    Functional Requirements: FR-001, FR-002, FR-012, FR-014
    """
    verify_user_access(user_id, current_user)

    task = session.exec(
        select(Task).where(Task.id == UUID(task_id), Task.user_id == UUID(user_id))
    ).first()

    if not task:
        raise NotFoundError("Task not found")

    # Update title
    if data.title is not None:
        title = data.title.strip()
        if len(title) < 1:
            raise ValidationError("Title cannot be empty after trimming whitespace")
        task.title = title

    # Update description
    if data.description is not None:
        task.description = data.description

    # Update priority
    if data.priority is not None:
        task.priority = validate_priority(data.priority)

    # Update due date
    if data.due_date is not None:
        if data.due_date:
            try:
                task.due_date = datetime.fromisoformat(data.due_date).date()
            except ValueError:
                raise ValidationError("Invalid due date format. Use YYYY-MM-DD")
        else:
            task.due_date = None

    # Update tags (if explicitly provided)
    if data.tag_ids is not None:
        # Remove existing tag associations
        session.exec(
            select(TaskTag).where(TaskTag.task_id == task.id)
        ).delete()

        # Add new tag associations
        if data.tag_ids:
            tag_uuids = validate_tag_ids(data.tag_ids, UUID(user_id), session)
            for tag_uuid in tag_uuids:
                task_tag = TaskTag(task_id=task.id, tag_id=tag_uuid)
                session.add(task_tag)

    task.updated_at = datetime.utcnow()
    session.add(task)
    session.commit()
    session.refresh(task)

    return task_to_response(task, session)


# =============================================================================
# Update Priority Endpoint
# =============================================================================

@router.patch("/{user_id}/tasks/{task_id}/priority", response_model=TaskResponse)
async def update_task_priority(
    user_id: str,
    task_id: str,
    data: UpdatePriorityRequest,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
) -> TaskResponse:
    """
    Update only the priority of a task.

    Functional Requirements: FR-001
    """
    verify_user_access(user_id, current_user)

    task = session.exec(
        select(Task).where(Task.id == UUID(task_id), Task.user_id == UUID(user_id))
    ).first()

    if not task:
        raise NotFoundError("Task not found")

    task.priority = validate_priority(data.priority)
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task_to_response(task, session)


# =============================================================================
# Update Due Date Endpoint
# =============================================================================

@router.patch("/{user_id}/tasks/{task_id}/due-date", response_model=TaskResponse)
async def update_task_due_date(
    user_id: str,
    task_id: str,
    data: UpdateDueDateRequest,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
) -> TaskResponse:
    """
    Update only the due date of a task.

    Functional Requirements: FR-008
    """
    verify_user_access(user_id, current_user)

    task = session.exec(
        select(Task).where(Task.id == UUID(task_id), Task.user_id == UUID(user_id))
    ).first()

    if not task:
        raise NotFoundError("Task not found")

    if data.due_date:
        try:
            task.due_date = datetime.fromisoformat(data.due_date).date()
        except ValueError:
            raise ValidationError("Invalid due date format. Use YYYY-MM-DD")
    else:
        task.due_date = None

    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task_to_response(task, session)


# =============================================================================
# Toggle Completion Endpoint (Existing)
# =============================================================================

@router.patch("/{user_id}/tasks/{task_id}/toggle", response_model=TaskResponse)
async def toggle_task_completion(
    user_id: str,
    task_id: str,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
) -> TaskResponse:
    """
    Toggle task completion status.

    Functional Requirements: FR-011, FR-014
    """
    verify_user_access(user_id, current_user)

    task = session.exec(
        select(Task).where(Task.id == UUID(task_id), Task.user_id == UUID(user_id))
    ).first()

    if not task:
        raise NotFoundError("Task not found")

    task.completed = not task.completed
    task.updated_at = datetime.utcnow()

    session.add(task)
    session.commit()
    session.refresh(task)

    return task_to_response(task, session)


# =============================================================================
# Delete Task Endpoint (Existing)
# =============================================================================

@router.delete("/{user_id}/tasks/{task_id}", status_code=204)
async def delete_task(
    user_id: str,
    task_id: str,
    current_user: User = Depends(verify_jwt),
    session: Session = Depends(get_session),
) -> None:
    """
    Delete task permanently.

    Functional Requirements: FR-013, FR-014
    """
    verify_user_access(user_id, current_user)

    task = session.exec(
        select(Task).where(Task.id == UUID(task_id), Task.user_id == UUID(user_id))
    ).first()

    if not task:
        raise NotFoundError("Task not found")

    # Delete from database (cascades to task_tags via foreign key)
    session.delete(task)
    session.commit()
