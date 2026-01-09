/**
 * TypeScript type definitions for Todo App Phase II.
 *
 * Maps to backend SQLModel schemas and API response formats.
 */

/**
 * User account information.
 *
 * Corresponds to backend User model (models.py).
 * Note: password_hash is never included in API responses.
 */
export interface User {
  id: string; // UUID as string
  email: string;
  name: string;
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}

/**
 * Task priority levels.
 */
export type Priority = "HIGH" | "MEDIUM" | "LOW";

/**
 * Tag for categorizing tasks.
 *
 * Corresponds to backend Tag model (models.py).
 */
export interface Tag {
  id: string; // UUID as string
  user_id: string; // UUID as string
  name: string; // 1-50 characters
  color: string | null; // Hex color code (#XXXXXX)
  created_at: string; // ISO 8601 datetime
}

/**
 * Tag with task count for list views.
 */
export interface TagDetail extends Tag {
  task_count?: number; // Number of tasks with this tag
}

/**
 * Simplified tag info for task responses.
 */
export interface TagSummary {
  id: string;
  name: string;
  color: string | null;
}

/**
 * Task/todo item with organization features.
 *
 * Corresponds to backend Task model (models.py).
 * Extended with priority, due_date, and tags for organization features.
 */
export interface Task {
  id: string; // UUID as string
  user_id: string; // UUID as string
  title: string; // 1-200 characters
  description: string | null; // Optional, max 1000 characters
  completed: boolean;
  priority: Priority | null; // Task priority level
  due_date: string | null; // ISO 8601 date (YYYY-MM-DD)
  tags: TagSummary[]; // Associated tags
  created_at: string; // ISO 8601 datetime
  updated_at: string; // ISO 8601 datetime
}

/**
 * Paginated task list response.
 */
export interface TaskListResponse {
  tasks: Task[];
  total: number; // Total matching tasks
  limit: number;
  offset: number;
}

/**
 * API error response format per contracts/error-responses.md.
 */
export interface APIError {
  error: {
    code: string;
    message: string;
    details?: Record<string, any>;
  };
}

/**
 * Authentication request payloads.
 */
export interface SignupRequest {
  email: string;
  password: string;
  name: string;
}

export interface SigninRequest {
  email: string;
  password: string;
}

/**
 * Authentication response with JWT token.
 */
export interface AuthResponse {
  token: string;
  user: User;
}

/**
 * Task creation/update payloads with organization features.
 */
export interface CreateTaskRequest {
  title: string;
  description?: string | null;
  priority?: Priority | null;
  due_date?: string | null; // YYYY-MM-DD
  tag_ids?: string[]; // Max 10 tag IDs
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string | null;
  priority?: Priority | null;
  due_date?: string | null; // YYYY-MM-DD or null to clear
  tag_ids?: string[] | null; // null keeps existing, [] clears all
}

/**
 * Tag CRUD request payloads.
 */
export interface CreateTagRequest {
  name: string; // 1-50 characters
  color?: string | null; // Hex color code
}

export interface UpdateTagRequest {
  name?: string; // 1-50 characters
  color?: string | null; // Hex color code or null to remove
}

/**
 * Task filter options.
 */
export interface TaskFilters {
  search?: string;
  status?: "all" | "pending" | "completed";
  priority?: Priority | "all";
  tag_ids?: string[];
}

/**
 * Task sort options.
 */
export type TaskSort =
  | "created_desc"
  | "created_asc"
  | "due_date_asc"
  | "due_date_desc"
  | "priority"
  | "priority_reverse"
  | "alpha"
  | "alpha_reverse";
