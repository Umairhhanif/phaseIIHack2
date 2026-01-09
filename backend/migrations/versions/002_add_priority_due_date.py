"""Add priority and due_date columns to tasks table

Revision ID: 002_add_priority_due_date
Revises: 001_initial
Create Date: 2025-12-31

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '002_add_priority_due_date'
down_revision = '001_initial'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add priority column with default 'medium'
    op.add_column(
        'tasks',
        sa.Column('priority', sa.String(length=10), nullable=False, server_default='medium')
    )

    # Add index on priority for filtering/sorting performance
    op.create_index(op.f('ix_tasks_priority'), 'tasks', ['priority'], unique=False)

    # Add due_date column (nullable)
    op.add_column(
        'tasks',
        sa.Column('due_date', sa.Date(), nullable=True)
    )

    # Add index on due_date for sorting
    op.create_index(op.f('ix_tasks_due_date'), 'tasks', ['due_date'], unique=False)


def downgrade() -> None:
    # Drop indexes
    op.drop_index(op.f('ix_tasks_due_date'), table_name='tasks')
    op.drop_index(op.f('ix_tasks_priority'), table_name='tasks')

    # Drop columns
    op.drop_column('tasks', 'due_date')
    op.drop_column('tasks', 'priority')
