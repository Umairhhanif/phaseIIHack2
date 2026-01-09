# Todo App - Phase II Full-Stack Web Application

Multi-user task management application with authentication, persistent storage, and complete CRUD operations.

## Features

- 🔐 **User Authentication** - Secure signup/signin with JWT tokens (Better Auth)
- ✅ **Task Management** - Create, view, update, delete, and toggle task completion
- 🔒 **Data Isolation** - Each user can only access their own tasks
- 🚀 **Modern Stack** - Next.js 16+ frontend, FastAPI backend, Neon PostgreSQL
- 📱 **Responsive UI** - Tailwind CSS with mobile-first design
- ⚡ **Fast Performance** - Server Components, optimized database queries, connection pooling

## Project Structure

```
phase2/
├── backend/          # FastAPI backend (Python 3.13+)
│   ├── main.py       # Application entry point
│   ├── models.py     # SQLModel database schemas
│   ├── routes/       # API endpoints (auth, users, tasks)
│   ├── lib/          # Utilities (JWT, error handling)
│   └── tests/        # pytest test suite
├── frontend/         # Next.js 16+ frontend (TypeScript)
│   ├── app/          # App Router pages
│   ├── components/   # React components
│   ├── lib/          # API client, auth config, types
│   └── tests/        # Jest + Playwright tests
└── specs/            # Feature specifications and design docs
```

## Quick Start

### Prerequisites

- **Python 3.13+** and **UV** package manager
- **Node.js 18+** and npm/pnpm
- **Neon PostgreSQL** account (free tier at [neon.tech](https://neon.tech))

### Setup

See **[Quickstart Guide](specs/001-phase2-fullstack/quickstart.md)** for detailed setup instructions.

**TL;DR:**

1. **Clone and configure environment**:
   ```bash
   git clone <repo-url> && cd phase2
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   # Edit both .env files with your DATABASE_URL and BETTER_AUTH_SECRET
   ```

2. **Start backend**:
   ```bash
   cd backend
   uv pip install -r requirements.txt
   uvicorn main:app --reload
   ```

3. **Start frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

4. **Access application**: http://localhost:3000

## Architecture

- **Frontend**: Next.js 16+ with App Router, Server Components, Better Auth
- **Backend**: FastAPI with SQLModel ORM, JWT verification middleware
- **Database**: Neon Serverless PostgreSQL with connection pooling
- **Authentication**: Better Auth + JWT tokens (7-day expiry)
- **API**: RESTful JSON endpoints with user isolation enforcement

## Development

### Run Backend Tests
```bash
cd backend
pytest tests/ -v
```

### Run Frontend Tests
```bash
cd frontend
npm test            # Jest unit tests
npm run test:e2e    # Playwright E2E tests
```

### Database Migrations
```bash
cd backend
alembic revision --autogenerate -m "Description"
alembic upgrade head
```

## Deployment

### Backend (Railway/Render/Fly.io)
- Set environment variables: `DATABASE_URL`, `BETTER_AUTH_SECRET`, `FRONTEND_URL`
- Deploy from `001-phase2-fullstack` branch

### Frontend (Vercel)
- Set environment variables: `NEXT_PUBLIC_API_URL`, `BETTER_AUTH_SECRET`, `BETTER_AUTH_URL`
- Deploy from `001-phase2-fullstack` branch

See **[Quickstart Guide](specs/001-phase2-fullstack/quickstart.md)** for detailed deployment instructions.

## Documentation

- **[Feature Specification](specs/001-phase2-fullstack/spec.md)** - User stories and requirements
- **[Implementation Plan](specs/001-phase2-fullstack/plan.md)** - Architecture and technical decisions
- **[Data Model](specs/001-phase2-fullstack/data-model.md)** - Database schema (SQLModel)
- **[API Contracts](specs/001-phase2-fullstack/contracts/)** - REST endpoint specifications
- **[Quickstart Guide](specs/001-phase2-fullstack/quickstart.md)** - Setup and deployment
- **[Tasks Breakdown](specs/001-phase2-fullstack/tasks.md)** - Implementation task list

## Tech Stack

### Backend
- **FastAPI** - High-performance async web framework
- **SQLModel** - ORM with Pydantic integration
- **Neon PostgreSQL** - Serverless database
- **PyJWT** - JWT token verification
- **bcrypt** - Password hashing
- **Alembic** - Database migrations
- **pytest** - Testing framework

### Frontend
- **Next.js 16+** - React framework with App Router
- **TypeScript** - Type-safe development
- **Better Auth** - Authentication library with JWT plugin
- **Tailwind CSS** - Utility-first styling
- **Jest** - Unit testing
- **Playwright** - E2E testing

## Contributing

This project follows **Spec-Driven Development (SDD)** workflow:

1. **Specify** - Define feature in `specs/[feature]/spec.md`
2. **Plan** - Design architecture in `specs/[feature]/plan.md`
3. **Tasks** - Break down implementation in `specs/[feature]/tasks.md`
4. **Implement** - Execute tasks with agent-based development

See **[CLAUDE.md](CLAUDE.md)** for agent-specific development guidelines.

## License

MIT

## Support

For issues or questions, see [Quickstart Guide](specs/001-phase2-fullstack/quickstart.md) Common Issues section.
