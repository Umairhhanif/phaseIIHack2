# Implementation Plan: Task Organization Features

**Branch**: `002-task-organization` | **Date**: 2025-12-31 | **Spec**: [spec.md](spec.md)
**Input**: Feature specification from `/specs/002-task-organization/spec.md`

## Summary

Extend the Todo App with organization features: priority levels (high/medium/low), tags/categories, keyword search, filtering by status/priority/tag, and sorting by due date/priority/title. The feature adds 16 functional requirements across 5 user stories, extending the existing Task model and adding a new Tag entity with many-to-many relationship.

## Technical Context

**Language/Version**: Python 3.13+ (FastAPI), TypeScript 5.x (Next.js 16+)
**Primary Dependencies**: FastAPI, SQLModel, Pydantic v2, Next.js, Tailwind CSS
**Storage**: Neon Serverless PostgreSQL with SQLModel ORM
**Testing**: pytest (backend), Jest/React Testing Library (frontend)
**Target Platform**: Web browser (responsive desktop/mobile)
**Project Type**: Full-stack web application (monorepo)
**Performance Goals**: Search results < 500ms, filter/sort < 200ms, API response < 200ms p95
**Constraints**: User isolation required, JWT authentication on all endpoints, max 10 tags per task
**Scale/Scope**: Individual user task management (10-500 tasks per user typical)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| Spec-Driven Development | PASS | Feature spec exists with 16 FRs, 5 user stories |
| Security First | PASS | User isolation via user_id, JWT on all endpoints |
| Clean Architecture | PASS | Frontend/backend separation maintained |
| Code Quality | PASS | TypeScript strict mode, Python type hints |
| Performance | PASS | Targets defined in success criteria |

## Project Structure

### Documentation (this feature)

```text
specs/002-task-organization/
├── plan.md              # This file (/sp.plan command output)
├── research.md          # Phase 0 output (research findings)
├── data-model.md        # Phase 1 output (entity definitions)
├── quickstart.md        # Phase 1 output (dev guide)
├── contracts/           # Phase 1 output (API schemas)
│   ├── task-organization-endpoints.md
│   └── tag-management-endpoints.md
└── tasks.md             # Phase 2 output (/sp.tasks command - NOT created by /sp.plan)
```

### Source Code (repository root)

```text
backend/
├── models.py            # EXTEND: Task, Tag, TaskTag models
├── routes/
│   ├── tasks.py         # EXTEND: Add filter/sort params to list endpoint
│   └── tags.py          # NEW: Tag CRUD endpoints
└── tests/
    ├── unit/
    │   ├── test_models.py
    │   └── test_tags.py
    └── integration/
        └── test_task_organization.py

frontend/
├── lib/
│   ├── types.ts         # EXTEND: Add Priority, Tag, TaskWithOrg
│   └── api.ts           # EXTEND: Add tag and filter APIs
├── components/
│   ├── TaskList.tsx     # EXTEND: Add priority/tag display
│   ├── TaskItem.tsx     # EXTEND: Add priority selector, tag badges
│   ├── TaskForm.tsx     # EXTEND: Add priority dropdown, tag input
│   ├── FilterBar.tsx    # NEW: Filter controls
│   └── SortDropdown.tsx # NEW: Sort selector
└── app/
    └── tasks/
        └── page.tsx     # EXTEND: Integrate filter/sort UI
```

**Structure Decision**: Follow existing monorepo structure with clear frontend/backend separation. Extend existing files rather than creating new modules where possible.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | N/A | N/A |

---

# Phase 0: Research & Findings

## Decision: Tag Storage Approach

**Decision**: Use a separate Tag table with many-to-many relationship via TaskTag join table.

**Rationale**:
- Tags are user-specific and should be queryable independently
- Join table enables efficient filtering (SQL IN/JOIN queries)
- Allows tag renaming across all tasks (if needed later)
- Scalable: supports many tags per task and many tasks per tag

**Alternatives considered**:
1. JSON array in Task table: Simpler but makes filtering inefficient (no index support)
2. Comma-separated string: No validation, hard to query, no metadata

## Decision: Search Implementation

**Decision**: Case-insensitive LIKE query on title and description fields.

**Rationale**:
- PostgreSQL supports ILIKE for case-insensitive matching
- With 10-500 tasks per user, full scan is acceptable (< 10ms)
- No external search engine needed (Elasticsearch overkill)
- Index on title could improve performance for common searches

**Alternatives considered**:
1. Full-text search (tsvector): Overkill for small datasets, adds complexity
2. External search service: Additional infrastructure, latency

## Decision: Filter/Sort Architecture

**Decision**: Backend handles filtering/sorting via query parameters on list endpoint.

**Rationale**:
- Consistent with existing list endpoint design
- Backend has full query optimization (indexes, pagination)
- Reduces client-side complexity
- Enables pagination of filtered results

**Alternatives considered**:
1. Client-side filtering: Faster for small datasets, but doesn't scale
2. Separate filter endpoints: Additional API calls, state sync complexity

---

# Phase 1: Design Artifacts

## Data Model

See [data-model.md](data-model.md) for detailed entity definitions.

## API Contracts

See [contracts/task-organization-endpoints.md](contracts/task-organization-endpoints.md) for endpoint specifications.

See [contracts/tag-management-endpoints.md](contracts/tag-management-endpoints.md) for tag CRUD operations.

## Quickstart Guide

See [quickstart.md](quickstart.md) for development setup instructions.

## Agent Context Update

Run: `powershell -ExecutionPolicy Bypass -File ".specify/scripts/powershell/update-agent-context.ps1" -AgentType claude`

---

## Re-check: Constitution Post-Design

| Principle | Status | Notes |
|-----------|--------|-------|
| Spec-Driven Development | PASS | All FRs mapped to endpoints/models |
| Security First | PASS | user_id filtering on all queries, JWT required |
| Clean Architecture | PASS | Business logic in backend, UI in components |
| Code Quality | PASS | TypeScript strict, Python type hints |
| Performance | PASS | Targets: search <500ms, filter/sort <200ms |
