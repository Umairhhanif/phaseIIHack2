---
description: "Task list for AI Todo Chatbot with Cohere Integration"
---

# Tasks: AI Todo Chatbot with Cohere Integration

**Input**: Design documents from `/specs/1-ai-chatbot/`
**Prerequisites**: plan.md (required), spec.md (required for user stories)

**Tests**: Tests are NOT explicitly requested in the feature specification, so test tasks are EXCLUDED from this implementation.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/` (FastAPI with SQLModel)
- **Frontend**: `frontend/` (Next.js 16+ with React)
- Monorepo structure with existing auth and task management

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Environment configuration and dependencies

- [ ] T001 Add COHERE_API_KEY to backend/.env with installation instructions
- [ ] T002 [P] Install cohere Python SDK in backend/requirements.txt (cohere>=5.0.0)
- [ ] T003 [P] Install react-markdown in frontend/package.json for message rendering
- [ ] T004 [P] Verify existing JWT authentication in backend/lib/auth.py is functional

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core database and infrastructure that MUST be complete before ANY user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T005 Create Conversation model in backend/models.py with id, user_id (indexed), title, created_at, updated_at
- [ ] T006 Create Message model in backend/models.py with id, conversation_id (indexed), user_id (indexed), role (enum), content, tool_calls (JSON), created_at
- [ ] T007 Add composite index (user_id, conversation_id) on Message model for efficient history queries
- [ ] T008 Run SQLModel.metadata.create_all() in backend/database.py init_db() to create new tables
- [ ] T009 [P] Create backend/mcp/__init__.py for MCP tools module
- [ ] T010 [P] Create backend/services/__init__.py for services module
- [ ] T011 [P] Create frontend/components/chatbot/ directory for chat UI components
- [ ] T012 [P] Add chat-related TypeScript types to frontend/lib/types.ts (ConversationMessage, ChatAPIRequest, ChatAPIResponse)

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Conversational Task Management (Priority: P1) 🎯 MVP

**Goal**: Users can add, complete, delete, update, and list tasks through natural language conversation

**Independent Test**: Type "add task buy groceries" into chatbot, verify task is created and confirmation appears. Type "show all tasks", verify task list displays. Type "complete buy groceries", verify task marked complete.

### MCP Tools Implementation for User Story 1

- [ ] T013 [P] [US1] Implement add_task tool in backend/mcp/tools.py with params (title, description, user_id, tags) and SQLModel Task creation
- [ ] T014 [P] [US1] Implement list_tasks tool in backend/mcp/tools.py with params (user_id, status, tag) and filtered query returning task dicts
- [ ] T015 [P] [US1] Implement complete_task tool in backend/mcp/tools.py with params (task_id, user_id) and status update logic
- [ ] T016 [P] [US1] Implement delete_task tool in backend/mcp/tools.py with params (task_id, user_id) and deletion logic returning bool
- [ ] T017 [P] [US1] Implement update_task tool in backend/mcp/tools.py with params (task_id, user_id, updates dict) and update logic
- [ ] T018 [US1] Add user_id validation in all MCP tools to enforce data isolation (compare with JWT user_id)

### Cohere Integration Core for User Story 1

- [ ] T019 [US1] Create backend/services/cohere.py with CohereClient class and API key initialization
- [ ] T020 [US1] Build system prompt in backend/services/cohere.py with tool schemas for all 6 MCP tools (OpenAI-compatible format)
- [ ] T021 [US1] Implement reasoning loop in backend/services/cohere.py: call Cohere → parse JSON tool calls → execute tools → feed results back until final response
- [ ] T022 [US1] Add JSON block parsing logic with strict ```json``` extraction and retry prompt on malformed responses
- [ ] T023 [US1] Add error handling for Cohere API failures with user-friendly fallback messages

### Chat Endpoint for User Story 1

- [ ] T024 [US1] Create backend/routes/chat.py with POST /api/{user_id}/chat endpoint
- [ ] T025 [US1] Add JWT authentication dependency to chat endpoint extracting user_id and email from token
- [ ] T026 [US1] Validate URL user_id matches JWT user_id in chat endpoint, return 403 if mismatch
- [ ] T027 [US1] Implement conversation_id creation logic: create new Conversation if not provided in request
- [ ] T028 [US1] Implement conversation history loading: query Message by conversation_id and user_id ordered by created_at
- [ ] T029 [US1] Integrate Cohere reasoning loop in chat endpoint: load history → run loop → get final response
- [ ] T030 [US1] Save user message to Message table with role="user", content=user_message
- [ ] T031 [US1] Save assistant response to Message table with role="assistant", content=assistant_message, tool_calls=executed_tools
- [ ] T032 [US1] Return ChatAPIResponse with conversation_id, assistant_message, and tool_calls metadata
- [ ] T033 [US1] Include chat router in backend/main.py with app.include_router(chat.router, prefix="/api")

**Checkpoint**: User Story 1 complete - users can manage tasks via natural language conversation

---

## Phase 4: User Story 2 - User Identity Recognition (Priority: P1)

**Goal**: Users can ask "Who am I?" and receive their email and user ID

**Independent Test**: Type "Who am I?" into chatbot and verify response contains user's email and ID from JWT token

### Implementation for User Story 2

- [ ] T034 [P] [US2] Implement get_current_user tool in backend/mcp/tools.py with params (user_id, email) returning user identity dict
- [ ] T035 [US2] Update system prompt in backend/services/cohere.py to include get_current_user tool schema
- [ ] T036 [US2] Test identity query by passing JWT user_id and email to get_current_user tool and returning formatted response

**Checkpoint**: User Story 2 complete - users can verify their logged-in identity through chatbot

---

## Phase 5: User Story 3 - Conversation History Persistence (Priority: P2)

**Goal**: Users can close and reopen chat panel and see full conversation history

**Independent Test**: Have a conversation, close chat panel, reopen it, and verify all previous messages appear in order

### Implementation for User Story 3

- [ ] T037 [US3] Add conversation loading endpoint GET /api/{user_id}/conversations in backend/routes/chat.py returning user's conversation list
- [ ] T038 [US3] Add conversation history endpoint GET /api/{user_id}/conversations/{conversation_id}/messages in backend/routes/chat.py
- [ ] T039 [US3] Ensure JWT validation on all conversation endpoints (user_id must match token)
- [ ] T040 [US3] Add conversation_id query param support to chat endpoint for resuming existing conversations
- [ ] T041 [US3] Update conversation updated_at timestamp on each new message for sorting
- [ ] T042 [US3] Add efficient composite index query test: verify (user_id, conversation_id) index improves message loading performance

**Checkpoint**: User Story 3 complete - conversation persistence and resumption working

---

## Phase 6: User Story 4 - Premium Visual Integration (Priority: P2)

**Goal**: Beautiful floating chat button and slide-in panel harmonizing with existing premium UI

**Independent Test**: Open application and verify emerald chat button appears bottom-right with pulse animation. Click button and verify glassmorphic panel slides in smoothly.

### Chat Button Implementation

- [ ] T043 [P] [US4] Create frontend/components/chatbot/ChatButton.tsx as client component with emerald circular button
- [ ] T044 [US4] Add pulse hover animation to ChatButton with Tailwind CSS classes
- [ ] T045 [US4] Position ChatButton fixed bottom-right with z-index above other content
- [ ] T046 [US4] Add onClick toggle state for opening/closing chat panel

### Chat Panel Implementation

- [ ] T047 [P] [US4] Create frontend/components/chatbot/ChatPanel.tsx with slide-in animation from bottom-right
- [ ] T048 [US4] Add glassmorphic styling to ChatPanel header (backdrop-blur, bg-white/10, border)
- [ ] T049 [US4] Add close button to ChatPanel header with X icon
- [ ] T050 [US4] Create scrollable message container in ChatPanel with auto-scroll to latest message
- [ ] T051 [US4] Add ChatPanel footer with message input and send button areas

### Message Components

- [ ] T052 [P] [US4] Create frontend/components/chatbot/ChatMessage.tsx with conditional styling for user vs assistant
- [ ] T053 [US4] Style user messages as right-aligned indigo solid bubbles with rounded corners
- [ ] T054 [US4] Style assistant messages as left-aligned slate glassmorphic bubbles with backdrop-blur
- [ ] T055 [US4] Add timestamp display to each message bubble (formatted time)
- [ ] T056 [US4] Add fade-in animation to messages on mount (opacity transition)
- [ ] T057 [US4] Integrate react-markdown in ChatMessage for rendering assistant markdown responses

### Chat Input Implementation

- [ ] T058 [P] [US4] Create frontend/components/chatbot/ChatInput.tsx with textarea and send button
- [ ] T059 [US4] Add multiline support to textarea with Enter to send and Shift+Enter for newline
- [ ] T060 [US4] Add send button with SVG icon (paper plane or arrow)
- [ ] T061 [US4] Disable input and send button while message is being processed
- [ ] T062 [US4] Clear textarea after successful send

### Typing Indicator

- [ ] T063 [P] [US4] Create frontend/components/chatbot/TypingIndicator.tsx with 3 animated dots
- [ ] T064 [US4] Add pulse/fade animation to typing dots using CSS keyframes
- [ ] T065 [US4] Display TypingIndicator in message area while waiting for assistant response

### Theme Support

- [ ] T066 [US4] Add dark mode conditional classes to ChatPanel using existing theme context
- [ ] T067 [US4] Add dark mode conditional classes to ChatMessage bubbles
- [ ] T068 [US4] Add dark mode conditional classes to ChatInput
- [ ] T069 [US4] Test theme switching with chat panel open verifying smooth color transitions

### Integration

- [ ] T070 [US4] Add ChatButton to frontend/app/layout.tsx so it appears on all pages
- [ ] T071 [US4] Implement chat state management in ChatPanel (messages array, loading state, conversation_id)
- [ ] T072 [US4] Add sendMessage API call in frontend/lib/api.ts calling POST /api/{user_id}/chat with JWT token
- [ ] T073 [US4] Handle API response in ChatPanel: append user message immediately, show typing indicator, append assistant message on response
- [ ] T074 [US4] Implement auto-scroll to bottom when new messages arrive
- [ ] T075 [US4] Add conversation loading on panel open: fetch conversation history from backend

**Checkpoint**: User Story 4 complete - premium chat UI fully integrated with existing design

---

## Phase 7: User Story 5 - Error Handling and Action Confirmation (Priority: P3)

**Goal**: Clear feedback for failed operations and confirmations for successful actions

**Independent Test**: Attempt to complete non-existent task and verify helpful error message. Add task and verify confirmation message with task name.

### Implementation for User Story 5

- [ ] T076 [P] [US5] Add try-catch error handling to all MCP tools returning structured error dicts with friendly messages
- [ ] T077 [US5] Update complete_task tool to check if task exists before completing, return clear error if not found
- [ ] T078 [US5] Update delete_task tool to check if task exists before deleting, return clear error if not found
- [ ] T079 [US5] Update complete_task tool to check if task is already completed, return informative message if so
- [ ] T080 [US5] Add Cohere system prompt instructions for confirming successful operations (e.g., "I've added [task name]")
- [ ] T081 [US5] Add Cohere system prompt instructions for handling ambiguous input by asking clarification questions
- [ ] T082 [US5] Update frontend ChatPanel error handling to display API errors in a styled error message bubble
- [ ] T083 [US5] Add retry logic in frontend for failed API calls with user-friendly error message "Connection issue, please try again"

**Checkpoint**: User Story 5 complete - robust error handling and confirmations in place

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final refinements affecting multiple user stories

- [ ] T084 [P] Add smooth panel slide-in animation (300ms ease-in-out) in ChatPanel
- [ ] T085 [P] Add mobile responsive styling to ChatPanel (full screen on mobile, panel on desktop)
- [ ] T086 [P] Add keyboard accessibility to ChatButton and chat controls (focus states, Enter/Escape handlers)
- [ ] T087 [P] Add ARIA labels to ChatButton ("Open chat"), ChatInput ("Type message"), send button ("Send message")
- [ ] T088 [P] Add loading state to send button (spinner icon while processing)
- [ ] T089 [P] Optimize conversation history query with LIMIT 100 to prevent performance issues with large histories
- [ ] T090 [P] Add conversation title auto-generation based on first user message (first 50 chars)
- [ ] T091 Update README.md with chatbot feature description, setup instructions for COHERE_API_KEY, and example queries
- [ ] T092 Create IMPLEMENTATION_LOG.md documenting completed phases and architectural decisions
- [ ] T093 Add demo script with example conversation flows showcasing task management capabilities
- [ ] T094 Run full integration test: signup → login → open chat → add task → list tasks → complete task → verify in main UI
- [ ] T095 Verify zero cross-user data leakage: login as two users, ensure each sees only their own conversations and tasks

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3-7)**: All depend on Foundational phase completion
  - US1 and US2 (P1 priority) can proceed in parallel after Foundational
  - US3 depends on US1 completion (needs conversation infrastructure)
  - US4 can start in parallel with US1/US2 (frontend independent of backend logic)
  - US5 depends on US1 completion (enhances US1 error handling)
- **Polish (Phase 8)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational (Phase 2) - No dependencies on other stories (can run parallel with US1)
- **User Story 3 (P2)**: Depends on US1 completion (requires conversation/message infrastructure from US1)
- **User Story 4 (P2)**: Can start after Foundational (Phase 2) - Frontend work independent (can run parallel with US1/US2)
- **User Story 5 (P3)**: Depends on US1 completion (enhances US1 error handling)

### Within Each User Story

- MCP tools can be implemented in parallel (all marked [P])
- Cohere integration must follow MCP tools completion
- Chat endpoint must follow Cohere integration
- Frontend components can be built in parallel with backend
- Integration happens after both backend and frontend complete

### Parallel Opportunities

- **Phase 1 Setup**: All tasks marked [P] can run in parallel (T002, T003, T004)
- **Phase 2 Foundational**: Models (T005, T006) sequential, but directories (T009, T010, T011, T012) parallel
- **US1 MCP Tools**: T013-T017 all parallel (different tools, different functions)
- **US1 Backend + US4 Frontend**: Can run fully in parallel (different codebases)
- **US2 Implementation**: All US2 tasks can overlap with US1 backend work
- **US4 Components**: T043, T047, T052, T058, T063 all parallel (different components)

---

## Parallel Example: User Story 1 + User Story 4

```bash
# Backend team works on US1:
Task: "Implement add_task tool in backend/mcp/tools.py"
Task: "Implement list_tasks tool in backend/mcp/tools.py"
Task: "Implement complete_task tool in backend/mcp/tools.py"

