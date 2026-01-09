"""
Database connection and session management for Neon PostgreSQL.

Configures SQLAlchemy engine with connection pooling optimized for
Neon Serverless PostgreSQL per research.md recommendations.
"""

import os
from typing import Generator

from dotenv import load_dotenv
from sqlmodel import Session, SQLModel, create_engine

# Load environment variables
load_dotenv()

DATABASE_URL = os.getenv("DATABASE_URL")
if not DATABASE_URL:
    raise ValueError("DATABASE_URL environment variable not set")

# psycopg3 requires special handling for connection URL
# The URL should work as-is with sqlmodel

# Create SQLAlchemy engine with Neon-optimized settings
engine = create_engine(
    DATABASE_URL,
    pool_size=10,  # Base connection pool size
    max_overflow=20,  # Additional connections under load
    pool_pre_ping=True,  # Neon serverless health check
    echo=False,  # Set to True for SQL query logging (dev only)
)


def init_db() -> None:
    """
    Create all database tables.

    Note: Use Alembic migrations in production for version control.
    This is primarily for development/testing environments.
    """
    SQLModel.metadata.create_all(engine)


def get_session() -> Generator[Session, None, None]:
    """
    FastAPI dependency for database sessions.

    Yields:
        Session: SQLModel database session

    Example:
        @app.get("/api/{user_id}/tasks")
        def get_tasks(
            user_id: str,
            session: Session = Depends(get_session)
        ):
            tasks = session.exec(select(Task).where(Task.user_id == user_id)).all()
            return tasks
    """
    with Session(engine) as session:
        yield session
