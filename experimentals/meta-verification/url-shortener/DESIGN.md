# URL Shortener API - Architecture Design

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     Express.js Server                    │
│                      (Port 3000)                         │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌──────────────────┐  ┌──────────────────┐            │
│  │  Routes Layer    │  │  Validation      │            │
│  │                  │  │  (Zod schemas)   │            │
│  │  POST /shorten   │──│                  │            │
│  │  GET /:id        │  │  - URL format    │            │
│  │  GET /urls/:id   │  │  - ID format     │            │
│  └────────┬─────────┘  └──────────────────┘            │
│           │                                              │
│  ┌────────▼─────────────────────────────────┐           │
│  │       Service Layer                      │           │
│  │  - createShortUrl()                      │           │
│  │  - getUrlById()                          │           │
│  │  - incrementClickCount()                 │           │
│  └────────┬─────────────────────────────────┘           │
│           │                                              │
│  ┌────────▼─────────────────────────────────┐           │
│  │       Storage Layer (In-Memory)          │           │
│  │  Map<string, UrlRecord>                  │           │
│  │  - shortId -> { longUrl, clicks, ... }   │           │
│  └──────────────────────────────────────────┘           │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

## Key Architectural Decisions

### Decision 1: Map-Based In-Memory Storage

**What**: Use `Map<string, UrlRecord>` for storage instead of object literals or external DB

**Why**:
- Requirement specifies in-memory storage
- Map provides O(1) lookups by short ID
- Type-safe with TypeScript
- No external dependencies required
- Simplifies testing and verification

**Impact**: HIGH
- Trade-off: Data lost on restart (acceptable for demo/verification)
- Benefit: Zero infrastructure setup, instant startup

**Alternatives Considered**:
1. Plain object: Less type-safe, no built-in size(), harder to iterate
2. Redis: Violates in-memory requirement, adds external dependency
3. SQLite: Overkill for verification task, adds persistence we don't need

---

### Decision 2: 6-Character Alphanumeric ID Generation

**What**: Use `crypto.randomBytes()` → base62 encoding → 6 chars

**Why**:
- Cryptographically secure random IDs (prevents enumeration attacks)
- Base62 (A-Z, a-z, 0-9) = 62^6 = 56 billion combinations
- Collision probability ~0% for demo scale
- URL-safe characters only

**Impact**: HIGH

**Implementation**:
```typescript
function generateShortId(): string {
  const bytes = crypto.randomBytes(6);
  const base62 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += base62[bytes[i] % 62];
  }
  return id;
}
```

**Alternatives Considered**:
1. UUID: Too long (36 chars), defeats "short" URL purpose
2. Sequential IDs: Predictable, enumeration risk, not scalable
3. Hash-based (MD5/SHA): Longer output, requires truncation (collision risk)

---

### Decision 3: Zod Validation Layer

**What**: Use Zod for request validation with strict schemas

**Why**:
- Type-safe validation with TypeScript inference
- Clear error messages for API consumers
- Requirement explicitly calls for Zod
- Validates URL format, ID format, request bodies

**Impact**: MEDIUM

**Schemas**:
```typescript
const CreateShortUrlSchema = z.object({
  url: z.string().url()
});

const ShortIdSchema = z.object({
  id: z.string().regex(/^[A-Za-z0-9]{6}$/)
});
```

**Alternatives Considered**:
1. Manual validation: Error-prone, verbose, no type inference
2. Joi: Similar but less TypeScript integration
3. Class-validator: Requires decorators, more boilerplate

---

### Decision 4: 301 Permanent Redirect for /:id

**What**: Use HTTP 301 (Moved Permanently) for short URL redirects

**Why**:
- Requirement explicitly specifies 301
- SEO-friendly (search engines update their indexes)
- Browser caching reduces load (trade-off: analytics may be delayed)

**Impact**: MEDIUM

