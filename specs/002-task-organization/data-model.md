# Data Model: Task Organization Features

**Feature**: Task Organization Features
**Date**: 2025-12-31
**Status**: Complete

## Entity Overview

| Entity | Type | Description |
|--------|------|-------------|
| Task | Extend | Core task with priority and due_date fields |
| Tag | New | User-specific label entity |
| TaskTag | New | Join table for many-to-many relationship |

---

## Task (Extended)

Extends the existing Task model with organization fields.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique task identifier |
| user_id | UUID | FK -> users.id, not null | Owner user ID |
| title | String | 1-200 chars, not null | Task title |
| description | String\|null | max 1000 chars | Optional description |
| completed | Boolean | default: false | Completion status |
| **priority** | **String** | **enum: high/medium/low, default: medium** | **Priority level** |
| **due_date** | **Date\|null** | **ISO 8601 format** | **Optional due date** |
| created_at | DateTime | auto-generated | Creation timestamp |
| updated_at | DateTime | auto-generated | Last update timestamp |

### Relationships

- User (1:N) - Each task belongs to one user
- Tags (N:M) - Tasks can have multiple tags via TaskTag

### Validation Rules

- Title must be 1-200 characters after trimming whitespace
- Description max 1000 characters if provided
- Priority must be one of: high, medium, low (or null for unspecified)
- Due date must be valid ISO 8601 date (YYYY-MM-DD), can be null
- Max 10 tags per task (enforced at application level)

---

## Tag (New)

User-specific label for categorizing tasks.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| id | UUID | PK, auto-generated | Unique tag identifier |
| user_id | UUID | FK -> users.id, not null, indexed | Owner user ID |
| name | String | 1-50 chars, not null | Tag name (case-insensitive) |
| color | String\|null | hex format (#XXXXXX) | Optional display color |
| created_at | DateTime | auto-generated | Creation timestamp |

### Relationships

- User (1:N) - Each tag belongs to one user
- Tasks (N:M) - Tags can be applied to many tasks via TaskTag

### Validation Rules

- Tag name must be 1-50 characters after trimming
- Tag name is case-insensitive for uniqueness per user
- Color must be valid 7-character hex code if provided
- Maximum 100 tags per user (soft limit)

### Indexes

- Unique index on (user_id, LOWER(name)) for case-insensitive uniqueness

---

## TaskTag (New)

Join table for many-to-many relationship between Task and Tag.

### Fields

| Field | Type | Constraints | Description |
|-------|------|-------------|-------------|
| task_id | UUID | FK -> tasks.id, PK part | Associated task |
| tag_id | UUID | FK -> tags.id, PK part | Associated tag |
| created_at | DateTime | auto-generated | Timestamp |

### Constraints

- Composite primary key (task_id, tag_id)
- Foreign keys with cascade delete
- No duplicate (task_id, tag_id) pairs

### Relationships

- Task (N:1) - Each join record links to one task
- Tag (N:1) - Each join record links to one tag

---

## Schema Diagram

```
User
├── 1:N Task
│       ├── N:M Tag (via TaskTag)
│       │       └── 1:N User (each tag belongs to one user)
│       └── has priority (enum)
│       └── has due_date (optional)
└── 1:N Tag
        └── N:M Task (via TaskTag)
```

---

## Migration Considerations

### New Tables

1. `tags` - User-specific tag labels
2. `task_tags` - Join table for task-tag relationships

### Schema Changes to Existing Tables

1. `tasks` table - Add columns:
   - `priority VARCHAR(10) DEFAULT 'medium'`
   - `due_date DATE NULL`

### Migration Order

1. Add priority and due_date columns to tasks table (nullable)
2. Create tags table
3. Create task_tags table
4. Add indexes for filtering/sorting performance

### Backward Compatibility

- Priority column defaults to 'medium' - existing tasks get default priority
- Due date column is nullable - no default value
- API responses extend to include new fields (backward-compatible addition)
