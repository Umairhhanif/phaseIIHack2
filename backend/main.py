"""
FastAPI application entry point for Todo App Phase II.

Configures CORS middleware, registers routes, and initializes the application.
"""

import os

from dotenv import load_dotenv
from fastapi import FastAPI
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware

from lib.errors import APIError, api_error_handler, validation_exception_handler

# Load environment variables
load_dotenv()

# Create FastAPI application
app = FastAPI(
    title="Todo App API",
    description="Multi-user task management API with JWT authentication",
    version="1.0.0",
)

# Register exception handlers first (middleware order matters - added later = processed first)
app.add_exception_handler(APIError, api_error_handler)
app.add_exception_handler(RequestValidationError, validation_exception_handler)

# Configure CORS middleware LAST so it wraps all responses including errors
frontend_url = os.getenv("FRONTEND_URL", "http://localhost:3000")
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
    expose_headers=["*"],
)


# Health check endpoint
@app.get("/health")
async def health_check():
    """Health check endpoint for monitoring and load balancers."""
    return {"status": "healthy"}


# Register route blueprints
from routes import tasks, users, tags

app.include_router(users.router, prefix="/auth", tags=["Authentication"])
app.include_router(tasks.router, prefix="/api", tags=["Tasks"])
app.include_router(tags.router, prefix="/api", tags=["Tags"])


@app.on_event("startup")
async def startup_event():
    """Validate environment variables on startup."""
    required_vars = ["DATABASE_URL", "BETTER_AUTH_SECRET", "FRONTEND_URL"]
    missing_vars = [var for var in required_vars if not os.getenv(var)]

    if missing_vars:
        raise ValueError(
            f"Missing required environment variables: {', '.join(missing_vars)}"
        )

    print("All required environment variables are set")
    print(f"CORS configured for: {frontend_url}")


if __name__ == "__main__":
    import uvicorn

    host = os.getenv("HOST", "0.0.0.0")
    port = int(os.getenv("PORT", "8000"))

    uvicorn.run("main:app", host=host, port=port, reload=True)
