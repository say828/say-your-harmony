# Task: Simple REST API with CRUD Operations

**Task ID**: `simple-rest-api`
**Complexity**: Simple
**Domain**: REST API
**Estimated Duration**: 20-30 minutes (baseline, no meta-analysis)

---

## Overview

Build a basic REST API that provides CRUD (Create, Read, Update, Delete) operations for managing notes. The API should be implemented in TypeScript with proper type safety, validation, and testing.

---

## Requirements

### 1. Functional Requirements

#### API Endpoints

Implement the following RESTful endpoints:

1. **GET /api/notes**
   - Returns all notes
   - Response: `200 OK` with array of notes
   - Empty array if no notes exist

2. **GET /api/notes/:id**
   - Returns a single note by ID
   - Response: `200 OK` with note object
   - Response: `404 Not Found` if note doesn't exist

3. **POST /api/notes**
   - Creates a new note
   - Request body: `{ title: string, content: string }`
   - Response: `201 Created` with created note (including generated ID)
   - Response: `400 Bad Request` if validation fails

4. **PUT /api/notes/:id**
   - Updates an existing note
   - Request body: `{ title?: string, content?: string }`
   - Response: `200 OK` with updated note
   - Response: `404 Not Found` if note doesn't exist
   - Response: `400 Bad Request` if validation fails

5. **DELETE /api/notes/:id**
   - Deletes a note by ID
   - Response: `204 No Content` on success
   - Response: `404 Not Found` if note doesn't exist

#### Data Model

```typescript
interface Note {
  id: string;           // UUID v4
  title: string;        // Max 200 characters, required
  content: string;      // Max 5000 characters, required
  createdAt: string;    // ISO 8601 timestamp
  updatedAt: string;    // ISO 8601 timestamp
}
```

#### Storage

- Use in-memory storage (simple object or Map)
- No database required
- Data persists only during application runtime

### 2. Technical Requirements

#### TypeScript Configuration

- Use TypeScript strict mode
- No implicit any types
- All functions must have explicit return types
- All interfaces must be properly typed

#### Input Validation

Use Zod for request validation:
- Title: required, string, 1-200 characters
- Content: required, string, 1-5000 characters
- Validate all incoming requests before processing

#### Error Handling

- Proper HTTP status codes for all scenarios
- Structured error responses:
  ```typescript
  {
    error: string;      // Error message
    code: string;       // Error code (e.g., "VALIDATION_ERROR")
    details?: any;      // Additional details (e.g., Zod validation errors)
  }
  ```

#### Framework

- Express.js for HTTP server
- Port: 3000 (configurable via environment variable)

### 3. Quality Requirements

#### Testing

- Minimum 80% test coverage
- Use Vitest as testing framework
- Test all endpoints with:
  - Success cases
  - Error cases (validation failures, not found, etc.)
  - Edge cases (empty strings, max length, etc.)

#### Code Quality

- ESLint configuration with TypeScript rules
- Zero ESLint errors
- Zero TypeScript errors
- Consistent code formatting (Prettier recommended)

#### Documentation

- README.md with:
  - Setup instructions
  - Running the server
  - API endpoint documentation
  - Testing instructions
- JSDoc comments for all public functions and interfaces

---

## Deliverables

### Required Files

1. **src/server.ts** - Main server setup and Express configuration
2. **src/routes/notes.ts** - Notes API route handlers
3. **src/types/note.ts** - TypeScript interfaces for Note model
4. **src/validators/note.ts** - Zod schemas for validation
5. **src/storage/notes.ts** - In-memory storage implementation
6. **tests/notes.test.ts** - Comprehensive test suite
7. **package.json** - Dependencies and scripts
8. **tsconfig.json** - TypeScript configuration
9. **.eslintrc.json** - ESLint configuration
10. **README.md** - Documentation

### NPM Scripts

```json
{
  "scripts": {
    "dev": "tsx watch src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js",
    "test": "vitest",
    "test:coverage": "vitest --coverage",
    "lint": "eslint src tests",
    "type-check": "tsc --noEmit"
  }
}
```

---

## Success Criteria

### Must Have (P0)

- [ ] All 5 endpoints implemented and working
- [ ] TypeScript strict mode enabled with zero errors
- [ ] Zod validation on all inputs
- [ ] Test coverage >= 80%
- [ ] All tests passing
- [ ] README with complete API documentation

### Should Have (P1)

