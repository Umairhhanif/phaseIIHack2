"""
MCP (Model Context Protocol) tools for AI chatbot.

These are callable functions that the AI can invoke to perform actions
on behalf of the user, such as managing tasks or retrieving user identity.

All tools enforce user isolation via user_id validation.
"""

import json
from datetime import datetime
from typing import Any, Dict, List, Optional
from uuid import UUID

from sqlmodel import Session, select

from models import MessageRole, Priority, Tag, Task, TaskTag


def add_task(
    session: Session,
    title: str,
    user_id: UUID,
    description: Optional[str] = None,
    priority: Optional[str] = None,
    due_date: Optional[str] = None,
    tags: Optional[List[str]] = None,
) -> Dict[str, Any]:
    """
    Create a new task for the user.
    """
    try:
        with open("debug_log.txt", "a") as f:
            f.write(f"DEBUG: add_task called with title='{title}', user_id={user_id}\n")
        # Validate user exists (implicit via foreign key)

        # Parse priority if provided
        task_priority = None
        if priority:
            try:
                task_priority = Priority(priority.upper())
            except ValueError:
                return {
                    "success": False,
                    "error": f"Invalid priority: {priority}. Use HIGH, MEDIUM, or LOW.",
                }

        # Parse due date if provided
        task_due_date = None
        if due_date:
            try:
                task_due_date = datetime.strptime(due_date, "%Y-%m-%d").date()
            except ValueError:
                return {
                    "success": False,
                    "error": f"Invalid due date: {due_date}. Use YYYY-MM-DD format.",
                }

        # Create task using dict to avoid Pydantic v2 default_factory issues
        task_dict = {
            "user_id": user_id,
            "title": title,
        }
        if description is not None:
            task_dict["description"] = description
        if task_priority is not None:
            task_dict["priority"] = task_priority
        if task_due_date is not None:
            task_dict["due_date"] = task_due_date
            
        task = Task.model_validate(task_dict)
        session.add(task)
        session.flush()  # Get the task ID

        # Add tags if provided
        if tags:
            for tag_name in tags:
                # Find or create tag
                tag = session.exec(
                    select(Tag)
                    .where(Tag.user_id == user_id)
                    .where(Tag.name == tag_name)
                ).first()

                if not tag:
                    # Create new tag with random color
                    import random

                    colors = [
                        "#ef4444",  # red
                        "#f97316",  # orange
                        "#eab308",  # yellow
                        "#22c55e",  # green
                        "#3b82f6",  # blue
                        "#8b5cf6",  # violet
                        "#ec4899",  # pink
                    ]
                    tag_dict = {
                        "user_id": user_id,
                        "name": tag_name,
                        "color": random.choice(colors),
                    }
                    tag = Tag.model_validate(tag_dict)
                    session.add(tag)
                    session.flush()

                # Link task and tag
                task_tag = TaskTag(task_id=task.id, tag_id=tag.id)
                session.add(task_tag)

        with open("debug_log.txt", "a") as f:
            f.write("DEBUG: Committing task to database...\n")
        session.commit()
        with open("debug_log.txt", "a") as f:
            f.write(f"DEBUG: Task committed. ID: {task.id}\n")
        session.refresh(task)

        return {
            "success": True,
            "task": {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "priority": str(task.priority) if task.priority else None,
                "due_date": str(task.due_date) if task.due_date else None,
                "created_at": task.created_at.isoformat(),
            },
        }

    except Exception as e:
        session.rollback()
        return {
            "success": False,
            "error": f"Failed to create task: {str(e)}",
        }


