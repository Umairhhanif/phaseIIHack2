"""Create tags and task_tags tables for task organization

Revision ID: 003_add_tags_tables
Revises: 002_add_priority_due_date
Create Date: 2025-12-31

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers, used by Alembic.
revision = '003_add_tags_tables'
down_revision = '002_add_priority_due_date'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create tags table
    op.create_table(
        'tags',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), nullable=False),
        sa.Column('name', sa.String(length=50), nullable=False),
        sa.Column('color', sa.String(length=7), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('id')
    )

    # Create index on user_id for user-specific tag queries
    op.create_index(op.f('ix_tags_user_id'), 'tags', ['user_id'], unique=False)

    # Create unique index on (user_id, LOWER(name)) for case-insensitive uniqueness
    op.create_index(
        'ix_tags_user_name_lower',
        'tags',
        [sa.text('user_id'), sa.text('LOWER(name)')],
        unique=True
    )

    # Create task_tags join table
    op.create_table(
        'task_tags',
        sa.Column('task_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('tag_id', postgresql.UUID(as_uuid=True), primary_key=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.ForeignKeyConstraint(['task_id'], ['tasks.id'], ondelete='CASCADE'),
        sa.ForeignKeyConstraint(['tag_id'], ['tags.id'], ondelete='CASCADE'),
        sa.PrimaryKeyConstraint('task_id', 'tag_id')
    )

    # Create indexes for join table performance
    op.create_index(op.f('ix_task_tags_task_id'), 'task_tags', ['task_id'], unique=False)
    op.create_index(op.f('ix_task_tags_tag_id'), 'task_tags', ['tag_id'], unique=False)


def downgrade() -> None:
    # Drop task_tags indexes
    op.drop_index(op.f('ix_task_tags_tag_id'), table_name='task_tags')
    op.drop_index(op.f('ix_task_tags_task_id'), table_name='task_tags')

    # Drop task_tags table
    op.drop_table('task_tags')

    # Drop tags indexes
    op.drop_index('ix_tags_user_name_lower', table_name='tags')
    op.drop_index(op.f('ix_tags_user_id'), table_name='tags')

    # Drop tags table
    op.drop_table('tags')
