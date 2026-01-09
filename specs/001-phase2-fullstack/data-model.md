# Data Model: Todo App - Phase II Full-Stack Web Application

**Feature**: `001-phase2-fullstack` | **Date**: 2025-12-29 | **Status**: Phase 1 Design

## Overview

This document defines the SQLModel database schemas for the Todo App Phase II multi-user system. The data model enforces user isolation through foreign key relationships and supports all functional requirements from the specification.

## Database Technology

- **Database**: Neon Serverless PostgreSQL
- **ORM**: SQLModel (combines SQLAlchemy + Pydantic)
- **Migration Tool**: Alembic
- **Connection Pooling**: SQLAlchemy engine with pool_size=10, max_overflow=20

## Entity-Relationship Diagram

```
┌─────────────────────────┐
│        User             │
│─────────────────────────│
│ id (UUID, PK)           │
│ email (String, Unique)  │
│ password_hash (String)  │
│ name (String)           │
│ created_at (DateTime)   │
│ updated_at (DateTime)   │
└─────────────────────────┘
           │
           │ 1:N
           │
           ▼
┌─────────────────────────┐
│        Task             │
│─────────────────────────│
│ id (UUID, PK)           │
│ user_id (UUID, FK)      │◄─── Foreign Key to User.id
│ title (String)          │
│ description (String?)   │
│ completed (Boolean)     │
│ created_at (DateTime)   │
│ updated_at (DateTime)   │
└─────────────────────────┘
```

**Relationship**: One User has many Tasks (1:N). Each Task belongs to exactly one User.

## SQLModel Schemas

### User Model

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional, List

class User(SQLModel, table=True):
    """
    User account for authentication and task ownership.

    Functional Requirements: FR-001, FR-002, FR-003, FR-004
    Security: Passwords stored as bcrypt hashes, never plain text
    """
    __tablename__ = "users"

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique user identifier (UUID v4)"
    )

    # Authentication Fields
    email: str = Field(
        max_length=255,
        unique=True,
        index=True,
        nullable=False,
        description="User email address (case-insensitive, unique)"
    )
    password_hash: str = Field(
        max_length=255,
        nullable=False,
        description="Bcrypt password hash (never store plain text)"
    )

    # User Profile
    name: str = Field(
        max_length=255,
        nullable=False,
        description="User display name"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Account creation timestamp (UTC)"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last profile update timestamp (UTC)"
    )

    # Relationships
    tasks: List["Task"] = Relationship(
        back_populates="owner",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    class Config:
        """Pydantic configuration for validation"""
        json_schema_extra = {
            "example": {
                "email": "user@example.com",
                "name": "John Doe"
            }
        }
```

**Indexes**:
- `email` (unique, btree) - Fast user lookup by email during login
- `id` (primary key, btree) - Standard primary key index

**Constraints**:
- Email uniqueness enforced at database level (prevents duplicate accounts)
- Email case-insensitive comparison required in application logic (normalize to lowercase)
- Password minimum 8 characters enforced in API validation layer (not database)

**Security Notes**:
- `password_hash` uses bcrypt with salt (recommended cost: 12 rounds)
- Never return `password_hash` in API responses (exclude in Pydantic serialization)

---

### Task Model

```python
from sqlmodel import SQLModel, Field, Relationship
from datetime import datetime
from uuid import UUID, uuid4
from typing import Optional

class Task(SQLModel, table=True):
    """
    User's task/todo item with completion tracking.

    Functional Requirements: FR-007 to FR-020
    Security: User isolation enforced via user_id foreign key
    """
    __tablename__ = "tasks"

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique task identifier (UUID v4)"
    )

    # Foreign Key (User Ownership)
    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
        description="Owner user ID (enforces data isolation)"
    )

    # Task Content
    title: str = Field(
        min_length=1,
        max_length=200,
        nullable=False,
        description="Task title (1-200 characters, trimmed)"
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        nullable=True,
        description="Optional task description (max 1000 characters)"
    )

    # Task Status
    completed: bool = Field(
        default=False,
        nullable=False,
        index=True,
        description="Task completion status (default: false)"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True,
        description="Task creation timestamp (UTC)"
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last modification timestamp (UTC)"
    )

    # Relationships
    owner: User = Relationship(back_populates="tasks")

    class Config:
        """Pydantic configuration for validation"""
        json_schema_extra = {
            "example": {
                "title": "Buy groceries",
                "description": "Milk, eggs, bread",
                "completed": False
            }
        }
