# Chatbot Fix and Testing Guide

## Issues Fixed

1. **Frontend ChatPanel.tsx (line 61-145)**:
   - Added better error handling for network failures
   - Added support for `NEXT_PUBLIC_API_URL` environment variable
   - Improved error messages for authentication and connection issues
   - Added null safety for API responses
   - Fixed conversation ID handling

2. **Backend routes/chat.py (line 142)**:
   - Fixed type hint for authorization parameter (was `str`, should be `dict`)

## Setup Instructions

### 1. Backend Setup

Ensure your backend `.env` file has these variables:

```env
DATABASE_URL=postgresql://...your-neon-db-url...
BETTER_AUTH_SECRET=iylYiaVeVL60NT2Us9teM549Ick1IuMq
FRONTEND_URL=http://localhost:3000
HOST=0.0.0.0
PORT=8000
COHERE_API_KEY=your-cohere-api-key-here
```

**Important**: Get a Cohere API key from https://dashboard.cohere.com/api-keys

### 2. Frontend Setup

Ensure your frontend `.env` file has:

```env
NEXT_PUBLIC_API_URL=http://localhost:8000
BETTER_AUTH_SECRET=iylYiaVeVL60NT2Us9teM549Ick1IuMq
BETTER_AUTH_URL=http://localhost:3000
```

### 3. Start the Backend

```bash
cd backend
python main.py
```

You should see:
```
All required environment variables are set
CORS configured for: http://localhost:3000
INFO:     Uvicorn running on http://0.0.0.0:8000
```

### 4. Start the Frontend

```bash
cd frontend
npm run dev
```

### 5. Test the Chatbot

1. Sign in to your account
2. Navigate to the tasks page
3. Click the chatbot button (floating button)
4. Try these test messages:
   - "List all my tasks"
   - "Add a task called 'Test the chatbot' with high priority"
   - "Complete task with title 'Test the chatbot'"
   - "Delete task 'Test the chatbot'"

## Common Issues and Solutions

### Issue: "Unable to connect to the server"
**Solution**: Ensure the backend is running on port 8000. Check with `curl http://localhost:8000/health`

### Issue: "Your session has expired"
**Solution**: Sign out and sign back in to get a fresh JWT token

### Issue: "AI chatbot is not configured"
**Solution**: Set the `COHERE_API_KEY` in your backend `.env` file

### Issue: CORS errors in browser console
**Solution**:
- Ensure `FRONTEND_URL=http://localhost:3000` in backend `.env`
- Restart the backend after changing the `.env` file

### Issue: Authentication errors
**Solution**: Ensure `BETTER_AUTH_SECRET` matches in both frontend and backend `.env` files

## Testing API Manually

Test the health endpoint:
```bash
curl http://localhost:8000/health
```

Test the chat endpoint (replace TOKEN and USER_ID):
```bash
curl -X POST http://localhost:8000/api/{USER_ID}/chat \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer {YOUR_JWT_TOKEN}" \
  -d '{"message": "list my tasks"}'
```

## What the Fix Does

The improved error handling now provides specific messages for:
- **Network failures**: "Unable to connect to the server..."
- **Authentication failures**: "Your session has expired..."
- **Backend errors**: Shows the actual error message from the API
- **CORS issues**: Better detection and reporting

The backend fix ensures the JWT payload is correctly typed and processed.
