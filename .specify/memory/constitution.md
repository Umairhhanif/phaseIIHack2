<!--
# Constitution Sync Impact Report

## Version Change
- **Previous**: Not versioned (initial creation)
- **New**: 1.0.0
- **Bump Type**: MAJOR (initial ratification)
- **Rationale**: First constitution for Todo App Phase II project

## Principles Modified
- NEW: 5 core principles established (Spec-Driven Development, Security First, Clean Architecture, Code Quality, Performance)

## Sections Added
- Project Identity
- Core Principles (5 principles)
- Technology Stack
- Architecture Constraints
- Folder Structure
- Development Workflow
- Testing Requirements
- Code Patterns
- Anti-Patterns
- Performance Targets
- Error Handling Standards
- Documentation Requirements
- Version Control
- Deployment Constraints
- Review Checklist
- Governance

## Templates Requiring Updates
- ✅ .specify/templates/plan-template.md - Constitution Check section already present
- ✅ .specify/templates/spec-template.md - Aligns with user scenarios and requirements
- ✅ .specify/templates/tasks-template.md - Aligns with phase-based execution
- ⚠️ .specify/templates/commands/*.md - Review needed for Phase II specifics
- ⚠️ CLAUDE.md - Already contains Phase II guidance
- ⚠️ README.md - To be created with project setup instructions

## Follow-up TODOs
- None - all placeholders filled

## Date of Constitution Amendment
2025-12-29
-->

# Todo App - Phase II Constitution

## Project Identity

**Name:** Todo App - Phase II Full-Stack Web Application
**Version:** 2.0.0
**Phase:** Phase II - Multi-user Web Application with Authentication
**Architecture:** Monorepo Full-Stack (Next.js + FastAPI)

## Core Principles

### I. Spec-Driven Development (SDD)

No code without specification. Every feature MUST map to a spec file in `/specs`. Specifications are versioned and reviewed before implementation. The SpecKit Plus workflow MUST be followed: Specify → Plan → Tasks → Implement.

**Rationale:** Specifications prevent scope creep, ensure alignment between stakeholders and implementers, and provide documentation that evolves with the codebase. This principle is non-negotiable because unspecified work leads to inconsistent implementations and maintenance burden.

### II. Security First

**MUST:**
- JWT authentication on all API endpoints
- User data isolation (users only access their own tasks)
- Validate JWT token matches user_id in URL parameters
- Store secrets in environment variables (BETTER_AUTH_SECRET, DATABASE_URL)
- Use HTTPS in production with secure cookies

**MUST NOT:**
- Store passwords in plain text
- Skip JWT validation on API routes
- Allow cross-user data access
- Hardcode secrets in code

**Rationale:** Security is foundational. Multi-user systems require strict access control. JWT validation at every endpoint prevents privilege escalation. Environment-based secrets enable secure deployment across environments.

### III. Clean Architecture

**MUST:**
- Maintain clear separation: Frontend (`/frontend`) and Backend (`/backend`)
- Keep business logic out of UI components
- Define API contracts before implementation
- Use database models as single source of truth

**MUST NOT:**
- Mix business logic with UI components
- Make direct database calls from frontend
- Create god classes/functions over 100 lines
- Bypass API contracts

**Rationale:** Separation of concerns enables parallel development, independent testing, and easier maintenance. API contracts ensure frontend and backend teams can work independently once contracts are defined.

### IV. Code Quality

**MUST:**
- TypeScript strict mode in frontend
- Type hints in all Python backend code
- Meaningful variable names (no single letters except loop counters)
- Functions under 50 lines
- No `any` types or untyped variables

**MUST NOT:**
- Use `any` type in TypeScript
- Skip type annotations in Python
- Create functions exceeding 50 lines without justification
- Use vague variable names

**Rationale:** Type safety catches errors at compile time. Small functions are easier to understand, test, and maintain. Meaningful names reduce cognitive load during code review and maintenance.

### V. Performance

**MUST:**
- Use Server Components by default in Next.js
- Filter all database queries by user_id with indexes
- Use connection pooling for Neon PostgreSQL
- Lazy load heavy components

**Performance Targets:**
- API response time: < 200ms (p95)
- Page load time: < 2s (FCP)
- Database query time: < 50ms
- Frontend bundle size: < 500KB (initial load)

**Rationale:** Performance is a feature. Server Components reduce client-side JavaScript. Indexed queries on user_id ensure multi-tenant performance scales linearly. Connection pooling prevents database connection exhaustion.

## Technology Stack (Non-Negotiable)

### Frontend
- **Framework:** Next.js 16+ (App Router only)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS (no inline styles)
- **Authentication:** Better Auth with JWT plugin
- **API Client:** Custom `/lib/api.ts` with typed functions

### Backend
- **Framework:** FastAPI
- **Language:** Python 3.13+
- **ORM:** SQLModel
- **Database:** Neon Serverless PostgreSQL
- **Authentication:** JWT verification middleware

### Development Tools
- **Package Manager:** UV (Python), npm/pnpm (Node.js)
- **AI Tools:** Claude Code, SpecKit Plus
- **Version Control:** Git with conventional commits

**Rationale:** These technologies are selected for Phase II requirements. Next.js App Router provides modern React patterns. FastAPI offers Python async performance. SQLModel combines Pydantic validation with SQLAlchemy ORM. Neon provides serverless PostgreSQL with automatic scaling.

## Architecture Constraints

### API Design
- RESTful endpoints under `/api/{user_id}/*`
- All requests MUST include `Authorization: Bearer <token>` header
- Responses in JSON format
- HTTP status codes:
  - 200: Success
  - 201: Created
  - 400: Validation error
  - 401: Unauthorized (missing/invalid token)
  - 403: Forbidden (insufficient permissions)
  - 404: Not found
  - 500: Server error

### Database Rules
- All user data tables MUST have `user_id` foreign key
- Indexes MUST be created on: `user_id`, status fields, `created_at`
- Use SQLModel for all database operations (no raw SQL)
- Migrations MUST be tracked and versioned

### Authentication Flow
- Better Auth handles signup/signin in frontend
- JWT tokens issued on successful authentication
- Backend MUST validate JWT on every request
- Token expiry: 7 days
- Refresh tokens not required for Phase II

**Rationale:** Standardized API design enables consistent error handling and client-side caching. User-scoped endpoints prevent accidental data leaks. Indexed foreign keys ensure query performance in multi-tenant scenarios.

## Folder Structure (Enforced)

```
/
├── specs/
│   ├── overview.md
│   ├── features/
│   ├── api/
│   ├── database/
│   └── ui/
├── frontend/
│   ├── app/
│   ├── components/
│   ├── lib/
│   └── CLAUDE.md
├── backend/
│   ├── main.py
│   ├── models.py
│   ├── routes/
│   └── CLAUDE.md
├── .claude/
│   ├── agents/
│   ├── commands/
│   └── Skills/
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

## Development Workflow

1. **Read Specs:** Start with `@specs/features/*.md`
2. **Design Database:** Create SQLModel schemas in `@specs/database/schema.md`
3. **Build Backend:** Implement API endpoints following `@specs/api/rest-endpoints.md`
4. **Add Auth:** Integrate Better Auth + JWT verification
5. **Build Frontend:** Create Next.js pages and components from `@specs/ui/`
6. **Validate:** Use APIContractValidator agent to ensure alignment

**Rationale:** This workflow ensures specification drives implementation, preventing divergence between documentation and code.

## Testing Requirements

### Backend
- Unit tests for each API endpoint
- Test JWT validation
- Test user isolation (users cannot access others' data)
- Test error handling

### Frontend
- Component rendering tests
- API client tests with mock responses
- Auth flow tests (signup, signin, protected routes)

**Rationale:** Testing user isolation prevents security vulnerabilities. API contract tests catch breaking changes early.

## Code Patterns (Required)

### Frontend (Next.js)

```typescript
// Server Component (default)
export default async function TasksPage() {
  const tasks = await api.getTasks();
  return <TaskList tasks={tasks} />;
}

// Client Component (when needed)
'use client';
export function TaskForm() {
  const [title, setTitle] = useState('');
  // ...
}

// API Client Pattern
import { api } from '@/lib/api';
const tasks = await api.getTasks();
```

### Backend (FastAPI)

```python
# Protected Route
@router.get("/api/{user_id}/tasks")
async def get_tasks(
    user_id: str,
    current_user: User = Depends(verify_jwt)
):
    if current_user.id != user_id:
        raise HTTPException(status_code=403)
    return db.query(Task).filter(Task.user_id == user_id).all()

# SQLModel Pattern
class Task(SQLModel, table=True):
    id: int = Field(primary_key=True)
    user_id: str = Field(foreign_key="user.id")
    title: str
    completed: bool = False
```

## Anti-Patterns (Forbidden)

**DO NOT:**
- Write code before specification exists
- Use `any` type in TypeScript
- Store passwords in plain text
- Skip JWT validation on API routes
- Use inline styles instead of Tailwind
- Make direct database calls from frontend
- Hardcode URLs or secrets
- Create god classes/functions over 100 lines
- Mix business logic with UI components
- Ignore `user_id` in database queries

**Rationale:** These patterns lead to security vulnerabilities, maintenance burden, and technical debt. Explicit prohibition prevents these issues from entering the codebase.

## Error Handling Standards

### Backend

```python
# Validation Error
raise HTTPException(status_code=400, detail="Invalid task title")

# Auth Error
raise HTTPException(status_code=401, detail="Invalid or expired token")

# Permission Error
raise HTTPException(status_code=403, detail="Cannot access other user's tasks")

# Not Found
raise HTTPException(status_code=404, detail="Task not found")
```

### Frontend

```typescript
try {
  await api.createTask(data);
} catch (error) {
  if (error.status === 401) {
    // Redirect to login
  } else {
    // Show error message
  }
}
```

## Documentation Requirements

- Every API endpoint documented in `@specs/api/rest-endpoints.md`
- Database schema documented in `@specs/database/schema.md`
- UI components documented in `@specs/ui/components.md`
- Setup instructions in `README.md`
- `CLAUDE.md` files in `frontend/` and `backend/` for agent guidance

## Version Control

**Commit Message Format:** `type(scope): message`

**Types:**
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation only
- `refactor`: Code change that neither fixes a bug nor adds a feature
- `test`: Adding or updating tests
- `chore`: Changes to build process or auxiliary tools

**Example:** `feat(backend): add JWT authentication middleware`

## Deployment Constraints

- **Frontend:** Vercel
- **Backend:** Any platform supporting FastAPI (Railway, Render, Fly.io)
- **Database:** Neon Serverless PostgreSQL
- Environment variables managed securely
- CORS configured for production domains

## Review Checklist

Before any PR/commit:
- [ ] Spec file exists and is up to date
- [ ] TypeScript/Python types are complete
- [ ] JWT authentication is enforced
- [ ] User isolation is implemented
- [ ] Error handling is comprehensive
- [ ] Tests are passing
- [ ] `CLAUDE.md` is updated if patterns change
- [ ] No secrets in code

## Governance

This constitution supersedes all other practices and conventions. Amendments require:
1. Documentation of proposed changes
2. Impact assessment on existing code and templates
3. Approval from project maintainers
4. Migration plan for affected code

All PRs and code reviews MUST verify compliance with these principles. Complexity must be justified against simpler alternatives. Use `CLAUDE.md` in each directory for runtime development guidance specific to that module.

**Version Semantics:**
- **MAJOR**: Backward incompatible governance/principle removals or redefinitions
- **MINOR**: New principle/section added or materially expanded guidance
- **PATCH**: Clarifications, wording, typo fixes, non-semantic refinements

---

**Version**: 1.0.0 | **Ratified**: 2025-12-29 | **Last Amended**: 2025-12-29
