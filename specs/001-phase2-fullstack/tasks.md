---
description: "Task list for Todo App - Phase II Full-Stack Web Application"
---

# Tasks: Todo App - Phase II Full-Stack Web Application

**Input**: Design documents from `/specs/001-phase2-fullstack/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**Agent-Based Implementation**: Tasks leverage agents from `.claude/agents/` and skills from `.claude/Skills/` for code generation.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US6)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/` (FastAPI, Python 3.13+)
- **Frontend**: `frontend/` (Next.js 16+, TypeScript)
- **Tests**: `backend/tests/`, `frontend/tests/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and monorepo structure setup

**Agent**: @FullStackArchitect
**Skills**: @monorepo-structure-setup, @env-config-manager

- [X] T001 Create monorepo structure with backend/ and frontend/ directories using @monorepo-structure-setup skill
- [X] T002 Initialize backend Python project with UV and create backend/pyproject.toml with FastAPI, SQLModel, psycopg2-binary, pyjwt, bcrypt, python-dotenv, pydantic[email] dependencies
- [X] T003 [P] Initialize frontend Next.js project with TypeScript in frontend/ directory (npx create-next-app@latest frontend --typescript --tailwind --app --no-src-dir)
- [X] T004 [P] Create backend/.env.example with DATABASE_URL, BETTER_AUTH_SECRET, FRONTEND_URL, HOST, PORT using @env-config-manager skill
- [X] T005 [P] Create frontend/.env.local.example with NEXT_PUBLIC_API_URL, BETTER_AUTH_SECRET, BETTER_AUTH_URL using @env-config-manager skill
- [X] T006 [P] Configure backend linting: create backend/.flake8, backend/.isort.cfg for Python code quality
- [X] T007 [P] Configure frontend TypeScript strict mode: update frontend/tsconfig.json with strict: true and path aliases
- [X] T008 [P] Configure Tailwind CSS: verify frontend/tailwind.config.ts has proper content paths
- [X] T009 Create docker-compose.yml for local Neon PostgreSQL development environment (optional)
- [X] T010 Create root README.md with project overview, quickstart guide reference, and deployment links

**Checkpoint**: ✅ Monorepo structure initialized with both backend and frontend projects configured

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

**Agent**: @DatabaseArchitect, @BackendDeveloper

### Database Foundation

- [X] T011 Create backend/models.py with User and Task SQLModel schemas from data-model.md using @sqlmodel-schema-creator skill (User: id UUID, email unique, password_hash, name, timestamps; Task: id UUID, user_id FK, title, description, completed, timestamps)
- [X] T012 Create backend/database.py with Neon PostgreSQL connection, SQLAlchemy engine (pool_size=10, max_overflow=20, pool_pre_ping=True), and get_session dependency
- [X] T013 Initialize Alembic migrations in backend/migrations/ using @db-migration-creator skill
- [X] T014 Create initial migration for users and tasks tables with indexes (users.email unique, tasks.user_id, tasks.completed, tasks.created_at, composite (user_id, created_at DESC))

### Backend API Foundation

- [X] T015 [P] Create backend/main.py FastAPI application with CORS middleware configured for FRONTEND_URL environment variable
- [X] T016 [P] Create backend/lib/errors.py with standardized HTTPException handlers for 400, 401, 403, 404, 422, 500 errors using @error-handler-generator skill (reference: contracts/error-responses.md)
- [X] T017 [P] Create backend/lib/auth.py with JWT token generation (create_jwt_token) and validation (verify_jwt_token) utilities using PyJWT library and BETTER_AUTH_SECRET
- [X] T018 Create backend/routes/auth.py with verify_jwt FastAPI dependency that extracts and validates JWT from Authorization header, returns authenticated User object

### Frontend Foundation

- [X] T019 [P] Create frontend/lib/types.ts with TypeScript interfaces for User (id, email, name, created_at) and Task (id, user_id, title, description, completed, created_at, updated_at)
- [X] T020 [P] Create frontend/lib/api.ts API client with typed functions and JWT header injection using @api-client-generator skill (base URL from NEXT_PUBLIC_API_URL)
- [X] T021 Create frontend/middleware.ts Next.js middleware for protected route checking (redirect to /signin if no JWT token)
- [X] T022 Create frontend/app/layout.tsx root layout with Better Auth provider placeholder and Tailwind CSS imports

**Checkpoint**: ✅ Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - User Registration and Authentication (Priority: P1) 🎯 MVP

**Goal**: Enable new users to create accounts and securely authenticate with JWT tokens, establishing the foundation for the multi-user system

**Independent Test**: Create an account via signup page, verify JWT token issued, sign in with credentials, verify session persistence, attempt signup with duplicate email (should fail), verify token expiration redirects to signin

**Agent**: @AuthIntegrator, @BackendDeveloper, @FrontendDeveloper
**Skills**: @better-auth-config, @api-endpoint-generator, @nextjs-page-builder, @form-component-builder

### Backend Authentication

- [X] T023 [P] [US1] Implement POST /auth/signup endpoint in backend/routes/users.py using @api-endpoint-generator skill (validate email/password, check uniqueness case-insensitive, hash password with bcrypt cost 12, create user, issue JWT) - Reference: contracts/auth-endpoints.md
- [X] T024 [P] [US1] Implement POST /auth/signin endpoint in backend/routes/users.py using @api-endpoint-generator skill (validate credentials, verify bcrypt password, issue JWT on success) - Reference: contracts/auth-endpoints.md
- [X] T025 [P] [US1] Implement GET /auth/me endpoint in backend/routes/users.py with verify_jwt dependency (return current user profile excluding password_hash) - Reference: contracts/auth-endpoints.md
- [X] T026 [US1] Register auth routes in backend/main.py with /auth prefix

### Frontend Authentication Pages

- [X] T027 [P] [US1] Configure Better Auth in frontend/lib/auth.ts with JWT plugin, email provider, 7-day token expiry using @better-auth-config skill
- [X] T028 [P] [US1] Create frontend/app/signup/page.tsx signup page with email/password form using @nextjs-page-builder and @form-component-builder skills (validate email format, password min 8 chars, call POST /auth/signup, store JWT, redirect to /tasks)
- [X] T029 [P] [US1] Create frontend/app/signin/page.tsx signin page with email/password form using @nextjs-page-builder and @form-component-builder skills (call POST /auth/signin, store JWT, redirect to /tasks)
- [X] T030 [P] [US1] Create frontend/components/SignOutButton.tsx component that clears JWT token and redirects to /signin
- [X] T031 [US1] Create frontend/app/page.tsx landing page that redirects authenticated users to /tasks and unauthenticated users to /signin
- [X] T032 [US1] Update frontend/middleware.ts to check JWT expiration and redirect to /signin with "Session expired" message on expired tokens

**Checkpoint**: ✅ User Story 1 complete - users can signup, signin, view profile, signout, and are redirected on token expiry. This is the MVP foundation.

---

## Phase 4: User Story 2 - Create and View Tasks (Priority: P1) 🎯 MVP

**Goal**: Enable authenticated users to create new tasks with title and description, and view all their personal tasks in a sorted list

**Independent Test**: Sign in, create multiple tasks with various titles/descriptions, verify tasks appear in list sorted newest first, verify empty state shown when no tasks, verify user isolation (cannot see other users' tasks), attempt create with empty title (should fail)

**Agent**: @BackendDeveloper, @FrontendDeveloper
**Skills**: @api-endpoint-generator, @crud-operations-builder, @nextjs-page-builder, @form-component-builder

### Backend Task CRUD (Create & Read)

- [X] T033 [P] [US2] Implement GET /api/{user_id}/tasks endpoint in backend/routes/tasks.py using @crud-operations-builder skill (verify JWT user_id matches path user_id, query tasks filtered by user_id, sort by created_at DESC, return task list) - Reference: contracts/task-endpoints.md
- [X] T034 [P] [US2] Implement POST /api/{user_id}/tasks endpoint in backend/routes/tasks.py using @crud-operations-builder skill (verify JWT user_id matches path user_id, validate title 1-200 chars, trim whitespace, create task with user_id, return created task) - Reference: contracts/task-endpoints.md
- [X] T035 [P] [US2] Implement GET /api/{user_id}/tasks/{task_id} endpoint in backend/routes/tasks.py (verify user_id matches JWT, query task by id and user_id, return 404 if not found) - Reference: contracts/task-endpoints.md
- [X] T036 [US2] Register task routes in backend/main.py with /api prefix

### Frontend Task Management UI

- [X] T037 [P] [US2] Create frontend/app/tasks/page.tsx task list page (Server Component) using @nextjs-page-builder skill (fetch tasks with api.getTasks, pass to TaskList component, show empty state "No tasks yet. Create your first task!" if empty)
- [X] T038 [P] [US2] Create frontend/components/TaskList.tsx component to display task array with TaskItem components
- [X] T039 [P] [US2] Create frontend/components/TaskItem.tsx component to display individual task (title, description, created date, completed indicator)
- [X] T040 [P] [US2] Create frontend/app/tasks/create/page.tsx task creation page using @nextjs-page-builder and @form-component-builder skills (form with title input 1-200 chars, optional description max 1000 chars, call POST /api/{user_id}/tasks, redirect to /tasks on success)
- [X] T041 [US2] Add "Create Task" button/link in frontend/app/tasks/page.tsx that navigates to /tasks/create

**Checkpoint**: ✅ User Story 2 complete - users can create tasks and view their task list sorted newest first. Combined with US1, this forms the complete MVP.

---

## Phase 5: User Story 6 - Protected Routes and Session Management (Priority: P1)

**Goal**: Ensure all task management pages are protected and only authenticated users can access their own data

**Independent Test**: Attempt to access /tasks without authentication (should redirect to /signin), attempt to access /tasks/create without authentication (should redirect to /signin), sign in and verify access granted, sign out and verify access revoked

**Agent**: @FrontendDeveloper

### Frontend Route Protection

- [ ] T042 [P] [US6] Update frontend/middleware.ts to protect /tasks/* routes (check JWT presence, verify not expired, redirect to /signin if missing or expired)
- [ ] T043 [P] [US6] Create frontend/lib/auth-helpers.ts with getAuthToken, setAuthToken, clearAuthToken, isTokenExpired utility functions
- [ ] T044 [US6] Update frontend/app/layout.tsx to include navigation bar with SignOutButton for authenticated users
- [ ] T045 [US6] Add loading state to protected pages while checking authentication status

**Checkpoint**: User Story 6 complete - all routes protected, only authenticated users can access task pages. MVP security complete.

---

## Phase 6: User Story 3 - Mark Tasks Complete/Incomplete (Priority: P2)

**Goal**: Enable users to toggle task completion status to track their progress

**Independent Test**: Sign in, create a task, toggle completion checkbox (task shows strikethrough), refresh page (completion persists), toggle back to incomplete (strikethrough removed), attempt to toggle another user's task via API (should return 403)

**Agent**: @BackendDeveloper, @FrontendDeveloper
**Skills**: @api-endpoint-generator

### Backend Task Toggle

- [X] T046 [P] [US3] Implement PATCH /api/{user_id}/tasks/{task_id}/toggle endpoint in backend/routes/tasks.py using @api-endpoint-generator skill (verify user_id matches JWT, query task, toggle completed boolean, update updated_at, return updated task) - Reference: contracts/task-endpoints.md

### Frontend Task Toggle UI

- [X] T047 [P] [US3] Update frontend/components/TaskItem.tsx to add checkbox input bound to task.completed state
- [X] T048 [US3] Add onClick handler to checkbox that calls PATCH /api/{user_id}/tasks/{task_id}/toggle and updates UI optimistically
- [X] T049 [US3] Add CSS styling to TaskItem: strikethrough text and different color for completed tasks

**Checkpoint**: ✅ User Story 3 complete - users can toggle task completion with visual feedback and persistence

---

## Phase 7: User Story 4 - Update Task Details (Priority: P3)

**Goal**: Enable users to edit task title and description to correct or update task information

**Independent Test**: Sign in, create a task, click edit button, update title and/or description, save changes (reflected immediately in task list), attempt to save with empty title (should fail with validation error), attempt to edit another user's task via API (should return 403)

**Agent**: @BackendDeveloper, @FrontendDeveloper
**Skills**: @api-endpoint-generator, @nextjs-page-builder, @form-component-builder

### Backend Task Update

- [X] T050 [P] [US4] Implement PUT /api/{user_id}/tasks/{task_id} endpoint in backend/routes/tasks.py using @api-endpoint-generator skill (verify user_id matches JWT, validate title if provided, trim whitespace, update task fields, update updated_at, return updated task) - Reference: contracts/task-endpoints.md

### Frontend Task Edit UI

- [X] T051 [P] [US4] Create frontend/app/tasks/[id]/edit/page.tsx task edit page using @nextjs-page-builder and @form-component-builder skills (fetch task by id, pre-populate form with current values, call PUT /api/{user_id}/tasks/{task_id}, redirect to /tasks on success)
- [X] T052 [P] [US4] Update frontend/components/TaskItem.tsx to add "Edit" button/link that navigates to /tasks/{id}/edit
- [X] T053 [US4] Add cancel button in edit page that navigates back to /tasks without saving

**Checkpoint**: ✅ User Story 4 complete - users can edit task title and description with validation

---

## Phase 8: User Story 5 - Delete Tasks (Priority: P3)

**Goal**: Enable users to permanently remove tasks from their list

**Independent Test**: Sign in, create a task, click delete button, confirm deletion (task removed from list and database), click delete then cancel (task remains in list), attempt to delete another user's task via API (should return 403)

**Agent**: @BackendDeveloper, @FrontendDeveloper
**Skills**: @api-endpoint-generator

### Backend Task Delete

- [X] T054 [P] [US5] Implement DELETE /api/{user_id}/tasks/{task_id} endpoint in backend/routes/tasks.py using @api-endpoint-generator skill (verify user_id matches JWT, query task, delete from database, return success message) - Reference: contracts/task-endpoints.md

### Frontend Task Delete UI

- [X] T055 [P] [US5] Update frontend/components/TaskItem.tsx to add "Delete" button with onClick handler
- [X] T056 [US5] Implement delete confirmation dialog (window.confirm or custom modal component) before calling DELETE /api/{user_id}/tasks/{task_id}
- [X] T057 [US5] Remove task from UI optimistically after successful delete API call, handle error rollback if delete fails

**Checkpoint**: ✅ User Story 5 complete - users can delete tasks with confirmation. All user stories now implemented.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements, error handling, performance optimization, and deployment preparation

**Agent**: @FullStackArchitect, @BackendDeveloper, @FrontendDeveloper

### Error Handling & Validation

- [ ] T058 [P] Add comprehensive error handling to all frontend API calls in frontend/lib/api.ts (401 → redirect to signin, 422 → parse Pydantic errors, 403 → show permission error, generic errors → user-friendly messages)
- [ ] T059 [P] Add backend request validation middleware to enforce max request body size and rate limiting (optional)
- [ ] T060 [P] Create frontend error boundary component for graceful error display (frontend/components/ErrorBoundary.tsx)

### Performance Optimization

- [ ] T061 [P] Verify Next.js Server Components used by default in all task pages (frontend/app/tasks/page.tsx should be async Server Component)
- [ ] T062 [P] Add database composite index (user_id, created_at DESC) to tasks table for optimized queries via Alembic migration
- [ ] T063 [P] Configure frontend bundle optimization in frontend/next.config.js (enable SWC minification, remove unused code)

### Security Hardening

- [ ] T064 [P] Add CSRF protection to backend API (validate Origin header matches FRONTEND_URL)
- [ ] T065 [P] Implement backend startup validation: check DATABASE_URL and BETTER_AUTH_SECRET environment variables are set, fail fast if missing
- [ ] T066 [P] Add backend /health endpoint for monitoring and load balancer health checks

### Documentation & Deployment

- [ ] T067 [P] Create backend/CLAUDE.md with backend-specific patterns: SQLModel usage, JWT middleware, error handling, testing commands
- [ ] T068 [P] Create frontend/CLAUDE.md with frontend-specific patterns: Server vs Client Components, API client usage, protected routes, form patterns
- [ ] T069 [P] Update root README.md with production deployment instructions referencing quickstart.md
- [ ] T070 [P] Create deployment checklist: environment variables, database migration, CORS configuration, HTTPS enforcement

### Testing (Optional - only if TDD requested)

> **Note**: These test tasks are placeholders. Only implement if user requests test-driven development approach.

- [ ] T071 [P] Create backend pytest fixtures in backend/tests/conftest.py (test database, auth tokens, test users)
- [ ] T072 [P] Write backend authentication tests in backend/tests/test_auth.py (signup, signin, JWT validation, token expiry)
- [ ] T073 [P] Write backend user isolation tests in backend/tests/test_tasks.py (verify 403 on cross-user access attempts)
- [ ] T074 [P] Write frontend component tests in frontend/tests/components/ using Jest + React Testing Library
- [ ] T075 [P] Write E2E tests in frontend/tests/e2e/ using Playwright (full signup → task CRUD flow)

**Checkpoint**: Application polished, secure, performant, and ready for production deployment

---

## Task Summary

**Total Tasks**: 75 tasks

**Task Count by User Story**:
- Setup (Phase 1): 10 tasks
- Foundational (Phase 2): 12 tasks
- US1 - User Registration and Authentication (P1): 10 tasks
- US2 - Create and View Tasks (P1): 9 tasks
- US6 - Protected Routes (P1): 4 tasks
- US3 - Mark Tasks Complete (P2): 4 tasks
- US4 - Update Task Details (P3): 4 tasks
- US5 - Delete Tasks (P3): 4 tasks
- Polish & Cross-Cutting: 18 tasks

**Parallel Opportunities**: 53 tasks marked [P] can run in parallel within their phase

**MVP Scope** (Phases 1-5):
- Phase 1: Setup (10 tasks)
- Phase 2: Foundational (12 tasks)
- Phase 3: US1 - Authentication (10 tasks)
- Phase 4: US2 - Create/View Tasks (9 tasks)
- Phase 5: US6 - Protected Routes (4 tasks)
- **MVP Total**: 45 tasks

**Post-MVP Enhancements** (Phases 6-9):
- Phase 6: US3 - Toggle Completion (4 tasks)
- Phase 7: US4 - Edit Tasks (4 tasks)
- Phase 8: US5 - Delete Tasks (4 tasks)
- Phase 9: Polish (18 tasks)

---

## Dependencies

### User Story Completion Order

**P1 Stories** (MVP - can work in parallel after foundational):
1. **US1** (Authentication) - No dependencies, MUST complete first
2. **US2** (Create/View Tasks) - Depends on US1 (requires authentication)
3. **US6** (Protected Routes) - Depends on US1 (requires JWT tokens)

**P2 Stories**:
4. **US3** (Toggle Completion) - Depends on US2 (requires tasks to exist)

**P3 Stories**:
5. **US4** (Update Tasks) - Depends on US2 (requires tasks to exist)
6. **US5** (Delete Tasks) - Depends on US2 (requires tasks to exist)

**Dependency Graph**:
```
Setup (Phase 1)
    ↓
