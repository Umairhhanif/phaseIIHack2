"""Add Conversation and Message tables for AI chatbot

Revision ID: 004
Revises: 003
Create Date: 2025-01-10

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import postgresql

# revision identifiers
revision = '004'
down_revision = '003'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Create MessageRole enum
    message_role_enum = sa.Enum('USER', 'ASSISTANT', name='messagerole')
    message_role_enum.create(op.get_bind(), checkfirst=True)

    # Create conversations table
    op.create_table(
        'conversations',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('title', sa.String(length=100), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
        sa.Column('updated_at', sa.DateTime(), nullable=False),
    )
    op.create_index(op.f('ix_conversations_id'), 'conversations', ['id'])
    op.create_index(op.f('ix_conversations_user_id'), 'conversations', ['user_id'])
    op.create_index(op.f('ix_conversations_created_at'), 'conversations', ['created_at'])
    op.create_index(op.f('ix_conversations_updated_at'), 'conversations', ['updated_at'])
    op.create_index('ix_conversations_user_updated', 'conversations', ['user_id', 'updated_at'])

    # Create messages table
    op.create_table(
        'messages',
        sa.Column('id', postgresql.UUID(as_uuid=True), primary_key=True, nullable=False),
        sa.Column('conversation_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('conversations.id', ondelete='CASCADE'), nullable=False),
        sa.Column('user_id', postgresql.UUID(as_uuid=True), sa.ForeignKey('users.id', ondelete='CASCADE'), nullable=False),
        sa.Column('role', message_role_enum, nullable=False),
        sa.Column('content', sa.String(), nullable=False),
        sa.Column('tool_calls', sa.String(), nullable=True),
        sa.Column('created_at', sa.DateTime(), nullable=False),
    )
    op.create_index(op.f('ix_messages_id'), 'messages', ['id'])
    op.create_index(op.f('ix_messages_conversation_id'), 'messages', ['conversation_id'])
    op.create_index(op.f('ix_messages_user_id'), 'messages', ['user_id'])
    op.create_index(op.f('ix_messages_created_at'), 'messages', ['created_at'])
    op.create_index('ix_messages_user_conversation', 'messages', ['user_id', 'conversation_id'])


def downgrade() -> None:
    # Drop messages table and indexes
    op.drop_index('ix_messages_user_conversation', table_name='messages')
    op.drop_index(op.f('ix_messages_created_at'), table_name='messages')
    op.drop_index(op.f('ix_messages_user_id'), table_name='messages')
    op.drop_index(op.f('ix_messages_conversation_id'), table_name='messages')
    op.drop_index(op.f('ix_messages_id'), table_name='messages')
    op.drop_table('messages')

    # Drop conversations table and indexes
    op.drop_index('ix_conversations_user_updated', table_name='conversations')
    op.drop_index(op.f('ix_conversations_updated_at'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_created_at'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_user_id'), table_name='conversations')
    op.drop_index(op.f('ix_conversations_id'), table_name='conversations')
    op.drop_table('conversations')

    # Drop MessageRole enum
    sa.Enum(name='messagerole').drop(op.get_bind(), checkfirst=True)
