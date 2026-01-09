# Tasks: Task Organization Features

**Input**: Design documents from `/specs/002-task-organization/`
**Prerequisites**: plan.md (required), spec.md (required), data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Database migration and foundational data model changes that all user stories depend on

**⚠️ CRITICAL**: This phase MUST be complete before any user story implementation begins

- [X] T001 Create Alembic migration for task priority and due_date columns in backend/migrations/versions/
- [X] T002 Create Alembic migration for tags and task_tags tables in backend/migrations/versions/
- [ ] T003 Run database migrations to apply schema changes `backend/migrations/versions/`

**Checkpoint**: Database schema ready - user story implementation can now begin

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core data models and Pydantic schemas that all user stories require

**⚠️ CRITICAL**: All tasks below MUST complete before user story phases begin

### Backend Models and Schemas

- [X] T004 [P] Add Priority enum and extend Task model in backend/models.py
- [X] T005 [P] Create Tag model in backend/models.py
- [X] T006 [P] Create TaskTag join model in backend/models.py
- [X] T007 [P] Update TaskResponse Pydantic schema to include priority, due_date, tags in backend/routes/tasks.py
- [X] T008 [P] Create CreateTaskRequest extension with priority, due_date, tag_ids in backend/routes/tasks.py
- [X] T009 [P] Create UpdateTaskRequest extension with priority, due_date, tag_ids in backend/routes/tasks.py
- [X] T010 [P] Create Tag Pydantic schemas (TagCreate, TagUpdate, TagResponse) in backend/routes/tags.py

### Frontend Types

- [X] T011 [P] Add Priority type and extend Task interface in frontend/lib/types.ts
- [X] T012 [P] Add Tag interface in frontend/lib/types.ts
- [X] T013 [P] Update TaskListResponse and related types in frontend/lib/types.ts

**Checkpoint**: All foundational work complete - user stories can proceed in parallel

---

## Phase 3: User Story 1 - Assign Priority to Tasks (Priority: P1) 🎯 MVP

**Goal**: Users can assign high/medium/low priority to tasks during creation and editing

**Independent Test**: Create a task with priority, verify it saves and displays correctly in the task list. Edit priority and verify update.

### Backend Implementation

- [ ] T014 [P] [US1] Add priority field to list_tasks query params in backend/routes/tasks.py
- [ ] T015 [P] [US1] Add filter logic for priority in list_tasks query in backend/routes/tasks.py
- [ ] T016 [P] [US1] Add sort logic for priority in list_tasks query in backend/routes/tasks.py
- [ ] T017 [US1] Implement PATCH /api/{user_id}/tasks/{task_id}/priority endpoint in backend/routes/tasks.py
- [ ] T018 [US1] Update task_to_dict to include priority field in backend/routes/tasks.py
- [ ] T019 [US1] Update create_task to accept priority in request body in backend/routes/tasks.py
- [ ] T020 [US1] Update update_task to accept priority in request body in backend/routes/tasks.py

### Frontend Implementation

- [ ] T021 [P] [US1] Add priority selector dropdown component in frontend/components/PrioritySelect.tsx (NEW)
- [ ] T022 [US1] Update TaskItem.tsx to display priority badge with color coding
- [ ] T023 [US1] Update TaskForm.tsx to include priority selector
- [ ] T024 [US1] Update TaskList.tsx to show priority indicators in list view

**Checkpoint**: User Story 1 complete - Priority assignment fully functional

---

## Phase 4: User Story 2 - Add Tags and Categories to Tasks (Priority: P1)

**Goal**: Users can create, view, and assign tags to tasks for categorization

**Independent Test**: Create tags, assign them to tasks, view task list showing tag badges. Edit tags on task.

### Backend Implementation (Tag Management)

- [ ] T025 [P] [US2] Implement GET /api/{user_id}/tags endpoint in backend/routes/tags.py
- [ ] T026 [P] [US2] Implement POST /api/{user_id}/tags endpoint in backend/routes/tags.py
- [ ] T027 [P] [US2] Implement GET /api/{user_id}/tags/{tag_id} endpoint in backend/routes/tags.py
- [ ] T028 [P] [US2] Implement PUT /api/{user_id}/tags/{tag_id} endpoint in backend/routes/tags.py
- [ ] T029 [P] [US2] Implement DELETE /api/{user_id}/tags/{tag_id} endpoint in backend/routes/tags.py
- [ ] T030 [P] [US2] Implement GET /api/{user_id}/tags?q= autocomplete endpoint in backend/routes/tags.py
- [ ] T031 [P] [US2] Implement POST /api/{user_id}/tags/{tag_id}/tasks/{task_id} endpoint in backend/routes/tags.py
- [ ] T032 [P] [US2] Implement DELETE /api/{user_id}/tags/{tag_id}/tasks/{task_id} endpoint in backend/routes/tags.py

