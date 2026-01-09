# Database Migration Creator

**Name:** db-migration-creator

**Purpose:** Generate Alembic/SQLModel migration scripts

**Input:** Schema changes (add table, add column, create index)

**Output:** Migration file with upgrade/downgrade functions

**Usage:**
```
@db-migration-creator add completed field to tasks
```

## Description

This skill generates Alembic migration scripts for database schema changes with the following features:
- Proper migration file naming with timestamps
- upgrade() and downgrade() functions
- Table creation/deletion
- Column addition/modification/removal
- Index creation/deletion
- Foreign key constraints
- Data migrations
- Rollback safety

## Example Usage

### Add Column
```
@db-migration-creator add completed field to tasks
```

### Create Table
```
@db-migration-creator create users table
```

### Add Index
```
@db-migration-creator add index on tasks.user_id
```

### Modify Column
```
@db-migration-creator make tasks.description nullable
```

### Add Foreign Key
```
@db-migration-creator add FK from tasks.user_id to users.id
```

## Generated Code Structure

The skill will generate:
1. **Migration file** with timestamp prefix
2. **Revision identifiers** (Alembic revision hash)
3. **upgrade() function** for applying changes
4. **downgrade() function** for rollback
5. **Proper imports** from alembic and sqlalchemy
6. **Type-safe operations** matching SQLModel types
7. **Comments** explaining each operation

## Integration Points

- **Alembic**: Migration framework for SQLAlchemy
- **SQLModel**: Schema definitions from models
- **PostgreSQL**: Database-specific features
- **Neon**: Cloud PostgreSQL compatibility
- **SQLAlchemy**: Core migration operations

## Example Generated Migration

```python
"""add completed field to tasks

Revision ID: a1b2c3d4e5f6
Revises: 0f9e8d7c6b5a
Create Date: 2025-12-29 20:55:00.000000

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = 'a1b2c3d4e5f6'
down_revision = '0f9e8d7c6b5a'
branch_labels = None
depends_on = None


def upgrade() -> None:
    """Add completed boolean field to tasks table."""
    op.add_column(
        'tasks',
        sa.Column(
            'completed',
            sa.Boolean(),
            nullable=False,
            server_default='false'
        )
    )


def downgrade() -> None:
    """Remove completed field from tasks table."""
    op.drop_column('tasks', 'completed')
```

## Migration Types Supported

### 1. Create Table
```python
def upgrade() -> None:
    op.create_table(
        'tasks',
        sa.Column('id', postgresql.UUID(), nullable=False),
        sa.Column('title', sa.String(length=255), nullable=False),
        sa.Column('description', sa.Text(), nullable=True),
        sa.Column('completed', sa.Boolean(), nullable=False),
        sa.Column('user_id', postgresql.UUID(), nullable=False),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ),
        sa.PrimaryKeyConstraint('id')
    )
    op.create_index(op.f('ix_tasks_user_id'), 'tasks', ['user_id'])
```

### 2. Add Column
```python
def upgrade() -> None:
    op.add_column(
        'tasks',
        sa.Column('priority', sa.String(length=20), nullable=True)
    )
```

### 3. Create Index
```python
def upgrade() -> None:
    op.create_index(
        'ix_tasks_title',
        'tasks',
        ['title']
    )
```

### 4. Add Foreign Key
```python
def upgrade() -> None:
    op.create_foreign_key(
        'fk_tasks_user_id_users',
        'tasks', 'users',
        ['user_id'], ['id'],
        ondelete='CASCADE'
    )
```

### 5. Data Migration
```python
def upgrade() -> None:
    # Add column
    op.add_column('tasks', sa.Column('status', sa.String(20)))

    # Migrate data
    op.execute(
        "UPDATE tasks SET status = CASE "
        "WHEN completed = true THEN 'done' "
        "ELSE 'pending' END"
    )

    # Make non-nullable
    op.alter_column('tasks', 'status', nullable=False)
```

## Features

- **Timestamp Prefixed**: Chronologically ordered migrations
- **Reversible**: Safe downgrade functions
- **Type Safe**: Matches SQLModel field types
- **Index Support**: Create/drop indexes
- **Foreign Keys**: Proper constraint handling
- **Data Migrations**: Safe data transformations
- **PostgreSQL Types**: UUID, JSONB, Array support
- **Server Defaults**: Database-level defaults

## Migration Workflow

```bash
# Generate migration
alembic revision --autogenerate -m "add completed field to tasks"

# Review generated migration
# Edit alembic/versions/xxx_add_completed_field_to_tasks.py

# Apply migration
alembic upgrade head

# Rollback if needed
alembic downgrade -1
```

## Best Practices

- **Review Generated Migrations**: Always check before applying
- **Test Rollback**: Verify downgrade() works correctly
- **Small Changes**: One logical change per migration
- **Data Safety**: Use transactions for data migrations
- **Index Creation**: Use CONCURRENTLY for production (PostgreSQL)
- **Column Defaults**: Set server_default for NOT NULL columns
