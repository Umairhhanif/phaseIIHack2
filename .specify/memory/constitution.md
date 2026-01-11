<!--
# Constitution Sync Impact Report

## Version Change
- **Previous**: 1.0.0 (Phase II)
- **New**: 3.0.0 (Phase III)
- **Bump Type**: MAJOR (backward incompatible - new AI chatbot architecture, Cohere API, MCP tools, database extensions)
- **Rationale**: Phase III introduces transformative AI capabilities with Cohere API integration, MCP tool system, and new database models (Conversation, Message). This is a fundamental architectural evolution, not an incremental update.

## Principles Modified
- REPLACED: 5 Phase II principles with 6 Phase III principles (AI-First Architecture, Stateless Design, Multi-User Security, Agentic Development, Cohere API Integration, Conversation Persistence)
- RENAMED: "Spec-Driven Development" → "Agentic Development"
- EXPANDED: Security principles now include conversation isolation and tool access control
- ADDED: Cohere API guidance, MCP tool patterns, conversation persistence rules

## Sections Added
- Chatbot Functionality & Natural Language Handling
- Cohere API Adaptation (tool calling, reasoning prompts)
- MCP Tools Specification (5 core tools with exact signatures)
- Database Extensions (Conversation, Message models)
- Conversation Persistence Rules
- Tool Chain Execution Patterns

## Sections Removed
- Phase II specific authentication flow (refresh tokens not required)
- Legacy Phase II folder structure references

