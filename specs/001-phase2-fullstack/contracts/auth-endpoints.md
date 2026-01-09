# Authentication Endpoints

**Feature**: `001-phase2-fullstack` | **Date**: 2025-12-29

## POST /auth/signup

Create a new user account and issue JWT token.

**Functional Requirements**: FR-001, FR-002, FR-003

### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "name": "John Doe"
}
```

**Validation Rules**:
- `email`: Required, valid email format (RFC 5322), max 255 characters
- `password`: Required, minimum 8 characters
- `name`: Required, max 255 characters

### Response

**Success (201 Created)**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-12-29T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:

*400 Bad Request* - Invalid input:
```json
{
  "detail": "Invalid email format"
}
```

*409 Conflict* - Email already registered:
```json
{
  "detail": "Email already registered"
}
```

*422 Unprocessable Entity* - Validation error:
```json
{
  "detail": [
    {
      "loc": ["body", "password"],
      "msg": "ensure this value has at least 8 characters",
      "type": "value_error.any_str.min_length"
    }
  ]
}
```

### Business Logic

1. Normalize email to lowercase for case-insensitive uniqueness
2. Check if email already exists (case-insensitive query)
3. If exists, return 409 Conflict
4. Hash password with bcrypt (cost factor: 12)
5. Create user record in database
6. Generate JWT token with user_id and email claims
7. Return user object (excluding password_hash) and JWT token

### Security Notes

- Password hashed with bcrypt before storage
- Email uniqueness enforced at database level
- JWT token expires in 7 days
- Password never returned in response

---

## POST /auth/signin

Authenticate user and issue JWT token.

**Functional Requirements**: FR-004, FR-005

### Request

**Headers**:
```
Content-Type: application/json
```

**Body**:
```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Validation Rules**:
- `email`: Required, valid email format
- `password`: Required

### Response

**Success (200 OK)**:
```json
{
  "user": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "email": "user@example.com",
    "name": "John Doe",
    "created_at": "2025-12-29T12:00:00Z"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Error Responses**:

*401 Unauthorized* - Invalid credentials:
```json
{
  "detail": "Invalid email or password"
}
```

*422 Unprocessable Entity* - Validation error:
```json
{
  "detail": [
    {
      "loc": ["body", "email"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

### Business Logic

1. Normalize email to lowercase
2. Query user by email (case-insensitive)
3. If user not found, return 401 Unauthorized
4. Verify password against bcrypt hash
5. If password incorrect, return 401 Unauthorized
6. Generate JWT token with user_id and email claims
7. Return user object (excluding password_hash) and JWT token

### Security Notes

- Constant-time password comparison (bcrypt.checkpw)
- Generic error message for invalid credentials (don't reveal if email exists)
- Rate limiting recommended (not implemented in Phase II)

---

## GET /auth/me

Get current authenticated user's profile.

**Functional Requirements**: FR-005 (JWT validation)

### Request

**Headers**:
```
Authorization: Bearer <jwt_token>
```

### Response

**Success (200 OK)**:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "email": "user@example.com",
  "name": "John Doe",
  "created_at": "2025-12-29T12:00:00Z"
}
```

**Error Responses**:

*401 Unauthorized* - Missing or invalid token:
```json
{
  "detail": "Invalid or expired token"
}
```

### Business Logic

1. Extract JWT token from Authorization header
2. Verify JWT signature with BETTER_AUTH_SECRET
3. Extract user_id from token claims
4. Query user by user_id
5. Return user object (excluding password_hash)

### Security Notes

- Token validation using PyJWT library
- Expired tokens rejected automatically
- Invalid signatures rejected

---

## POST /auth/signout

Sign out user (frontend-only implementation in Phase II).

**Functional Requirements**: FR-016

### Implementation Note

Signout is handled client-side in Phase II by deleting the JWT token from localStorage or cookies. No backend endpoint required since JWTs are stateless.

**Frontend Logic**:
1. Delete JWT token from storage
2. Redirect to signin page

**Future Enhancement** (Out of Scope):
- Token blacklisting for immediate invalidation
- Refresh token revocation

---

**Contract Status**: ✅ COMPLETE - Authentication endpoints fully specified
