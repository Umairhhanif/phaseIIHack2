from database import get_session
from models import Conversation, Message, MessageRole, User
from uuid import uuid4
from sqlmodel import select

# Get a session
session = next(get_session())

# Get first user
user = session.exec(select(User)).first()
if not user:
    print("No users found. Please create a user first.")
    exit(1)

print(f"Found user: {user.email} ({user.id})")

# Try to create a conversation
try:
    conversation = Conversation(
        user_id=user.id,
        title="Test conversation"
    )
    session.add(conversation)
    session.commit()
    session.refresh(conversation)
    print(f"✅ Conversation created: {conversation.id}")
    
    # Try to create a message
    message = Message(
        conversation_id=conversation.id,
        user_id=user.id,
        role=MessageRole.USER,
        content="Test message"
    )
    session.add(message)
    session.commit()
    print(f"✅ Message created: {message.id}")
    
except Exception as e:
    print(f"❌ Error: {e}")
    import traceback
    traceback.print_exc()
    session.rollback()
