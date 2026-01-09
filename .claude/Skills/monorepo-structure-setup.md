# Monorepo Structure Setup

**Name:** monorepo-structure-setup

**Purpose:** Setup monorepo folder structure with shared configs

**Input:** Project name

**Output:** /frontend, /backend, /specs, docker-compose.yml, CLAUDE.md files

**Usage:**
```
@monorepo-structure-setup for todo-app
```

## Description

This skill generates a complete monorepo structure with the following features:
- Frontend directory (Next.js)
- Backend directory (FastAPI)
- Specs directory for documentation
- Docker Compose configuration
- Shared configuration files
- CLAUDE.md instruction files
- README files
- .gitignore files
- Environment templates

## Example Usage

### Basic Setup
```
@monorepo-structure-setup for todo-app
```

### With Custom Ports
```
@monorepo-structure-setup for todo-app --frontend-port 3000 --backend-port 8000
```

## Generated Structure

```
project-root/
├── frontend/                 # Next.js application
│   ├── app/                  # App Router pages
│   ├── components/           # React components
│   ├── lib/                  # Utilities and API client
│   ├── public/               # Static assets
│   ├── .env.local.example    # Environment template
│   ├── .gitignore
│   ├── CLAUDE.md             # Frontend-specific instructions
│   ├── next.config.js
│   ├── package.json
│   ├── tsconfig.json
│   └── README.md
│
├── backend/                  # FastAPI application
│   ├── routers/              # API route handlers
│   ├── models/               # SQLModel database models
│   ├── services/             # Business logic
│   ├── alembic/              # Database migrations
│   │   └── versions/
│   ├── tests/                # Backend tests
│   ├── .env.example          # Environment template
│   ├── .gitignore
│   ├── CLAUDE.md             # Backend-specific instructions
│   ├── main.py               # FastAPI app entry
│   ├── database.py           # Database configuration
│   ├── auth.py               # JWT authentication
│   ├── requirements.txt
│   ├── pyproject.toml
│   └── README.md
│
├── specs/                    # Documentation
│   ├── api/                  # API specifications
│   ├── features/             # Feature specs
│   ├── architecture/         # Architecture docs
│   └── README.md
│
├── .github/                  # GitHub configuration
│   └── workflows/            # CI/CD workflows
│       ├── frontend.yml
│       └── backend.yml
│
├── docker-compose.yml        # Local development setup
├── .gitignore                # Root gitignore
├── CLAUDE.md                 # Root Claude instructions
└── README.md                 # Project overview
```

## Generated Files

### 1. Root docker-compose.yml
```yaml
version: '3.8'

services:
  postgres:
    image: postgres:15
    environment:
      POSTGRES_USER: user
      POSTGRES_PASSWORD: password
      POSTGRES_DB: database
    ports:
      - "5432:5432"
    volumes:
      - postgres_data:/var/lib/postgresql/data

  backend:
    build: ./backend
    command: uvicorn main:app --host 0.0.0.0 --port 8000 --reload
    volumes:
      - ./backend:/app
    ports:
      - "8000:8000"
    environment:
      - DATABASE_URL=postgresql://user:password@postgres:5432/database
      - BETTER_AUTH_SECRET=your-secret-key-here
    depends_on:
      - postgres

  frontend:
    build: ./frontend
    command: npm run dev
    volumes:
      - ./frontend:/app
      - /app/node_modules
    ports:
      - "3000:3000"
    environment:
      - NEXT_PUBLIC_API_URL=http://localhost:8000
    depends_on:
      - backend

volumes:
  postgres_data:
```

### 2. Root CLAUDE.md
```markdown
# Claude Code Instructions

This is a monorepo containing a FastAPI backend and Next.js frontend.

## Project Structure

- `/frontend` - Next.js 14+ with App Router and TypeScript
- `/backend` - FastAPI with SQLModel and PostgreSQL
- `/specs` - Documentation and specifications

## Development Workflow

1. Start services: `docker-compose up`
2. Frontend: http://localhost:3000
3. Backend: http://localhost:8000
4. Backend docs: http://localhost:8000/docs

## Key Technologies

- **Frontend**: Next.js, TypeScript, Tailwind CSS, Better Auth
- **Backend**: FastAPI, SQLModel, PostgreSQL, JWT
- **Database**: PostgreSQL (via Neon in production)

## Commands

```bash
# Start all services
docker-compose up

# Backend only
cd backend && uvicorn main:app --reload

# Frontend only
cd frontend && npm run dev

# Run tests
cd backend && pytest
cd frontend && npm test
```

## Guidelines

- Use the skills in `.claude/Skills/` for common tasks
- Follow the architecture patterns in `/specs/architecture/`
- All API endpoints require JWT authentication
- Use TypeScript for all frontend code
- Follow SQLModel patterns for database models
```

### 3. Backend Dockerfile
```dockerfile
FROM python:3.11-slim

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY . .

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 4. Frontend Dockerfile
```dockerfile
FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["npm", "run", "dev"]
```

### 5. Root README.md
```markdown
# Project Name

Full-stack application with FastAPI backend and Next.js frontend.

## Quick Start

1. Clone the repository
2. Copy environment files:
   ```bash
   cp backend/.env.example backend/.env
   cp frontend/.env.local.example frontend/.env.local
   ```
3. Update environment variables
4. Start services:
   ```bash
   docker-compose up
   ```

## Architecture

- **Frontend**: Next.js 14+ with App Router
- **Backend**: FastAPI with SQLModel
- **Database**: PostgreSQL
- **Authentication**: Better Auth with JWT

## Development

See individual README files:
- [Frontend README](./frontend/README.md)
- [Backend README](./backend/README.md)

## Documentation

See [specs/](./specs/) directory for detailed documentation.
```

## Features

- **Docker Compose**: Complete local development setup
- **Monorepo Structure**: Organized frontend/backend separation
- **Documentation**: README and CLAUDE.md files
- **Environment Templates**: .env.example files
- **CI/CD Ready**: GitHub Actions workflows
- **Database Migrations**: Alembic setup
- **TypeScript**: Full type safety
- **Testing**: Test directories and configurations

## Scripts Generated

### Backend Scripts
```bash
# backend/scripts/init-db.sh
#!/bin/bash
alembic upgrade head
```

### Frontend Scripts
```json
// frontend/package.json scripts
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "test": "jest"
  }
}
```

## Environment Variables

### Backend .env.example
```env
DATABASE_URL=postgresql://user:password@localhost:5432/database
BETTER_AUTH_SECRET=your-secret-key-min-32-chars
ENVIRONMENT=development
```

### Frontend .env.local.example
```env
NEXT_PUBLIC_API_URL=http://localhost:8000
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

## Post-Setup Instructions

After running this skill:

1. Install dependencies:
   ```bash
   cd backend && pip install -r requirements.txt
   cd frontend && npm install
   ```

2. Initialize database:
   ```bash
   cd backend && alembic upgrade head
   ```

3. Start development:
   ```bash
   docker-compose up
   ```

4. Access applications:
   - Frontend: http://localhost:3000
   - Backend: http://localhost:8000
   - API Docs: http://localhost:8000/docs