## Templates Requiring Updates
- ✅ .specify/templates/plan-template.md - Constitution Check section requires AI/MCP gates
- ✅ .specify/templates/spec-template.md - Aligned with Phase III chatbot requirements
- ✅ .specify/templates/tasks-template.md - Ready for agentic task generation
- ✅ .specify/templates/phr-template.prompt.md - No changes needed
- ✅ .claude/Skills/*.md - New skills created: integrate-openai-agents.md (adapt for Cohere), manage-conversation-db.md, configure-chatkit.md, map-nl-to-tools.md, handle-errors-confirmations.md

## Follow-up TODOs
- None - all placeholders filled

## Date of Constitution Amendment
2026-01-06
-->

# The Evolution of Todo - Phase III Constitution

## Project Identity

**Name:** The Evolution of Todo - Phase III Full-Stack Web Application with AI Chatbot
**Version:** 3.0.0
**Phase:** Phase III - AI-Powered Chatbot Integration
**Architecture:** Monorepo Full-Stack (Next.js + FastAPI + Cohere API + MCP Tools)
**Date:** January 6, 2026

## Project Overview

Phase III transforms the existing Phase II full-stack backend (FastAPI + Neon DB + Better Auth) into an intelligent, conversational task management system. The chatbot handles all core task functionalities (add, delete, mark complete, update, list) through natural language, provides user email information from the logged-in session, and offers full conversational control.

This evolution elevates the application from a traditional CRUD web app to a flagship AI-powered productivity tool. The chatbot integrates seamlessly into the existing monorepo, extending the `/backend` with MCP tools and a stateless `/api/{user_id}/chat` endpoint, while adding ChatKit components to `/frontend` for the conversational interface.

## Core Principles

### I. AI-First Architecture

**MUST:**
- Use Cohere API for all AI reasoning, tool calling, and conversation management
- Design all interactions as conversational, not transactional
- Support multi-turn conversations with context persistence
- Chain tools sequentially for complex queries (e.g., "Add task and list pending")
- Provide natural language responses, not raw data

**MUST NOT:**
- Use OpenAI Agents SDK (replaced by Cohere API)
- Return raw JSON or technical details to end users
- Build UI that bypasses the conversational interface
- Implement features without natural language support

**Rationale:** AI-first design ensures the chatbot feels intelligent and helpful. Cohere API provides superior conversational AI with tool calling capabilities. Natural language interfaces reduce friction and increase user engagement.

### II. Stateless Design

**MUST:**
- No server-side session state
- All conversation history loaded from database per request
- `/api/{user_id}/chat` endpoint is stateless
- JWT token provides all necessary user context
- MCP tools execute statelessly with database persistence

**MUST NOT:**
- Store conversation state in memory or cache
- Rely on server-side sessions
- Implement WebSocket or long-lived connections for state
- Assume previous requests share memory

**Rationale:** Stateless architecture enables horizontal scaling and simplifies deployment. Database persistence ensures conversations survive restarts and server migrations. Statelessness is essential for serverless deployment targets.

### III. Multi-User Security

**MUST:**
- JWT authentication on `/api/{user_id}/chat` endpoint
- Validate JWT token matches `user_id` in URL parameters
- Task isolation: users only access their own tasks via MCP tools
- Conversation isolation: users only see their own conversations
- Tool calls must include `user_id` from JWT
- Validate `user_id` on every database query

**MUST NOT:**
- Allow cross-user data access via any route
- Skip JWT validation on chat endpoint
- Expose other users' conversations or tasks
- Use `user_id` from request body (must be from JWT)

**Rationale:** Multi-user systems require strict access control. JWT validation at every endpoint prevents privilege escalation. Conversation and task isolation ensures privacy and compliance.

### IV. Agentic Development

**MUST:**
- Follow SpecKit Plus workflow: Specify → Plan → Tasks → Implement
- Use Claude Code agents for all implementation work
- No manual coding - all via agents/skills
- Create specs before any code
- Generate tasks from specs
- Document architectural decisions in ADRs

**MUST NOT:**
- Write code without specification
- Skip planning phase
- Manually implement features without agent guidance
- Ignore existing skills and patterns

**Rationale:** Agentic development ensures consistency, reduces human error, and leverages Claude Code's capabilities for production-quality code. Spec-driven development prevents scope creep and provides living documentation.

### V. Cohere API Integration

**MUST:**
- Use COHERE_API_KEY environment variable for all AI calls
- Use Cohere chat endpoint for multi-turn conversations
- Structure prompts to reason step-by-step and output tool invocation JSON
- Parse Cohere responses for tool calls
- Execute tools via MCP server and return results to Cohere
- Handle tool call errors gracefully and retry

**MUST NOT:**
- Hardcode API keys in code
- Use OpenAI API or other AI providers
- Ignore tool call responses from Cohere
- Bypass structured JSON output for tool invocations

**Rationale:** Cohere API provides enterprise-grade conversational AI with built-in tool calling. Structured prompts ensure reliable tool invocation. Environment-based secrets enable secure deployment.

### VI. Conversation Persistence

**MUST:**
- Store all conversations in database (Conversation model)
- Store all messages with roles and content (Message model)
- Load full conversation history per request for context
- Support multiple conversations per user
- Include `user_id` in all conversation and message records
- Persist tool calls and their results as messages

**MUST NOT:**
- Lose conversation history on server restart
- Store conversations in memory
- Skip message persistence
- Allow orphaned messages without conversation_id

**Rationale:** Persistent conversations enable multi-turn context, historical review, and debugging. Database persistence ensures scalability and reliability.

## Technology Stack (Non-Negotiable)

### Frontend
- **Framework:** Next.js 16+ (App Router only)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS (no inline styles)
- **Authentication:** Better Auth with JWT plugin
- **Chat UI:** OpenAI ChatKit components (adapted for Cohere)
- **API Client:** Custom `/lib/api.ts` with typed functions

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.13+
- **ORM:** SQLModel
- **Database:** Neon Serverless PostgreSQL
- **Authentication:** JWT verification middleware
- **AI Provider:** Cohere API (chat endpoint with tool calling)
- **Tool System:** Official MCP SDK for task operations

### Development Tools
- **Package Manager:** UV (Python), npm/pnpm (Node.js)
- **AI Tools:** Claude Code, SpecKit Plus
- **Version Control:** Git with conventional commits

**Rationale:** Cohere API replaces OpenAI for enterprise-grade conversational AI. MCP SDK provides standardized tool interfaces. All other technologies remain from Phase II for seamless integration.

## Architecture Constraints

### Chat Endpoint Design

**Single Stateless Endpoint:**
```
POST /api/{user_id}/chat
Authorization: Bearer <JWT token>
Content-Type: application/json

{
  "message": "Add weekly meeting and list pending tasks",
  "conversation_id": "<optional, creates new if omitted>"
}

Response:
{
  "success": true,
  "message": "I've added your weekly meeting task and here are your pending tasks:",
  "data": {
    "conversation_id": "...",
    "assistant_message": "...",
    "tool_calls": [...]
  }
}
```

### Cohere Tool Calling Pattern

**Prompt Structure:**
```python
system_prompt = """
You are a helpful task management assistant with access to the following tools:
- add_task(title, description, status, user_id)
- list_tasks(user_id, status, tag)
- complete_task(task_id, user_id)
- delete_task(task_id, user_id)
- update_task(task_id, user_id, updates)

When responding to user requests:
1. Analyze the intent
2. Output tool invocation as JSON in format: {"tool": "name", "params": {...}}
3. After tool execution, respond naturally with confirmation

ALWAYS:
- Extract user_id from JWT (provided in context)
- Respond conversationally, not with raw data
- Confirm actions (e.g., "Task added!")
- Handle errors gracefully
"""
```

### MCP Tools Specification

**1. add_task**
```python
async def add_task(
    title: str,
    description: str = "",
    status: str = "pending",
    user_id: str,
    tags: List[str] = []
) -> dict:
    """Create a new task. Returns task object with id."""
```

**2. list_tasks**
```python
async def list_tasks(
    user_id: str,
    status: str = None,  # None = all
    tag: str = None
) -> List[dict]:
    """List tasks with optional filters. Returns list of task objects."""
```

**3. complete_task**
```python
async def complete_task(
    task_id: str,
    user_id: str
) -> dict:
    """Mark task as completed. Returns updated task object."""
```

**4. delete_task**
```python
async def delete_task(
    task_id: str,
    user_id: str
) -> bool:
    """Delete a task. Returns success boolean."""
```

**5. update_task**
```python
async def update_task(
    task_id: str,
    user_id: str,
    updates: dict
) -> dict:
    """Update task fields. Returns updated task object."""
```

**All tools MUST:**
- Validate `user_id` matches JWT
- Query database with `user_id` filter
- Return user-friendly error messages
- Use async database operations

## Database Extensions

### New Models

**Conversation Model:**
```python
class Conversation(SQLModel, table=True):
    id: str = Field(default_factory=uuid4, primary_key=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    title: str = Field(default="New Conversation")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
```

**Message Model:**
```python
class Message(SQLModel, table=True):
    id: str = Field(default_factory=uuid4, primary_key=True)
    conversation_id: str = Field(foreign_key="conversation.id", index=True)
    user_id: str = Field(foreign_key="user.id", index=True)
    role: str  # "user", "assistant", "tool"
    content: str
    tool_calls: Optional[dict] = None  # For assistant/tool messages
    created_at: datetime = Field(default_factory=datetime_utcnow)
```

### Indexes Required
- `user_id` on Conversation (index)
- `user_id` on Message (index)
- `conversation_id` on Message (index)
- Composite index: `(user_id, conversation_id)` on Message

## Chatbot Functionality & Natural Language Handling

### Core Functionality

**1. Natural Language Task Management (CRUD + Complete)**
- "Add weekly meeting" → `add_task(title="Weekly meeting", user_id="...")`
- "List pending tasks" → `list_tasks(user_id="...", status="pending")`
- "Mark task 123 as complete" → `complete_task(task_id="123", user_id="...")`
- "Delete the meeting task" → `delete_task(task_id="...", user_id="...")`
- "Update task title to 'Team Sync'" → `update_task(task_id="...", user_id="...", updates={"title": "Team Sync"})`

**2. User Email Queries**
- "Who am I?" → "Logged in as user@example.com"
- "What's my email?" → "Your email address is user@example.com"
- Extract email from JWT token, respond conversationally

**3. Complex Queries (Tool Chaining)**
- "Add weekly meeting and list pending tasks" → Execute `add_task`, then `list_tasks`
- "Show my tasks and delete the first one" → Execute `list_tasks`, present results, wait for confirmation, execute `delete_task`
- "Complete task 2 and add new task 'Review PR'" → Execute `complete_task`, then `add_task`

**4. Confirmations**
- "Task added!"
- "Task marked as completed!"
- "Task deleted!"
- "Task updated!"
- "Here are your tasks:"

**5. Error Handling**
- "Task not found, try again"
- "I couldn't complete that action. Please try again."
- "Which task would you like to update? Please specify."
- "What would you like the task to say?"

### Conversation Flow

```
User: "Add task: Complete Phase III spec"
  ↓
Cohere analyzes intent → outputs JSON: {"tool": "add_task", "params": {...}}
  ↓
Execute add_task via MCP → database write
  ↓
Return result to Cohere
  ↓
Cohere generates natural response: "Task added: Complete Phase III spec"
  ↓
Persist user message + assistant message to database
  ↓
Return to frontend with confirmation
```

## Authentication & Security

### JWT Authentication
- **Secret:** `BETTER_AUTH_SECRET` environment variable
- **Token Payload:** `{"user_id": "...", "email": "...", "exp": ...}`
- **Middleware:** Validate JWT on `/api/{user_id}/chat` endpoint
- **Expiry:** 7 days

### Security Rules
**MUST:**
- Verify JWT signature on every request
- Validate `user_id` from JWT matches URL parameter
- Include `user_id` in all database queries
- Isolate conversations by `user_id`
- Isolate tasks by `user_id` in MCP tools
- Return 401 for invalid/missing tokens
- Return 403 for user_id mismatch

**MUST NOT:**
- Trust `user_id` from request body
- Cache authenticated users beyond token expiry
- Allow conversation_id enumeration attacks
- Expose other users' data in any response

## Non-Functional Requirements

### Clean Code
**MUST:**
- TypeScript strict mode in frontend
- Type hints in all Python backend code
- Functions under 50 lines
- Meaningful variable names
- No `any` types in TypeScript
- Async/await for all database operations
- Cohere API calls must be async

**MUST NOT:**
- Use `any` type in TypeScript
- Skip type annotations in Python
- Create functions exceeding 50 lines
- Mix sync/async database operations
- Block on external API calls

### Async Operations
**MUST:**
- All database operations use `async def`
- All API calls use `async def`
- Use `async with` for database sessions
- Proper error handling in async context
- Connection pooling for database

### Scalability
**MUST:**
- Stateless endpoint enables horizontal scaling
- Database connection pooling
- Efficient queries with indexes
- No memory leaks from conversations
- Handle concurrent users without degradation

**Performance Targets:**
- Chat endpoint response: < 2s (p95) including AI call
- Database query time: < 50ms
- Cohere API timeout: 30s
- Support 100 concurrent users

### Graceful Errors
**MUST:**
- User-friendly error messages
- Never expose stack traces in production
- Retry transient failures (Cohere API, database)
- Log errors with context
- Return structured error responses

## Development Workflow

1. **Create Spec:** Use `/sp.specify` to generate feature specification
2. **Generate Plan:** Use `/sp.plan` to create architecture plan
3. **Generate Tasks:** Use `/sp.tasks` to create actionable task list
4. **Implement with Agents:** Use Claude Code agents for all implementation
   - `/skills integrate-openai-agents` (adapt for Cohere)
   - `/skills manage-conversation-db`
   - `/skills configure-chatkit`
   - `/skills map-nl-to-tools`
   - `/skills handle-errors-confirmations`
5. **Test:** Use `/sp.implement` to execute tasks
6. **Record ADRs:** Use `/sp.adr` for architectural decisions
7. **Create PHR:** Automatic after every interaction

**Rationale:** This agentic workflow ensures consistency, leverages Claude Code capabilities, and maintains documentation throughout development.

## Monorepo Updates

### Extended Structure

```
/
├── specs/
│   ├── overview.md
│   ├── features/
│   ├── api/
│   ├── database/
│   ├── ui/
│   └── chatbot/          # NEW: Phase III chatbot specs
├── frontend/
│   ├── app/
│   │   └── chat/         # NEW: Chat interface
│   ├── components/
│   │   └── chatkit/      # NEW: ChatKit components
│   ├── lib/
│   │   └── api.ts
│   └── CLAUDE.md
├── backend/
│   ├── main.py
│   ├── models.py
│   │   ├── task.py
│   │   ├── user.py
│   │   ├── conversation.py  # NEW
│   │   └── message.py       # NEW
│   ├── routes/
│   │   ├── tasks.py
│   │   └── chat.py          # NEW
│   ├── mcp/
│   │   └── tools.py         # NEW: MCP tool implementations
│   ├── services/
│   │   └── cohere.py        # NEW: Cohere API integration
│   └── CLAUDE.md
├── .claude/
│   ├── agents/
│   │   ├── openai-agents-integrator.md   # NEW (adapt for Cohere)
│   │   ├── database-engineer.md          # NEW
│   │   ├── integration-tester.md         # NEW
│   │   └── phase3-architecture-planner.md # NEW
│   ├── Skills/
│   │   ├── integrate-openai-agents.md    # NEW (Cohere adaptation)
│   │   ├── manage-conversation-db.md     # NEW
│   │   ├── configure-chatkit.md          # NEW
│   │   ├── map-nl-to-tools.md            # NEW
│   │   └── handle-errors-confirmations.md # NEW
│   └── commands/
├── .specify/
│   ├── memory/
│   │   └── constitution.md (this file)
│   └── templates/
├── history/
│   ├── prompts/
│   └── adr/
├── AGENTS.md
├── CLAUDE.md
└── docker-compose.yml
```

## Environment Variables

```bash
# Phase II (existing)
BETTER_AUTH_SECRET=...
DATABASE_URL=postgresql://...

# Phase III (new)
COHERE_API_KEY=c4iE4V4fbUHfyq7DrhswUKH96ZhECgS3MdEEEIeO
```

## Deployment Constraints

- **Frontend:** Vercel (or compatible Next.js host)
- **Backend:** Any platform supporting FastAPI (Railway, Render, Fly.io)
- **Database:** Neon Serverless PostgreSQL
- **AI API:** Cohere (external service)
- Environment variables managed securely
- CORS configured for production domains

## Guiding Principles

1. **AI-First**: Design everything around conversational AI capabilities
2. **Stateless**: No server memory, database as source of truth
3. **Security**: Multi-user isolation at every layer
4. **Agentic**: All development via Claude Code agents
5. **Spec-Driven**: No code without specification
6. **Persistence**: All conversations and messages saved to database
7. **Confirmation**: Every action confirmed with natural language response
8. **Error Handling**: Graceful, user-friendly error messages
9. **Hackathon Transparency**: Clear architecture, documented decisions, demo-ready

## Deliverables and Success Criteria

### Working Chatbot
- [x] Stateless `/api/{user_id}/chat` endpoint
- [x] Cohere API integration for AI reasoning
- [x] MCP tools for all 5 task operations
- [x] Database persistence (Conversation, Message models)
- [x] JWT authentication with user isolation
- [x] Natural language responses
- [x] Confirmations for all actions
- [x] Graceful error handling

### Repository Updates
- [x] New backend routes: `/api/{user_id}/chat`
- [x] New database models: Conversation, Message
- [x] MCP tools implementation in `/backend/mcp/tools.py`
- [x] Cohere integration service in `/backend/services/cohere.py`
- [x] ChatKit frontend components
- [x] Updated constitution (this file)
- [x] New skills for Claude Code agents

### Demo Capabilities
- [x] Natural queries handle full CRUD + complete
- [x] User email queries ("Who am I?")
- [x] Complex queries with tool chaining
- [x] Error handling demonstrated
- [x] Multi-user isolation verified
- [x] Conversation persistence across sessions

### Success Metrics
- Chatbot handles all 5 task operations naturally
- User queries resolved in < 2s
- No cross-user data access
- Conversations persist correctly
- Error rate < 1% for valid queries
- Demo flows work end-to-end

## Review Checklist

Before any PR/commit:
- [ ] Spec file exists and is up to date
- [ ] Cohere API calls are async with proper error handling
- [ ] JWT authentication enforced on chat endpoint
- [ ] MCP tools validate user_id
- [ ] Conversations persisted to database
- [ ] No server-side state (stateless endpoint)
- [ ] Natural language responses, not raw data
- [ ] Confirmations provided for all actions
- [ ] Error messages are user-friendly
- [ ] TypeScript/Python types are complete
- [ ] No secrets in code
- [ ] Tests passing (if applicable)

## Governance

This constitution supersedes all Phase II practices. Amendments require:
1. Documentation of proposed changes
2. Impact assessment on existing code and templates
3. Approval from project maintainers
4. Migration plan for affected code
5. Update of all dependent templates and skills

All PRs and code reviews MUST verify compliance with these principles. Complexity must be justified against simpler alternatives. Use `CLAUDE.md` in each directory for runtime development guidance specific to that module.

**Version Semantics:**
- **MAJOR**: Backward incompatible governance/principle removals or redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

---

**Version**: 3.0.0 | **Ratified**: 2026-01-06 | **Last Amended**: 2026-01-06
