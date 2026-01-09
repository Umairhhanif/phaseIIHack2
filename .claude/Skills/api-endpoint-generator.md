# API Endpoint Generator

**Name:** api-endpoint-generator

**Purpose:** Generate FastAPI REST endpoints from specs

**Input:** Endpoint spec (method, path, request/response schema)

**Output:** Complete FastAPI route with SQLModel integration, JWT auth, error handling

**Usage:**
```
@api-endpoint-generator create POST /api/{user_id}/tasks
```

## Description

This skill generates complete FastAPI REST endpoints with the following features:
- HTTP method support (GET, POST, PUT, PATCH, DELETE)
- Path parameters and query parameters
- Request/response schema validation using SQLModel
- JWT authentication integration
- Comprehensive error handling
- Database integration patterns
- Response status codes and error responses

## Example Usage

### Basic Endpoint Creation
```
@api-endpoint-generator create POST /api/users
```

### Endpoint with Path Parameters
```
@api-endpoint-generator create GET /api/users/{user_id}
```

### Endpoint with Authentication
```
@api-endpoint-generator create POST /api/protected/tasks --auth required
```

## Generated Code Structure

The skill will generate:
1. **Route definition** with proper decorators
2. **Request/Response models** using SQLModel
3. **Authentication checks** using JWT tokens
4. **Error handling** with appropriate HTTP status codes
5. **Database operations** with proper session management
6. **Input validation** and sanitization

## Integration Points

- **FastAPI**: REST endpoint routing
- **SQLModel**: Database models and validation
- **JWT Auth**: Token verification and user authentication
- **Database Session**: Proper connection and transaction handling
- **Error Responses**: Standardized error format
