from database import engine
from sqlmodel import SQLModel
from models import User, Task, Tag, TaskTag, Conversation, Message

# Import all models to ensure they're registered
print("Dropping all tables...")
SQLModel.metadata.drop_all(engine)
print("✅ Tables dropped")

print("Creating all tables...")
SQLModel.metadata.create_all(engine)
print("✅ Tables created")

# List all tables
from sqlalchemy import inspect
inspector = inspect(engine)
tables = inspector.get_table_names()
print(f"\n📋 Tables in database: {tables}")
