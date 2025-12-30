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
  UpdateTaskRequest,
  User,
} from "./types";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";

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

    return response.json();
  } catch (error) {
    // Handle network errors
    if (error instanceof Error) {
      throw error;
    }
    throw new Error("Network request failed. Please check your connection.");
  }
}

/**
 * Authentication API
 */
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

/**
 * Tasks API
 */
export const tasksAPI = {
  async list(userId: string): Promise<Task[]> {
    return apiFetch<Task[]>(`/api/${userId}/tasks`);
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
