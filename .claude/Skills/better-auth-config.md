# Better Auth Config Generator

**Name:** better-auth-config

**Purpose:** Generate Better Auth configuration with JWT plugin

**Input:** Auth providers, JWT settings

**Output:** auth.ts config file with JWT plugin, signup/signin routes

**Usage:**
```
@better-auth-config with email provider and JWT
```

## Description

This skill generates complete Better Auth configuration with the following features:
- Email/password authentication
- JWT token generation
- Session management
- Database adapter configuration
- Signup and signin routes
- Password hashing
- Token refresh logic
- Social auth providers (optional)

## Example Usage

### Basic Email Auth with JWT
```
@better-auth-config with email provider and JWT
```

### With Social Providers
```
@better-auth-config with email, Google, and GitHub providers
```

### Custom JWT Expiration
```
@better-auth-config with JWT expires 7d
```

## Generated Code Structure

The skill will generate:
1. **auth.ts** - Main Better Auth configuration
2. **JWT plugin** configuration
3. **Database adapter** for PostgreSQL
4. **Email provider** setup
5. **Social providers** (if requested)
6. **Token generation** logic
7. **Session handling**
8. **Environment variable** references

## Integration Points

- **Better Auth**: Authentication library
- **JWT**: JSON Web Token generation
- **PostgreSQL**: User data storage
- **Next.js**: API routes integration
- **FastAPI**: JWT verification on backend
- **Environment Variables**: Secret keys from .env

## Example Generated Configuration

```typescript
// lib/auth.ts or auth.ts

import { betterAuth } from "better-auth";
import { jwt } from "better-auth/plugins";
import Database from "better-sqlite3";

export const auth = betterAuth({
  // Database configuration
  database: {
    provider: "postgres",
    url: process.env.DATABASE_URL!,
  },

  // Email provider for password authentication
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: false, // Set true for production
  },

  // JWT plugin configuration
  plugins: [
    jwt({
      // JWT secret from environment
      secret: process.env.BETTER_AUTH_SECRET!,

      // Token expiration
      expiresIn: "7d", // 7 days

      // Include user ID in token payload
      schema: (user) => ({
        sub: user.id,
        email: user.email,
        name: user.name,
      }),
    }),
  ],

  // Session configuration
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 days in seconds
    updateAge: 60 * 60 * 24, // Update session every 24 hours
  },

  // User model schema
  user: {
    modelName: "User",
    fields: {
      email: "email",
      name: "name",
    },
    additionalFields: {
      // Add custom fields here if needed
    },
  },

  // Social providers (optional)
  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      enabled: true,
    },
    github: {
      clientId: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      enabled: true,
    },
  },

  // Base URL for redirects
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",

  // Advanced options
  advanced: {
    // Use secure cookies in production
    useSecureCookies: process.env.NODE_ENV === "production",

    // Cookie name
    cookiePrefix: "auth",
  },
});

// Export types for TypeScript
export type Auth = typeof auth;
```

## API Route Handler

```typescript
// app/api/auth/[...all]/route.ts

import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const { GET, POST } = toNextJsHandler(auth.handler);
```

## Client Hook

```typescript
// lib/auth-client.ts

import { createAuthClient } from "better-auth/client";

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
});

// Usage in components
export function useAuth() {
  return authClient.useSession();
}
```

## Features

- **Email/Password Auth**: Secure password hashing with bcrypt
- **JWT Tokens**: Stateless authentication
- **Session Management**: Automatic session refresh
- **Social Login**: Google, GitHub, and more
- **Type Safety**: Full TypeScript support
- **Database Integration**: PostgreSQL adapter
- **Secure Cookies**: HTTP-only cookies for tokens
- **Token Refresh**: Automatic token renewal
- **Email Verification**: Optional email confirmation

## Environment Variables Required

```env
# Database
DATABASE_URL=postgresql://user:pass@localhost:5432/db

# Better Auth
BETTER_AUTH_SECRET=your-secret-key-here-min-32-chars

# App URL
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Social Providers (optional)
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret
```

## Usage in Components

### Sign Up
```typescript
'use client';

import { authClient } from '@/lib/auth-client';

export default function SignupForm() {
  const handleSignup = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await authClient.signUp.email({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
        name: formData.get('name') as string,
      });

      // Redirect or show success
    } catch (error) {
      console.error('Signup failed:', error);
    }
  };

  return (
    <form onSubmit={handleSignup}>
      <input name="name" type="text" placeholder="Name" required />
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Sign Up</button>
    </form>
  );
}
```

### Sign In
```typescript
'use client';

import { authClient } from '@/lib/auth-client';

export default function SigninForm() {
  const handleSignin = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);

    try {
      await authClient.signIn.email({
        email: formData.get('email') as string,
        password: formData.get('password') as string,
      });

      // Redirect to dashboard
    } catch (error) {
      console.error('Signin failed:', error);
    }
  };

  return (
    <form onSubmit={handleSignin}>
      <input name="email" type="email" placeholder="Email" required />
      <input name="password" type="password" placeholder="Password" required />
      <button type="submit">Sign In</button>
    </form>
  );
}
```

### Protected Page
```typescript
'use client';

import { useAuth } from '@/lib/auth-client';
import { redirect } from 'next/navigation';

export default function ProtectedPage() {
  const { data: session, isPending } = useAuth();

  if (isPending) return <div>Loading...</div>;
  if (!session) redirect('/signin');

  return <div>Welcome, {session.user.name}!</div>;
}
```

## Security Best Practices

- Use environment variables for secrets
- Enable HTTPS in production
- Set secure cookie flags
- Implement rate limiting
- Enable email verification
- Use strong password requirements
- Implement CSRF protection
- Regular security audits
