# Setup MCP Server

**Name:** setup-mcp-server

**Purpose:** Create stateless MCP server using Official MCP SDK in FastAPI

**Input:** Tool specifications, database models

**Output:** MCP server with 5 tools, SQLModel integration, JWT authentication, tool chaining support

**Usage:**
```
@setup-mcp-server for todo management tools
```

## Description

This skill creates a complete MCP (Model Context Protocol) server using the Official MCP SDK with the following features:
- Expose 5 tools with parameters and return values as specified
- Stateless design using SQLModel for database operations
- User ID extracted from JWT token for authentication
- Tool chaining support for multi-step operations
- FastAPI integration for serving the MCP protocol
- Proper error handling and response formatting

## Example Usage

### Basic MCP Server Setup
```
@setup-mcp-server for todo management tools
```

### Custom Tool Set
```
@setup-mcp-server with tools: add_task, list_tasks, complete_task, delete_task, update_task
```

### With Custom Models
```
@setup-mcp-server for todo tools using Task model with Conversation/Message models
```

## Generated Code Structure

The skill will generate:
1. **MCP server main file** (`mcp_server.py`) with FastAPI integration
2. **Tool definitions** with proper schemas and parameter validation
3. **Database integration** using SQLModel for stateless operations
4. **JWT authentication** to extract user_id for authorization
5. **Tool chaining** logic to support multi-step workflows
6. **Error handlers** for tool execution failures
7. **Response formatters** following MCP protocol specifications
8. **Configuration** for MCP server settings

## Integration Points

- **Official MCP SDK**: Server implementation and protocol handling
- **FastAPI**: HTTP server and request handling
- **SQLModel**: Database operations for stateless tool execution
- **JWT Authentication**: User identification and authorization
- **Neon PostgreSQL**: Database backend for data persistence
- **Tool Chaining**: Sequential tool execution with context passing

## Example Generated Code

### mcp_server.py - Main MCP Server

