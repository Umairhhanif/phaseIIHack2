from sqlmodel import Session, select, create_engine
from models import Task, User
from database import engine
import uuid

# User ID from logs
user_id_str = "a5cf5b9a-6bac-4c2f-94f1-cbce63732e02"
user_id = uuid.UUID(user_id_str)

with Session(engine) as session:
    print(f"Checking tasks for user: {user_id}")
    
    # Check user exists
    user = session.exec(select(User).where(User.id == user_id)).first()
    if user:
        print(f"User found: {user.email}")
    else:
        print("User NOT found!")
        
    # Check tasks
    tasks = session.exec(select(Task).where(Task.user_id == user_id).order_by(Task.created_at.desc())).all()
    
    print(f"Found {len(tasks)} tasks:")
    for task in tasks:
        print(f"- [{task.status if hasattr(task, 'status') else 'Completed' if task.completed else 'Pending'}] {task.title} (ID: {task.id})")
