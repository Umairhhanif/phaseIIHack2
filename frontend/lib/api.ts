/**
 * Typed API client for Todo App backend.
 *
 * All functions inject JWT token from localStorage and handle errors.
 */

import type {
  APIError,
  AuthResponse,
  CreateTaskRequest,
  SigninRequest,
  SignupRequest,
  Task,
  TaskListResponse,
  TaskFilters,
  TaskSort,
  UpdateTaskRequest,
  User,
  Tag,
  TagDetail,
  CreateTagRequest,
  UpdateTagRequest,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

/**********************************************************************
 * Helper Functions
 **********************************************************************/

/**
 * Get JWT token from localStorage.
 */
function getAuthToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem("auth_token");
}

/**
 * Set JWT token in cookie (and localStorage for API calls).
 */
export function setAuthToken(token: string): void {
  if (typeof window !== "undefined") {
    localStorage.setItem("auth_token", token);
    // Set cookie for middleware to read (expires in 7 days)
    document.cookie = `auth_token=${token}; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
  }
}

/**
 * Clear JWT token from localStorage and cookie.
 */
export function clearAuthToken(): void {
  if (typeof window !== "undefined") {
    localStorage.removeItem("auth_token");
    // Clear cookie by setting expired date
    document.cookie = "auth_token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT";
  }
}

/**
 * Build query string from filters and sort options.
 */
function buildQueryString(params: Record<string, any>): string {
  const searchParams = new URLSearchParams();

  for (const [key, value] of Object.entries(params)) {
    if (value === undefined || value === null || value === "") continue;

    if (Array.isArray(value)) {
      for (const v of value) {
        searchParams.append(key, String(v));
      }
    } else {
      searchParams.set(key, String(value));
    }
  }

  return searchParams.toString();
}

/**
 * Base fetch wrapper with JWT injection and error handling.
 */
async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const token = getAuthToken();

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }

  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      // Try to parse error response
      let errorMessage = "API request failed";
      let errorDetails: any = null;

      try {
        const contentType = response.headers.get("content-type");
        if (contentType && contentType.includes("application/json")) {
          const errorData = await response.json();

          // Handle different error response formats
          if (errorData?.error?.message) {
            // Standard APIError format
            errorMessage = errorData.error.message;
            errorDetails = errorData.error.details;
          } else if (errorData?.detail) {
            // FastAPI validation error format (raw detail)
            if (Array.isArray(errorData.detail)) {
              errorMessage = errorData.detail.map((e: any) => e.msg).join(", ");
            } else {
              errorMessage = errorData.detail;
            }
          } else if (errorData?.message) {
            // Alternative format
            errorMessage = errorData.message;
          } else if (typeof errorData === "string") {
            errorMessage = errorData;
          }
        } else {
          // Non-JSON response
          const text = await response.text();
          errorMessage = text || `HTTP ${response.status}: ${response.statusText}`;
        }
      } catch (parseError) {
        // Failed to parse error response
        errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      }

      // Attach details for debugging in development
      const error = new Error(errorMessage);
      (error as any).details = errorDetails;
      (error as any).statusCode = response.status;
      throw error;
    }

    // Handle 204 No Content
    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  } catch (error) {
    // Handle network errors
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network request failed. Please check your connection.");
  }
}

/**********************************************************************
 * Authentication API
 **********************************************************************/
export const authAPI = {
  async signup(data: SignupRequest): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/auth/signup", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async signin(data: SigninRequest): Promise<AuthResponse> {
    return apiFetch<AuthResponse>("/auth/signin", {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async me(): Promise<User> {
    return apiFetch<User>("/auth/me");
  },
};

/**********************************************************************
 * Tasks API (Extended with Filter/Sort/Search)
 **********************************************************************/
export const tasksAPI = {
  /**
   * List tasks with optional filtering, searching, and sorting.
   */
  async list(
    userId: string,
    filters?: TaskFilters,
    sort?: TaskSort,
    limit = 50,
    offset = 0
  ): Promise<TaskListResponse> {
    const params: Record<string, any> = {
      limit,
      offset,
    };

    if (filters) {
      if (filters.search) params.search = filters.search;
      if (filters.status && filters.status !== "all") params.status = filters.status;
      if (filters.priority && filters.priority !== "all") params.priority = filters.priority;
      if (filters.tag_ids && filters.tag_ids.length > 0) {
        params.tag_id = filters.tag_ids;
      }
    }

    if (sort) params.sort = sort;

    const queryString = buildQueryString(params);
    const endpoint = `/api/${userId}/tasks${queryString ? `?${queryString}` : ""}`;

    return apiFetch<TaskListResponse>(endpoint);
  },

  async get(userId: string, taskId: string): Promise<Task> {
    return apiFetch<Task>(`/api/${userId}/tasks/${taskId}`);
  },

  async create(userId: string, data: CreateTaskRequest): Promise<Task> {
    return apiFetch<Task>(`/api/${userId}/tasks`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(
    userId: string,
    taskId: string,
    data: UpdateTaskRequest
  ): Promise<Task> {
    return apiFetch<Task>(`/api/${userId}/tasks/${taskId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async updatePriority(userId: string, taskId: string, priority: string): Promise<Task> {
    return apiFetch<Task>(`/api/${userId}/tasks/${taskId}/priority`, {
      method: "PATCH",
      body: JSON.stringify({ priority }),
    });
  },

  async updateDueDate(userId: string, taskId: string, dueDate: string | null): Promise<Task> {
    return apiFetch<Task>(`/api/${userId}/tasks/${taskId}/due-date`, {
      method: "PATCH",
      body: JSON.stringify({ due_date: dueDate }),
    });
  },

  async toggle(userId: string, taskId: string): Promise<Task> {
    return apiFetch<Task>(`/api/${userId}/tasks/${taskId}/toggle`, {
      method: "PATCH",
    });
  },

  async delete(userId: string, taskId: string): Promise<void> {
    return apiFetch<void>(`/api/${userId}/tasks/${taskId}`, {
      method: "DELETE",
    });
  },
};

/**********************************************************************
 * Tags API
 **********************************************************************/
export const tagsAPI = {
  /**
   * List all tags for a user.
   */
  async list(
    userId: string,
    options?: { withCounts?: boolean; search?: string }
  ): Promise<TagDetail[]> {
    const params: Record<string, any> = {};
    if (options?.withCounts) params.with_counts = "true";
    if (options?.search) params.q = options.search;

    const queryString = buildQueryString(params);
    const endpoint = `/api/${userId}/tags${queryString ? `?${queryString}` : ""}`;

    const response = await apiFetch<{ tags: TagDetail[] }>(endpoint);
    return response.tags;
  },

  async get(userId: string, tagId: string): Promise<Tag> {
    return apiFetch<Tag>(`/api/${userId}/tags/${tagId}`);
  },

  async create(userId: string, data: CreateTagRequest): Promise<Tag> {
    return apiFetch<Tag>(`/api/${userId}/tags`, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  async update(userId: string, tagId: string, data: UpdateTagRequest): Promise<Tag> {
    return apiFetch<Tag>(`/api/${userId}/tags/${tagId}`, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  async delete(userId: string, tagId: string): Promise<void> {
    return apiFetch<void>(`/api/${userId}/tags/${tagId}`, {
      method: "DELETE",
    });
  },

  /**
   * Add a tag to a task.
   */
  async addTagToTask(userId: string, tagId: string, taskId: string): Promise<void> {
    return apiFetch<void>(`/api/${userId}/tags/${tagId}/tasks/${taskId}`, {
      method: "POST",
    });
  },

  /**
   * Remove a tag from a task.
   */
  async removeTagFromTask(userId: string, tagId: string, taskId: string): Promise<void> {
    return apiFetch<void>(`/api/${userId}/tags/${tagId}/tasks/${taskId}`, {
      method: "DELETE",
    });
  },
};