```python
from fastapi import FastAPI, Depends, HTTPException, status
from mcp.server import Server
from mcp.server.stdio import stdio_server
from mcp.types import Tool, TextContent
from sqlmodel import Session, select
from typing import Any, Dict, List, Optional
from uuid import UUID
import json

from database import get_session
from models import Task, Conversation, Message
from auth import get_current_user

# Initialize MCP Server
mcp_server = Server("todo-mcp-server")

# Initialize FastAPI
app = FastAPI(title="MCP Server")

# Tool Specifications
TOOL_DEFINITIONS = [
    {
        "name": "add_task",
        "description": "Add a new task to the user's task list",
        "inputSchema": {
            "type": "object",
            "properties": {
                "title": {
                    "type": "string",
                    "description": "Task title",
                    "minLength": 1,
                    "maxLength": 255
                },
                "description": {
                    "type": "string",
                    "description": "Optional task description"
                },
                "tags": {
                    "type": "array",
                    "items": {"type": "string"},
                    "description": "Optional tags for categorization"
                }
            },
            "required": ["title"]
        }
    },
    {
        "name": "list_tasks",
        "description": "List all tasks for the authenticated user",
        "inputSchema": {
            "type": "object",
            "properties": {
                "filter": {
                    "type": "string",
                    "enum": ["all", "pending", "completed"],
                    "description": "Filter tasks by status",
                    "default": "all"
                },
                "limit": {
                    "type": "number",
                    "description": "Maximum number of tasks to return",
                    "default": 50
                }
            }
        }
    },
    {
        "name": "complete_task",
        "description": "Mark a task as completed",
        "inputSchema": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "string",
                    "description": "UUID of the task to complete",
                    "format": "uuid"
                }
            },
            "required": ["task_id"]
        }
    },
    {
        "name": "delete_task",
        "description": "Delete a task permanently",
        "inputSchema": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "string",
                    "description": "UUID of the task to delete",
                    "format": "uuid"
                }
            },
            "required": ["task_id"]
        }
    },
    {
        "name": "update_task",
        "description": "Update an existing task's details",
        "inputSchema": {
            "type": "object",
            "properties": {
                "task_id": {
                    "type": "string",
                    "description": "UUID of the task to update",
                    "format": "uuid"
                },
                "title": {
                    "type": "string",
                    "description": "New task title",
                    "maxLength": 255
                },
                "description": {
                    "type": "string",
                    "description": "New task description"
                },
                "completed": {
                    "type": "boolean",
                    "description": "New completion status"
                }
            },
            "required": ["task_id"]
        }
    }
]


# Tool Implementation
@mcp_server.call_tool()
async def call_tool(name: str, arguments: Any) -> List[TextContent]:
    """Handle tool calls from MCP clients."""

    # Extract user_id from context (set by middleware)
    user_id = getattr(mcp_server, "current_user_id", None)

    if not user_id:
        raise ValueError("User authentication required")

    try:
        # Route to appropriate tool handler
        if name == "add_task":
            result = await handle_add_tool(user_id, arguments)
        elif name == "list_tasks":
            result = await handle_list_tasks(user_id, arguments)
        elif name == "complete_task":
            result = await handle_complete_task(user_id, arguments)
        elif name == "delete_task":
            result = await handle_delete_task(user_id, arguments)
        elif name == "update_task":
            result = await handle_update_task(user_id, arguments)
        else:
            return [TextContent(type="text", text=f"Unknown tool: {name}")]

        return [TextContent(type="text", text=json.dumps(result, default=str))]

    except Exception as e:
        return [TextContent(
            type="text",
            text=json.dumps({"error": str(e)}, default=str)
        )]


# Tool Handlers
async def handle_add_task(
    user_id: UUID,
    arguments: Dict[str, Any],
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """Add a new task for the user."""
    task = Task(
        title=arguments["title"],
        description=arguments.get("description"),
        user_id=user_id,
        completed=False
    )

    session.add(task)
    session.commit()
    session.refresh(task)

    return {
        "success": True,
        "task": {
            "id": str(task.id),
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "created_at": task.created_at.isoformat()
        }
    }


async def handle_list_tasks(
    user_id: UUID,
    arguments: Dict[str, Any],
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """List tasks for the user with optional filtering."""
    filter_status = arguments.get("filter", "all")
    limit = arguments.get("limit", 50)

    query = select(Task).where(Task.user_id == user_id)

    if filter_status == "pending":
        query = query.where(Task.completed == False)
    elif filter_status == "completed":
        query = query.where(Task.completed == True)

    query = query.limit(limit)

    tasks = session.exec(query).all()

    return {
        "success": True,
        "tasks": [
            {
                "id": str(task.id),
                "title": task.title,
                "description": task.description,
                "completed": task.completed,
                "created_at": task.created_at.isoformat()
            }
            for task in tasks
        ]
    }


async def handle_complete_task(
    user_id: UUID,
    arguments: Dict[str, Any],
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """Mark a task as completed."""
    task_id = UUID(arguments["task_id"])

    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise ValueError("Task not found or unauthorized")

    task.completed = True
    session.add(task)
    session.commit()

    return {
        "success": True,
        "message": f"Task '{task.title}' marked as completed"
    }


async def handle_delete_task(
    user_id: UUID,
    arguments: Dict[str, Any],
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """Delete a task."""
    task_id = UUID(arguments["task_id"])

    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise ValueError("Task not found or unauthorized")

    session.delete(task)
    session.commit()

    return {
        "success": True,
        "message": "Task deleted successfully"
    }


async def handle_update_task(
    user_id: UUID,
    arguments: Dict[str, Any],
    session: Session = Depends(get_session)
) -> Dict[str, Any]:
    """Update an existing task."""
    task_id = UUID(arguments["task_id"])

    task = session.get(Task, task_id)
    if not task or task.user_id != user_id:
        raise ValueError("Task not found or unauthorized")

    # Update provided fields
    if "title" in arguments:
        task.title = arguments["title"]
    if "description" in arguments:
        task.description = arguments["description"]
    if "completed" in arguments:
        task.completed = arguments["completed"]

    session.add(task)
    session.commit()
    session.refresh(task)

    return {
        "success": True,
        "task": {
            "id": str(task.id),
            "title": task.title,
            "description": task.description,
            "completed": task.completed,
            "updated_at": task.updated_at.isoformat()
        }
    }


# FastAPI Integration
@app.on_event("startup")
async def startup():
    """Initialize MCP server on FastAPI startup."""
    # Start MCP server in background
    pass


@app.get("/tools")
async def list_tools():
    """List available MCP tools."""
    return {"tools": TOOL_DEFINITIONS}


@app.post("/tools/{tool_name}")
async def execute_tool(
    tool_name: str,
    arguments: Dict[str, Any],
    user_id: UUID = Depends(get_current_user)
):
    """Execute a specific MCP tool."""
    # Set user_id in context
    mcp_server.current_user_id = user_id

    # Execute tool
    results = await call_tool(tool_name, arguments)

    return results


# Tool Chaining Support
class ToolChain:
    """Support sequential tool execution with context passing."""

    def __init__(self, user_id: UUID, session: Session):
        self.user_id = user_id
        self.session = session
        self.context: Dict[str, Any] = {}

    async def execute(self, steps: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        """Execute a chain of tools sequentially."""
        results = []

        for step in steps:
            tool_name = step["tool"]
            arguments = step["arguments"]

            # Merge previous results into context
            if "use_context" in step:
                for key in step["use_context"]:
                    if key in self.context:
                        arguments[key] = self.context[key]

            # Execute tool
            result = await call_tool(tool_name, arguments)
            results.append(result)

            # Store result in context for next steps
            if "store_as" in step:
                self.context[step["store_as"]] = result

        return results


@app.post("/chain")
async def execute_chain(
    steps: List[Dict[str, Any]],
    user_id: UUID = Depends(get_current_user),
    session: Session = Depends(get_session)
):
    """Execute a chain of tools."""
    chain = ToolChain(user_id, session)
    results = await chain.execute(steps)
    return results


if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8001)
```

