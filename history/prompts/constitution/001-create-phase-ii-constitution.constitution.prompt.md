---
id: 001
title: Create Phase II Constitution
stage: constitution
date: 2025-12-29
surface: agent
model: claude-sonnet-4-5
feature: none
branch: master
user: umair
command: /sp.constitution
labels: ["constitution", "phase-ii", "initialization", "governance"]
links:
  spec: null
  ticket: null
  adr: null
  pr: null
files:
 - .specify/memory/constitution.md
tests:
 - none
---

## Prompt

## Project Identity

**Name:** Todo App - Phase II Full-Stack Web Application
**Version:** 2.0.0
**Phase:** Phase II - Multi-user Web Application with Authentication
**Architecture:** Monorepo Full-Stack (Next.js + FastAPI)

---

## Core Principles

### 1. Spec-Driven Development (SDD)
- No code without specification
- Every feature maps to a spec file in /specs
- Specifications are versioned and reviewed before implementation
- Use SpecKit Plus workflow: Specify → Plan → Tasks → Implement

### 2. Security First
- JWT authentication on all API endpoints
- User data isolation (users only access their own tasks)
- Validate JWT token matches user_id in URL
- Store secrets in environment variables (BETTER_AUTH_SECRET, DATABASE_URL)
- HTTPS in production, secure cookies

### 3. Clean Architecture
- Clear separation: Frontend (/frontend) and Backend (/backend)
- No business logic in UI components
- API contracts defined before implementation
- Database models as single source of truth

### 4. Code Quality
- TypeScript strict mode in frontend
- Type hints in Python backend
- No any types or untyped variables
- Meaningful variable names (no single letters except loops)
- Functions under 50 lines

### 5. Performance
- Server components by default in Next.js
- Database queries filtered by user_id with indexes
- Connection pooling for Neon PostgreSQL
- Lazy loading for heavy components

---

## Technology Stack (Non-Negotiable)

### Frontend
- **Framework:** Next.js 16+ (App Router only)
- **Language:** TypeScript (strict mode)
- **Styling:** Tailwind CSS (no inline styles)
- **Authentication:** Better Auth with JWT plugin
- **API Client:** Custom /lib/api.ts with typed functions

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

---

## Architecture Constraints

