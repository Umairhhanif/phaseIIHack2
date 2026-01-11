# Implementation Plan: AI Todo Chatbot with Cohere Integration

**Branch**: `1-ai-chatbot` | **Date**: 2026-01-10 | **Spec**: [v1_chatbot.spec.md](./spec.md)
**Input**: Feature specification from `/specs/1-ai-chatbot/spec.md`

## Summary

This plan transforms the existing Phase II full-stack backend into an intelligent, conversational task management system. The chatbot handles all core task functionalities (add, delete, mark complete, update, list) through natural language, provides user email information from the logged-in session, and offers full conversational control with persistence. The implementation leverages Cohere API for AI reasoning, MCP-style tools for task operations, and adds a premium ChatKit-based UI component to the frontend.

## Technical Context

**Language/Version**: Python 3.13+ (backend), TypeScript 5+ (frontend)
**Primary Dependencies**: FastAPI, SQLModel, Cohere SDK, Next.js 16+, React
**Storage**: Neon Serverless PostgreSQL
**Testing**: pytest (backend), Jest/Playwright (frontend)
**Target Platform**: Web (desktop + mobile responsive)
**Project Type**: Full-stack web application (monorepo)
**Performance Goals**: < 2s chat response (p95), < 50ms DB queries, 100 concurrent users
**Constraints**: Stateless architecture, no server-side session, all state from DB
**Scale/Scope**: Multi-user SaaS, 10k+ users, conversation persistence per user

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

### AI-First Architecture (PASS)
- Cohere API selected for all AI reasoning (not OpenAI)
- Conversational interaction design throughout
- Multi-turn conversations with context persistence
- Natural language responses only (no raw JSON to users)
- Tool chaining for complex queries

### Stateless Design (PASS)
- No server-side session state planned
- All conversation history loaded from database per request
- /api/{user_id}/chat endpoint designed as stateless
- JWT token provides all necessary user context
- MCP tools execute statelessly with database persistence

### Multi-User Security (PASS)
- JWT authentication on /api/{user_id}/chat endpoint
- JWT validation matches URL user_id
- Task isolation enforced via user_id in MCP tools
- Conversation isolation via user_id in queries
- All tools include user_id from JWT

### Agentic Development (PASS)
- Implementation via specialized Claude Code agents
- Spec-driven workflow followed
- No manual coding planned
- Skills and agents defined for each phase

### Cohere API Integration (PASS)
- COHERE_API_KEY environment variable configured
- Cohere chat endpoint for multi-turn conversations
- System prompt with tool schemas
- JSON block parsing for tool invocations
- Tool execution with result feeding

### Conversation Persistence (PASS)
- Conversation model defined in data model
- Message model with roles and content
- Load full history per request
- Multiple conversations per user supported
- Tool calls persisted as messages

**CONCLUSION**: All constitution gates PASS. Proceed to Phase 0 research.

## Project Structure

### Documentation (this feature)

```text
specs/1-ai-chatbot/
├── plan.md              # This file (/sp.plan command output)
├── spec.md              # Feature specification (completed)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── chat-endpoint.md # Chat API contract
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── main.py              # Updated with chat router
├── models.py            # Extended with Conversation, Message
├── database.py          # No changes (supports new models)
├── routes/
│   ├── tasks.py         # Existing, unchanged
│   ├── auth.py          # Existing, unchanged
│   └── chat.py          # NEW: /api/{user_id}/chat endpoint
├── services/
│   └── cohere.py        # NEW: Cohere API integration
├── mcp/
│   └── tools.py         # NEW: MCP-style tool implementations
└── lib/
    ├── auth.py          # Existing, unchanged
    └── errors.py        # Existing, unchanged

frontend/
├── app/
│   ├── layout.tsx       # Updated with chat button
│   └── page.tsx         # Existing, unchanged
├── components/
│   └── chatbot/         # NEW: ChatKit-based components
│       ├── ChatButton.tsx      # Floating action button
│       ├── ChatPanel.tsx       # Slide-in panel
│       ├── ChatMessage.tsx     # Message bubble
│       ├── ChatInput.tsx       # Input with send button
│       └── TypingIndicator.tsx # Animated dots
├── lib/
│   ├── api.ts           # Extended with chatAPI
│   ├── auth.ts          # Existing, unchanged
│   └── types.ts         # Extended with chat types
```

**Structure Decision**: Monorepo structure maintained. Backend extended with new routes, services, and MCP tools. Frontend extended with new chatbot components. No new projects or major restructuring needed - this is an enhancement, not a new application.

