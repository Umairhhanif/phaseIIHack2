# Environment Config Manager

**Name:** env-config-manager

**Purpose:** Generate .env files for frontend and backend

**Input:** Required variables (DATABASE_URL, BETTER_AUTH_SECRET, etc.)

**Output:** .env.example and .env.local files with documentation

**Usage:**
```
@env-config-manager for Phase II
```

## Description

This skill generates complete environment configuration files with the following features:
- .env.example templates
- .env.local for actual values
- Inline documentation for each variable
- Validation rules
- Security best practices
- Platform-specific variables
- Development/production configs

## Example Usage

### Generate All Environment Files
```
@env-config-manager for Phase II
```

### Backend Only
```
@env-config-manager for backend with PostgreSQL
```

### Frontend Only
```
@env-config-manager for frontend with Better Auth
```

## Generated Files

The skill will generate:
1. **Backend .env.example** - Template with all variables
2. **Backend .env** - Actual values (gitignored)
3. **Frontend .env.local.example** - Template for Next.js
4. **Frontend .env.local** - Actual values (gitignored)
5. **.gitignore entries** - Ensure secrets aren't committed

## Backend Environment File

### backend/.env.example
```env
# Database Configuration
# PostgreSQL connection string for Neon or local database
# Format: postgresql://user:password@host:port/database
DATABASE_URL=postgresql://user:password@localhost:5432/database

# Better Auth Configuration
# Secret key for JWT token signing (minimum 32 characters)
# Generate with: openssl rand -base64 32
BETTER_AUTH_SECRET=your-secret-key-here-min-32-characters

# Application Settings
# Environment: development, staging, or production
ENVIRONMENT=development

# CORS Origins
# Comma-separated list of allowed origins
CORS_ORIGINS=http://localhost:3000,http://localhost:3001

# API Configuration
API_HOST=0.0.0.0
API_PORT=8000
API_RELOAD=true

# JWT Settings
JWT_ALGORITHM=HS256
JWT_EXPIRATION_HOURS=168  # 7 days

# Database Pool Settings (optional, for production)
DB_POOL_SIZE=5
DB_MAX_OVERFLOW=10

# Logging
LOG_LEVEL=INFO

# Rate Limiting (optional)
RATE_LIMIT_ENABLED=false
RATE_LIMIT_PER_MINUTE=60

# Email Configuration (optional, for email verification)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASSWORD=your-app-password
SMTP_FROM=noreply@yourapp.com

# Storage Configuration (optional, for file uploads)
UPLOAD_DIR=./uploads
MAX_UPLOAD_SIZE_MB=10

# Redis Configuration (optional, for caching)
REDIS_URL=redis://localhost:6379/0

# Sentry (optional, for error tracking)
SENTRY_DSN=
```

## Frontend Environment File

### frontend/.env.local.example
```env
# API Configuration
# Backend API base URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Application URL
# Frontend application URL for redirects and OAuth callbacks
NEXT_PUBLIC_APP_URL=http://localhost:3000

# Better Auth Configuration
# These should match the backend configuration
DATABASE_URL=postgresql://user:password@localhost:5432/database
BETTER_AUTH_SECRET=your-secret-key-here-min-32-characters

# OAuth Providers (optional)
# Google OAuth
GOOGLE_CLIENT_ID=your-google-client-id
GOOGLE_CLIENT_SECRET=your-google-client-secret

# GitHub OAuth
GITHUB_CLIENT_ID=your-github-client-id
GITHUB_CLIENT_SECRET=your-github-client-secret

# Feature Flags (optional)
NEXT_PUBLIC_ENABLE_ANALYTICS=false
NEXT_PUBLIC_ENABLE_ERROR_REPORTING=false

# Analytics (optional)
NEXT_PUBLIC_GA_TRACKING_ID=

# Vercel/Deployment (set automatically by platform)
# VERCEL_URL=
# NEXT_PUBLIC_VERCEL_URL=
```

## Environment Variable Documentation