## Tool Chaining Example

```json
{
  "steps": [
    {
      "tool": "add_task",
      "arguments": {
        "title": "Review project proposal",
        "description": "Check and approve the project proposal"
      },
      "store_as": "new_task"
    },
    {
      "tool": "complete_task",
      "arguments": {
        "task_id": "{{new_task.task.id}}"
      },
      "use_context": ["new_task"]
    }
  ]
}
```

## Features

- **Official MCP SDK**: Uses the official MCP Server SDK implementation
- **Stateless Design**: All operations use SQLModel for database persistence
- **JWT Authentication**: User ID extracted from JWT token for authorization
- **5 Built-in Tools**: add_task, list_tasks, complete_task, delete_task, update_task
- **Tool Chaining**: Support sequential tool execution with context passing
- **Parameter Validation**: Schema validation for all tool inputs
- **Error Handling**: Comprehensive error responses
- **FastAPI Integration**: RESTful API for MCP protocol
- **Type Safety**: Full Python type hints throughout
- **Multi-user Support**: Isolated data per user via user_id

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://user:password@localhost:5432/database

# JWT Authentication
BETTER_AUTH_SECRET=your-secret-key-min-32-characters
JWT_ALGORITHM=HS256

# MCP Server
MCP_SERVER_PORT=8001
MCP_SERVER_HOST=0.0.0.0
```

## Integration with Phase III Chatbot

The MCP server integrates with the Phase III chatbot architecture:

1. **OpenAI Agents SDK** calls MCP tools via the MCP protocol
2. **FastAPI endpoint** (`/api/{user_id}/chat`) loads conversation history
3. **MCP tools** receive user_id from JWT for data isolation
4. **Tool chaining** enables complex multi-step task management
5. **Stateless design** ensures scalability and reliability

## Testing

```python
# tests/test_mcp_server.py

import pytest
from httpx import AsyncClient

@pytest.mark.asyncio
async def test_list_tools(client: AsyncClient, auth_headers: dict):
    response = await client.get("/tools", headers=auth_headers)
    assert response.status_code == 200
    tools = response.json()["tools"]
    assert len(tools) == 5
    assert tools[0]["name"] == "add_task"

@pytest.mark.asyncio
async def test_execute_add_task(client: AsyncClient, auth_headers: dict):
    response = await client.post(
        "/tools/add_task",
        headers=auth_headers,
        json={
            "title": "Test Task",
            "description": "Test description"
        }
    )
    assert response.status_code == 200
    result = response.json()[0]
    assert "task" in result

@pytest.mark.asyncio
async def test_tool_chain(client: AsyncClient, auth_headers: dict):
    response = await client.post(
        "/chain",
        headers=auth_headers,
        json={
            "steps": [
                {
                    "tool": "add_task",
                    "arguments": {"title": "Test Task"},
                    "store_as": "task1"
                },
                {
                    "tool": "complete_task",
                    "arguments": {
                        "task_id": "{{task1.task.id}}"
                    },
                    "use_context": ["task1"]
                }
            ]
        }
    )
    assert response.status_code == 200
    assert len(response.json()) == 2
```

## MCP Client Configuration

```typescript
// Client-side MCP configuration
import { Client } from '@modelcontextprotocol/sdk/client/index.js';
import { StdioClientTransport } from '@modelcontextprotocol/sdk/client/stdio.js';

const transport = new StdioClientTransport({
  command: 'python',
  args: ['mcp_server.py'],
  env: {
    DATABASE_URL: process.env.DATABASE_URL,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET,
  },
});

const client = new Client({
  name: 'todo-client',
  version: '1.0.0',
}, {
  capabilities: {},
});

await client.connect(transport);

// List tools
const tools = await client.listTools();

// Call tool
const result = await client.callTool({
  name: 'add_task',
  arguments: {
    title: 'New task',
    description: 'Task description'
  },
});
```
