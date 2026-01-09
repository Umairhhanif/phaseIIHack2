# Quickstart Guide: Todo App - Phase II Full-Stack Web Application

**Feature**: `001-phase2-fullstack` | **Date**: 2025-12-29 | **Status**: Phase 1 Design

## Prerequisites

Before starting, ensure you have the following installed:

- **Python 3.13+** - Backend runtime
- **UV** - Python package manager (`pip install uv`)
- **Node.js 18+** - Frontend runtime
- **npm or pnpm** - Node.js package manager
- **Git** - Version control
- **Neon Account** - For PostgreSQL database (free tier available at https://neon.tech)

---

## 1. Clone Repository

```bash
git clone <repository-url>
cd phase2
git checkout 001-phase2-fullstack
```

---

## 2. Environment Configuration

### Backend Environment Variables

Create `backend/.env`:

```bash
# Database
DATABASE_URL=postgresql://user:password@host/dbname?sslmode=require

# Authentication (must match frontend secret)
BETTER_AUTH_SECRET=your-super-secret-key-min-32-characters

# CORS (allow frontend origin)
FRONTEND_URL=http://localhost:3000

# Server Config
HOST=0.0.0.0
PORT=8000
```

**Get DATABASE_URL**:
1. Sign up at https://neon.tech
2. Create a new project
3. Copy the connection string from dashboard
4. Paste into `DATABASE_URL` environment variable

**Generate BETTER_AUTH_SECRET**:
```bash
# Generate random 32-character secret
python -c "import secrets; print(secrets.token_urlsafe(32))"
```

### Frontend Environment Variables

Create `frontend/.env.local`:

```bash
# Backend API URL
NEXT_PUBLIC_API_URL=http://localhost:8000

# Authentication (must match backend secret)
BETTER_AUTH_SECRET=your-super-secret-key-min-32-characters

# Better Auth URL
BETTER_AUTH_URL=http://localhost:3000
```

**CRITICAL**: `BETTER_AUTH_SECRET` must be identical in both backend and frontend.

---

## 3. Backend Setup

### Install Dependencies

```bash
cd backend
uv pip install -r requirements.txt
```

**requirements.txt** (create if not exists):
```
fastapi==0.115.0
uvicorn[standard]==0.32.0
sqlmodel==0.0.22
psycopg2-binary==2.9.10
pyjwt==2.9.0
bcrypt==4.2.0
python-dotenv==1.0.1
pydantic[email]==2.10.0
```

### Initialize Database

```bash
# Run database migrations
python -c "from database import init_db; init_db()"
```

This creates the `users` and `tasks` tables in your Neon PostgreSQL database.

**Verify Tables Created**:
```sql
-- Connect to Neon console and run:
\dt
-- Should show: users, tasks
```

### Start Backend Server

```bash
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

**Expected Output**:
```
INFO:     Uvicorn running on http://0.0.0.0:8000 (Press CTRL+C to quit)
INFO:     Started reloader process
INFO:     Started server process
INFO:     Application startup complete.
```

**Test Backend**:
```bash
curl http://localhost:8000/health
# Expected: {"status": "healthy"}
```

---

## 4. Frontend Setup

### Install Dependencies

```bash
cd frontend
npm install
# or: pnpm install
```

**package.json** (key dependencies):
```json
{
  "dependencies": {
    "next": "^16.0.0",
    "react": "^19.0.0",
    "react-dom": "^19.0.0",
    "better-auth": "^1.0.0",
    "tailwindcss": "^3.4.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "@types/react": "^19.0.0",
    "@types/node": "^22.0.0"
  }
}
```

### Configure TypeScript

Ensure `tsconfig.json` has strict mode enabled:

```json
{
  "compilerOptions": {
    "strict": true,
    "target": "ES2020",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx"],
  "exclude": ["node_modules"]
}
```

### Start Frontend Development Server

```bash
npm run dev
# or: pnpm dev
```

**Expected Output**:
```
- ready started server on 0.0.0.0:3000, url: http://localhost:3000
- info  Loaded env from /path/to/frontend/.env.local
```

**Test Frontend**:
Open browser to http://localhost:3000 - should see landing page or signup form.

---

## 5. Verify Full Stack Integration

### Test Authentication Flow

1. **Signup**:
   - Navigate to http://localhost:3000/signup
   - Enter email: `test@example.com`
   - Enter password: `password123` (min 8 chars)
   - Enter name: `Test User`
   - Click "Sign Up"
   - Should redirect to `/tasks` with empty task list

2. **Create Task**:
   - Navigate to http://localhost:3000/tasks/create
   - Enter title: `Test Task`
   - Enter description: `Testing task creation`
   - Click "Create Task"
   - Should redirect to `/tasks` with new task visible

3. **Toggle Task Completion**:
   - Click checkbox next to task
   - Task should show as completed (strikethrough, visual indicator)
   - Refresh page - completion state should persist

4. **Sign Out and Sign In**:
   - Click "Sign Out" button
   - Should redirect to `/signin`
   - Sign in with same credentials
   - Should see your tasks persisted

### Test User Isolation

1. **Create Second User**:
   - Sign out
   - Sign up with different email: `test2@example.com`
   - Create a task for second user

2. **Verify Data Isolation**:
   - Sign in as first user
   - Should NOT see second user's tasks
   - Attempt to access second user's task via URL (copy task ID)
   - Should receive 403 Forbidden error

---

## 6. Database Inspection (Optional)

Connect to Neon PostgreSQL console and verify data:

```sql
-- View all users (passwords hashed)
SELECT id, email, name, created_at FROM users;

-- View all tasks
SELECT id, user_id, title, completed, created_at FROM tasks;

-- Verify user isolation (no cross-user data)
SELECT u.email, COUNT(t.id) as task_count
FROM users u
LEFT JOIN tasks t ON u.id = t.user_id
GROUP BY u.email;
```

---

## 7. Development Workflow

### Making Changes

**Backend Changes**:
1. Modify code in `backend/`
2. Uvicorn auto-reloads on file save (if `--reload` flag used)
3. Test API endpoints with curl or Postman

**Frontend Changes**:
1. Modify code in `frontend/app/` or `frontend/components/`
2. Next.js auto-reloads on file save (Fast Refresh)
3. View changes in browser immediately

### Database Migrations

When modifying SQLModel schemas:

```bash
cd backend
alembic revision --autogenerate -m "Description of change"
alembic upgrade head
```

### Running Tests

**Backend Tests**:
```bash
cd backend
pytest tests/ -v
```

**Frontend Tests**:
```bash
cd frontend
npm test
# or: pnpm test
```

---

## 8. Common Issues

### Issue: "Invalid or expired token"

**Cause**: BETTER_AUTH_SECRET mismatch between frontend and backend.

**Fix**:
1. Ensure both `backend/.env` and `frontend/.env.local` have identical BETTER_AUTH_SECRET
2. Restart both servers
3. Clear browser cookies/localStorage
4. Sign in again

### Issue: "Database connection failed"

**Cause**: Invalid DATABASE_URL or Neon database not accessible.

**Fix**:
1. Verify DATABASE_URL in `backend/.env` is correct
2. Check Neon dashboard - ensure database is active (not paused)
3. Test connection: `psql <DATABASE_URL>`

### Issue: "CORS policy blocked"

**Cause**: FRONTEND_URL in backend doesn't match actual frontend origin.

**Fix**:
1. Update `backend/.env` with correct FRONTEND_URL
2. For local dev: `FRONTEND_URL=http://localhost:3000`
3. Restart backend server

### Issue: "Cannot access other user's tasks"

**Status**: Expected behavior - user isolation working correctly.

**Explanation**: Each user can only access their own tasks. This is a security feature, not a bug.

---

## 9. Next Steps

After successful setup:

1. **Review Codebase**:
   - Read `backend/CLAUDE.md` for backend patterns
   - Read `frontend/CLAUDE.md` for frontend patterns
   - Review API contracts in `specs/001-phase2-fullstack/contracts/`

2. **Explore Features**:
   - Test all CRUD operations (Create, Read, Update, Delete)
   - Test task completion toggling
   - Test user isolation with multiple accounts

3. **Start Development**:
   - Follow tasks in `specs/001-phase2-fullstack/tasks.md` (created by `/sp.tasks`)
   - Use Skills from `.claude/Skills/` for code generation
   - Follow SpecKit Plus workflow: Plan → Tasks → Implement

---

## 10. Production Deployment

### Backend Deployment (Railway/Render/Fly.io)

1. Create account on deployment platform
2. Connect GitHub repository
3. Set environment variables:
   - `DATABASE_URL` (Neon connection string)
   - `BETTER_AUTH_SECRET` (same as frontend)
   - `FRONTEND_URL` (production frontend URL)
4. Deploy from `001-phase2-fullstack` branch

### Frontend Deployment (Vercel)

1. Create Vercel account
2. Import GitHub repository
3. Set environment variables:
   - `NEXT_PUBLIC_API_URL` (production backend URL)
   - `BETTER_AUTH_SECRET` (same as backend)
   - `BETTER_AUTH_URL` (production frontend URL)
4. Deploy from `001-phase2-fullstack` branch

### Post-Deployment Checklist

- [ ] Verify DATABASE_URL points to production Neon database
- [ ] Verify BETTER_AUTH_SECRET matches between frontend and backend
- [ ] Verify CORS configured with production frontend URL
- [ ] Test signup, signin, task CRUD in production
- [ ] Test user isolation in production
- [ ] Enable HTTPS (automatic on Vercel/Railway/Render)

---

**Quickstart Status**: ✅ COMPLETE - Local development environment ready
