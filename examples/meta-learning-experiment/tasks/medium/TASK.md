# Medium Complexity Task: JWT Authentication System

## Task Overview

**Complexity Level**: Medium
**Domain**: Authentication & Authorization
**Estimated Duration**: 75 minutes
**Estimated Turns**: 15

## Objective

Implement a production-ready JWT-based authentication system with role-based access control (RBAC) using TypeScript and Express.js. The system must handle user registration, login, token refresh, password reset, and authorization middleware.

## Task Description

Build a complete authentication system with the following capabilities:

### Core Features

1. **User Registration**
   - Email and password-based registration
   - Email format validation
   - Password strength requirements (min 8 chars, uppercase, lowercase, number)
   - Unique email constraint
   - Secure password hashing using bcrypt (salt rounds: 10)

2. **User Login**
   - Email/password authentication
   - JWT token generation on successful login
   - Token includes user ID and role
   - Access token expiration: 15 minutes
   - Refresh token expiration: 7 days

3. **Token Refresh Mechanism**
   - Endpoint to refresh access token using refresh token
   - Refresh token rotation (issue new refresh token on refresh)
   - Invalidate old refresh tokens

4. **Password Reset**
   - Generate secure reset token (random 32-byte hex)
   - Token expiration: 1 hour
   - Email-based reset flow (simulate email sending)
   - Password update with token validation

5. **Role-Based Access Control (RBAC)**
   - Two roles: `admin` and `user`
   - Middleware to protect routes by role
   - Admin-only endpoints for user management

### Technical Requirements

#### Stack
- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict mode)
- **Framework**: Express.js
- **Testing**: Vitest
- **Database**: In-memory store (array) for simplicity
- **Password Hashing**: bcrypt
- **JWT**: jsonwebtoken

#### Security Requirements
- Password hashing with bcrypt (salt rounds >= 10)
- JWT signing with strong secret (min 32 chars)
- Input validation on all endpoints
- Rate limiting on authentication endpoints (max 5 requests per minute per IP)
- No sensitive data in JWT payload (no passwords, tokens)
- HTTP-only cookies for refresh tokens (optional enhancement)

#### Code Quality
- TypeScript strict mode enabled
- All functions and interfaces properly typed
- No use of `any` type
- ESLint with recommended rules
- Zero linting errors

#### Testing Requirements
- Test coverage >= 80%
- All critical paths tested:
  - Registration (success and failure cases)
  - Login (valid/invalid credentials)
  - Token refresh (valid/expired tokens)
  - Password reset flow
  - Authorization middleware (admin/user access)
- Use Vitest for testing
- Mock external dependencies (email service)

## Expected Deliverables

### 1. Source Files

#### `/src/types/user.ts`
- User interface definition
- Role enum
- Request/response types

#### `/src/models/user.ts`
- User data model
- In-memory user storage
- CRUD operations

#### `/src/auth/jwt.ts`
- Token generation functions
- Token verification functions
- Token refresh logic

#### `/src/auth/password.ts`
- Password hashing
- Password comparison
- Password reset token generation

#### `/src/middleware/auth.ts`
- Authentication middleware
- Authorization middleware (role-based)
- Rate limiting middleware

#### `/src/routes/auth.ts`
- POST /auth/register
- POST /auth/login
- POST /auth/refresh
- POST /auth/password-reset-request
- POST /auth/password-reset
- GET /auth/me (protected route)

#### `/src/routes/admin.ts`
- GET /admin/users (admin only)
- DELETE /admin/users/:id (admin only)

#### `/src/server.ts`
- Express app setup
- Middleware configuration
- Route mounting
- Error handling

### 2. Configuration Files

#### `/package.json`
- All dependencies listed
- Scripts: build, test, lint, dev

#### `/tsconfig.json`
- TypeScript strict mode
- Appropriate compiler options

#### `/.eslintrc.json`
- ESLint configuration
- TypeScript plugin

### 3. Tests

#### `/test/auth/registration.test.ts`
- User registration tests

#### `/test/auth/login.test.ts`
- Login flow tests

#### `/test/auth/token.test.ts`
- Token generation and refresh tests

#### `/test/auth/password-reset.test.ts`
- Password reset flow tests

#### `/test/middleware/auth.test.ts`
- Authentication middleware tests
- Authorization middleware tests

#### `/test/integration/auth-flow.test.ts`
- End-to-end authentication flows

### 4. Documentation (Optional)

#### `/docs/auth-flow.md`
- Authentication flow diagrams
- API endpoint documentation
- Security considerations

## API Specification

### Authentication Endpoints

#### POST /auth/register
```typescript
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123",
  "role": "user" // optional, defaults to "user"
}

Response (201):
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "user",
  "createdAt": "2026-01-18T00:00:00Z"
}

Errors:
- 400: Invalid email format
- 400: Weak password
- 409: Email already exists
```

