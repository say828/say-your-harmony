# URL Shortener API - Problem Definition (Phase 1: Planning)

**Date**: 2026-01-18
**Task ID**: url-shortener
**Complexity**: Simple
**Domain**: Web Services / URL Management
**Meta Status**: Verification Task (Meta System Validation)
**Planner Agent**: opus

---

## Executive Summary

This is a **meta-learning system verification task**. We are building a simple URL Shortener REST API with in-memory storage to validate the QuickMeta system's ability to extract and store sequential dependencies and parallel successes from implementation patterns.

**Key Context**: This is a focused verification task designed to test specific meta-learning extraction capabilities (sequentialDeps + parallelSuccesses). The goal is to keep implementation simple while ensuring clear pattern emergence.

---

## 1. Problem Definition

### 1.1 What Problem Are We Solving?

We are building a **URL Shortener REST API** that enables:
1. Creating short URLs from long URLs
2. Retrieving URL details by short ID
3. Redirecting users from short URL to original URL
4. Tracking click/redirect counts
5. Validating URL formats (HTTP/HTTPS only)
6. Generating collision-free short IDs

### 1.2 Why Is This Important?

**For Meta-Learning System Verification**:
- Tests QuickMeta's extraction of sequential dependencies (e.g., ID generation before storage)
- Tests QuickMeta's extraction of parallel successes (e.g., independent endpoint implementations)
- Validates pattern storage in semantic JSON format
- Provides baseline for future meta-learning experiments

**For the Domain**:
- URL shorteners are fundamental web services
- ID generation is a common backend pattern
- URL validation demonstrates input sanitization patterns
- Click tracking shows analytics integration patterns

### 1.3 What Are the Constraints?

**Technical Constraints**:
- In-memory storage only (Map<string, UrlEntry>)
- TypeScript strict mode required
- Port 3000 for Express server
- Zod for all input validation
- Vitest for testing framework
- 80%+ test coverage mandatory
- 6-character alphanumeric short IDs

**Business Constraints**:
- Only HTTP and HTTPS URLs allowed
- Short IDs must be unique (collision handling required)
- Click counter must be accurate (no race conditions)
- 301 Permanent Redirect for GET /:id
- Created timestamp in ISO 8601 format

**Quality Constraints**:
- Zero TypeScript errors
- Zero ESLint errors
- 100% test pass rate
- No implicit any types

### 1.4 What Is Out of Scope?

**Explicitly Excluded**:
- Database persistence (in-memory only)
- User authentication/authorization
- Custom short ID selection (system-generated only)
- URL expiration/TTL
- Analytics dashboard
- Rate limiting
- QR code generation
- Link preview metadata
- Bulk URL creation
- Admin panel

**P2 Features (Nice-to-Have, Not Required)**:
- Custom domain support
- URL validation with HEAD request
- Duplicate URL detection (return existing short ID)
- Delete URL endpoint

---

## 2. Requirements Analysis

### 2.1 Functional Requirements (Detailed Breakdown)