### Backend Implementation (Task-Tag Integration)

- [ ] T033 [US2] Update list_tasks to include tags in response in backend/routes/tasks.py
- [ ] T034 [US2] Update create_task to accept and save tag_ids in backend/routes/tasks.py
- [ ] T035 [US2] Update update_task to accept and modify tag_ids in backend/routes/tasks.py

### Frontend Implementation

- [ ] T036 [P] [US2] Add tagsAPI object with CRUD methods in frontend/lib/api.ts
- [ ] T037 [P] [US2] Create TagBadge component for displaying tags in frontend/components/TagBadge.tsx (NEW)
- [ ] T038 [P] [US2] Create TagInput component with autocomplete in frontend/components/TagInput.tsx (NEW)
- [ ] T039 [US2] Update TaskItem.tsx to display tag badges
- [ ] T040 [US2] Update TaskForm.tsx to include tag input component
- [ ] T041 [US2] Create TagManager component for tag CRUD UI in frontend/components/TagManager.tsx (NEW)

**Checkpoint**: User Story 2 complete - Tags fully functional

---

## Phase 5: User Story 3 - Search Tasks by Keyword (Priority: P1)

**Goal**: Users can search tasks by keyword in title and description with real-time results

**Independent Test**: Create tasks with various titles/descriptions, search for keywords, verify matching tasks appear.

### Backend Implementation

- [ ] T042 [P] [US3] Add search query parameter to list_tasks in backend/routes/tasks.py
- [ ] T043 [US3] Implement ILIKE search on title and description in list_tasks query in backend/routes/tasks.py

### Frontend Implementation

- [ ] T044 [P] [US3] Create SearchBar component with debounced input in frontend/components/SearchBar.tsx (NEW)
- [ ] T045 [US3] Update TaskList.tsx to integrate search functionality
- [ ] T046 [US3] Add "no results" empty state component in frontend/components/NoResults.tsx (NEW)

**Checkpoint**: User Story 3 complete - Search fully functional

---

## Phase 6: User Story 4 - Filter Tasks (Priority: P2)

**Goal**: Users can filter tasks by status, priority, and tags with AND logic between filters

**Independent Test**: Create tasks with various attributes, apply different filter combinations, verify only matching tasks display.

### Backend Implementation

- [ ] T047 [P] [US4] Add status filter to list_tasks query params in backend/routes/tasks.py
- [ ] T048 [P] [US4] Add tag_id filter array to list_tasks query params in backend/routes/tasks.py
- [ ] T049 [US4] Implement multi-filter AND logic in list_tasks query in backend/routes/tasks.py

### Frontend Implementation

- [ ] T050 [P] [US4] Create FilterBar component with status dropdown, priority checkboxes in frontend/components/FilterBar.tsx (NEW)
- [ ] T051 [P] [US4] Create TagFilter component for multi-select tag filtering in frontend/components/TagFilter.tsx (NEW)
- [ ] T052 [US4] Integrate FilterBar into TaskList.tsx

**Checkpoint**: User Story 4 complete - Filtering fully functional

---

## Phase 7: User Story 5 - Sort Tasks (Priority: P2)

**Goal**: Users can sort tasks by due date, priority, creation date, and alphabetically

**Independent Test**: Create tasks with various attributes, apply different sort options, verify tasks appear in correct order.

### Backend Implementation

- [ ] T053 [P] [US5] Add due_date column to tasks table if not exists (per spec)
- [ ] T054 [P] [US5] Add sort parameter to list_tasks query params in backend/routes/tasks.py
- [ ] T055 [US5] Implement sort logic (due_date, priority, alpha, created_at) in list_tasks query in backend/routes/tasks.py

### Frontend Implementation

- [ ] T056 [P] [US5] Create SortDropdown component in frontend/components/SortDropdown.tsx (NEW)
- [ ] T057 [US5] Integrate SortDropdown into TaskList.tsx

