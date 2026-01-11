# Skill: Map NL to Tools

## Purpose
Guide OpenAI agent to map natural language user input to MCP tool calls for the Todo AI Chatbot.

## Instructions

When this skill is invoked, implement natural language to tool mapping logic:

### 1. "Add task" → add_task
- **Trigger Phrases:**
  - "Add a task to..."
  - "Create a new task"
  - "I need to..."
  - "Add todo..."
  - "Remind me to..."
  - "Add item..."

- **Tool Call:**
  ```python
  add_task(title="Task title", description="Optional details", status="pending", user_id="<extracted>")
  ```

- **Implementation:**
  - Parse task title from user message
  - Extract optional description
  - Default `status` to "pending"
  - Extract `user_id` from JWT
  - Validate required fields

### 2. "List pending" → list_tasks(status="pending")
- **Trigger Phrases:**
  - "Show my pending tasks"
  - "What do I need to do?"
  - "List my todos"
  - "Show incomplete tasks"
  - "What's on my list?"
  - "Display tasks"

- **Tool Call:**
  ```python
  list_tasks(user_id="<extracted>", status="pending")
  ```

- **Other Variants:**
  - "List all tasks" → `list_tasks(user_id="<extracted>")`
  - "Show completed tasks" → `list_tasks(user_id="<extracted>", status="completed")`
  - "Show tasks with tag [name]" → `list_tasks(user_id="<extracted>", tag="<tag-name>")`

- **Implementation:**
  - Detect status keywords (pending, completed, all)
  - Parse tag mentions if present
  - Extract `user_id` from JWT
  - Format results naturally

### 3. Handle Chains (list then delete)
- **Multi-step Scenarios:**
  - "Show my tasks and delete the first one"
  - "List pending tasks and mark [task name] as completed"
  - "What are my tasks? Actually, remove [task name]"

- **Tool Call Sequence:**
  ```python
  # Step 1: List tasks
  tasks = list_tasks(user_id="<extracted>", status="pending")

  # Step 2: Parse user's selection
  # Step 3: Execute follow-up action
  delete_task(task_id="<selected_id>", user_id="<extracted>")
  ```

- **Implementation:**
  - Detect intent for chained operations
  - Execute first tool call
  - Present results to user
  - Wait for user confirmation or context for next step
  - Execute subsequent tool calls
  - Provide summary of all operations

- **Example Chain:**
  1. User: "Show my tasks"
  2. Agent: Calls `list_tasks`, displays 5 tasks
  3. User: "Delete task 2"
  4. Agent: Calls `delete_task` with task_id from previous list

### 4. User Email: Extract from JWT, Respond in Natural Language
- **JWT Structure:**
  ```json
  {
    "user_id": "abc123",
    "email": "user@example.com",
    "name": "John Doe"
  }
  ```

- **Extraction:**
  ```python
  # From Better Auth JWT
  user_id = jwt_payload.get("user_id")
  email = jwt_payload.get("email")
  ```

- **User Queries:**
  - "What's my email?" → Return email from JWT
  - "Who am I?" → Return user info from JWT
  - "My account details" → Return user profile info

- **Natural Language Response:**
  - **Instead of:** `{"email": "user@example.com"}`
  - **Respond:** "Your email address is user@example.com"

- **Tool Usage:**
  - May use `user_lookup` tool if additional info needed
  - Always reference JWT for `user_id` in all tool calls
  - Format responses conversationally

## System Prompt Guidelines

Configure agent with these instructions:

```python
system_message = """
You are a helpful task management assistant. You have access to the following tools:

1. add_task - Create a new task
2. list_tasks - Retrieve tasks (filter by status, tag)
3. complete_task - Mark task as completed
4. delete_task - Remove a task
5. update_task - Modify task details
6. user_lookup - Get user information

Always:
- Use the user_id from the JWT authentication for all tool calls
- Respond in natural, conversational language
- Present tool results in a user-friendly format
- Ask for clarification if user intent is ambiguous
- Handle chained requests by executing sequentially
- Never expose internal IDs or technical details
"""
```

## Intent Detection Logic

```python
def detect_intent(user_message: str) -> str:
    """Determine which tool(s) to call based on user input"""

    # Add task
    if any(word in user_message.lower() for word in ["add", "create", "new", "remind", "todo"]):
        return "add_task"

    # List tasks
    if any(word in user_message.lower() for word in ["list", "show", "display", "what", "my tasks"]):
        return "list_tasks"

    # Complete task
    if any(word in user_message.lower() for word in ["complete", "done", "finish", "mark as done"]):
        return "complete_task"

    # Delete task
    if any(word in user_message.lower() for word in ["delete", "remove", "erase"]):
        return "delete_task"

    # Update task
    if any(word in user_message.lower() for word in ["update", "change", "modify", "edit"]):
        return "update_task"

    # User info
    if any(word in user_message.lower() for word in ["my email", "who am i", "my account"]):
        return "user_lookup"

    return "unknown"
```

## Error Handling

- **Ambiguous Intent:** Ask clarifying question
  - User: "Update it"
  - Agent: "Which task would you like to update? Please specify."

- **Missing Data:** Request required fields
  - User: "Add task"
  - Agent: "What would you like the task to say?"

- **Tool Errors:** Explain in user-friendly terms
  - User: "Delete task 123"
  - Agent: "I couldn't find that task. Would you like me to list your tasks?"

## Technical Notes

- Use OpenAI Agents SDK's built-in function calling
- Provide detailed tool schemas for better mapping
- Maintain conversation context for chained requests
- Cache user info from JWT to avoid repeated lookups
- Log tool calls for debugging
- Validate user_id matches JWT before each tool call