- [ ] Proper HTTP status codes for all scenarios
- [ ] Structured error responses
- [ ] ESLint configured and zero errors
- [ ] JSDoc comments on public APIs

### Nice to Have (P2)

- [ ] Request/response logging middleware
- [ ] CORS configuration
- [ ] Environment variable support (.env file)

---

## Example Usage

### Create a Note

```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Note", "content": "This is the content"}'
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "My First Note",
  "content": "This is the content",
  "createdAt": "2026-01-18T15:30:00.000Z",
  "updatedAt": "2026-01-18T15:30:00.000Z"
}
```

### Get All Notes

```bash
curl http://localhost:3000/api/notes
```

Response:
```json
[
  {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "title": "My First Note",
    "content": "This is the content",
    "createdAt": "2026-01-18T15:30:00.000Z",
    "updatedAt": "2026-01-18T15:30:00.000Z"
  }
]
```

### Update a Note

```bash
curl -X PUT http://localhost:3000/api/notes/550e8400-e29b-41d4-a716-446655440000 \
  -H "Content-Type: application/json" \
  -d '{"title": "Updated Title"}'
```

### Delete a Note

```bash
curl -X DELETE http://localhost:3000/api/notes/550e8400-e29b-41d4-a716-446655440000
```

---

## Testing Guidelines

### Required Test Cases

1. **GET /api/notes**
   - Returns empty array initially
   - Returns all notes after creation

2. **GET /api/notes/:id**
   - Returns note when it exists
   - Returns 404 when note doesn't exist

3. **POST /api/notes**
   - Creates note with valid data
   - Returns 400 with missing title
   - Returns 400 with missing content
   - Returns 400 with title too long (>200 chars)
   - Returns 400 with content too long (>5000 chars)
   - Generates unique ID for each note
   - Sets createdAt and updatedAt timestamps

4. **PUT /api/notes/:id**
   - Updates note with valid data
   - Returns 404 when note doesn't exist
   - Returns 400 with invalid data
   - Updates updatedAt timestamp
   - Allows partial updates (only title or only content)

5. **DELETE /api/notes/:id**
   - Deletes existing note
   - Returns 404 when note doesn't exist
   - Actually removes note from storage

---

## Dependencies

### Required

```json
{
  "express": "^4.18.2",
  "zod": "^3.22.4",
  "uuid": "^9.0.1"
}
```

### DevDependencies

```json
{
  "typescript": "^5.3.3",
  "tsx": "^4.7.0",
  "vitest": "^1.2.0",
  "@types/express": "^4.17.21",
  "@types/uuid": "^9.0.7",
  "@types/node": "^20.11.0",
  "eslint": "^8.56.0",
  "@typescript-eslint/parser": "^6.19.0",
  "@typescript-eslint/eslint-plugin": "^6.19.0",
  "supertest": "^6.3.4",
  "@types/supertest": "^6.0.2"
}
```

---

## Tips for Implementation

1. **Start with types** - Define the Note interface first
2. **Implement storage** - Simple Map-based storage is sufficient
3. **Add validation** - Set up Zod schemas before route handlers
4. **Build routes incrementally** - Start with GET, then POST, then PUT/DELETE
5. **Test as you go** - Write tests alongside implementation
6. **Use middleware** - Express middleware for error handling and JSON parsing

---

## Common Pitfalls to Avoid

1. **Forgetting to parse JSON** - Use `express.json()` middleware
2. **Not validating UUIDs** - Ensure ID parameters are valid UUIDs
3. **Mutation issues** - Return copies of notes, not direct references
4. **Missing error handling** - Always handle validation errors from Zod
5. **Inconsistent timestamps** - Use `new Date().toISOString()` for consistency
6. **Not testing edge cases** - Test boundary conditions (empty strings, max lengths)

---

## Time Estimates

| Phase | Estimated Time |
|-------|---------------|
| Setup (package.json, tsconfig) | 3-5 min |
| Types and storage | 5 min |
| Validation schemas | 5 min |
| Route handlers | 10 min |
| Tests | 10-15 min |
| Documentation | 5 min |
| **Total (baseline)** | **38-45 min** |
| **Total (with meta)** | **25-30 min** |

---

**Expected Efficiency Gain with Meta-Analysis**: 30-35% reduction in time and turns through:
- Pre-existing knowledge of Express/Zod patterns
- Reuse of validation strategies
- Established testing patterns
- No web searches for basic setup