## Phase 0: Research & Technology Decisions

### Research Tasks

| Research Topic | Decision Required | Impact |
|----------------|-------------------|--------|
| Cohere API integration patterns | Tool calling format, chat API vs completions | Core AI reasoning implementation |
| Cohere model selection | command-r vs command-r-plus | Reasoning accuracy vs cost |
| JSON parsing from Cohere responses | Strict JSON block vs regex fallback | Tool invocation reliability |
| Tool schema format for Cohere | OpenAI-style vs custom | Compatibility with Cohere |
| ChatKit component adaptation | Use as-is vs customize | Development effort |
| Conversation history management | Full load vs token limiting | Performance vs context |
| MCP SDK integration | Official SDK vs custom | Tool implementation effort |
| Markdown rendering library | react-markdown vs custom | Display capabilities |

### Output: research.md

Research findings will document:
1. Cohere API best practices for tool calling
2. Model selection justification (command-r-plus)
3. JSON parsing strategy (strict with retry)
4. ChatKit component patterns
5. MCP SDK usage patterns
6. Conversation history window strategy
7. Markdown library selection

## Phase 1: Design & Contracts

### Phase 1A: Data Model Extension

Create `data-model.md` with:
1. Conversation model definition
   - id (UUID, primary key)
   - user_id (foreign key to users.id, indexed)
   - title (string, default "New Conversation")
   - created_at, updated_at (datetime)
2. Message model definition
   - id (UUID, primary key)
   - conversation_id (foreign key to conversations.id, indexed)
   - user_id (foreign key to users.id, indexed)
   - role (enum: "user" | "assistant" | "tool")
   - content (string)
   - tool_calls (optional JSON dict for assistant/tool messages)
   - created_at (datetime)
3. Indexes specification:
   - user_id on Conversation
   - user_id on Message
   - conversation_id on Message
   - Composite: (user_id, conversation_id) on Message
4. Migration strategy:
   - Create tables via SQLModel.metadata.create_all()
   - Existing tables unaffected (non-breaking change)
   - Rollback: drop tables if needed

### Phase 1B: API Contract

Create `contracts/chat-endpoint.md` with:

**POST /api/{user_id}/chat**

Request:
```json
{
  "message": "Add weekly meeting and list pending tasks",
  "conversation_id": "<optional UUID, creates new if omitted>"
}
```

Response (Success):
```json
{
  "success": true,
  "message": "I've added your weekly meeting task and here are your pending tasks:",
  "data": {
    "conversation_id": "uuid",
    "assistant_message": "I've added 'Weekly meeting' to your tasks. Here are your pending tasks:\n1. Weekly meeting\n2. Buy groceries",
    "tool_calls": [
      {
        "tool": "add_task",
        "params": {"title": "Weekly meeting", "user_id": "uuid"},
        "result": {"id": "uuid", "title": "Weekly meeting", ...}
      },
      {
        "tool": "list_tasks",
        "params": {"user_id": "uuid", "status": "pending"},
        "result": [...]
      }
    ]
  }
}
```

Response (Error):
```json
{
  "error": {
    "code": "AI_REASONING_FAILED",
    "message": "I'm having trouble understanding your request. Please try rephrasing."
  }
}
```

Status codes:
- 200: Success
- 400: Invalid request (malformed message)
- 401: Unauthorized (missing/invalid JWT)
- 403: Forbidden (user_id mismatch)
- 500: Internal error (Cohere API failure, DB error)

### Phase 1C: MCP Tools Specification

Define 6 tools with exact signatures:

1. **add_task**
```python
async def add_task(
    title: str,
    description: str = "",
    user_id: str,
    tags: List[str] = []
) -> dict:
    """Create a new task. Returns task object with id."""
```

2. **list_tasks**
```python
async def list_tasks(
    user_id: str,
    status: str = None,  # "pending" | "completed" | None
    tag: str = None
) -> List[dict]:
    """List tasks with optional filters. Returns list of task objects."""
```

3. **complete_task**
```python
async def complete_task(
    task_id: str,
    user_id: str
) -> dict:
    """Mark task as completed. Returns updated task object."""
```

4. **delete_task**
```python
async def delete_task(
    task_id: str,
    user_id: str
) -> bool:
    """Delete a task. Returns success boolean."""
```

5. **update_task**
```python
async def update_task(
    task_id: str,
    user_id: str,
    updates: dict
) -> dict:
    """Update task fields. Returns updated task object."""
```

