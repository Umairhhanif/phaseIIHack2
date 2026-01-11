# Skill: Configure ChatKit

## Purpose
Setup OpenAI ChatKit integration in Next.js for the Todo AI Chatbot frontend.

## Instructions

When this skill is invoked, implement ChatKit configuration in the Next.js application:

### 1. Add Domain Allowlist Key to Env
- Add OpenAI API key to `.env.local`:
  ```
  OPENAI_API_KEY=sk-...
  OPENAI_DOMAIN_ALLOWLIST=yourdomain.com
  ```
- Or configure domain allowlist via environment variables
- Add to Next.js `env.mjs` or `.env` for type safety
- Ensure keys are not committed to git (add to `.gitignore`)

### 2. Build Chat UI Component
Create a chat component with these features:
- **Message Display:**
  - User messages (right-aligned, distinctive style)
  - Assistant messages (left-aligned)
  - Tool call indicators (visual badges/icons)
  - Timestamps

- **Input Area:**
  - Text input with send button
  - Auto-resize textarea for long messages
  - Loading spinner during message processing
  - Disable input while awaiting response

- **Conversation Features:**
  - Scroll to latest message
  - Typing indicator
  - Error display for failed requests
  - Responsive design (mobile-friendly)

### 3. POST to /api/chat Endpoint with conversation_id
- Implement chat message submission:
  ```javascript
  async function sendMessage(message, conversationId) {
    const response = await fetch('/api/chat', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message,
        conversation_id: conversationId
      })
    });
    return response.json();
  }
  ```
- Handle new conversations (generate or receive ID)
- Pass `conversation_id` from existing conversation state
- Update local state with response

### 4. Display History, Tool Calls Visually
- **History Display:**
  - Load previous messages on component mount
  - Show conversation flow chronologically
  - Group messages by role
  - Infinite scroll or pagination for long conversations

- **Tool Call Visualization:**
  - Show tool call in-progress state
  - Display tool name being executed
  - Show tool output/results
  - Use distinctive styling (e.g., code blocks, badges)
  - Expand/collapse tool details

### 5. Integrate Better Auth Session
- Get authenticated user session:
  ```javascript
  import { auth } from "@/lib/auth";

  // Server component
  const session = await auth();
  const userId = session?.user?.id;
  ```
- Pass `user_id` implicitly via authentication cookie
- Validate session before allowing chat access
- Redirect to login if not authenticated
- Use session to track conversation ownership

## Component Structure

```
ChatKit/
├── ChatContainer.tsx       # Main chat component
├── MessageList.tsx         # Message history display
├── MessageBubble.tsx       # Individual message UI
├── ToolCallDisplay.tsx     # Tool call visualization
├── ChatInput.tsx           # Input area with send button
└── ChatProvider.tsx        # Context for chat state
```

## API Route Pattern

```typescript
// app/api/chat/route.ts
export async function POST(request: Request) {
  const session = await auth();
  const { message, conversation_id } = await request.json();

  // Forward to backend FastAPI endpoint
  const response = await fetch(`${process.env.API_URL}/api/${session.user.id}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.user.id}` // or JWT token
    },
    body: JSON.stringify({ message, conversation_id })
  });

  return response.json();
}
```

## Technical Notes

- Use Next.js 13+ App Router and Server Components
- Store conversation ID in URL or state management
- Handle network errors gracefully
- Support streaming responses (optional)
- Use React 18+ with Suspense for loading states
- Integrate with Better Auth for seamless authentication
- Consider using React Query or SWR for data fetching
