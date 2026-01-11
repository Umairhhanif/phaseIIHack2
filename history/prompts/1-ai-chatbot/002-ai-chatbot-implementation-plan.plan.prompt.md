---
id: 002
title: ai-chatbot-implementation-plan
stage: plan
date: 2026-01-10
surface: agent
model: claude-sonnet-4-5-20250929
feature: 1-ai-chatbot
branch: 1-ai-chatbot
user: unknown
command: /sp.plan
labels: [plan, architecture, cohere, chatbot]
links:
  spec: ../specs/1-ai-chatbot/spec.md
  ticket: null
  adr: null
  pr: null
files:
  - specs/1-ai-chatbot/plan.md
tests:
---

## Prompt

AI Todo Chatbot Integration for The Evolution of Todo - Phase III: Full-Stack Web Application
Create: A flawless, rigorously sequenced, flagship-grade implementation blueprint that transforms the approved v1_chatbot.spec.md into a breathtakingly intelligent, emotionally delightful, production-ready AI Todo Chatbot seamlessly integrated into the existing full-stack masterpiece. This plan must guide the specialized agents (Database Engineer, MCP Tools Engineer, Chatbot Backend Engineer, Frontend Chatbot Engineer) to deliver absolute perfection: magical natural language task management, secure Cohere-powered reasoning with tool calling, persistent conversations, and a visually stunning, premium chat UI that harmonizes perfectly with the existing flagship design — resulting in a hackathon-dominating, real-world AI productivity experience.
Decisions needing documentation:
Cohere Model Selection: command-r-plus vs. command-r (choose command-r-plus for superior reasoning and tool-use accuracy).
Tool Call Parsing: Strict JSON block extraction vs. regex fallback (choose strict: require Cohere to output valid JSON in ```json``` block).
Multi-Step Chaining: Single Cohere call vs. loop until no tool call (choose loop: execute tools, feed results back to Cohere until final response for complex queries like "List pending then delete the first").
Conversation Persistence: Always new conversation_id if missing vs. single per user (choose optional: create new if not provided, support resuming via ID).
Frontend Chat Panel Layout: Slide-in side panel vs. full bottom sheet (choose elegant slide-in from bottom-right with glassmorphic card for premium immersion).
Message Rendering: Plain text vs. markdown support (choose markdown: assistant responses with bold, italic, lists, code blocks for rich, professional feel).
Typing Indicator: Simple "AI is typing..." vs. animated dots (choose subtle animated dots with fade for delight).
Testing strategy:
Intelligence Validation: Diverse natural language queries (simple add, ambiguous delete by title, chained list+complete, "Who am I?" → email response).
Integration End-to-End: Frontend button → open panel → send message → backend Cohere call → tool execution → DB update → response bubbles appear → task list updates reflect changes.
Security & Isolation: Invalid JWT → 401, cross-user conversation → denied, tool calls with wrong user_id → rejected.
Persistence & Statelessness: Server restart → history loads, no session loss; multiple concurrent chats work.
Edge Cases: Malformed Cohere JSON → retry prompt, API error → friendly "I'm having trouble, try again", unknown intent → helpful clarification.
UI Perfection Audit: Chat panel animations cinematic, bubbles premium (glassmorphic assistant, solid user), theme switching flawless, mobile touch-optimized.
Performance Check: Low latency (<2s typical response), efficient DB queries, no memory leaks.
Technical details:
Execute in strict, phased sequence with mandatory agent-specific checkpoints — each phase atomic, testable, reversible.
Every action must explicitly reference v1_chatbot.spec.md sections (e.g., "Per Cohere API Adaptation Strategy, implement prompt with step-by-step reasoning").
Backend: Async Cohere calls via cohere library, async DB sessions, stateless endpoint.
Cohere Prompt Engineering: System prompt for reasoning + tool schema + "output JSON in json block or direct response".
Tools: 6 total (add_task, delete_task, update_task, complete_task, list_tasks, get_current_user) — all stateless, enforce user_id from JWT.
Frontend: Client component for chat panel, integrate with existing premium theme (glassmorphism, colors, typography).
Environment: Use COHERE_API_KEY env var; reuse existing BETTER_AUTH_SECRET, DATABASE_URL.
Agent must request confirmation after major phases (DB complete, Tools complete, Backend endpoint complete, Frontend UI complete).
Include rollback guidance per phase.
Phases:
Foundation & Database Extensions → Extend SQLModel with Conversation and Message models, add indexes, async create_tables/migration logic (Database Engineer Agent).
MCP-Style Tools Implementation → Build 6 stateless tools with exact params/returns, integrate SQLModel CRUD, enforce user_id/email from JWT (MCP Tools Engineer Agent).
Cohere Integration Core → Implement Cohere client, system prompt with tool schemas, reasoning loop (call → parse JSON → execute tool → feed back until final) (Chatbot Backend Engineer Agent).
Stateless Chat Endpoint → Create POST /api/{user_id}/chat: JWT auth, load/save history, run Cohere loop, return response + tool_calls (Chatbot Backend Engineer Agent).
Conversation Management → Handle conversation_id creation/loading, message saving (user/assistant roles), efficient history fetching (Chatbot Backend Engineer Agent).
Frontend Chat Trigger → Add premium floating chatbot button (bottom-right, emerald accent, subtle pulse hover, glassmorphic) matching flagship design (Frontend Chatbot Engineer Agent).
Chat Panel UI Mastery → Build stunning slide-in panel: header with close/AI title, scrollable markdown bubbles, input bar with send SVG, typing indicator, theme-aware styling (Frontend Chatbot Engineer Agent).
Real-Time Chat Flow → Implement send message → loading state → streaming/fake typing → display assistant response, auto-scroll, error handling (Frontend Chatbot Engineer Agent).
Polish & Delight → Add micro-interactions (panel slide animation, bubble fade-in, send button ripple), markdown rendering, mobile optimization, accessibility (ARIA labels) (Frontend Chatbot Engineer Agent).
Final Validation & Magic → Comprehensive testing of all scenarios, end-to-end demo flows, intelligence audit, visual perfection review, prepare demo notes highlighting AI capabilities.
Deliverables:
Fully integrated, intelligent AI Todo Chatbot enhancing the flagship full-stack app.
Updated /backend with secure, stateless Cohere-powered endpoint and tools.
Stunning /frontend chat UI component seamlessly blended with premium design.
Updated README.md with Cohere setup, chatbot usage examples, "AI Magic Highlights" for judges.
IMPLEMENTATION_LOG.md documenting phase completions and intelligence decisions.
Demo-ready: natural language task management that feels truly magical.
Timeline: Complete the entire flagship AI chatbot within 24-36 hours via parallel agent execution — prioritize phases 1-5 for core intelligence, then 6-10 for breathtaking UI and perfection.
Guiding mantra: Do not merely add a chatbot — deliver an enchanting, intelligent companion that makes users fall in love with the app, whispering "This AI actually understands me perfectly." Flagship quality. Emotional delight. Absolute mastery.

