# Skill: Handle Errors & Confirmations

## Purpose
Implement graceful error handling and user confirmation patterns in both backend and frontend for the Todo AI Chatbot.

## Instructions

When this skill is invoked, implement error handling and confirmation logic:

### 1. Backend Error Handling

#### Tool Not Found → "Task not found, try again"
```python
# Example error handling pattern
try:
    result = await delete_task(task_id=task_id, user_id=user_id)
    if not result:
        return {
            "success": False,
            "message": "Task not found, try again",
            "error": "TASK_NOT_FOUND"
        }
except Exception as e:
    logger.error(f"Error deleting task: {e}")
    return {
        "success": False,
        "message": "Something went wrong. Please try again.",
        "error": "INTERNAL_ERROR"
    }
```

#### Common Error Scenarios:
- **Task not found:** "Task not found, try again"
- **Conversation not found:** "Conversation not found. Starting a new one."
- **Invalid user_id:** "Authentication error. Please log in again."
- **Tool execution failed:** "I couldn't complete that action. Please try again."
- **Rate limit exceeded:** "Too many requests. Please wait a moment."
- **Database connection error:** "Connection issue. Please try again."

#### Error Response Format:
```python
{
    "success": False,
    "message": "User-friendly error message",
    "error": "ERROR_CODE",
    "details": {}  # Optional debug info (dev only)
}
```

#### Success Response Format:
```python
{
    "success": True,
    "message": "Task added!",
    "data": {...}
}
```

### 2. Always Confirm Actions in Response

#### Action Confirmations:
- **Add task:** "Task added!"
- **Complete task:** "Task marked as completed!"
- **Delete task:** "Task deleted!"
- **Update task:** "Task updated!"
- **List tasks:** "Here are your tasks:" (followed by list)

#### Implementation Pattern:
```python
async def handle_add_task(user_message: str, user_id: str):
    # Parse task from message
    task = parse_task(user_message)

    # Execute tool
    result = await add_task(**task, user_id=user_id)

    # Return confirmation
    return {
        "success": True,
        "message": f"Task added: {task['title']}",
        "data": {
            "task_id": result.id,
            "title": result.title
        }
    }
```

#### Agent Response Guidelines:
```python
system_message = """
Always confirm actions with a friendly message:
- After creating: "I've added that task for you!"
- After completing: "Great! Task completed."
- After deleting: "Task removed from your list."
- After listing: "Here are your tasks:"

Never return raw data only. Always provide context and confirmation.
"""
```

### 3. Frontend Error Handling

#### Show Error Toasts
```typescript
// Use a toast library like react-hot-toast, sonner, or next-toast
import toast from 'react-hot-toast';

// Error toast
toast.error('Task not found, try again');

// Success toast
toast.success('Task added!');

// Loading toast
toast.loading('Processing...', { id: 'upload' });
```

#### Toast Component Pattern:
```tsx
// components/Toast.tsx
import { toast } from 'sonner';

export function showToast(message: string, type: 'success' | 'error' | 'info') {
  toast[type](message, {
    duration: 3000,
    position: 'top-right',
  });
}

// Usage
showToast('Task added!', 'success');
showToast('Something went wrong', 'error');
```

#### Loading Indicators
```tsx
// Chat input loading state
{isSending ? (
  <LoadingSpinner />
) : (
  <SendButton onClick={handleSend} />
)}

// Message loading state
{isLoading ? (
  <MessageBubble>
    <LoadingDots />
  </MessageBubble>
) : (
  <MessageBubble content={message} />
)}

// Global page loading
{isInitialLoading && <PageLoader />}
```

#### Loading Components:
```tsx
// components/LoadingSpinner.tsx
export function LoadingSpinner() {
  return (
    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600" />
  );
}

// components/LoadingDots.tsx
export function LoadingDots() {
  return (
    <div className="flex space-x-1">
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
      <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
    </div>
  );
}
```

#### Error Boundary
```tsx
// components/ErrorBoundary.tsx
'use client';

import { Component, ReactNode } from 'react';

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
}

export class ErrorBoundary extends Component<Props, { hasError: boolean }> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="p-4 bg-red-50 text-red-600 rounded-lg">
          Something went wrong. Please refresh the page.
        </div>
      );
    }

    return this.props.children;
  }
}
```

#### API Error Handling in Frontend
```typescript
// lib/api.ts
export async function sendMessage(message: string, conversationId: string) {
  try {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message, conversation_id: conversationId })
    });

    const data = await response.json();

    if (!response.ok || !data.success) {
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    const message = error instanceof Error ? error.message : 'An error occurred';
    toast.error(message);
    throw error;
  }
}

// Usage in component
const handleSend = async () => {
  setIsSending(true);

  try {
    const response = await sendMessage(inputValue, conversationId);
    setMessages(prev => [...prev, response.data]);
    toast.success(response.message);
  } catch (error) {
    // Error already handled in api.ts
    console.error('Failed to send message:', error);
  } finally {
    setIsSending(false);
  }
};
```

## Response Patterns

### Success Patterns:
| Action | Backend Message | Frontend Toast |
|--------|-----------------|----------------|
| Add task | "Task added!" | ✅ Task added! |
| Complete | "Task completed!" | ✅ Task completed! |
| Delete | "Task deleted!" | ✅ Task deleted! |
| Update | "Task updated!" | ✅ Task updated! |
| List | "Here are your tasks:" | (No toast) |

### Error Patterns:
| Error | Backend Message | Frontend Toast |
|-------|-----------------|----------------|
| Not found | "Task not found, try again" | ❌ Task not found, try again |
| Unauthorized | "Please log in again" | ❌ Please log in again |
| Network | "Connection issue" | ❌ Connection issue. Try again |
| Rate limit | "Too many requests" | ⚠️ Too many requests. Wait a moment |

## State Management

```tsx
// useChat.ts
export function useChat(conversationId: string) {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sendMessage = async (content: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await api.sendMessage(content, conversationId);

      if (response.success) {
        setMessages(prev => [...prev, response.data]);
        toast.success(response.message);
      } else {
        setError(response.message);
        toast.error(response.message);
      }
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Unknown error';
      setError(message);
      toast.error(message);
    } finally {
      setIsLoading(false);
    }
  };

  return { messages, sendMessage, isLoading, error };
}
```

## Technical Notes

### Backend:
- Use structured error codes for client handling
- Log errors with context for debugging
- Never expose stack traces in production
- Return HTTP status codes: 200 (success), 400 (client error), 500 (server error)

### Frontend:
- Use optimistic UI updates where appropriate
- Show loading states during async operations
- Provide clear error messages with recovery options
- Use toast notifications for transient feedback
- Use inline errors for form validation
- Implement retry logic for transient failures

### Libraries:
- Toasts: `react-hot-toast`, `sonner`, `next-toast`
- Error Boundary: React built-in or `react-error-boundary`
- Loading States: CSS animations or `react-spinners`
