"""MCP (Model Context Protocol) tools module for AI chatbot integration.

This module contains tool functions that the AI can call to perform actions
like managing tasks, getting user identity, etc.
"""

from .tools import (
    add_task,
    complete_task,
    delete_task,
    get_current_user,
    list_tasks,
    update_task,
)

__all__ = [
    "add_task",
    "complete_task",
    "delete_task",
    "get_current_user",
    "list_tasks",
    "update_task",
]