#### FR-1: Shorten URL (POST /api/shorten)
- **Input**: `{ "url": "https://example.com/very/long/url" }`
- **Output**: `{ "id": "abc123", "shortUrl": "http://localhost:3000/abc123", "originalUrl": "..." }`
- **Success**: 201 Created
- **Business Logic**:
  - Validate URL format (must start with http:// or https://)
  - Generate 6-character alphanumeric short ID
  - Check for collision, regenerate if exists
  - Store UrlEntry with metadata
  - Initialize clicks to 0
  - Set createdAt to current ISO timestamp
  - Return short URL details

**Validation Rules**:
- url: required, non-empty string
- url: must match pattern `^https?://.*`
- url: max length 2048 characters (browser limit)
- url: must be valid URL format

#### FR-2: Get URL Details (GET /api/urls/:id)
- **Input**: Short ID (6-char alphanumeric)
- **Output**: `{ "id": "abc123", "shortUrl": "...", "originalUrl": "...", "clicks": 0, "createdAt": "..." }`
- **Success**: 200 OK
- **Errors**: 404 Not Found if ID doesn't exist
- **Business Logic**:
  - Validate ID format (6 chars, alphanumeric)
  - Lookup ID in storage
  - Return full UrlEntry details
  - Do NOT increment click counter (read-only)

**Validation Rules**:
- id: required, string, exactly 6 characters
- id: must match pattern `^[a-zA-Z0-9]{6}$`

#### FR-3: Redirect to Original URL (GET /:id)
- **Input**: Short ID (6-char alphanumeric)
- **Output**: 301 Redirect to original URL
- **Success**: 301 Permanent Redirect
- **Errors**: 404 Not Found if ID doesn't exist
- **Business Logic**:
  - Validate ID format
  - Lookup ID in storage
  - Increment click counter atomically
  - Send 301 redirect with Location header
  - Update UrlEntry in storage

**Validation Rules**:
- id: required, string, exactly 6 characters
- id: must match pattern `^[a-zA-Z0-9]{6}$`

### 2.2 Non-Functional Requirements

#### NFR-1: Type Safety
- TypeScript strict mode enabled
- No implicit any types
- All function signatures with explicit return types
- All interfaces properly typed
- Zod for runtime validation

#### NFR-2: Error Handling
- HTTP status codes:
  - 200 OK: Successful URL details retrieval
  - 201 Created: New short URL created
  - 301 Permanent Redirect: Successful redirection
  - 400 Bad Request: Invalid URL or ID format
  - 404 Not Found: Short ID not found
  - 500 Internal Server Error: Unexpected errors
- Structured error response format:
  ```typescript
  {
    error: string;      // Human-readable message
    code: string;       // Machine-readable code
  }
  ```

#### NFR-3: Testing Coverage
- Minimum 80% code coverage
- Test all 3 endpoints
- Test success cases
- Test error cases (validation, not found)
- Test edge cases (collision handling, URL formats)
- Use Vitest as framework
- Use supertest for HTTP endpoint testing

#### NFR-4: Code Quality
- ESLint with TypeScript plugin
- Zero ESLint errors
- Zero TypeScript compiler errors
- Consistent formatting
- JSDoc comments on public functions

---

## 3. Data Models

### 3.1 UrlEntry Interface

```typescript
interface UrlEntry {
  id: string;              // 6-char alphanumeric short ID
  shortUrl: string;        // Full short URL (http://localhost:3000/{id})
  originalUrl: string;     // Original long URL
  clicks: number;          // Redirect count (starts at 0)
  createdAt: string;       // ISO 8601 timestamp
}
```

**Field Details**:
- `id`: Generated with short ID algorithm, must be unique
- `shortUrl`: Constructed as `http://localhost:3000/{id}`
- `originalUrl`: User-provided URL, validated
- `clicks`: Incremented on each GET /:id redirect
- `createdAt`: Set once on creation, immutable

### 3.2 Storage Structure

```typescript
// In-memory storage
const urlStorage = new Map<string, UrlEntry>();

// Key: Short ID (e.g., "abc123")
// Value: UrlEntry object
```

**Storage Operations**:
- Create: `urlStorage.set(id, entry)`
- Read: `urlStorage.get(id)`
- Update: `urlStorage.set(id, updatedEntry)`
- Check Exists: `urlStorage.has(id)`

---

## 4. Business Logic Rules

### 4.1 Short ID Generation Logic

#### Rule 1: Character Set
- Allowed characters: a-z, A-Z, 0-9 (62 total)
- Character set provides 62^6 = 56.8 billion possible IDs

#### Rule 2: Generation Algorithm
```typescript
function generateShortId(): string {
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += chars[Math.floor(Math.random() * chars.length)];
  }
  return id;
}
```

#### Rule 3: Collision Handling
- Generate ID
- Check if exists in storage
- If exists: Regenerate (recursive or loop)
- If not exists: Use ID
- Maximum 10 generation attempts before error

**Decision Point for Phase 2**: Recursive vs loop implementation for collision handling.

#### Rule 4: Case Sensitivity
- IDs are case-sensitive
- "abc123" and "ABC123" are different IDs

### 4.2 URL Validation Logic

#### Rule 1: Protocol Validation
- Must start with `http://` or `https://`
- Other protocols (ftp://, file://, etc.) rejected

#### Rule 2: Format Validation
- Use Zod URL validator: `z.string().url()`
- Additional regex check: `^https?://.*`

#### Rule 3: Length Validation
- Minimum: 10 characters (e.g., "http://a.b")
- Maximum: 2048 characters (browser URL limit)

#### Rule 4: Character Validation
- Allow all valid URL characters
- No whitespace allowed
- URL encoding acceptable (e.g., %20)

### 4.3 Click Tracking Logic

#### Rule 1: Increment on Redirect Only
- GET /:id increments counter
- GET /api/urls/:id does NOT increment counter
- POST /api/shorten initializes to 0

#### Rule 2: Atomic Increment
- Read current entry
- Increment clicks field
- Write back to storage
- In-memory storage is single-threaded (atomic by default)

#### Rule 3: Counter Bounds
- Minimum: 0 (initialization)
- Maximum: Number.MAX_SAFE_INTEGER (9,007,199,254,740,991)
- No overflow handling needed

---

## 5. Edge Cases and Validation

### 5.1 Edge Cases to Handle

#### EC-1: Invalid URL Protocol
- **Scenario**: User provides `ftp://example.com`
- **Behavior**: Return 400 Bad Request
- **Error Code**: "INVALID_URL_PROTOCOL"

#### EC-2: Malformed URL
- **Scenario**: User provides `not-a-url`
- **Behavior**: Return 400 Bad Request
- **Error Code**: "INVALID_URL_FORMAT"

#### EC-3: URL Too Long
- **Scenario**: URL exceeds 2048 characters
- **Behavior**: Return 400 Bad Request
- **Error Code**: "URL_TOO_LONG"

#### EC-4: Short ID Not Found
- **Scenario**: Request for non-existent ID
- **Behavior**: Return 404 Not Found
- **Error Code**: "URL_NOT_FOUND"

#### EC-5: Invalid Short ID Format
- **Scenario**: ID contains special characters or wrong length
- **Behavior**: Return 400 Bad Request
- **Error Code**: "INVALID_SHORT_ID"

#### EC-6: Short ID Collision
- **Scenario**: Generated ID already exists
- **Behavior**: Regenerate ID (up to 10 attempts)
- **Error Code**: "ID_GENERATION_FAILED" (after 10 failures)

#### EC-7: Empty URL
- **Scenario**: User provides empty string
- **Behavior**: Return 400 Bad Request
- **Error Code**: "URL_REQUIRED"

#### EC-8: Whitespace in URL
- **Scenario**: URL contains spaces
- **Behavior**: Return 400 Bad Request
- **Error Code**: "INVALID_URL_FORMAT"

#### EC-9: Maximum Click Count
- **Scenario**: Clicks reach Number.MAX_SAFE_INTEGER
- **Behavior**: Allow overflow to Infinity (acceptable for verification)
- **Note**: Not a P0 requirement

### 5.2 Validation Schema Requirements

**Zod Schemas Needed**:

1. **ShortenRequestSchema**:
   ```typescript
   z.object({
     url: z.string().url().min(10).max(2048).regex(/^https?:\/\//)
   })
   ```

2. **ShortIdSchema**:
   ```typescript
   z.string().length(6).regex(/^[a-zA-Z0-9]{6}$/)
   ```

---

## 6. API Endpoint Specifications

### 6.1 Endpoint Summary Table

| Method | Endpoint | Description | Success | Errors |
|--------|----------|-------------|---------|--------|
| POST | /api/shorten | Create short URL | 201 | 400 |
| GET | /api/urls/:id | Get URL details | 200 | 400, 404 |
| GET | /:id | Redirect to original URL | 301 | 400, 404 |

### 6.2 Detailed Request/Response Examples

#### POST /api/shorten

**Request**:
```json
POST /api/shorten
Content-Type: application/json

{
  "url": "https://example.com/very/long/url/with/many/parameters?foo=bar&baz=qux"
}
```

**Success Response (201)**:
```json
{
  "id": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://example.com/very/long/url/with/many/parameters?foo=bar&baz=qux",
  "clicks": 0,
  "createdAt": "2026-01-18T10:30:00.000Z"
}
```

**Error Response (400)**:
```json
{
  "error": "Invalid URL format",
  "code": "INVALID_URL_FORMAT"
}
```

#### GET /api/urls/:id

**Request**:
```
GET /api/urls/abc123
```

**Success Response (200)**:
```json
{
  "id": "abc123",
  "shortUrl": "http://localhost:3000/abc123",
  "originalUrl": "https://example.com/very/long/url",
  "clicks": 42,
  "createdAt": "2026-01-18T10:30:00.000Z"
}
```

**Error Response (404)**:
```json
{
  "error": "Short URL not found",
  "code": "URL_NOT_FOUND"
}
```

#### GET /:id

**Request**:
```
GET /abc123
```

**Success Response (301)**:
```
HTTP/1.1 301 Permanent Redirect
Location: https://example.com/very/long/url
```

**Error Response (404)**:
```json
{
  "error": "Short URL not found",
  "code": "URL_NOT_FOUND"
}
```

---

## 7. Success Criteria

### 7.1 P0 (Must Have) - Blocking Issues

These must all be met for the task to be considered complete:

- [ ] **EP-1**: POST /api/shorten creates short URL with unique ID
- [ ] **EP-2**: GET /api/urls/:id returns URL details or 404
- [ ] **EP-3**: GET /:id redirects with 301 or returns 404
- [ ] **BL-1**: Short IDs are 6-char alphanumeric
- [ ] **BL-2**: Short ID collision handling works (regeneration)
- [ ] **BL-3**: URL validation accepts HTTP/HTTPS only
- [ ] **BL-4**: Click counter increments on redirect
- [ ] **BL-5**: Click counter does NOT increment on GET /api/urls/:id
- [ ] **TS-1**: TypeScript strict mode enabled, zero errors
- [ ] **VAL-1**: Zod validation on POST /api/shorten
- [ ] **VAL-2**: Zod validation on ID format for both GET endpoints
- [ ] **TEST-1**: Test coverage >= 80%
- [ ] **TEST-2**: All tests passing (100% pass rate)
- [ ] **DOC-1**: README.md with setup and API docs
- [ ] **BUILD-1**: npm run build succeeds
- [ ] **LINT-1**: npm run lint shows zero errors

### 7.2 P1 (Should Have) - High Priority

These should be implemented if time permits:

- [ ] **ERR-1**: Proper HTTP status codes for all scenarios
- [ ] **ERR-2**: Structured error responses with codes
- [ ] **VAL-3**: Comprehensive edge case validation
- [ ] **DOC-2**: JSDoc comments on public APIs
- [ ] **TEST-3**: Edge case tests (invalid URLs, collisions, not found)

### 7.3 P2 (Nice to Have) - Low Priority

These are optional enhancements:

- [ ] Duplicate URL detection (return existing short ID)
- [ ] DELETE /api/urls/:id endpoint
- [ ] URL validation with HEAD request
- [ ] Custom error messages per validation rule

### 7.4 Meta-Learning Success Criteria

For meta-system verification:

- [ ] **META-1**: QuickMeta session directory created
- [ ] **META-2**: planning.json contains sequential dependencies
- [ ] **META-3**: implementation.json contains parallel successes
- [ ] **META-4**: Semantic patterns extracted correctly
- [ ] **META-5**: All meta files < 2KB (performance goal)

---

## 8. Architecture Decisions Needed (Phase 2)

The following decisions require architect input:

### Decision 1: Collision Handling Strategy
- **Question**: Recursive or loop-based ID regeneration?
- **Options**:
  - A. Recursive (cleaner, stack depth risk)
  - B. Loop with max attempts (safer, more verbose)
- **Recommendation**: B (loop) for safety

### Decision 2: ID Generation Algorithm
- **Question**: Truly random or seeded?
- **Options**:
  - A. Math.random() (simple, non-reproducible)
  - B. Crypto.randomBytes() (secure, overkill)
- **Recommendation**: A (Math.random()) for simplicity

### Decision 3: Storage Structure
- **Question**: Map vs Array?
- **Options**:
  - A. Map<string, UrlEntry> (O(1) lookup)
  - B. Array with .find() (O(n) lookup)
- **Recommendation**: A (Map) for performance

### Decision 4: Click Counter Atomicity
- **Question**: Read-modify-write vs functional update?
- **Options**:
  - A. Read, increment, write (3 steps)
  - B. Functional update with spread (1 step)
- **Recommendation**: A for clarity (in-memory is atomic)

### Decision 5: URL Normalization
- **Question**: Should we normalize URLs (e.g., trailing slash)?
- **Options**:
  - A. Store as-is
  - B. Normalize before storage
- **Recommendation**: A (as-is) for simplicity

---

## 9. File Structure and Organization

### 9.1 Recommended Directory Structure

```
url-shortener/
├── src/
│   ├── server.ts                 # Express server setup
│   ├── types/
│   │   └── url.ts                # TypeScript interfaces
│   ├── validators/
│   │   └── url.ts                # Zod schemas
│   ├── storage/
│   │   └── url.ts                # In-memory Map storage
│   ├── services/
│   │   ├── id-generator.ts       # Short ID generation
│   │   └── url-validator.ts      # URL validation logic
│   └── routes/
│       └── url.ts                # Express route handlers
├── tests/
│   └── url.test.ts               # Comprehensive test suite
├── package.json
├── tsconfig.json
├── .eslintrc.json
├── vitest.config.ts
└── README.md
```

### 9.2 Module Responsibilities

**server.ts**:
- Initialize Express app
- Configure middleware (json parser, error handler)
- Register routes
- Start server on port 3000

**types/url.ts**:
- Export UrlEntry interface
- Export request/response types

**validators/url.ts**:
- Zod schemas for all endpoints
- Export validation functions

**storage/url.ts**:
- Map-based URL storage
- CRUD operations: create, get, update
- Export storage functions

**services/id-generator.ts**:
- Short ID generation algorithm
- Collision detection and handling
- Export generateUniqueShortId(storage)

**services/url-validator.ts**:
- URL format validation
- Protocol validation
- Export validateUrl(url)

**routes/url.ts**:
- Express Router with all 3 endpoints
- Request validation using Zod
- Business logic coordination
- Response formatting

---

## 10. Dependencies and Setup

### 10.1 Production Dependencies

```json
{
  "express": "^4.18.2",
  "zod": "^3.22.4"
}
```

### 10.2 Development Dependencies

```json
{
  "typescript": "^5.3.3",
  "tsx": "^4.7.0",
  "vitest": "^1.2.0",
  "@types/express": "^4.17.21",
  "@types/node": "^20.11.0",
  "eslint": "^8.56.0",
  "@typescript-eslint/parser": "^6.19.0",
  "@typescript-eslint/eslint-plugin": "^6.19.0",
  "supertest": "^6.3.4",
  "@types/supertest": "^6.0.2"
}
```

### 10.3 NPM Scripts

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

### 10.4 TypeScript Configuration (tsconfig.json)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "NodeNext",
    "moduleResolution": "NodeNext",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## 11. Testing Strategy

### 11.1 Test Categories

#### Unit Tests
- ID generation service (collision handling)
- URL validation service
- Storage operations (get, set)

#### Integration Tests
- All 3 API endpoints
- Request validation with invalid inputs
- Error handling and status codes

#### Edge Case Tests
- Invalid URL formats (no protocol, ftp://, malformed)
- Invalid ID formats (wrong length, special chars)
- Short ID not found (404)
- ID collision handling (regeneration)
- Click counter increment accuracy

### 11.2 Test Coverage Goals

- Overall: >= 80%
- Routes: >= 90% (critical path)
- Services: >= 85%
- Storage: >= 75%

### 11.3 Test Organization

```typescript
describe('URL Shortener API', () => {
  describe('POST /api/shorten', () => {
    it('should create short URL with 6-char ID', async () => {});
    it('should return 201 status', async () => {});
    it('should validate HTTP/HTTPS protocol', async () => {});
    it('should reject FTP URLs', async () => {});
    it('should handle ID collisions', async () => {});
  });

  describe('GET /api/urls/:id', () => {
    it('should return URL details', async () => {});
    it('should not increment click counter', async () => {});
    it('should return 404 for non-existent ID', async () => {});
    it('should validate ID format', async () => {});
  });

  describe('GET /:id', () => {
    it('should redirect with 301', async () => {});
    it('should increment click counter', async () => {});
    it('should return 404 for non-existent ID', async () => {});
  });
});

describe('ID Generator Service', () => {
  it('should generate 6-char alphanumeric ID', () => {});
  it('should handle collisions with regeneration', () => {});
  it('should fail after 10 collision attempts', () => {});
});

describe('URL Validator Service', () => {
  it('should accept HTTP URLs', () => {});
  it('should accept HTTPS URLs', () => {});
  it('should reject FTP URLs', () => {});
  it('should reject malformed URLs', () => {});
});
```

---

## 12. Risk Analysis

### 12.1 P0 Risks (Critical - Block Implementation)

| Risk | Description | Mitigation | Owner |
|------|-------------|------------|-------|
| **R-P0-1** | Infinite loop in collision handling | Implement max attempts limit (10) | Builder |
| **R-P0-2** | Race condition in click counter | Document that in-memory is single-threaded | Architect |
| **R-P0-3** | URL validation bypass | Use Zod URL validator + regex check | Builder |

### 12.2 P1 Risks (High - Address Before Completion)

| Risk | Description | Mitigation | Owner |
|------|-------------|------------|-------|
| **R-P1-1** | Test coverage < 80% | Write tests alongside implementation | Builder |
| **R-P1-2** | ID collision probability | Use 62^6 character space (56B IDs) | Architect |

### 12.3 P2 Risks (Medium - Monitor)

| Risk | Description | Mitigation | Owner |
|------|-------------|------------|-------|
| **R-P2-1** | Non-cryptographic randomness | Acceptable for verification task | Architect |

---

## 13. Implementation Phases (For Phase 3 Guidance)

### Phase 3A: Foundation (Est. 5 min)
1. Initialize npm project
2. Install dependencies
3. Configure TypeScript (strict mode)
4. Configure ESLint
5. Create directory structure
6. Define types in types/url.ts

### Phase 3B: Storage and Services (Est. 5-7 min)
1. Implement URL storage (Map-based)
2. Implement ID generator service
3. Implement URL validator service

### Phase 3C: Validation Layer (Est. 3-5 min)
1. Create Zod schemas for endpoints
2. Export validation functions

### Phase 3D: API Routes (Est. 8-10 min)
1. Implement POST /api/shorten
2. Implement GET /api/urls/:id
3. Implement GET /:id

### Phase 3E: Testing (Est. 10-15 min)
1. Test URL shortening endpoint
2. Test URL details endpoint
3. Test redirect endpoint
4. Test edge cases (validation, not found, collisions)
5. Run coverage report

### Phase 3F: Documentation (Est. 3-5 min)
1. Write README.md
2. Add JSDoc comments
3. Create example curl commands

**Total Estimated Time**: 34-47 minutes (within 5-7 minute range for simple task)

---

## 14. Meta-Learning Verification Goals

### 14.1 Sequential Dependencies to Extract

This task should demonstrate clear sequential dependencies:

1. **ID Generation → Storage**: ID must be generated before entry can be stored
2. **Validation → Storage**: URL must be validated before creating entry
3. **Storage → Response**: Entry must be stored before returning response
4. **Lookup → Increment**: Entry must be found before incrementing clicks
5. **Increment → Redirect**: Clicks must be incremented before sending redirect

### 14.2 Parallel Successes to Extract

This task should demonstrate parallel implementation opportunities:

1. **Independent Endpoints**: All 3 endpoints can be implemented in parallel
2. **Independent Services**: ID generator and URL validator are independent
3. **Independent Tests**: Test suites for each endpoint can run in parallel

### 14.3 Pattern Categories Expected

**Sequential Patterns**:
- Data validation before persistence
- Collision detection before commitment
- State update before response

**Parallel Patterns**:
- Independent endpoint implementations
- Independent service modules
- Independent test suites

---

## 15. Handoff to Phase 2 (Design)

### 15.1 Architect Checklist

The architect (Phase 2) should address:

- [ ] Decide collision handling strategy (recursive vs loop)
- [ ] Decide ID generation algorithm (random vs crypto)
- [ ] Design storage structure (Map confirmed)
- [ ] Design click counter update mechanism
- [ ] Design URL normalization approach
- [ ] Document all architectural decisions with rationale
- [ ] Create tradeoff analysis for key decisions
- [ ] Specify module interfaces and dependencies

### 15.2 Open Questions for Architect

1. Should we allow duplicate URLs (create new ID each time)?
2. Should redirect endpoint check for URL validity on redirect?
3. Should we log/track creation timestamps for analytics?
4. How should we handle URL encoding in original URLs?

### 15.3 Success Criteria for Phase 2

Phase 2 (Design) is complete when:

- [ ] All Decision Points from Section 8 are resolved
- [ ] Architecture diagram created (module dependencies)
- [ ] All interfaces documented with contracts
- [ ] Tradeoff analysis documented for key decisions
- [ ] Risk analysis reviewed and updated
- [ ] Implementation plan validated against time estimates

---

## 16. Appendix

### 16.1 Example Request/Response Flows

**Flow 1: Create and Access Short URL**
```
1. POST /api/shorten
   Body: { url: "https://example.com/very/long/url" }
   → 201 Created
   {
     "id": "abc123",
     "shortUrl": "http://localhost:3000/abc123",
     "originalUrl": "https://example.com/very/long/url",
     "clicks": 0,
     "createdAt": "2026-01-18T10:30:00.000Z"
   }

2. GET /abc123
   → 301 Permanent Redirect
   Location: https://example.com/very/long/url
   (clicks incremented to 1)

3. GET /api/urls/abc123
   → 200 OK
   {
     "id": "abc123",
     "shortUrl": "http://localhost:3000/abc123",
     "originalUrl": "https://example.com/very/long/url",
     "clicks": 1,
     "createdAt": "2026-01-18T10:30:00.000Z"
   }
```

### 16.2 Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| URL_NOT_FOUND | 404 | Short ID doesn't exist |
| INVALID_URL_PROTOCOL | 400 | URL not HTTP/HTTPS |
| INVALID_URL_FORMAT | 400 | Malformed URL |
| URL_TOO_LONG | 400 | URL exceeds 2048 chars |
| URL_REQUIRED | 400 | Empty URL provided |
| INVALID_SHORT_ID | 400 | ID format invalid |
| ID_GENERATION_FAILED | 500 | Max collision attempts exceeded |

### 16.3 ID Generation Examples

**Valid IDs**:
- `abc123`
- `XyZ789`
- `A1b2C3`
- `zZzZzZ`

**Invalid IDs**:
- `abc12` (too short)
- `abc1234` (too long)
- `abc-123` (contains hyphen)
- `abc 123` (contains space)

---

## Document Status

**Status**: PLANNING COMPLETE
**Version**: 1.0
**Date**: 2026-01-18
**Next Phase**: Phase 2 - Design (Architect)
**Estimated Phase 2 Duration**: 5-8 minutes
**Estimated Total Time**: 5-7 minutes (simple task)

---

## Approval

This problem definition is comprehensive and ready for Phase 2 (Design).

**Key Achievements**:
- Problem clearly defined
- All 3 endpoints specified
- Business rules documented (ID generation, validation, click tracking)
- Edge cases identified
- Data models defined
- Success criteria established
- Risks analyzed
- Meta-learning verification goals documented

**Phase 1 Complete**: ✅
