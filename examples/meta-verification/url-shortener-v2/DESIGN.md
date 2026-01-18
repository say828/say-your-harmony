# URL Shortener API v2 - Architecture Design (Phase 2)

**Date**: 2026-01-19
**Task ID**: url-shortener-v2
**Architect**: Claude Opus 4.5

---

## Architecture Overview

```
+--------------------------------------------------+
|              Express.js Server                    |
|                (Port 3000)                        |
+--------------------------------------------------+
|                                                   |
|  +-----------------+  +----------------------+   |
|  |  Routes Layer   |  |  Validation (Zod)    |   |
|  |                 |--+                      |   |
|  |  POST /shorten  |  |  - ShortenSchema     |   |
|  |  GET /urls/:id  |  |  - ShortIdSchema     |   |
|  |  GET /:id       |  |                      |   |
|  +--------+--------+  +----------------------+   |
|           |                                       |
|  +--------v------------------------------------+ |
|  |           Service Layer                     | |
|  |  - createShortUrl(url)                      | |
|  |  - getUrlById(id)                           | |
|  |  - redirectAndIncrement(id)                 | |
|  +--------+------------------------------------+ |
|           |                                       |
|  +--------v------------------------------------+ |
|  |           Storage Layer                     | |
|  |  Map<string, UrlEntry>                      | |
|  +---------------------------------------------+ |
+--------------------------------------------------+
```

---

## Architectural Decisions

### Decision 1: Map-Based In-Memory Storage

**What**: Use `Map<string, UrlEntry>` for storage

**Why**:
- Requirement specifies in-memory storage
- O(1) lookup by short ID
- Type-safe with TypeScript
- No external dependencies

**Alternatives Considered**:
1. Plain object: Less type-safe
2. Redis: Adds external dependency
3. SQLite: Overkill for verification

**Impact**: HIGH

---

### Decision 2: 6-Character Alphanumeric ID Generation

**What**: Use Math.random() with base62 charset for 6-char IDs

**Why**:
- Simple implementation
- 62^6 = 56 billion combinations
- URL-safe characters only
- Collision probability ~0% at demo scale

**Implementation**:
```typescript
const CHARSET = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

function generateShortId(): string {
  let id = '';
  for (let i = 0; i < 6; i++) {
    id += CHARSET[Math.floor(Math.random() * 62)];
  }
  return id;
}
```

**Alternatives Considered**:
1. crypto.randomBytes: Overkill for demo
2. UUID: Too long
3. Sequential: Predictable

**Impact**: HIGH

---

### Decision 3: Collision Handling (Loop with Max Attempts)

**What**: Loop-based regeneration with 10 max attempts

**Why**:
- Prevents infinite loops
- Clear error handling
- Simple implementation

**Implementation**:
```typescript
function generateUniqueId(storage: Map<string, UrlEntry>): string {
  for (let attempt = 0; attempt < 10; attempt++) {
    const id = generateShortId();
    if (!storage.has(id)) return id;
  }
  throw new Error('Failed to generate unique ID after 10 attempts');
}
```

**Impact**: HIGH (P0 risk mitigation)

---

### Decision 4: Zod Validation Layer

**What**: Use Zod for all input validation

**Why**:
- Requirement explicitly specifies Zod
- Type-safe validation with TypeScript inference
- Clear error messages

**Schemas**:
```typescript
const ShortenSchema = z.object({
  url: z.string().url().regex(/^https?:\/\//)
});

const ShortIdSchema = z.string().length(6).regex(/^[A-Za-z0-9]{6}$/);
```

**Impact**: MEDIUM

---

### Decision 5: Layered Project Structure

**What**: Separate types, storage, services, and main server

**Why**:
- Testability
- Clear separation of concerns
- Follows Express.js best practices

**Structure**:
```
url-shortener-v2/
├── src/
│   ├── index.ts           # Express server + routes
│   ├── types/
│   │   └── index.ts       # TypeScript interfaces
│   ├── storage/
│   │   └── url.storage.ts # In-memory Map
│   └── services/
│       └── url.service.ts # Business logic + ID generation
├── tests/
│   ├── url.storage.test.ts
│   ├── url.service.test.ts
│   └── api.test.ts
├── package.json
├── tsconfig.json
└── vitest.config.ts
```

**Impact**: MEDIUM

---

## Risk Analysis

### P0 Risks (Must Fix)

| Risk | Description | Mitigation |
|------|-------------|------------|
| R-P0-1 | Infinite loop in collision handling | Max 10 attempts |
| R-P0-2 | URL validation bypass | Zod + regex validation |

### P1 Risks (Should Fix)

| Risk | Description | Mitigation |
|------|-------------|------------|
| R-P1-1 | Data loss on restart | Documented limitation |

---

## Meta-Learning Verification Points

**Sequential Dependencies** (for Phase 2):
- requirements-gathered (from Phase 1)
- architecture-approved (before implementation)

**Parallel Successes** (expected in Phase 3):
- types + storage + services files (independent)
- test files (independent)

---

## Handoff to Phase 3

**Ready for Implementation**:
- Architecture defined
- All decisions documented with rationale
- File structure specified
- Risks identified

**Phase 2 Complete**: Ready for Phase 3 (Implementation)