```

**Indexes**:
- `user_id` (foreign key, btree) - Critical for user isolation queries (`WHERE user_id = ?`)
- `completed` (btree) - Optional filter for completed/incomplete tasks
- `created_at` (btree) - Supports default sort order (newest first: `ORDER BY created_at DESC`)
- `id` (primary key, btree) - Standard primary key index

**Constraints**:
- `user_id` foreign key references `users.id` with ON DELETE CASCADE (deleting user deletes all tasks)
- Title length validation (1-200 chars) enforced in Pydantic model + API layer
- Title trimming happens in application logic before save (FR-017)

**Performance Notes**:
- Composite index `(user_id, created_at DESC)` recommended for optimized task list queries
- Expected query pattern: `SELECT * FROM tasks WHERE user_id = ? ORDER BY created_at DESC`
- Index covers both filter and sort, avoiding table scan

---

## Database Initialization

### Connection Setup

```python
# backend/database.py
from sqlmodel import create_engine, Session, SQLModel
import os

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

engine = create_engine(
    DATABASE_URL,
    pool_size=10,           # Base connection pool size
    max_overflow=20,        # Additional connections under load
    pool_pre_ping=True,     # Neon serverless health check
    echo=False              # Set to True for SQL query logging (dev only)
)

def init_db():
    """Create all tables (use Alembic migrations in production)"""
    SQLModel.metadata.create_all(engine)

def get_session():
    """FastAPI dependency for database sessions"""
    with Session(engine) as session:
        yield session
```

### Migration Strategy

**Development**: Use `SQLModel.metadata.create_all(engine)` for rapid iteration

**Production**: Use Alembic migrations for version control and rollback capability

```bash
# Initialize Alembic
alembic init migrations

# Generate migration from SQLModel schemas
alembic revision --autogenerate -m "Create users and tasks tables"

# Apply migrations
alembic upgrade head
```

---

## Data Validation Rules

### User Entity
- Email format: RFC 5322 compliant (validated by Pydantic EmailStr)
- Email uniqueness: Case-insensitive (normalize to lowercase before INSERT)
- Password: Minimum 8 characters (validated in API layer before hashing)
- Name: Required, max 255 characters

### Task Entity
- Title: Required, 1-200 characters (trim whitespace before validation)
- Description: Optional, max 1000 characters
- Completed: Boolean (default false)
- user_id: Must reference existing User.id (enforced by foreign key)

---

## Query Patterns

### User Authentication
```python
# Find user by email (case-insensitive)
user = session.exec(
    select(User).where(func.lower(User.email) == email.lower())
).first()
```

### Task List (User-Scoped)
```python
# Get all tasks for user, newest first
tasks = session.exec(
    select(Task)
    .where(Task.user_id == user_id)
    .order_by(Task.created_at.desc())
).all()
```

### Task CRUD (with User Isolation)
```python
# Get single task with ownership check
task = session.exec(
    select(Task).where(Task.id == task_id, Task.user_id == user_id)
).first()

if not task:
    raise HTTPException(404, detail="Task not found")
```

---

## Security Guarantees

1. **User Isolation**: All task queries MUST filter by `user_id` (enforced in every endpoint)
2. **Foreign Key Integrity**: Database enforces `user_id` references valid user
3. **Cascade Deletion**: Deleting user automatically deletes all user's tasks
4. **Index Performance**: Indexes on `user_id` ensure multi-tenant queries remain fast
5. **No Password Leakage**: `password_hash` excluded from API responses

---

## Scalability Considerations

- **Current Scale**: 100 concurrent users, ~1000 tasks per user (constitution assumption)
- **Database Size Estimate**: 100 users × 1000 tasks = 100k tasks (~10MB with indexes)
- **Query Performance**: Indexed `user_id` queries scale linearly with users (not tasks)
- **Future Optimization**: Partition tasks table by `user_id` if exceeding 1M tasks

---

## Migration Checklist

Before deploying to production:
- [ ] Alembic migrations created and tested in staging
- [ ] Composite index `(user_id, created_at DESC)` added to tasks table
- [ ] Email uniqueness constraint verified (case-insensitive collation)
- [ ] Foreign key cascade deletion tested
- [ ] Connection pooling configured (pool_size=10, max_overflow=20)
- [ ] Database backups enabled (Neon automated backups)

---

**Data Model Status**: ✅ COMPLETE - Ready for API contract definition (Phase 1: contracts/)