Foundational (Phase 2)
    ↓
US1 (Authentication) ←─────┐
    ↓                      │
    ├→ US2 (Create/View) ←─┤─── All depend on US1
    │       ↓              │
    │       ├→ US3 (Toggle)│
    │       ├→ US4 (Edit)  │
    │       └→ US5 (Delete)│
    │                      │
    └→ US6 (Protected) ────┘
         ↓
    Polish (Phase 9)
```

---

## Parallel Execution Examples

### Phase 2: Foundational (12 tasks total, 7 parallelizable)

**Sequential Block 1** (Database - must run in order):
- T011 → T012 → T013 → T014 (database models, connection, migrations)

**Parallel Block 1** (API foundation - can run concurrently):
- T015 [P] (FastAPI app with CORS)
- T016 [P] (Error handlers)
- T017 [P] (JWT utilities)

**Sequential Block 2** (Depends on T017):
- T018 (verify_jwt dependency - needs JWT utilities from T017)

**Parallel Block 2** (Frontend foundation - can run concurrently):
- T019 [P] (TypeScript types)
- T020 [P] (API client)
- T021 [P] (Middleware)
- T022 [P] (Root layout)

**Execution Strategy**: Run T011-T014 sequentially, then run T015-T017 in parallel, then T018, then T019-T022 in parallel.

---

### Phase 3: User Story 1 (10 tasks total, 7 parallelizable)

**Parallel Block 1** (Backend auth endpoints - can run concurrently):
- T023 [P] [US1] (POST /auth/signup)
- T024 [P] [US1] (POST /auth/signin)
- T025 [P] [US1] (GET /auth/me)

**Sequential Block 1** (Depends on T023-T025):
- T026 [US1] (Register routes in main.py)

**Parallel Block 2** (Frontend auth - can run concurrently after T026):
- T027 [P] [US1] (Better Auth config)
- T028 [P] [US1] (Signup page)
- T029 [P] [US1] (Signin page)
- T030 [P] [US1] (SignOut button)

**Sequential Block 2** (Frontend integration - must run in order):
- T031 [US1] → T032 [US1] (Landing page, then middleware update)

**Execution Strategy**: Run T023-T025 in parallel, then T026, then T027-T030 in parallel, then T031, then T032.

---

### Phase 4: User Story 2 (9 tasks total, 6 parallelizable)

**Parallel Block 1** (Backend task endpoints - can run concurrently):
- T033 [P] [US2] (GET /api/{user_id}/tasks)
- T034 [P] [US2] (POST /api/{user_id}/tasks)
- T035 [P] [US2] (GET /api/{user_id}/tasks/{task_id})

**Sequential Block 1** (Depends on T033-T035):
- T036 [US2] (Register task routes)

**Parallel Block 2** (Frontend UI - can run concurrently after T036):
- T037 [P] [US2] (Task list page)
- T038 [P] [US2] (TaskList component)
- T039 [P] [US2] (TaskItem component)
- T040 [P] [US2] (Create task page)

**Sequential Block 2** (UI integration):
- T041 [US2] (Add create button to list page)

**Execution Strategy**: Run T033-T035 in parallel, then T036, then T037-T040 in parallel, then T041.

---

## Implementation Strategy

### MVP First (Phases 1-5: 45 tasks)

**Goal**: Deliver working multi-user todo application with authentication and basic task management

**Deliverables**:
- User signup and signin with JWT authentication
- Create and view personal tasks
- Protected routes ensuring data isolation
- User can sign out

**Value**: Users can immediately start managing their todo lists securely

### Incremental Enhancements (Phases 6-8: 12 tasks)

**Goal**: Add quality-of-life features for task management

**Deliverables**:
- Toggle task completion (P2)
- Edit task details (P3)
- Delete tasks (P3)

**Value**: Users can fully manage task lifecycle beyond just creation

### Production Readiness (Phase 9: 18 tasks)

**Goal**: Harden application for production deployment

**Deliverables**:
- Comprehensive error handling
- Performance optimizations (indexes, bundle size)
- Security hardening (CSRF, validation, health checks)
- Documentation and deployment guides

**Value**: Application ready for real-world usage with proper monitoring and security

---

## Agent and Skill Mappings

### Agent Responsibilities per Phase

**Phase 1 (Setup)**: @FullStackArchitect
- Skills: @monorepo-structure-setup, @env-config-manager

**Phase 2 (Foundational)**: @DatabaseArchitect, @BackendDeveloper
- Skills: @sqlmodel-schema-creator, @db-migration-creator, @error-handler-generator, @api-client-generator

**Phase 3 (US1 - Auth)**: @AuthIntegrator, @BackendDeveloper, @FrontendDeveloper
- Skills: @better-auth-config, @api-endpoint-generator, @nextjs-page-builder, @form-component-builder

**Phase 4 (US2 - Tasks)**: @BackendDeveloper, @FrontendDeveloper
- Skills: @crud-operations-builder, @nextjs-page-builder, @form-component-builder

**Phase 5 (US6 - Protected Routes)**: @FrontendDeveloper
- Skills: (Manual middleware configuration)

**Phases 6-8 (US3-US5)**: @BackendDeveloper, @FrontendDeveloper
- Skills: @api-endpoint-generator, @nextjs-page-builder, @form-component-builder

**Phase 9 (Polish)**: @FullStackArchitect, @APIContractValidator
- Skills: Various for optimization and validation

### Skill Usage by Task Type

**Database Tasks**: @sqlmodel-schema-creator, @db-migration-creator
**Backend Endpoints**: @api-endpoint-generator, @crud-operations-builder
**Authentication**: @better-auth-config, @jwt-auth-middleware (implied in foundational)
**Frontend Pages**: @nextjs-page-builder
**Frontend Forms**: @form-component-builder
**API Client**: @api-client-generator
**Error Handling**: @error-handler-generator
**Environment Config**: @env-config-manager
**Project Structure**: @monorepo-structure-setup

---

**Tasks Status**: ✅ COMPLETE - Ready for implementation
**Last Updated**: 2025-12-29
**Next Step**: Begin Phase 1 (Setup) - Create monorepo structure and initialize projects
