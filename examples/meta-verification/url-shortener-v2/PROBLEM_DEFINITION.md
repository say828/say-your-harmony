# URL Shortener API v2 - Problem Definition (Phase 1: Planning)

**Date**: 2026-01-19
**Task ID**: url-shortener-v2
**Session Purpose**: Meta-Learning Pattern Accumulation Test (2nd Session)
**Complexity**: Simple
**Domain**: Web Services / URL Management

---

## Executive Summary

This is the **2nd test session** for meta-learning pattern accumulation verification. We are building a URL Shortener REST API with identical requirements to validate that:

1. Pattern frequencies increase when similar patterns occur
2. Confidence scores improve with repeated occurrences
3. Sequential dependencies accumulate across sessions
4. Parallel successes accumulate across sessions

**Key Context**: Building on patterns from hello-api session (2026-01-18).

---

## 1. Problem Definition

### 1.1 What Problem Are We Solving?

Building a URL Shortener REST API with:
- POST /api/shorten - Create short URL from long URL
- GET /api/urls/:id - Retrieve URL details by short ID
- GET /:id - Redirect to original URL

### 1.2 Why Is This Important?

**For Meta-Learning Verification**:
- Tests pattern accumulation (frequencies should increase)
- Tests confidence scoring (repeated patterns = higher confidence)
- Validates cross-session learning

**Domain Value**:
- Standard backend API pattern
- Demonstrates CRUD operations
- Shows validation patterns

### 1.3 Constraints

**Technical**:
- TypeScript strict mode
- Express.js on port 3000
- In-memory Map storage
- 6-character alphanumeric IDs
- Zod validation
- Vitest testing (3+ tests)

**Out of Scope**:
- Database persistence
- Authentication
- Rate limiting
- Analytics dashboard

---

## 2. Requirements

### 2.1 Functional Requirements

#### FR-1: POST /api/shorten
- Input: `{ "url": "https://example.com/..." }`
- Output: `{ "id": "abc123", "shortUrl": "...", "originalUrl": "..." }`
- HTTP 201 Created
- Validates HTTP/HTTPS URLs only
- Generates unique 6-char alphanumeric ID

#### FR-2: GET /api/urls/:id
- Returns URL details with click count
- HTTP 200 OK or 404 Not Found
- Does NOT increment click counter

#### FR-3: GET /:id
- HTTP 301 Permanent Redirect
- Increments click counter
- 404 if not found

### 2.2 Non-Functional Requirements

- TypeScript strict mode (zero errors)
- Zod validation on all inputs
- 3+ Vitest tests passing
- Build succeeds

---

## 3. Data Model

```typescript
interface UrlEntry {
  id: string;           // 6-char alphanumeric
  shortUrl: string;     // http://localhost:3000/{id}
  originalUrl: string;  // User-provided URL
  clicks: number;       // Redirect count
  createdAt: string;    // ISO 8601 timestamp
}
```

---

## 4. Success Criteria

### P0 (Must Have)
- [ ] 3 endpoints working correctly
- [ ] TypeScript strict mode, zero errors
- [ ] Zod validation on inputs
- [ ] 3+ tests passing
- [ ] Build succeeds

### Meta-Learning Criteria
- [ ] Meta files created in ~/.claude/meta/{phase}/recent/
- [ ] Session ready for pattern aggregation

---

## 5. Architecture Decisions Needed (Phase 2)

1. ID generation algorithm (Math.random vs crypto)
2. Collision handling strategy (loop with max attempts)
3. Project structure (layered architecture)

---

## 6. Handoff to Phase 2

Ready for Design phase:
- Requirements clear
- Data model defined
- Constraints documented

**Phase 1 Complete**: Ready for Phase 2 (Design)
