# SQLModel Schema Creator

**Name:** sqlmodel-schema-creator

**Purpose:** Generate SQLModel database models from schema specs

**Input:** Table name, fields, relationships, indexes

**Output:** SQLModel class with proper types, foreign keys, indexes

**Usage:**
```
@sqlmodel-schema-creator create Task model with user_id FK
```

## Description

This skill generates complete SQLModel database models with the following features:
- Proper SQLModel class structure
- Type-safe field definitions
- Foreign key relationships
- Unique constraints and indexes
- Default values and nullable fields
- Timestamps (created_at, updated_at)
- Table configuration and naming
- Relationship definitions

## Example Usage

### Basic Model Creation
```
@sqlmodel-schema-creator create User model
```

### Model with Foreign Key
```
@sqlmodel-schema-creator create Task model with user_id FK
```

### Model with Multiple Relationships
```
@sqlmodel-schema-creator create Comment model with task_id and user_id FKs
```

### Model with Indexes
```
@sqlmodel-schema-creator create Product model with indexed sku field
```

## Generated Code Structure

The skill will generate:
1. **SQLModel class definition** with proper inheritance
2. **Field definitions** with SQLModel Field() configuration
3. **Type annotations** using Python typing and Optional
4. **Foreign keys** with proper ForeignKey constraints
5. **Indexes** for performance optimization
6. **Unique constraints** for data integrity
7. **Default values** and nullable field handling
8. **Timestamps** with automatic created_at/updated_at
9. **Table configuration** using __tablename__ and table args
10. **Relationship attributes** (optional, for ORM navigation)

## Integration Points

- **SQLModel**: Combines SQLAlchemy and Pydantic
- **PostgreSQL**: Optimized for Neon PostgreSQL
- **FastAPI**: Seamless request/response validation
- **Alembic**: Migration-ready model definitions
- **Type Safety**: Full Python type hints

## Field Types Supported

- **String**: `str` with length constraints
- **Integer**: `int` for whole numbers
- **Float**: `float` for decimals
- **Boolean**: `bool` for true/false
- **DateTime**: `datetime` for timestamps
- **UUID**: `UUID` for unique identifiers
- **JSON**: `dict` for structured data
- **Enum**: Custom enum types

## Example Generated Model

```python
from sqlmodel import Field, SQLModel, Relationship
from datetime import datetime
from typing import Optional
from uuid import UUID, uuid4

class Task(SQLModel, table=True):
    __tablename__ = "tasks"

    id: UUID = Field(default_factory=uuid4, primary_key=True)
    title: str = Field(max_length=255, index=True)
    description: Optional[str] = Field(default=None)
    completed: bool = Field(default=False)
    user_id: UUID = Field(foreign_key="users.id", index=True)

    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    # Optional: ORM relationship
    user: Optional["User"] = Relationship(back_populates="tasks")
```

## Features

- **Automatic Timestamps**: created_at and updated_at fields
- **UUID Primary Keys**: Secure, distributed-safe identifiers
- **Foreign Key Cascading**: Proper ON DELETE and ON UPDATE behavior
- **Index Optimization**: Strategic indexing for query performance
- **Validation Rules**: Pydantic validators for business logic
- **Migration Friendly**: Alembic-compatible model definitions