6. **get_current_user**
```python
async def get_current_user(
    user_id: str,
    email: str
) -> dict:
    """Return user identity. Returns {id, email, name}."""
```

All tools:
- Validate user_id matches JWT
- Return user-friendly errors
- Use async database operations

### Phase 1D: Quickstart Guide

Create `quickstart.md` with:
1. Environment setup (COHERE_API_KEY)
2. Database migration (create tables)
3. Backend startup verification
4. Frontend component usage
5. Example chat interactions

### Phase 1E: Agent Context Update

Run `.specify/scripts/powershell/update-agent-context.ps1 -AgentType claude` to update agent-specific context files with new technology (Cohere, MCP, ChatKit).

## Phase 2: Implementation Roadmap

After Phase 1 completes, `/sp.tasks` will generate actionable task list. High-level phases:

### Phase 2.1: Database Extensions (Database Engineer Agent)
- Create Conversation model in models.py
- Create Message model in models.py
- Add indexes
- Test table creation via init_db()

### Phase 2.2: MCP Tools Implementation (MCP Tools Engineer Agent)
- Create backend/mcp/tools.py
- Implement 6 tools with exact signatures
- Integrate with existing Task CRUD routes
- Add user_id validation
- Return user-friendly errors

### Phase 2.3: Cohere Integration Core (Chatbot Backend Engineer Agent)
- Create backend/services/cohere.py
- Initialize Cohere client with API key
- Build system prompt with tool schemas
- Implement reasoning loop (call → parse → execute → feed back)
- Handle JSON parsing with retry logic

### Phase 2.4: Stateless Chat Endpoint (Chatbot Backend Engineer Agent)
- Create backend/routes/chat.py
- Implement POST /api/{user_id}/chat
- Add JWT authentication dependency
- Load conversation history (if conversation_id provided)
- Run Cohere reasoning loop
- Save user and assistant messages to DB
- Return response with tool_calls metadata

### Phase 2.5: Conversation Management (Chatbot Backend Engineer Agent)
- Implement conversation_id creation/loading
- Handle message persistence (user/assistant/tool roles)
- Efficient history fetching (indexed queries)
- Support conversation resumption

### Phase 2.6: Frontend Chat Trigger (Frontend Chatbot Engineer Agent)
- Create frontend/components/chatbot/ChatButton.tsx
- Style: floating button, emerald accent, pulse hover, glassmorphic
- Position: bottom-right fixed
- State: open/close toggle

### Phase 2.7: Chat Panel UI (Frontend Chatbot Engineer Agent)
- Create frontend/components/chatbot/ChatPanel.tsx
- Slide-in animation from bottom-right
- Header: close button, AI title
- Scrollable message area
- Input bar with send button
- Typing indicator
- Theme-aware styling

### Phase 2.8: Chat Message Component (Frontend Chatbot Engineer Agent)
- Create frontend/components/chatbot/ChatMessage.tsx
- User messages: right-aligned, solid indigo bubble
- Assistant messages: left-aligned, glassmorphic slate bubble
- Markdown rendering (react-markdown)
- Timestamps
- Fade-in animations

### Phase 2.9: Chat Input Component (Frontend Chatbot Engineer Agent)
- Create frontend/components/chatbot/ChatInput.tsx
- Text input with multiline support
- Send button with SVG icon
- Enter to send, Shift+Enter for newline
- Disabled state while sending

### Phase 2.10: Typing Indicator (Frontend Chatbot Engineer Agent)
- Create frontend/components/chatbot/TypingIndicator.tsx
- 3 animated dots with fade
- Subtle pulse animation
- Positioned in message area

### Phase 2.11: Frontend API Integration (Frontend Chatbot Engineer Agent)
- Extend frontend/lib/api.ts with chatAPI
- Add chat types to frontend/lib/types.ts
- Implement sendMessage, loadConversation functions
- Handle errors gracefully

### Phase 2.12: Integration Testing (Integration Tester Agent)
- Test: Frontend button → open panel → send message → backend Cohere call → tool execution → DB update → response bubbles
- Test: Invalid JWT → 401 error
- Test: Cross-user conversation → denied
- Test: Conversation persistence across sessions
- Test: Multi-step tool chaining

### Phase 2.13: Polish & Delight (Frontend Chatbot Engineer Agent)
- Micro-interactions (panel slide, bubble fade, button ripple)
- Mobile optimization (touch, responsive)
- Accessibility (ARIA labels, keyboard nav)
- Theme switching validation

