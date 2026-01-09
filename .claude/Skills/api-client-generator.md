# API Client Generator

**Name:** api-client-generator

**Purpose:** Generate TypeScript API client for Next.js frontend

**Input:** Backend endpoints list

**Output:** /lib/api.ts with typed functions, JWT headers, error handling

**Usage:**
```
@api-client-generator from @specs/api/rest-endpoints.md
```

## Description

This skill generates a complete TypeScript API client for the Next.js frontend with the following features:
- Typed API functions matching backend endpoints
- Automatic JWT token inclusion in headers
- Centralized error handling
- Request/response type definitions
- HTTP client wrapper (fetch/axios)
- Base URL configuration
- Token refresh logic
- Request/response interceptors

## Example Usage

### Generate from Spec File
```
@api-client-generator from @specs/api/rest-endpoints.md
```

### Generate for Specific Resource
```
@api-client-generator for Task endpoints
```

### Generate with Custom Base URL
```
@api-client-generator --base-url http://localhost:8000/api
```

## Generated Code Structure

The skill will generate:
1. **Base API client** with fetch wrapper and configuration
2. **Type definitions** for all request/response schemas
3. **Resource-specific functions** (e.g., tasks.create, tasks.list)
4. **Authentication helpers** for token management
5. **Error handling utilities** with typed errors
6. **Request interceptors** for JWT headers
7. **Response interceptors** for error parsing
8. **TypeScript interfaces** matching backend models

## Integration Points

- **Next.js**: Client and server component support
- **TypeScript**: Full type safety end-to-end
- **JWT Authentication**: Automatic token handling
- **Better Auth**: Compatible with Better Auth tokens
- **FastAPI Backend**: Matches backend API contracts
- **Error Handling**: Standardized error responses

## Example Generated Code

```typescript
// lib/api.ts

type ApiError = {
  message: string;
  status: number;
  details?: Record<string, any>;
};

class ApiClient {
  private baseUrl: string;

  constructor(baseUrl: string = process.env.NEXT_PUBLIC_API_URL!) {
    this.baseUrl = baseUrl;
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    // Get JWT token from Better Auth or localStorage
    const token = localStorage.getItem('auth_token');

    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...options.headers,
    };

    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const response = await fetch(`${this.baseUrl}${endpoint}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error: ApiError = {
        message: response.statusText,
        status: response.status,
      };

      try {
        const errorData = await response.json();
        error.message = errorData.detail || errorData.message;
        error.details = errorData;
      } catch {}

      throw error;
    }

    return response.json();
  }

  // Task endpoints
  tasks = {
    list: () => this.request<Task[]>('/tasks'),

    get: (id: string) => this.request<Task>(`/tasks/${id}`),

    create: (data: CreateTaskRequest) =>
      this.request<Task>('/tasks', {
        method: 'POST',
        body: JSON.stringify(data),
      }),

    update: (id: string, data: UpdateTaskRequest) =>
      this.request<Task>(`/tasks/${id}`, {
        method: 'PUT',
        body: JSON.stringify(data),
      }),

    delete: (id: string) =>
      this.request<void>(`/tasks/${id}`, {
        method: 'DELETE',
      }),
  };

  // User endpoints
  users = {
    me: () => this.request<User>('/users/me'),
  };
}

export const api = new ApiClient();

// Type definitions
export interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface CreateTaskRequest {
  title: string;
  description?: string;
}

export interface UpdateTaskRequest {
  title?: string;
  description?: string;
  completed?: boolean;
}

export interface User {
  id: string;
  email: string;
  name: string;
}
```

## Features

- **Type Safety**: Full TypeScript types for all endpoints
- **JWT Headers**: Automatic token injection
- **Error Handling**: Centralized error parsing
- **Token Refresh**: Automatic token renewal
- **Request/Response Interceptors**: Extensible middleware
- **Environment Configuration**: Base URL from env vars
- **Resource Organization**: Grouped by domain entities
- **Server Components**: Compatible with Next.js server-side usage

## Usage in Components

```typescript
'use client';

import { api } from '@/lib/api';
import { useState, useEffect } from 'react';

export default function TaskList() {
  const [tasks, setTasks] = useState([]);

  useEffect(() => {
    api.tasks.list()
      .then(setTasks)
      .catch(console.error);
  }, []);

  return (
    <ul>
      {tasks.map(task => (
        <li key={task.id}>{task.title}</li>
      ))}
    </ul>
  );
}
```