## Response snapshot

Generated comprehensive implementation plan (plan.md) for AI Todo Chatbot with Cohere Integration. Plan includes:

**Technical Context**:
- Stack: Python 3.13+, TypeScript 5+, FastAPI, SQLModel, Cohere SDK, Next.js 16+
- Storage: Neon Serverless PostgreSQL
- Performance: <2s chat response, <50ms DB queries, 100 concurrent users
- Architecture: Stateless, monorepo full-stack enhancement

**Constitution Check** (6/6 PASS):
- AI-First Architecture: Cohere API selected, conversational design, tool chaining
- Stateless Design: No server session, DB-persisted history
- Multi-User Security: JWT auth on all endpoints, user isolation
- Agentic Development: Agent-based implementation workflow
- Cohere API Integration: Tool calling with JSON parsing
- Conversation Persistence: Conversation/Message models defined

**Project Structure**: Backend extended with chat.py route, cohere.py service, mcp/tools.py. Frontend extended with chatbot/ components.

**Phase 0 Research**: 8 research tasks defined (Cohere API, model selection, JSON parsing, tool schema, ChatKit, history management, MCP SDK, markdown rendering)

**Phase 1 Design**: data-model.md, contracts/chat-endpoint.md, quickstart.md specifications for Conversation, Message models, API contract, 6 MCP tools (add_task, list_tasks, complete_task, delete_task, update_task, get_current_user)

**Phase 2 Roadmap**: 14 implementation phases from database extensions through final validation, assigned to specialized agents

**Architecture Decisions** (6 identified for ADR):
1. Cohere model: command-r-plus
2. JSON parsing: strict with retry
3. Tool chaining: loop until final
4. Conversation persistence: optional conversation_id
5. UI layout: slide-in glassmorphic
6. Message rendering: markdown support

**Rollback Strategy**: Non-destructive rollback per phase (drop tables, delete files, remove routes)

**Success Criteria**: Functional (6 items), Non-Functional (5), Visual (5), AI Intelligence (4)

## Outcome

- ✅ Impact: Comprehensive flagship-grade implementation blueprint created, all constitution gates passed, architecture decisions documented for ADR
- 🧪 Tests: No tests run (planning phase only)
- 📁 Files: Created specs/1-ai-chatbot/plan.md with complete technical plan, constitution check, project structure, phased roadmap
- 🔁 Next prompts: Run `/sp.tasks` to generate actionable task breakdown, proceed with Phase 0 research
- 🧠 Reflection: Plan successfully bridges approved spec to implementation with agent-specific phases. All user-specified decisions (Cohere model, parsing strategy, chaining, persistence, UI layout, markdown support) embedded. Rollback guidance ensures safe deployment.

## Evaluation notes (flywheel)

- Failure modes observed: None
- Graders run and results (PASS/FAIL): Constitution Check PASS (6/6 gates)
- Prompt variant (if applicable): None
- Next experiment (smallest change to try): Generate Phase 0 research.md with Cohere API best practices, then proceed to /sp.tasks for implementation