### Phase 2.14: Final Validation (Integration Tester Agent)
- End-to-end demo flows
- Intelligence validation (diverse queries)
- Visual perfection review
- Performance benchmarks (< 2s response)
- Prepare demo notes

## Architecture Decisions (Need ADR Documentation)

### 1. Cohere Model Selection: command-r-plus
**Impact**: Long-term AI reasoning quality, cost
**Alternatives**: command-r (cheaper, less reasoning power)
**Scope**: Cross-cutting - affects all AI interactions
**Decision**: Use command-r-plus for superior tool-use accuracy

### 2. Tool Call Parsing: Strict JSON Block Extraction
**Impact**: Reliability of tool invocation
**Alternatives**: Regex fallback (more lenient, less reliable)
**Scope**: Cohere integration layer
**Decision**: Require Cohere to output valid JSON in ```json``` blocks with retry prompt on failure

### 3. Multi-Step Chaining: Loop Until No Tool Call
**Impact**: Supports complex queries like "List pending then delete first"
**Alternatives**: Single Cohere call (simpler, limited)
**Scope**: Reasoning loop implementation
**Decision**: Execute tools, feed results back to Cohere until final response

### 4. Conversation Persistence: Optional conversation_id
**Impact**: UX flexibility
**Alternatives**: Always new conversation (simpler, no resuming)
**Scope**: Conversation management
**Decision**: Create new if not provided, support resuming via ID

### 5. Frontend Layout: Slide-in Glassmorphic Card
**Impact**: Visual design, UX pattern
**Alternatives**: Side panel (traditional), bottom sheet (mobile-first)
**Scope**: Chat UI component structure
**Decision**: Elegant slide-in from bottom-right with glassmorphism for premium immersion

### 6. Message Rendering: Markdown Support
**Impact**: Display capabilities
**Alternatives**: Plain text (simpler)
**Scope**: Message display component
**Decision**: Use react-markdown for rich formatting (bold, italic, lists, code blocks)

**NOTE**: All decisions above require ADR documentation. Run `/sp.adr <title>` for each significant decision.

## Rollback Strategy

| Phase | Rollback Steps |
|-------|----------------|
| Database Extensions | Drop `conversations` and `messages` tables; no impact on existing tables |
| MCP Tools | Delete `backend/mcp/tools.py`; no impact on existing routes |
| Cohere Integration | Delete `backend/services/cohere.py`; chat endpoint will fail gracefully |
| Chat Endpoint | Remove `app.include_router(chat.router)` from main.py |
| Frontend Chat | Remove chatbot components and ChatButton from layout.tsx |

All rollback operations are non-destructive to existing Phase II functionality.

## Success Criteria

### Functional
- [ ] Users can add tasks via natural language ("add task buy groceries")
- [ ] Users can complete, delete, update tasks via natural language
- [ ] Users can list tasks with filters via natural language
- [ ] "Who am I?" returns user's email and ID
- [ ] Conversation history persists across sessions
- [ ] Multiple concurrent conversations supported

### Non-Functional
- [ ] Chat endpoint responds < 2s (p95)
- [ ] Zero cross-user data leakage
- [ ] Stateless architecture verified (no in-memory state)
- [ ] JWT authentication enforced on all chat operations
- [ ] All conversations/messages saved to database

### Visual
- [ ] Chat button visible on all pages with premium styling
- [ ] Chat panel opens smoothly (< 300ms animation)
- [ ] Message bubbles styled correctly (user vs assistant)
- [ ] Dark/light theme support working
- [ ] Mobile responsive touch interactions working

### AI Intelligence
- [ ] 95% intent interpretation accuracy across varied phrasing
- [ ] Tool chaining works for complex queries
- [ ] Graceful error handling for ambiguous inputs
- [ ] Natural language confirmations for all actions

## Open Questions / Clarifications Needed

None. All technical decisions specified in user input.

## Next Steps

1. **Phase 0**: Execute research tasks and generate `research.md`
2. **Phase 1**: Generate `data-model.md`, `contracts/chat-endpoint.md`, `quickstart.md`
3. **Update Agent Context**: Run update-agent-context.ps1
4. **Phase 2**: Run `/sp.tasks` to generate actionable task list
5. **Implementation**: Execute tasks via specialized Claude Code agents

---

**Plan Status**: READY FOR PHASE 0 RESEARCH
**Constitution Check**: PASS (6/6 gates)
**Next Command**: Proceed with Phase 0 research tasks
