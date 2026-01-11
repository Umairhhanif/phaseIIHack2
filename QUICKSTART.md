# Phase 3 AI Chatbot - Quick Start Guide

Get the AI chatbot up and running in 5 minutes.

---

## Prerequisites

- Python 3.13+ installed
- Node.js 18+ installed
- A Neon PostgreSQL database (free at [neon.tech](https://neon.tech))
- A Cohere API key (free at [cohere.com/api-keys](https://dashboard.cohere.com/api-keys))

---

## Step 1: Get Your Cohere API Key

1. Visit [cohere.com/api-keys](https://dashboard.cohere.com/api-keys)
2. Sign up for a free account
3. Create a new API key
4. Copy the key (starts with something like `abc123...`)

---

## Step 2: Configure Environment

**Backend configuration:**

```bash
cd backend
cp .env.example .env
```

Edit `backend/.env` and set:
```bash
DATABASE_URL=your-neon-postgresql-url
BETTER_AUTH_SECRET=your-secret-min-32-chars
FRONTEND_URL=http://localhost:3000
COHERE_API_KEY=your-cohere-api-key-here  # ← PASTE YOUR KEY HERE
```

---

## Step 3: Create Database Tables

Run the database migration:

```bash
cd backend
alembic upgrade head
```

Or use direct initialization:

```bash
python -c "from database import init_db; init_db()"
```

---

## Step 4: Install Dependencies

**Backend (if not already installed):**

```bash
cd backend
uv pip install -r requirements.txt
```

**Frontend:**

```bash
cd frontend
npm install
```

---

## Step 5: Start the Servers

**Terminal 1 - Start Backend:**

```bash
cd backend
python main.py
```

You should see:
```
INFO:     Started server process
INFO:     Uvicorn running on http://0.0.0.0:8000
All required environment variables are set
CORS configured for: http://localhost:3000
```

**Terminal 2 - Start Frontend:**

```bash
cd frontend
npm run dev
```

You should see:
```
✓ Ready in 2.1s
◐ Compiling /page ...
```

---

## Step 6: Test the Chatbot

1. Open http://localhost:3000 in your browser
2. Sign up for a new account
3. You'll see an emerald chat button in the bottom-right corner
4. Click it to open the AI assistant
5. Try these commands:
   - `Who am I?`
   - `Add task buy groceries`
   - `Add task pay electricity bill with priority HIGH`
   - `Show all my tasks`
   - `Complete buy groceries`
   - `Delete pay electricity bill`

---

## Running the Demo Script

Automated testing script:

```bash
python demo_chatbot.py
```

This will:
1. Create a test user
2. Send all chat commands
3. Verify conversation history
4. Confirm tasks were created

---

## Troubleshooting

### "COHERE_API_KEY not set" warning

- Make sure you set `COHERE_API_KEY` in `backend/.env`
- The key should not be `your-cohere-api-key-here`

### Chatbot responds with error message

- Verify your Cohere API key is valid
- Check backend logs for errors
- Ensure database tables were created

### Frontend build errors

```bash
cd frontend
rm -rf .next node_modules
npm install
npm run build
```

### Database connection errors

- Verify `DATABASE_URL` is correct
- Check your Neon database is active
- Ensure SSL mode is enabled (`sslmode=require`)

---

## Chatbot Features Reference

### Task Commands

| Command | Action |
|---------|--------|
| `Add task [title]` | Create a new task |
| `Add task [title] with priority HIGH/MEDIUM/LOW` | Create with priority |
| `Show all my tasks` | List all tasks |
| `Show only pending tasks` | List incomplete tasks |
| `Complete [task name]` | Mark task as done |
| `Delete [task name]` | Remove task |
| `Change [old name] to [new name]` | Update task title |

### Identity Commands

| Command | Action |
|---------|--------|
| `Who am I?` | Show user email and ID |
| `What is my email?` | Show user email |

### Keyboard Shortcuts

| Key | Action |
|-----|--------|
| Enter | Send message |
| Shift+Enter | New line |
| Escape | Close chat panel |

---

## Project Structure

```
phase3/
├── backend/
│   ├── mcp/              # MCP tools for AI
│   ├── services/         # Cohere AI client
│   ├── routes/           # API endpoints
│   └── models.py         # Database models
├── frontend/
│   └── components/chatbot/  # Chat UI components
└── demo_chatbot.py       # Testing script
```

---

## Next Steps

1. **Explore the code**: Read `IMPLEMENTATION_LOG.md` for architecture details
2. **Run tests**: Execute `python demo_chatbot.py` for automated testing
3. **Customize**: Modify `backend/services/cohere.py` to adjust AI behavior
4. **Add features**: Extend `backend/mcp/tools.py` with new tools

---

## Support

- View full documentation: `README.md`
- Implementation log: `IMPLEMENTATION_LOG.md`
- Feature specification: `specs/1-ai-chatbot/spec.md`