def list_tasks(
    session: Session,
    user_id: UUID,
    status: Optional[str] = None,
    tag: Optional[str] = None,
) -> Dict[str, Any]:
    """
    List tasks for the user with optional filtering.

    Args:
        session: Database session
        user_id: Owner user ID (for data isolation)
        status: Filter by status ("pending", "completed", or None for all)
        tag: Filter by tag name

    Returns:
        Dict with success status and list of tasks
    """
    try:
        # Base query with user isolation
        query = select(Task).where(Task.user_id == user_id)

        # Apply status filter
        if status == "pending":
            query = query.where(Task.completed == False)
        elif status == "completed":
            query = query.where(Task.completed == True)

        # Apply tag filter
        if tag:
            tag_query = (
                select(Tag)
                .where(Tag.user_id == user_id)
                .where(Tag.name == tag)
            )
            tag_result = session.exec(tag_query).first()
            if tag_result:
                # Join through TaskTag to get tasks with this tag
                query = query.join(TaskTag).where(TaskTag.tag_id == tag_result.id)
            else:
                # Tag doesn't exist, return empty list
                return {"success": True, "tasks": [], "count": 0}

        # Order by created_at descending
        query = query.order_by(Task.created_at.desc())

        tasks = session.exec(query).all()

        task_list = []
        for task in tasks:
            # Get tags for this task
            tags_query = (
                select(Tag)
                .join(TaskTag)
                .where(TaskTag.task_id == task.id)
            )
            task_tags = session.exec(tags_query).all()

            task_list.append({
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "priority": str(task.priority) if task.priority else None,
                "due_date": str(task.due_date) if task.due_date else None,
                "tags": [tag.name for tag in task_tags],
                "created_at": task.created_at.isoformat(),
            })

        return {
            "success": True,
            "tasks": task_list,
            "count": len(task_list),
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to list tasks: {str(e)}",
        }


def complete_task(
    session: Session,
    task_id: str,
    user_id: UUID,
) -> Dict[str, Any]:
    """
    Mark a task as completed.

    Args:
        session: Database session
        task_id: Task ID to complete (string or UUID)
        user_id: Owner user ID (for data isolation)

    Returns:
        Dict with success status, task data, or error message
    """
    try:
        # Parse task_id
        try:
            task_uuid = UUID(task_id)
        except ValueError:
            # Try to find by title if not a UUID
            return {
                "success": False,
                "error": f"Invalid task ID format. Please provide a valid UUID.",
            }

        # Find task with user isolation
        task = session.exec(
            select(Task)
            .where(Task.id == task_uuid)
            .where(Task.user_id == user_id)
        ).first()

        if not task:
            return {
                "success": False,
                "error": f"Task not found. You don't have a task with ID {task_id}.",
            }

        # Check if already completed
        if task.completed:
            return {
                "success": False,
                "error": f"Task '{task.title}' is already completed.",
            }

        # Mark as completed
        task.completed = True
        task.updated_at = datetime.utcnow()
        session.commit()
        session.refresh(task)

        return {
            "success": True,
            "task": {
                "id": str(task.id),
                "title": task.title,
                "completed": task.completed,
            },
        }

    except Exception as e:
        session.rollback()
        return {
            "success": False,
            "error": f"Failed to complete task: {str(e)}",
        }


def delete_task(
    session: Session,
    task_id: str,
    user_id: UUID,
) -> Dict[str, Any]:
    """
    Delete a task.

    Args:
        session: Database session
        task_id: Task ID to delete (string or UUID)
        user_id: Owner user ID (for data isolation)

    Returns:
        Dict with success status and deleted task info, or error message
    """
    try:
        # Parse task_id
        try:
            task_uuid = UUID(task_id)
        except ValueError:
            return {
                "success": False,
                "error": f"Invalid task ID format. Please provide a valid UUID.",
            }

        # Find task with user isolation
        task = session.exec(
            select(Task)
            .where(Task.id == task_uuid)
            .where(Task.user_id == user_id)
        ).first()

        if not task:
            return {
                "success": False,
                "error": f"Task not found. You don't have a task with ID {task_id}.",
            }

        # Store task info before deletion
        task_info = {
            "id": str(task.id),
            "title": task.title,
        }

        # Delete task (cascade will handle TaskTag associations)
        session.delete(task)
        session.commit()

        return {
            "success": True,
            "task": task_info,
        }

    except Exception as e:
        session.rollback()
        return {
            "success": False,
            "error": f"Failed to delete task: {str(e)}",
        }


