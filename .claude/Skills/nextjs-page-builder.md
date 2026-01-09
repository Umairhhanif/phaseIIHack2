# Next.js Page Builder

**Name:** nextjs-page-builder

**Purpose:** Generate Next.js App Router pages with TypeScript

**Input:** Page spec (route, components, data fetching)

**Output:** Server/Client components, layouts, API integration via /lib/api.ts

**Usage:**
```
@nextjs-page-builder create /tasks page with task list
```

## Description

This skill generates complete Next.js App Router pages with the following features:
- App Router file structure (page.tsx, layout.tsx)
- Server Components for data fetching
- Client Components for interactivity
- TypeScript type safety throughout
- API integration via `/lib/api.ts`
- Responsive layouts and styling
- Loading and error states
- Authentication integration

## Example Usage

### Basic Page Creation
```
@nextjs-page-builder create /dashboard page
```

### Page with Data Fetching
```
@nextjs-page-builder create /tasks page with task list
```

### Nested Route with Layout
```
@nextjs-page-builder create /profile/settings page with layout
```

### Protected Page
```
@nextjs-page-builder create /admin page --auth required
```

## Generated Code Structure

The skill will generate:
1. **Page component** (`page.tsx`) with proper App Router structure
2. **Layout component** (`layout.tsx`) if needed
3. **Server Components** for data fetching and SEO
4. **Client Components** for interactive elements
5. **API integration** using `/lib/api.ts` helper functions
6. **TypeScript types** for props and data structures
7. **Loading states** (`loading.tsx`) for async operations
8. **Error boundaries** (`error.tsx`) for error handling
9. **Metadata** for SEO optimization

## Integration Points

- **Next.js App Router**: File-based routing with app directory
- **Server Components**: Async data fetching on server
- **Client Components**: Interactive UI with 'use client'
- **API Integration**: Centralized API calls via `/lib/api.ts`
- **TypeScript**: Full type safety and IntelliSense
- **Authentication**: JWT token handling and protected routes
- **Styling**: Tailwind CSS or CSS Modules support
- **State Management**: React hooks and context patterns

## File Structure Example

For a `/tasks` page, the skill generates:
```
app/
  tasks/
    page.tsx          # Main page component (Server Component)
    loading.tsx       # Loading skeleton
    error.tsx         # Error boundary
    components/
      TaskList.tsx    # Client component for task list
      TaskItem.tsx    # Client component for individual tasks
```

## Features

- **Data Fetching**: Server-side data fetching with proper caching
- **API Routes Integration**: Seamless connection to FastAPI backend
- **Error Handling**: Graceful error states and user feedback
- **Loading States**: Skeleton loaders and suspense boundaries
- **Authentication**: Protected routes with JWT verification
- **Responsive Design**: Mobile-first responsive layouts
- **Type Safety**: End-to-end TypeScript types from API to UI
