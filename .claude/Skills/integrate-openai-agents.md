# Skill: Integrate OpenAI Agents

## Purpose
Setup OpenAI Agents SDK integration in FastAPI endpoint to handle conversational AI with tool execution.

## Instructions

When this skill is invoked, implement OpenAI Agents SDK in the FastAPI endpoint:

### 1. Build Message Array from DB History
- Load conversation history from the database (Neon PostgreSQL)
- Query messages by `user_id` and conversation `id`
- Format database messages into the OpenAI message array format:
  - User messages → `{"role": "user", "content": "..."}`
  - Assistant messages → `{"role": "assistant", "content": "..."}`
  - Tool results → `{"role": "tool", "tool_call_id": "...", "content": "..."}`

### 2. Run Agent with MCP Tools
- Initialize OpenAI Agents SDK client with API key from environment
- Load MCP tools from the MCP server
- Pass the message array to the agent
- Configure tool definitions for the agent

### 3. Parse Tool Calls, Execute, Return Response
- Parse tool_calls from agent response
- For each tool_call:
  - Extract tool name, arguments, and call_id
  - Execute the tool via the MCP server
  - Capture tool output/execution result
- Format tool results into proper message format
- Continue conversation loop if more tool calls are needed
- Return final assistant response to the client

### 4. Save Full Conversation to DB
- Persist the user message to the database
- Persist the assistant response to the database
- Persist all tool calls and their results to the database
- Ensure proper linking to the conversation and user

## Key Endpoint

**`/api/{user_id}/chat`**
- HTTP Method: POST
- Request Body: `{"message": "...", "conversation_id": "..."}`
- Response: Assistant message with tool call results

## Technical Notes

- Use stateless design (load conversation history per request)
- Handle MCP tool errors gracefully
- Support streaming responses if needed
- Ensure JWT authentication is validated before processing
- Use SQLModel for database operations