#### POST /auth/login
```typescript
Request:
{
  "email": "user@example.com",
  "password": "SecurePass123"
}

Response (200):
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc...",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user"
  }
}

Errors:
- 401: Invalid credentials
- 429: Too many requests
```

#### POST /auth/refresh
```typescript
Request:
{
  "refreshToken": "eyJhbGc..."
}

Response (200):
{
  "accessToken": "eyJhbGc...",
  "refreshToken": "eyJhbGc..." // new refresh token
}

Errors:
- 401: Invalid or expired refresh token
```

#### POST /auth/password-reset-request
```typescript
Request:
{
  "email": "user@example.com"
}

Response (200):
{
  "message": "Password reset email sent"
  // In real app, would send email with token
  // For testing, return token in response
  "resetToken": "abc123..." // only in dev mode
}

Errors:
- 404: Email not found
```

#### POST /auth/password-reset
```typescript
Request:
{
  "resetToken": "abc123...",
  "newPassword": "NewSecurePass456"
}

Response (200):
{
  "message": "Password reset successful"
}

Errors:
- 401: Invalid or expired reset token
- 400: Weak password
```

#### GET /auth/me
```typescript
Headers:
Authorization: Bearer <accessToken>

Response (200):
{
  "id": "uuid",
  "email": "user@example.com",
  "role": "user"
}

Errors:
- 401: Missing or invalid token
```

### Admin Endpoints

#### GET /admin/users
```typescript
Headers:
Authorization: Bearer <adminAccessToken>

Response (200):
[
  {
    "id": "uuid",
    "email": "user@example.com",
    "role": "user",
    "createdAt": "2026-01-18T00:00:00Z"
  }
]

Errors:
- 401: Unauthorized
- 403: Forbidden (not admin)
```

#### DELETE /admin/users/:id
```typescript
Headers:
Authorization: Bearer <adminAccessToken>

Response (200):
{
  "message": "User deleted successfully"
}

Errors:
- 401: Unauthorized
- 403: Forbidden (not admin)
- 404: User not found
```

## Quality Criteria

### Pass Criteria
- All tests pass (100% pass rate)
- TypeScript builds with no errors (strict mode)
- Zero linting errors
- Test coverage >= 80%
- `npm run build` succeeds
- `npm audit --audit-level=high` passes

### Code Quality Standards
- Proper error handling (try-catch where needed)
- Input validation on all endpoints
- No hardcoded secrets (use environment variables)
- Consistent code formatting
- Clear function and variable names
- JSDoc comments on public functions

## Success Validation

Upon completion, verify:

1. **Build Check**
   ```bash
   npm run build
   # Should complete with exit code 0
   ```

2. **Test Check**
   ```bash
   npm test
   # Should show 100% pass rate with coverage >= 80%
   ```

3. **Lint Check**
   ```bash
   npm run lint
   # Should show 0 errors
   ```

4. **Security Check**
   ```bash
   npm audit --audit-level=high
   # Should show 0 high-severity vulnerabilities
   ```

5. **Manual API Testing**
   - Start server: `npm run dev`
   - Register a user
   - Login and receive tokens
   - Access protected route with token
   - Refresh token
   - Reset password
   - Access admin route (should fail for non-admin)

## Baseline Estimates

Based on previous similar tasks:

- **Turns**: 15 conversation turns
- **Duration**: 75 minutes
- **Tool Calls**: ~55 total
  - Read: ~15
  - Write: ~20
  - Edit: ~10
  - Bash: ~10
- **Web Searches**: ~8 (JWT best practices, bcrypt usage, Vitest setup, etc.)
- **Decisions**: ~12 (framework choice, token expiry times, password rules, etc.)

## Tips for Efficiency

1. **Start with Planning**: Define types and interfaces first
2. **Use Existing Libraries**: Don't reinvent JWT or bcrypt
3. **Test as You Build**: Write tests alongside implementation
4. **Leverage TypeScript**: Use strict typing to catch errors early
5. **Reference Documentation**: Check official docs for jsonwebtoken and bcrypt
6. **Parallel Work**: Implement independent modules concurrently where possible

## Common Pitfalls to Avoid

1. Storing passwords in plain text
2. Using weak JWT secrets
3. Not handling token expiration
4. Missing input validation
5. Inadequate error messages
6. No rate limiting on auth endpoints
7. Hardcoding configuration values
8. Insufficient test coverage
9. Using `any` type in TypeScript
10. Not testing error paths

## Extension Ideas (Optional)

If time permits, consider:

- Email verification on registration
- OAuth2 integration (Google, GitHub)
- Two-factor authentication (TOTP)
- Session management (track active sessions)
- Account lockout after failed attempts
- Audit logging for auth events
- Persistent storage (SQLite/PostgreSQL)
- API documentation with OpenAPI/Swagger

## Notes

- This task focuses on authentication fundamentals and best practices
- The in-memory storage is intentional for simplicity
- Security practices should be production-grade despite simplified storage
- Code should be easily extensible to real database
- Focus on clean architecture and separation of concerns
