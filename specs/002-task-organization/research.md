# Research: Task Organization Features

**Feature**: Task Organization Features
**Date**: 2025-12-31
**Status**: Complete

## Key Decisions

### 1. Tag Storage Approach

**Decision**: Use a separate Tag table with many-to-many relationship via TaskTag join table.

**Rationale**:
- Tags are user-specific and should be queryable independently
- Join table enables efficient filtering (SQL IN/JOIN queries)
- Allows tag renaming across all tasks (if needed later)
- Scalable: supports many tags per task and many tasks per tag
- Follows database normalization principles

**Alternatives considered**:
1. JSON array in Task table: Simpler but makes filtering inefficient (no index support)
2. Comma-separated string: No validation, hard to query, no metadata

### 2. Search Implementation

**Decision**: Case-insensitive LIKE query on title and description fields.

**Rationale**:
- PostgreSQL supports ILIKE for case-insensitive matching
- With 10-500 tasks per user, full scan is acceptable (< 10ms)
- No external search engine needed (Elasticsearch overkill)
- Index on title could improve performance for common searches

**Alternatives considered**:
1. Full-text search (tsvector): Overkill for small datasets, adds complexity
2. External search service: Additional infrastructure, latency

### 3. Filter/Sort Architecture

**Decision**: Backend handles filtering/sorting via query parameters on list endpoint.

**Rationale**:
- Consistent with existing list endpoint design
- Backend has full query optimization (indexes, pagination)
- Reduces client-side complexity
- Enables pagination of filtered results

**Alternatives considered**:
1. Client-side filtering: Faster for small datasets, but doesn't scale
2. Separate filter endpoints: Additional API calls, state sync complexity

### 4. Priority Enum Values

**Decision**: Use "high", "medium", " lowercase string enum with default "medium".

**Rationale**:
- Simple string comparison for sorting
- Easy to localize for i18n
- Defaults align with user expectations
- Three levels provide sufficient granularity without overwhelming

**Alternatives considered**:
1. Integer priority (1-5): More granular but adds cognitive load
2. Custom colors: Overcomplicates, visual design should be separate

## Database Considerations

### Index Strategy

| Field | Index Type | Reason |
|-------|------------|--------|
| Task.user_id | B-tree | Foreign key, always filtered |
| Task.completed | B-tree | Filtered frequently |
| Task.priority | B-tree | Filtered and sorted |
| Task.due_date | B-tree | Sorted, nullable handling |
| Task.created_at | B-tree | Default sort, filtered |
| Tag.user_id | B-tree | Foreign key, user-specific queries |
| TaskTag.task_id | B-tree | Join table, filtered when removing tags |
| TaskTag.tag_id | B-tree | Join table, filtered by tag |

### Performance with Large Datasets

For users with 1000+ tasks:
- Search: ILIKE on indexed title + sequential scan on description
- Filter: B-tree indexes reduce scan to matching subset
- Sort: In-memory sort after filtering (PostgreSQL handles efficiently)

Estimated query times (500 tasks):
- Unfiltered list: ~15ms
- Filtered (1 condition): ~5ms
- Filtered (3 conditions): ~8ms
- Search with results: ~20ms
- Combined filter + search: ~25ms

## Frontend Implementation

### Component Structure

```
components/
├── FilterBar.tsx      # Filter controls (status, priority, tags)
├── SortDropdown.tsx   # Sort selector
├── TaskItem.tsx       # Extended with priority badge, tag badges
├── TaskForm.tsx       # Extended with priority dropdown, tag input
└── TagInput.tsx       # NEW: Autocomplete tag input component
```

### State Management

- Filter state: URL query params for shareability
- Local component state for immediate UI feedback
- Debounced search input (300ms) to reduce API calls

## API Design Patterns

### List Endpoint Extension

```python
GET /api/{user_id}/tasks
    ?search=keyword           # Optional: case-insensitive search
    &status=all|pending|completed  # Optional: filter by completion
    &priority=all|high|medium|low  # Optional: filter by priority
    &tag_id=uuid              # Optional: filter by tag (can repeat)
    &sort=created_desc|created_asc|due_date_asc|due_date_desc|priority|alpha
    &limit=50                 # Pagination
    &offset=0                 # Pagination
```

### Tag Autocomplete

```python
GET /api/{user_id}/tags?q=work
    # Returns tags matching prefix, limited to 10 results
```

## Testing Strategy

### Backend Tests

1. Unit tests for each filter/sort combination
2. Integration tests for search + filter + sort combinations
3. Performance tests: Verify < 200ms for typical queries
4. Edge case tests: empty results, max tags, special characters

### Frontend Tests

1. Component rendering with priority/tag props
2. Filter state transitions
3. Search debouncing behavior
4. Error states (no results, API errors)