def update_task(
    session: Session,
    task_id: str,
    user_id: UUID,
    updates: Dict[str, Any],
) -> Dict[str, Any]:
    """
    Update task details.

    Args:
        session: Database session
        task_id: Task ID to update (string or UUID)
        user_id: Owner user ID (for data isolation)
        updates: Dictionary of fields to update

    Returns:
        Dict with success status and updated task data, or error message
    """
    try:
        # Parse task_id
        try:
            task_uuid = UUID(task_id)
        except ValueError:
            return {
                "success": False,
                "error": f"Invalid task ID format. Please provide a valid UUID.",
            }

        # Find task with user isolation
        task = session.exec(
            select(Task)
            .where(Task.id == task_uuid)
            .where(Task.user_id == user_id)
        ).first()

        if not task:
            return {
                "success": False,
                "error": f"Task not found. You don't have a task with ID {task_id}.",
            }

        # Update fields
        if "title" in updates:
            task.title = updates["title"]
        if "description" in updates:
            task.description = updates["description"]
        if "priority" in updates and updates["priority"]:
            try:
                task.priority = Priority(updates["priority"].upper())
            except ValueError:
                return {
                    "success": False,
                    "error": f"Invalid priority: {updates['priority']}. Use HIGH, MEDIUM, or LOW.",
                }
        if "due_date" in updates:
            if updates["due_date"]:
                try:
                    task.due_date = datetime.strptime(updates["due_date"], "%Y-%m-%d").date()
                except ValueError:
                    return {
                        "success": False,
                        "error": f"Invalid due date: {updates['due_date']}. Use YYYY-MM-DD format.",
                    }
            else:
                task.due_date = None
        if "completed" in updates:
            task.completed = updates["completed"]

        task.updated_at = datetime.utcnow()
        session.commit()
        session.refresh(task)

        return {
            "success": True,
            "task": {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "priority": str(task.priority) if task.priority else None,
                "due_date": str(task.due_date) if task.due_date else None,
            },
        }

    except Exception as e:
        session.rollback()
        return {
            "success": False,
            "error": f"Failed to update task: {str(e)}",
        }


def get_current_user(
    user_id: UUID,
    email: str,
) -> Dict[str, Any]:
    """
    Get current user identity information.

    Args:
        user_id: User ID
        email: User email

    Returns:
        Dict with user identity info
    """
    return {
        "success": True,
        "user": {
            "id": str(user_id),
            "email": email,
        },
    }


def find_task_by_title(
    session: Session,
    title: str,
    user_id: UUID,
) -> Dict[str, Any]:
    """
    Find a task by title (for natural language resolution).

    Args:
        session: Database session
        title: Task title to search for (partial match)
        user_id: Owner user ID (for data isolation)

    Returns:
        Dict with success status and task data if found
    """
    try:
        # Try exact match first
        query = (
            select(Task)
            .where(Task.user_id == user_id)
            .where(Task.title == title)
        )
        task = session.exec(query).first()

        # Try partial match if exact not found
        if not task:
            query = (
                select(Task)
                .where(Task.user_id == user_id)
                .where(Task.title.ilike(f"%{title}%"))
            )
            task = session.exec(query).first()

        if not task:
            return {
                "success": False,
                "error": f"No task found matching '{title}'",
            }

        return {
            "success": True,
            "task": {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "priority": str(task.priority) if task.priority else None,
                "due_date": str(task.due_date) if task.due_date else None,
            },
        }

    except Exception as e:
        return {
            "success": False,
            "error": f"Failed to find task: {str(e)}",
        }
