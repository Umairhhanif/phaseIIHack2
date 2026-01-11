"""
SQLModel database schemas for Todo App Phase II + Phase III.

This module defines the User, Task, Tag, TaskTag, Conversation, and Message models
with proper relationships, indexes, and validation rules per specification.
"""

from datetime import datetime
from enum import Enum
from typing import List, Optional, TYPE_CHECKING
from uuid import UUID, uuid4

from sqlmodel import Field, Relationship, SQLModel
from sqlalchemy import Index

if TYPE_CHECKING:
    from models import Task, Tag, User, Conversation, Message


class Priority(str, Enum):
    """Task priority levels."""
    HIGH = "HIGH"
    MEDIUM = "MEDIUM"
    LOW = "LOW"


class TaskTag(SQLModel, table=True):
    """
    Join table for many-to-many relationship between Task and Tag.

    Enables efficient filtering by tag through SQL joins.
    """

    __tablename__ = "task_tags"

    # Foreign Keys
    task_id: UUID = Field(
        foreign_key="tasks.id",
        primary_key=True,
        nullable=False,
        description="Associated task ID",
    )
    tag_id: UUID = Field(
        foreign_key="tags.id",
        primary_key=True,
        nullable=False,
        description="Associated tag ID",
    )

    # Timestamp
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Timestamp when tag was assigned to task",
    )


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
        description="Unique user identifier (UUID v4)",
    )

    # Authentication Fields
    email: str = Field(
        max_length=255,
        unique=True,
        index=True,
        nullable=False,
        description="User email address (case-insensitive, unique)",
    )
    password_hash: str = Field(
        max_length=255,
        nullable=False,
        description="Bcrypt password hash (never store plain text)",
    )

    # User Profile
    name: str = Field(
        max_length=255, nullable=False, description="User display name"
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Account creation timestamp (UTC)",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last profile update timestamp (UTC)",
    )

    # Relationships
    tasks: List["Task"] = Relationship(
        back_populates="owner", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )
    tags: List["Tag"] = Relationship(
        back_populates="owner", sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )


class Task(SQLModel, table=True):
    """
    User's task/todo item with completion tracking and organization features.

    Functional Requirements: FR-007 to FR-020, FR-001, FR-002, FR-004-FR-016
    Security: User isolation enforced via user_id foreign key
    """

    __tablename__ = "tasks"

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique task identifier (UUID v4)",
    )

    # Foreign Key (User Ownership)
    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
        description="Owner user ID (enforces data isolation)",
    )

    # Task Content
    title: str = Field(
        min_length=1,
        max_length=200,
        nullable=False,
        description="Task title (1-200 characters, trimmed)",
    )
    description: Optional[str] = Field(
        default=None,
        max_length=1000,
        nullable=True,
        description="Optional task description (max 1000 characters)",
    )

    # Task Status
    completed: bool = Field(
        default=False,
        nullable=False,
        index=True,
        description="Task completion status (default: false)",
    )

    # Organization Features
    priority: Priority = Field(
        default=Priority.MEDIUM,
        nullable=False,
        description="Task priority level (high/medium/low)",
    )
    due_date: Optional[datetime] = Field(
        default=None,
        nullable=True,
        description="Optional due date for the task",
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True,
        description="Task creation timestamp (UTC)",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Last modification timestamp (UTC)",
    )

    # Relationships
    owner: "User" = Relationship(back_populates="tasks")
    tags: List["Tag"] = Relationship(
        back_populates="tasks",
        link_model=TaskTag,
        sa_relationship_kwargs={"lazy": "selectin"}
    )


class Tag(SQLModel, table=True):
    """
    User-specific label for categorizing tasks.

    Functional Requirements: FR-002, FR-003, FR-007, FR-013
    """

    __tablename__ = "tags"

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique tag identifier (UUID v4)",
    )

    # Foreign Key (User Ownership)
    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
        description="Owner user ID (enforces data isolation)",
    )

    # Tag Content
    name: str = Field(
        min_length=1,
        max_length=50,
        nullable=False,
        description="Tag name (1-50 characters)",
    )
    color: Optional[str] = Field(
        default=None,
        max_length=7,
        nullable=True,
        description="Tag display color in hex format (#XXXXXX)",
    )

    # Timestamp
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        description="Tag creation timestamp (UTC)",
    )

    # Relationships
    owner: "User" = Relationship(back_populates="tags")
    tasks: List["Task"] = Relationship(
        back_populates="tags",
        link_model=TaskTag,
        sa_relationship_kwargs={"lazy": "selectin"}
    )


class MessageRole(str, Enum):
    """Message role in conversation."""
    USER = "user"
    ASSISTANT = "assistant"


class Conversation(SQLModel, table=True):
    """
    Conversation thread between a user and the AI chatbot.

    Functional Requirements: US3 - Conversation History Persistence
    Security: User isolation enforced via user_id foreign key
    """

    __tablename__ = "conversations"

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique conversation identifier (UUID v4)",
    )

    # Foreign Key (User Ownership)
    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
        description="Owner user ID (enforces data isolation)",
    )

    # Conversation Content
    title: Optional[str] = Field(
        default=None,
        max_length=100,
        nullable=True,
        description="Optional conversation title (auto-generated from first message)",
    )

    # Timestamps
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True,
        description="Conversation creation timestamp (UTC)",
    )
    updated_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True,
        description="Last message timestamp (UTC)",
    )

    # Relationships
    messages: List["Message"] = Relationship(
        back_populates="conversation",
        sa_relationship_kwargs={"cascade": "all, delete-orphan"}
    )

    # Composite index for efficient user conversation queries
    __table_args__ = (
        Index("ix_conversations_user_updated", "user_id", "updated_at"),
    )


class Message(SQLModel, table=True):
    """
    Individual message in a conversation thread.

    Functional Requirements: US3 - Conversation History Persistence
    Security: User isolation enforced via user_id and conversation_id foreign keys
    """

    __tablename__ = "messages"

    # Primary Key
    id: UUID = Field(
        default_factory=uuid4,
        primary_key=True,
        nullable=False,
        description="Unique message identifier (UUID v4)",
    )

    # Foreign Keys
    conversation_id: UUID = Field(
        foreign_key="conversations.id",
        nullable=False,
        index=True,
        description="Associated conversation ID",
    )
    user_id: UUID = Field(
        foreign_key="users.id",
        nullable=False,
        index=True,
        description="Owner user ID (enforces data isolation)",
    )

    # Message Content
    role: MessageRole = Field(
        nullable=False,
        description="Message role (user or assistant)",
    )
    content: str = Field(
        nullable=False,
        description="Message text content",
    )
    tool_calls: Optional[str] = Field(
        default=None,
        nullable=True,
        description="JSON string of tool calls made by assistant",
    )

    # Timestamp
    created_at: datetime = Field(
        default_factory=datetime.utcnow,
        nullable=False,
        index=True,
        description="Message creation timestamp (UTC)",
    )

    # Relationships
    conversation: "Conversation" = Relationship(back_populates="messages")

    # Composite index for efficient history queries
    __table_args__ = (
        Index("ix_messages_user_conversation", "user_id", "conversation_id"),
    )