**Trade-off Analysis**:
- 301 vs 302 (Temporary): 301 allows caching, 302 forces fresh requests
- For URL shortener: 301 is correct (URLs don't change destinations)
- Analytics impact: Cached redirects bypass server (acceptable for demo)

**Alternatives Considered**:
1. 302 Redirect: Better for analytics, but requirement says 301
2. 307 Redirect: Preserves HTTP method, unnecessary for GET

---

### Decision 5: Project Structure (Layered Architecture)

**What**: Separate routes, services, storage, validation into distinct modules

**Why**:
- Testability: Each layer can be unit tested independently
- Maintainability: Clear separation of concerns
- Scalability: Easy to replace storage layer later
- Follows Express.js best practices

**Impact**: MEDIUM

**Structure**:
```
url-shortener/
├── src/
│   ├── server.ts          # Express app setup
│   ├── routes/
│   │   └── url.routes.ts  # Route handlers
│   ├── services/
│   │   └── url.service.ts # Business logic
│   ├── storage/
│   │   └── url.storage.ts # In-memory Map
│   ├── validation/
│   │   └── schemas.ts     # Zod schemas
│   └── types/
│       └── index.ts       # TypeScript types
├── tests/
│   ├── url.routes.test.ts
│   ├── url.service.test.ts
│   └── url.storage.test.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

**Alternatives Considered**:
1. Single-file implementation: Hard to test, violates SRP
2. Feature-based folders: Overkill for 3-endpoint API
3. Hexagonal architecture: Over-engineered for verification task

---

## Data Model

### UrlRecord Interface

```typescript
interface UrlRecord {
  id: string;           // 6-char short ID
  longUrl: string;      // Original URL
  createdAt: Date;      // Timestamp of creation
  clicks: number;       // Click counter (for analytics)
}
```

### Storage Type

```typescript
type UrlStorage = Map<string, UrlRecord>;
```

---

## API Specification

### 1. POST /api/shorten

**Request**:
```json
{
  "url": "https://example.com/very/long/path"
}
```

**Response** (201 Created):
```json
{
  "id": "aB3xY9",
  "shortUrl": "http://localhost:3000/aB3xY9",
  "longUrl": "https://example.com/very/long/path"
}
```

**Validation**:
- `url` must be valid URL format (Zod schema)

**Errors**:
- 400 Bad Request: Invalid URL format
- 500 Internal Server Error: ID collision (retry logic)

---

### 2. GET /api/urls/:id

**Response** (200 OK):
```json
{
  "id": "aB3xY9",
  "longUrl": "https://example.com/very/long/path",
  "clicks": 42,
  "createdAt": "2026-01-18T14:30:00.000Z"
}
```

**Errors**:
- 404 Not Found: ID doesn't exist

---

### 3. GET /:id

**Response**: 301 Redirect to `longUrl`

**Headers**:
```
HTTP/1.1 301 Moved Permanently
Location: https://example.com/very/long/path
```

**Side Effect**: Increment `clicks` counter atomically

**Errors**:
- 404 Not Found: ID doesn't exist

---

## Risk Analysis

### P0 Risks (Must Fix Before Operation)

1. **ID Collision Handling**
   - Risk: Two random IDs collide (probability ~0% but possible)
   - Mitigation: Retry generation up to 5 times, throw error if all fail
   - Status: PLANNED

2. **URL Validation Bypass**
   - Risk: Malicious URLs (XSS, open redirects) stored
   - Mitigation: Zod validates URL format, no user input in redirect response
   - Status: PLANNED

### P1 Risks (Should Fix)

1. **No Rate Limiting**
   - Risk: DoS via spam requests
   - Mitigation: Out of scope for verification task
   - Status: ACCEPTED (documented limitation)

2. **No Persistence**
   - Risk: Data loss on restart
   - Mitigation: In-memory requirement, acceptable trade-off
   - Status: ACCEPTED (by design)

### P2 Risks (Nice to Have)

1. **No URL Expiration**
   - Risk: Unbounded memory growth
   - Mitigation: Add TTL in future iteration
   - Status: DEFERRED

2. **No Analytics Beyond Clicks**
   - Risk: Limited insights
   - Mitigation: Out of scope
   - Status: DEFERRED

### P3 Risks (Low Priority)

1. **No HTTPS Enforcement**
   - Risk: HTTP short URLs less secure
   - Mitigation: Deployment concern, not dev concern
   - Status: ACKNOWLEDGED

---

## Testing Strategy

### Unit Tests (70% of coverage)

1. **Storage Layer** (`url.storage.test.ts`)
   - Test Map CRUD operations
   - Test ID collision handling
   - Test atomic click increments

2. **Service Layer** (`url.service.test.ts`)
   - Test ID generation (uniqueness)
   - Test URL creation logic
   - Test URL retrieval and click tracking

3. **Validation** (`schemas.test.ts`)
   - Test valid URLs accepted
   - Test invalid URLs rejected
   - Test ID format validation

### Integration Tests (30% of coverage)

1. **Routes** (`url.routes.test.ts`)
   - Test POST /api/shorten → 201 response
   - Test GET /api/urls/:id → 200 with data
   - Test GET /:id → 301 redirect + click increment
   - Test 404 errors for missing IDs

**Coverage Target**: 80%+ (requirement)

**Test Framework**: Vitest (requirement)

---

## TypeScript Configuration

### tsconfig.json (Strict Mode)

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "lib": ["ES2022"],
    "moduleResolution": "node",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,              // ✅ STRICT MODE
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

**Strict Mode Flags** (all enabled):
- `strictNullChecks`: true
- `strictFunctionTypes`: true
- `strictBindCallApply`: true
- `strictPropertyInitialization`: true
- `noImplicitAny`: true
- `noImplicitThis`: true

---

## Dependencies

### Production

```json
{
  "express": "^4.18.2",
  "zod": "^3.22.4"
}
```

### Development

```json
{
  "typescript": "^5.3.3",
  "vitest": "^1.1.0",
  "@types/node": "^20.10.6",
  "@types/express": "^4.17.21",
  "supertest": "^6.3.3",
  "@types/supertest": "^6.0.2"
}
```

---

## Meta-Learning Verification Points

After each phase, the system should extract:

1. **Planning Phase**:
   - `sequentialDeps`: [] (no dependencies, first phase)
   - `parallelSuccesses`: [] (information gathering)

2. **Design Phase** (this phase):
   - `sequentialDeps`: ["requirements-gathered", "problem-defined"]
   - `parallelSuccesses`: [] (sequential design decisions)

3. **Implementation Phase**:
   - `sequentialDeps`: ["architecture-designed", "dependencies-installed"]
   - `parallelSuccesses`: ["routes-impl", "services-impl", "storage-impl", "validation-impl", "tests-impl"] (parallel file creation)

4. **Operation Phase**:
   - `sequentialDeps`: ["tests-passed", "build-succeeded"]
   - `parallelSuccesses`: [] (sequential verification)

---

## Next Phase Handoff

**Ready For**: Implementation phase can now create:
- TypeScript project structure
- 5 core modules (routes, services, storage, validation, types)
- Test files for each module
- Configuration files (package.json, tsconfig.json, vitest.config.ts)

**Blockers**: None

**Critical Context**:
- Map-based storage requires atomic operations for click counter
- ID collision retry logic must be in service layer (5 attempts max)
- All validation happens at route layer using Zod
- Tests must achieve 80%+ coverage before Operation phase