### API Design
- RESTful endpoints under /api/{user_id}/*
- All requests require Authorization: Bearer <token>
- Responses in JSON format
- HTTP status codes: 200 (success), 201 (created), 400 (validation), 401 (unauthorized), 403 (forbidden), 404 (not found), 500 (server error)

### Database Rules
- All user data tables must have user_id foreign key
- Indexes on: user_id, status fields, created_at
- Use SQLModel for all database operations
- No raw SQL queries
- Migrations tracked and versioned

### Authentication Flow
- Better Auth handles signup/signin in frontend
- JWT tokens issued on successful authentication
- Backend validates JWT on every request
- Token expiry: 7 days
- Refresh tokens not required for Phase II

---

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
├── AGENTS.md
├── CLAUDE.md
├── sp.constitution (this file)
└── docker-compose.yml
```

---

## Development Workflow

1. **Read Specs:** Start with @specs/features/*.md
2. **Design Database:** Create SQLModel schemas in @specs/database/schema.md
3. **Build Backend:** Implement API endpoints following @specs/api/rest-endpoints.md
4. **Add Auth:** Integrate Better Auth + JWT verification
5. **Build Frontend:** Create Next.js pages and components from @specs/ui/
6. **Validate:** Use APIContractValidator to ensure alignment

---

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

---

## Code Patterns (Required)

### Frontend (Next.js)
```typescript
// Server Component (default)
export default async function TasksPage() {
  const tasks = await api.getTasks();
  return ;
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

---

## Anti-Patterns (Forbidden)

❌ **DO NOT:**
- Write code before specification exists
- Use `any` type in TypeScript
- Store passwords in plain text
- Skip JWT validation on API routes
- Use inline styles instead of Tailwind
- Make direct database calls from frontend
- Hardcode URLs or secrets
- Create god classes/functions over 100 lines
- Mix business logic with UI components
- Ignore user_id in database queries

---

## Performance Targets

- API response time: < 200ms (p95)
- Page load time: < 2s (FCP)
- Database query time: < 50ms
- Frontend bundle size: < 500KB (initial load)

---

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

---

## Documentation Requirements

- Every API endpoint documented in @specs/api/rest-endpoints.md
- Database schema documented in @specs/database/schema.md
- UI components documented in @specs/ui/components.md
- Setup instructions in README.md
- CLAUDE.md files in frontend/ and backend/ for agent guidance

---

## Version Control

- Commit message format: `type(scope): message`
- Types: feat, fix, docs, refactor, test, chore
- Example: `feat(backend): add JWT authentication middleware`

---

## Deployment Constraints

- Frontend: Vercel
- Backend: Any platform supporting FastAPI (Railway, Render, Fly.io)
- Database: Neon Serverless PostgreSQL
- Environment variables managed securely
- CORS configured for production domains

---

## Review Checklist

Before any PR/commit:
- [ ] Spec file exists and is up to date
- [ ] TypeScript/Python types are complete
- [ ] JWT authentication is enforced
- [ ] User isolation is implemented
- [ ] Error handling is comprehensive
- [ ] Tests are passing
- [ ] CLAUDE.md is updated if patterns change
- [ ] No secrets in code

---

**Last Updated:** December 29, 2025
**Maintained By:** FullStackArchitect Agent
**Review Cycle:** After each phase completion

## Response snapshot

Successfully created Todo App Phase II Constitution v1.0.0 with comprehensive governance framework.

**Constitution Overview:**
- **Version:** 1.0.0 (initial ratification)
- **Ratified:** 2025-12-29
- **Principles:** 5 core principles (SDD, Security First, Clean Architecture, Code Quality, Performance)

**Key Sections Created:**
1. Project Identity - Defined as Phase II Full-Stack Web App with Next.js + FastAPI
2. Core Principles - 5 non-negotiable principles with detailed MUST/MUST NOT rules
3. Technology Stack - Locked to Next.js 16+, FastAPI, SQLModel, Neon PostgreSQL
4. Architecture Constraints - API design, database rules, auth flow
5. Folder Structure - Enforced monorepo structure
6. Development Workflow - Spec-driven 6-step process
7. Testing Requirements - Backend and frontend test categories
8. Code Patterns - Required patterns for Next.js and FastAPI
9. Anti-Patterns - Explicitly forbidden practices
10. Performance Targets - Measurable thresholds
11. Error Handling Standards - Standardized error codes and patterns
12. Documentation Requirements - Required docs per layer
13. Version Control - Conventional commits format
14. Deployment Constraints - Platform specifications
15. Review Checklist - 8-point pre-commit checklist
16. Governance - Amendment process and compliance enforcement

**Template Consistency Check:**
- ✅ plan-template.md - Constitution Check section already exists
- ✅ spec-template.md - Aligns with user scenarios and requirements approach
- ✅ tasks-template.md - Compatible with phase-based execution model
- ⚠️ Commands and CLAUDE.md - May need minor reviews for Phase II specifics

**Impact:**
- All placeholders filled with concrete Phase II values
- No bracketed tokens remaining
- Comprehensive security and performance standards established
- Clear governance and amendment process defined
- Foundation ready for spec-driven development workflow

## Outcome

- ✅ Impact: Constitution v1.0.0 ratified - establishes governance framework for Todo App Phase II development
- 🧪 Tests: Template consistency validated across plan, spec, and tasks templates
- 📁 Files: Created .specify/memory/constitution.md (395 lines)
- 🔁 Next prompts: Begin feature specification with /sp.specify, setup monorepo structure, create initial specs in /specs directory
- 🧠 Reflection: Constitution provides clear architectural boundaries and quality standards. The 5 core principles (SDD, Security, Clean Architecture, Code Quality, Performance) align with Phase II multi-user requirements. Anti-patterns section prevents common security pitfalls. Performance targets are measurable and realistic for serverless deployment.

## Evaluation notes (flywheel)

- Failure modes observed: None - initial constitution creation successful
- Graders run and results (PASS/FAIL): Template consistency check PASS, placeholder resolution PASS, governance structure PASS
- Prompt variant (if applicable): Standard sp.constitution command with comprehensive Phase II requirements
- Next experiment (smallest change to try): Monitor constitution compliance during first feature implementation to identify gaps or overly restrictive rules