# Frontend team works on US4 simultaneously:
Task: "Create ChatButton.tsx with emerald circular button"
Task: "Create ChatPanel.tsx with slide-in animation"
Task: "Create ChatMessage.tsx with conditional styling"
```

---

## Implementation Strategy

### MVP First (User Story 1 + User Story 2 Only)

1. Complete Phase 1: Setup (T001-T004)
2. Complete Phase 2: Foundational (T005-T012) - CRITICAL blocking phase
3. Complete Phase 3: User Story 1 (T013-T033) - Core chatbot functionality
4. Complete Phase 4: User Story 2 (T034-T036) - User identity
5. **STOP and VALIDATE**: Test natural language task management end-to-end
6. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational (T001-T012) → Foundation ready
2. Add User Story 1 + User Story 2 (T013-T036) → Test independently → Deploy/Demo (MVP with core AI chatbot!)
3. Add User Story 3 (T037-T042) → Test conversation persistence → Deploy/Demo
4. Add User Story 4 (T043-T075) → Test premium UI → Deploy/Demo (visual perfection!)
5. Add User Story 5 (T076-T083) → Test error handling → Deploy/Demo (polish complete!)
6. Phase 8 Polish (T084-T095) → Final validation → Production-ready

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together (T001-T012)
2. Once Foundational is done (after T012):
   - **Backend Developer A**: User Story 1 tasks T013-T033 (MCP tools, Cohere, chat endpoint)
   - **Backend Developer B**: User Story 2 tasks T034-T036 (identity tool) + prep User Story 3
   - **Frontend Developer**: User Story 4 tasks T043-T075 (entire chat UI)
3. Stories integrate and test independently
4. US5 error handling added by any developer after US1 completes

---

## Task Count Summary

- **Phase 1 (Setup)**: 4 tasks
- **Phase 2 (Foundational)**: 8 tasks
- **Phase 3 (US1 - P1)**: 21 tasks
- **Phase 4 (US2 - P1)**: 3 tasks
- **Phase 5 (US3 - P2)**: 6 tasks
- **Phase 6 (US4 - P2)**: 33 tasks
- **Phase 7 (US5 - P3)**: 8 tasks
- **Phase 8 (Polish)**: 12 tasks

**Total**: 95 tasks

**Parallel Opportunities**: 35 tasks marked [P] can run in parallel within their phase

**MVP Scope**: T001-T036 (40 tasks) delivers core AI chatbot with task management and user identity

---

## Notes

- [P] tasks = different files, no dependencies within phase
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests are NOT included (not requested in spec)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
