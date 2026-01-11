# Skill: Manage Conversation DB

## Purpose
Handle stateless conversation persistence for the Todo AI Chatbot using async database operations.

## Instructions

When this skill is invoked, implement conversation database management operations:

### 1. Create/Load Conversation by ID
- **Create Conversation:**
  - Generate new conversation ID (UUID)
  - Associate with `user_id` from JWT
  - Set initial title (optional, can be derived from first message)
  - Save to database
  - Return conversation object

- **Load Conversation:**
  - Query conversation by `id` and `user_id`
  - Validate user ownership (security check)
  - Return conversation object
  - Return 404 if not found

### 2. Save User/Assistant Messages with Role/Content
- **User Messages:**
  - Store `role: "user"`
  - Store message `content`
  - Link to conversation `id`
  - Add timestamp
  - Use async database write

- **Assistant Messages:**
  - Store `role: "assistant"`
  - Store response `content`
  - Link to conversation `id`
  - Add timestamp
  - Optionally store `tool_calls` metadata

- **Tool Messages:**
  - Store `role: "tool"`
  - Store `tool_call_id`
  - Store tool execution result as `content`
  - Link to conversation `id`

### 3. Fetch History for Agent Input
- Query all messages for a specific conversation `id`
- Sort by timestamp ascending (chronological order)
- Format messages into OpenAI-compatible array:
  ```python
  [
      {"role": "user", "content": "Hello"},
      {"role": "assistant", "content": "Hi there!"},
      {"role": "tool", "tool_call_id": "...", "content": "..."}
  ]
  ```
- Return array for agent processing
- Handle empty history (new conversation)

### 4. Async Queries
- Use SQLModel with async session (AsyncSession)
- All database operations must be async:
  - `session.add()` → `await session.add()`
  - `session.commit()` → `await session.commit()`
  - `session.refresh()` → `await session.refresh()`
  - Queries → `await session.exec(select(...))`
- Use `async with` context managers for session management
- Handle database connection pool efficiently
- Implement proper error handling with try/except

## Database Models

Use these SQLModel models:
- **Conversation** - tracks conversation metadata
- **Message** - stores individual messages with roles

## API Operations

```python
# Create conversation
async def create_conversation(user_id: str, title: str = None) -> Conversation

# Load conversation
async def load_conversation(conversation_id: str, user_id: str) -> Conversation

# Save message
async def save_message(conversation_id: str, role: str, content: str, **metadata) -> Message

# Fetch history
async def get_conversation_history(conversation_id: str, user_id: str) -> List[dict]
```

## Technical Notes

- Validate `user_id` from JWT on all operations
- Ensure conversation ownership before loading
- Use UUIDs for conversation and message IDs
- Handle database connection timeouts
- Log errors appropriately
- Use database indexes on `user_id` and `conversation_id` for performance