### Backend Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `DATABASE_URL` | PostgreSQL connection string | Yes | - |
| `BETTER_AUTH_SECRET` | JWT signing secret (min 32 chars) | Yes | - |
| `ENVIRONMENT` | Environment name | No | development |
| `CORS_ORIGINS` | Allowed CORS origins | No | http://localhost:3000 |
| `API_HOST` | API server host | No | 0.0.0.0 |
| `API_PORT` | API server port | No | 8000 |
| `JWT_ALGORITHM` | JWT algorithm | No | HS256 |
| `JWT_EXPIRATION_HOURS` | Token expiration in hours | No | 168 |
| `LOG_LEVEL` | Logging level | No | INFO |

### Frontend Variables

| Variable | Description | Required | Default |
|----------|-------------|----------|---------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes | - |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | Yes | - |
| `DATABASE_URL` | Database URL (for Better Auth) | Yes | - |
| `BETTER_AUTH_SECRET` | Auth secret (must match backend) | Yes | - |
| `GOOGLE_CLIENT_ID` | Google OAuth client ID | No | - |
| `GOOGLE_CLIENT_SECRET` | Google OAuth secret | No | - |
| `GITHUB_CLIENT_ID` | GitHub OAuth client ID | No | - |
| `GITHUB_CLIENT_SECRET` | GitHub OAuth secret | No | - |

## Security Best Practices

### 1. Secret Generation
```bash
# Generate secure random secret
openssl rand -base64 32

# Or use Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"

# Or use Python
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### 2. .gitignore Entries
```gitignore
# Environment files
.env
.env.local
.env.*.local
.env.development.local
.env.test.local
.env.production.local

# Keep example files
!.env.example
!.env.local.example
```

### 3. Environment Validation

**Backend (Python)**
```python
# config.py
from pydantic_settings import BaseSettings

class Settings(BaseSettings):
    database_url: str
    better_auth_secret: str
    environment: str = "development"

    class Config:
        env_file = ".env"
        case_sensitive = False

    def __init__(self, **kwargs):
        super().__init__(**kwargs)

        # Validate secret length
        if len(self.better_auth_secret) < 32:
            raise ValueError("BETTER_AUTH_SECRET must be at least 32 characters")

settings = Settings()
```

**Frontend (TypeScript)**
```typescript
// lib/env.ts
const requiredEnvVars = [
  'NEXT_PUBLIC_API_URL',
  'NEXT_PUBLIC_APP_URL',
  'DATABASE_URL',
  'BETTER_AUTH_SECRET',
] as const;

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

export const env = {
  apiUrl: process.env.NEXT_PUBLIC_API_URL!,
  appUrl: process.env.NEXT_PUBLIC_APP_URL!,
  databaseUrl: process.env.DATABASE_URL!,
  authSecret: process.env.BETTER_AUTH_SECRET!,
};
```

## Platform-Specific Configurations

### Vercel (Frontend)
```env
# Automatically set by Vercel
VERCEL=1
VERCEL_URL=your-app.vercel.app
VERCEL_ENV=production

# You need to set these in Vercel dashboard
NEXT_PUBLIC_API_URL=https://your-api.com
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=...
```

### Railway (Backend)
```env
# Automatically set by Railway
RAILWAY_ENVIRONMENT=production

# You need to set these in Railway dashboard
DATABASE_URL=${{Postgres.DATABASE_URL}}
BETTER_AUTH_SECRET=...
```

### Neon Database
```env
# Neon provides this connection string
DATABASE_URL=postgresql://user:password@ep-xxx-xxx.us-east-2.aws.neon.tech/neondb?sslmode=require
```

## Features

- **Complete Documentation**: Every variable explained
- **Security Best Practices**: Secret generation and validation
- **Platform Support**: Vercel, Railway, Neon configurations
- **Validation**: Type checking and required field validation
- **Gitignore Safe**: Example files tracked, actual secrets ignored
- **Development/Production**: Separate configs for each environment