**Checkpoint**: User Story 5 complete - Sorting fully functional

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T058 [P] Add comprehensive error handling for priority/tag validation in backend/routes/tasks.py
- [ ] T059 [P] Add error handling for tag limits (max 10 per task) in backend/routes/tags.py
- [ ] T060 Update frontend/app/tasks/page.tsx to integrate FilterBar, SortDropdown, SearchBar
- [ ] T061 [P] Add loading states for filter/sort/search operations in frontend/components/
- [ ] T062 Add keyboard navigation support for filter/sort controls in frontend/components/
- [ ] T063 Optimize list_tasks query with proper indexes (per data-model.md)

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends On | Description |
|-------|------------|-------------|
| Phase 1: Setup | None | Database migrations |
| Phase 2: Foundational | Phase 1 | Models and schemas - BLOCKS all user stories |
| Phase 3: US1 (Priority) | Phase 2 | Core priority feature - MVP |
| Phase 4: US2 (Tags) | Phase 2 | Tag management |
| Phase 5: US3 (Search) | Phase 2 | Search functionality |
| Phase 6: US4 (Filter) | Phase 2 | Filtering functionality |
| Phase 7: US5 (Sort) | Phase 2 | Sorting functionality |
| Phase 8: Polish | All stories | Cross-cutting improvements |

### User Story Dependencies

| Story | Priority | Dependencies | Can Start After |
|-------|----------|--------------|-----------------|
| US1: Priority | P1 | Phase 2 | Immediately after Phase 2 |
| US2: Tags | P1 | Phase 2 | Immediately after Phase 2 |
| US3: Search | P1 | Phase 2 | Immediately after Phase 2 |
| US4: Filter | P2 | Phase 2 | Immediately after Phase 2 |
| US5: Sort | P2 | Phase 2 | Immediately after Phase 2 |

### Within Each User Story

- Models before services
- Services before endpoints
- Core implementation before UI integration
- Story complete before polish phase

---

## Parallel Execution Opportunities

### Phase 2 (Foundational) - 10 tasks, all can run in parallel:
```bash
# All these can execute simultaneously:
- T004: Add Priority enum to Task model
- T005: Create Tag model
- T006: Create TaskTag model
- T007: Update TaskResponse schema
- T008: Create CreateTaskRequest extension
- T009: Create UpdateTaskRequest extension
- T010: Create Tag Pydantic schemas
- T011: Add Priority type in frontend
- T012: Add Tag interface in frontend
- T013: Update TaskListResponse types
```

### Phase 3-7 (User Stories) - All stories can run in parallel:
```bash
# Multiple developers can work simultaneously:
Developer A: US1 (Priority) - T014-T024
Developer B: US2 (Tags) - T025-T041
Developer C: US3 (Search) - T042-T046
Developer D: US4 (Filter) - T047-T052
Developer E: US5 (Sort) - T053-T057
```

### Within Each Story:
```bash
# Tasks marked [P] can run in parallel:
- T014 [P] [US1] Add priority filter param
- T015 [P] [US1] Add priority sort logic
- T016 [P] [US1] Add priority filter logic
```

---

## Implementation Strategy

### MVP First (Priority Only)

1. Complete Phase 1: Setup (migrations)
2. Complete Phase 2: Foundational (models/schemas)
3. Complete Phase 3: User Story 1 (Priority)
4. **STOP and VALIDATE**: Test priority feature independently
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Phase 1 + Phase 2 → Foundation ready
2. Add US1 → Test → Deploy/Demo (Priority feature!)
3. Add US2 → Test → Deploy/Demo (Tags feature!)
4. Add US3 → Test → Deploy/Demo (Search feature!)
5. Add US4 → Test → Deploy/Demo (Filter feature!)
6. Add US5 → Test → Deploy/Demo (Sort feature!)
7. Add Phase 8 → Polish

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 + Phase 2 together
2. Once Phase 2 is done:
   - Developer A: User Story 1 (Priority)
   - Developer B: User Story 2 (Tags)
   - Developer C: User Story 3 + 4 + 5 (Search/Filter/Sort)
3. Stories complete and integrate independently

---

## Task Summary

| Phase | Story | Task Count | Description |
|-------|-------|------------|-------------|
| Phase 1 | Setup | 3 | Database migrations |
| Phase 2 | Foundational | 10 | Models, schemas, types |
| Phase 3 | US1: Priority | 11 | Priority assignment |
| Phase 4 | US2: Tags | 17 | Tag management and assignment |
| Phase 5 | US3: Search | 5 | Keyword search |
| Phase 6 | US4: Filter | 6 | Status/priority/tag filtering |
| Phase 7 | US5: Sort | 5 | Sort by due date/priority/alpha |
| Phase 8 | Polish | 6 | Cross-cutting improvements |
| **Total** | | **63** | |

### MVP Scope (User Story 1 only)

- Phases 1, 2, 3 only
- **19 tasks** for priority-only MVP
- Deliverable: Users can assign and view task priorities

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Run migrations before any model changes (`alembic upgrade head`)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Frontend components marked (NEW) are entirely new files
