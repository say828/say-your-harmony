# E-commerce API - Design Document

## Phase 2: Architecture & Design

**Project**: E-commerce REST API
**Location**: `experimentals/1.pre_validation/ecommerce-api/`
**Problem Definition**: [PROBLEM_DEFINITION.md](./PROBLEM_DEFINITION.md)
**Created**: 2026-01-19

---

## 1. Architecture Overview

### 1.1 System Architecture Diagram

```
                                    ┌─────────────────────────────────────────────────────────┐
                                    │                      EXPRESS SERVER                       │
                                    └─────────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       MIDDLEWARE CHAIN                                           │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐            │
│  │  CORS    │→ │  JSON    │→ │  Logger  │→ │  Rate    │→ │   Auth   │→ │  Error   │            │
│  │          │  │  Parser  │  │          │  │  Limiter │  │          │  │  Handler │            │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘  └──────────┘            │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                         ROUTE LAYER                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    /auth     │  │  /products   │  │    /cart     │  │   /orders    │  │  /inventory  │      │
│  │   routes     │  │   routes     │  │   routes     │  │   routes     │  │   routes     │      │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       SERVICE LAYER                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐      │
│  │    Auth      │  │   Product    │  │    Cart      │  │   Order      │  │  Inventory   │      │
│  │   Service    │  │   Service    │  │   Service    │  │   Service    │  │   Service    │      │
│  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘  └──────────────┘      │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
                                                              │
                                                              ▼
┌─────────────────────────────────────────────────────────────────────────────────────────────────┐
│                                       STORAGE LAYER                                              │
│  ┌─────────────────────────────────────────────────────────────────────────────────────────────┐│
│  │                              STORAGE INTERFACE (IStorage)                                    ││
│  └─────────────────────────────────────────────────────────────────────────────────────────────┘│
│                                              │                                                   │
│                    ┌─────────────────────────┴──────────────────────────┐                       │
│                    ▼                                                    ▼                       │
│  ┌─────────────────────────────────┐              ┌─────────────────────────────────┐          │
│  │       InMemoryStorage           │              │     (Future: DatabaseStorage)   │          │
│  │  ┌───────┐ ┌───────┐ ┌───────┐  │              │                                 │          │
│  │  │ Users │ │Product│ │ Carts │  │              │                                 │          │
│  │  │  Map  │ │  Map  │ │  Map  │  │              │                                 │          │
│  │  └───────┘ └───────┘ └───────┘  │              │                                 │          │
│  │  ┌───────┐ ┌───────┐ ┌───────┐  │              └─────────────────────────────────┘          │
│  │  │Orders │ │Tokens │ │ Audit │  │                                                           │
│  │  │  Map  │ │  Set  │ │  Log  │  │                                                           │
│  │  └───────┘ └───────┘ └───────┘  │                                                           │
│  └─────────────────────────────────┘                                                           │
└─────────────────────────────────────────────────────────────────────────────────────────────────┘
```

### 1.2 Data Flow Diagram

```
┌────────────────────────────────────────────────────────────────────────────────────────┐
│                              REQUEST LIFECYCLE                                          │
└────────────────────────────────────────────────────────────────────────────────────────┘

  HTTP Request
       │
       ▼
  ┌─────────────┐     ┌─────────────┐     ┌─────────────┐     ┌─────────────┐
  │   Express   │ ──▶ │  Middleware │ ──▶ │   Route     │ ──▶ │   Zod       │
  │   Router    │     │   Chain     │     │   Handler   │     │  Validation │
  └─────────────┘     └─────────────┘     └─────────────┘     └─────────────┘
                                                                      │
                                                                      ▼
                                                              ┌─────────────┐
                                                              │   Service   │
                                                              │   Method    │
                                                              └─────────────┘
                                                                      │
                                                                      ▼
                                                              ┌─────────────┐
                                                              │   Storage   │
                                                              │  Operation  │
                                                              └─────────────┘
                                                                      │
                                                                      ▼
                                                              ┌─────────────┐
  HTTP Response ◀────────────────────────────────────────────│   Result    │
                                                              │   Format    │
                                                              └─────────────┘
```

---

## 2. Component Descriptions

### 2.1 Middleware Layer

| Component | Responsibility | Dependencies |
|-----------|----------------|--------------|
| **CORS Middleware** | Handle cross-origin requests | None |
| **JSON Parser** | Parse request body as JSON | None |
| **Logger Middleware** | Log request/response for debugging | None |
| **Rate Limiter** | Protect auth endpoints from brute force | In-memory counter |
| **Auth Middleware** | Extract and validate JWT tokens | Auth Service |
| **Error Handler** | Centralized error response formatting | None |

### 2.2 Route Layer

| Route Module | Endpoints | Middleware |
|--------------|-----------|------------|
| **auth.routes.ts** | 5 endpoints | Rate limiter on login |
| **product.routes.ts** | 6 endpoints | Auth (admin only for CUD) |
| **cart.routes.ts** | 6 endpoints | None (session-based) |
| **order.routes.ts** | 5 endpoints | Auth required |
| **inventory.routes.ts** | 4 endpoints | Auth (admin only) |

### 2.3 Service Layer

| Service | Responsibility | Business Logic |
|---------|----------------|----------------|
| **AuthService** | User registration, login, token management | Password hashing, JWT generation/validation |
| **ProductService** | Product CRUD, search, pagination | Soft delete, active filtering |
| **CartService** | Cart management, item operations | Price snapshot, quantity limits, expiration |
| **OrderService** | Order creation, status management | Inventory integration, workflow validation |
| **InventoryService** | Stock tracking, audit logging | Auto-decrement/restore, low-stock alerts |

### 2.4 Storage Layer

| Storage | Implementation | Data Structures |
|---------|----------------|-----------------|
| **UserStorage** | Map<string, User> | Email index for lookup |
| **ProductStorage** | Map<string, Product> | Category index for filtering |
| **CartStorage** | Map<string, Cart> | Session/User index |
| **OrderStorage** | Map<string, Order> | User index for history |
| **TokenStorage** | Set<string> | Blacklisted refresh tokens |
| **AuditStorage** | Array<AuditEntry> | Chronological inventory log |

---

## 3. Decision Log (ADR Format)

### ADR-001: Web Framework Selection

**Status**: Accepted
**Date**: 2026-01-19
**Context**: Need to select a Node.js web framework for the REST API.

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **Express.js** | Industry standard, massive ecosystem, extensive middleware, simple learning curve | Callback-based (mitigated with async/await), slower than alternatives |
| **Fastify** | Faster performance, built-in validation, schema-based | Smaller ecosystem, less community resources, different patterns |
| **Koa** | Cleaner async/await, lightweight | Requires more manual setup, smaller middleware ecosystem |
| **Hono** | Ultra-fast, Web Standards API, edge-ready | Very new, limited middleware, unfamiliar patterns |

**Decision**: Express.js

**Rationale**:
1. **Requirement Compliance**: Problem definition specifies Express
2. **Ecosystem Maturity**: Thousands of battle-tested middleware packages
3. **Team Familiarity**: Most developers know Express patterns
4. **Documentation Quality**: Extensive tutorials and Stack Overflow answers
5. **Performance Sufficient**: For in-memory storage, Express is fast enough

**Tradeoffs**:
- Accepting slower raw performance for ecosystem benefits
- Accepting callback-legacy patterns (mitigated with async handlers)

---

### ADR-002: Storage Architecture Pattern

**Status**: Accepted
**Date**: 2026-01-19
**Context**: Need to implement data persistence for the API.

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **Direct In-Memory Maps** | Simplest, no abstraction overhead | No path to database migration |
| **Interface Abstraction + InMemory** | Easy database swap, testable, clean boundaries | Slight complexity increase |
| **Repository Pattern** | Full ORM-like abstraction, unit of work | Over-engineering for scope |
| **SQLite In-Memory** | Real SQL queries, closer to production | External dependency, slower |

**Decision**: Interface Abstraction with In-Memory Implementation

**Rationale**:
1. **Future Flexibility**: Can swap to PostgreSQL/MongoDB without changing services
2. **Testability**: Easy to mock storage in unit tests
3. **Clean Architecture**: Services don't know storage implementation details
4. **Appropriate Complexity**: Not over-engineered, but not under-designed

**Interface Design**:
```typescript
interface IStorage<T> {
  findById(id: string): Promise<T | null>;
  findAll(filter?: Partial<T>): Promise<T[]>;
  create(entity: T): Promise<T>;
  update(id: string, data: Partial<T>): Promise<T | null>;
  delete(id: string): Promise<boolean>;
}
```

**Tradeoffs**:
- Accepting async interface overhead (Promises) for future database compatibility
- Accepting interface maintenance cost for testability benefits

---

### ADR-003: JWT Token Strategy

**Status**: Accepted
**Date**: 2026-01-19
**Context**: Need to implement secure authentication with session management.

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **Single Token (Long-lived)** | Simple implementation | Security risk if stolen |
| **Access + Refresh Tokens** | Short-lived access, revocable refresh | More complex, requires storage |
| **Session-based (Cookies)** | Server-controlled, easy revocation | Stateful, CSRF concerns |
| **OAuth2/OpenID Connect** | Industry standard, delegated auth | Over-engineering for scope |

**Decision**: Access Token (15 min) + Refresh Token (7 days)

**Rationale**:
1. **Security Best Practice**: Short-lived access tokens limit exposure window
2. **UX Balance**: 15 minutes allows reasonable activity without constant re-auth
3. **Revocation Support**: Refresh token blacklist enables logout/security actions
4. **Stateless Access**: Access token validation doesn't require storage lookup

**Token Structure**:
```typescript
// Access Token Payload
{
  userId: string;
  email: string;
  role: 'user' | 'admin';
  type: 'access';
  iat: number;
  exp: number;  // 15 minutes
}

// Refresh Token Payload
{
  userId: string;
  type: 'refresh';
  iat: number;
  exp: number;  // 7 days
}
```

**Tradeoffs**:
- Accepting refresh token storage overhead for revocation capability
- Accepting token refresh complexity for improved security

---

### ADR-004: Validation Strategy

**Status**: Accepted
**Date**: 2026-01-19
**Context**: Need comprehensive input validation with good developer experience.

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **Manual Validation** | No dependencies, full control | Verbose, error-prone, inconsistent |
| **Joi** | Mature, feature-rich, widely used | Verbose syntax, no TypeScript inference |
| **Yup** | Clean API, good error messages | Slower, primarily for forms |
| **Zod** | TypeScript-first, type inference, composable | Newer, smaller ecosystem |

**Decision**: Zod with middleware pattern

**Rationale**:
1. **Requirement Compliance**: Problem definition specifies Zod
2. **TypeScript Integration**: Automatic type inference from schemas
3. **Composable Schemas**: Easy to build complex validations from primitives
4. **Error Messages**: Clear, customizable error formatting
5. **Single Source of Truth**: Schema defines both validation AND types

**Middleware Pattern**:
```typescript
const validate = (schema: ZodSchema) => (req, res, next) => {
  const result = schema.safeParse({
    body: req.body,
    params: req.params,
    query: req.query
  });

  if (!result.success) {
    return res.status(400).json(formatZodError(result.error));
  }

  req.validated = result.data;
  next();
};
```

**Tradeoffs**:
- Accepting runtime validation overhead for type safety
- Accepting Zod learning curve for superior DX

---

### ADR-005: Error Response Format

**Status**: Accepted
**Date**: 2026-01-19
**Context**: Need consistent error responses across all endpoints.

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **Plain Message** | Simple | No structure for client handling |
| **RFC 7807 (Problem Details)** | Industry standard, extensible | Verbose for simple errors |
| **Custom Format** | Tailored to needs, simple | Non-standard |
| **GraphQL-style Errors** | Familiar to some, supports multiple errors | REST context mismatch |

**Decision**: Custom format inspired by RFC 7807

**Rationale**:
1. **Consistency**: Same structure for all errors
2. **Actionability**: Error codes enable client-side handling
3. **Debugging**: Details field for development context
4. **Simplicity**: Not over-complicated for API scope

**Error Response Schema**:
```typescript
interface ErrorResponse {
  success: false;
  error: {
    code: string;          // Machine-readable: "VALIDATION_ERROR", "NOT_FOUND"
    message: string;       // Human-readable description
    details?: unknown;     // Additional context (validation errors, etc.)
    timestamp: string;     // ISO 8601
    path: string;          // Request path for debugging
  };
}

// Success Response for consistency
interface SuccessResponse<T> {
  success: true;
  data: T;
  meta?: {
    page?: number;
    pageSize?: number;
    totalCount?: number;
    totalPages?: number;
  };
}
```

**Error Codes**:
| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Insufficient permissions |
| `NOT_FOUND` | 404 | Resource not found |
| `CONFLICT` | 409 | Resource state conflict |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

**Tradeoffs**:
- Accepting custom format over strict RFC 7807 for simplicity
- Accepting verbose responses for debugging benefits

---

### ADR-006: Rate Limiting Implementation

**Status**: Accepted
**Date**: 2026-01-19
**Context**: Need to protect authentication endpoints from brute force attacks.

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **No Rate Limiting** | Simplest | Security vulnerability |
| **In-Memory Sliding Window** | Accurate, no dependencies | Memory growth, single-instance |
| **In-Memory Fixed Window** | Simple, predictable memory | Less accurate at boundaries |
| **express-rate-limit** | Ready-made, configurable | External dependency |
| **Redis Rate Limiting** | Distributed, production-ready | Infrastructure overhead |

**Decision**: In-Memory Fixed Window (custom implementation)

**Rationale**:
1. **Minimal Dependencies**: No external packages needed
2. **Sufficient for Scope**: Single-instance API doesn't need distributed limiting
3. **Predictable Behavior**: Fixed windows are easier to reason about
4. **Memory Bounded**: Automatic cleanup of expired windows

**Implementation**:
```typescript
interface RateLimitEntry {
  count: number;
  windowStart: number;
}

const rateLimiter = (limit: number, windowMs: number) => {
  const requests = new Map<string, RateLimitEntry>();

  // Cleanup old entries every minute
  setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of requests) {
      if (now - entry.windowStart > windowMs) {
        requests.delete(key);
      }
    }
  }, 60000);

  return (req, res, next) => {
    const key = req.ip;
    const now = Date.now();
    const entry = requests.get(key);

    if (!entry || now - entry.windowStart > windowMs) {
      requests.set(key, { count: 1, windowStart: now });
      return next();
    }

    if (entry.count >= limit) {
      return res.status(429).json({ /* rate limit error */ });
    }

    entry.count++;
    next();
  };
};
```

**Configuration**:
- Login endpoint: 5 requests per minute per IP
- Register endpoint: 3 requests per minute per IP
- Token refresh: 10 requests per minute per IP

**Tradeoffs**:
- Accepting single-instance limitation for simplicity
- Accepting fixed window inaccuracy at boundaries for predictability

---

### ADR-007: Dependency Injection Pattern

**Status**: Accepted
**Date**: 2026-01-19
**Context**: Need to manage dependencies between services and storage layers.

**Options Considered**:

| Option | Pros | Cons |
|--------|------|------|
| **Direct Imports** | Simplest, no abstraction | Hard to test, tight coupling |
| **Constructor Injection** | Explicit dependencies, testable | Manual wiring required |
| **Service Locator** | Centralized, lazy loading | Hidden dependencies, harder to reason |
| **DI Container (tsyringe, inversify)** | Automatic resolution, decorators | External dependency, complexity |

**Decision**: Constructor Injection with Factory Functions

**Rationale**:
1. **Explicit Dependencies**: All dependencies visible in constructor
2. **Testability**: Easy to inject mocks for unit testing
3. **No External Libraries**: Pure TypeScript implementation
4. **Simple Wiring**: Factory functions for composition root

**Pattern**:
```typescript
// Service with injected dependencies
class OrderService {
  constructor(
    private readonly orderStorage: IOrderStorage,
    private readonly productService: IProductService,
    private readonly inventoryService: IInventoryService
  ) {}

  async createOrder(cartId: string, userId: string): Promise<Order> {
    // Use injected dependencies
  }
}

// Factory function for composition
export const createOrderService = (storage: IStorage) => {
  const productService = createProductService(storage);
  const inventoryService = createInventoryService(storage);
  return new OrderService(storage, productService, inventoryService);
};

// Composition root (server.ts)
const storage = new InMemoryStorage();
const orderService = createOrderService(storage);
```

**Tradeoffs**:
- Accepting manual wiring overhead for explicit dependencies
- Accepting factory function boilerplate for testability

---

## 4. Tradeoff Analysis

### 4.1 Tradeoff Matrix

| Decision | Tradeoff | Chose | Sacrificed | Rationale |
|----------|----------|-------|------------|-----------|
| Express vs Fastify | Performance vs Ecosystem | Ecosystem | Raw speed | Ecosystem maturity more valuable for maintainability |
| In-memory vs SQLite | Simplicity vs Realism | Simplicity | SQL practice | Scope is validation, not database skills |
| Dual tokens vs Single | Security vs Simplicity | Security | Simple auth | Security best practices are non-negotiable |
| Zod vs Manual | Type safety vs Control | Type safety | Custom errors | DX improvement worth the dependency |
| Fixed window vs Sliding | Accuracy vs Simplicity | Simplicity | Accuracy | Edge case inaccuracy acceptable |
| Constructor DI vs Container | Explicitness vs Magic | Explicitness | Convenience | Prefer explicit over implicit |

### 4.2 Security vs UX Tradeoffs

| Scenario | Security Option | UX Option | Decision | Rationale |
|----------|-----------------|-----------|----------|-----------|
| Token expiry | 5 min access | 1 hour access | 15 min | Balance between security and re-auth friction |
| Password rules | Complex (12+ chars, symbols) | Simple (6+ chars) | Moderate (8+, mixed) | Standard practice, not overly burdensome |
| Rate limiting | 3 req/min (aggressive) | 20 req/min (loose) | 5 req/min | Prevents brute force without blocking legitimate users |
| Cart expiry | 1 hour | 7 days | 24 hours | Reasonable shopping window without stale data |

### 4.3 Performance vs Maintainability Tradeoffs

| Area | Performance Option | Maintainability Option | Decision | Rationale |
|------|-------------------|----------------------|----------|-----------|
| Validation | Skip in production | Always validate | Always validate | Security over micro-optimization |
| Logging | Minimal/disabled | Verbose debugging | Configurable | Environment-based toggle |
| Type checking | `any` shortcuts | Strict TypeScript | Strict | Catch bugs at compile time |
| Error details | Minimal response | Full context | Full in dev, minimal in prod | Environment-based toggle |

---

## 5. Risk Assessment

### 5.1 Risk Matrix

| ID | Risk | Priority | Impact | Likelihood | Mitigation |
|----|------|----------|--------|------------|------------|
| R1 | JWT secret in code | P0 | Critical | High | Use environment variable |
| R2 | No input sanitization | P0 | Critical | Medium | Zod validation on all inputs |
| R3 | Password in logs | P0 | Critical | Medium | Never log request bodies with passwords |
| R4 | Race condition in inventory | P1 | High | Medium | Atomic operations in storage |
| R5 | Cart not expiring | P1 | Medium | Low | Implement cleanup interval |
| R6 | No request logging | P2 | Medium | N/A | Add configurable logger |
| R7 | Memory growth unbounded | P2 | Medium | Low | Implement storage limits |
| R8 | No health check | P2 | Low | N/A | Add /health endpoint |
| R9 | No graceful shutdown | P3 | Low | Low | Handle SIGTERM |
| R10 | No API versioning | P3 | Low | N/A | Future consideration |

### 5.2 P0 Risks (Block Deployment)

#### R1: JWT Secret Exposure

**Problem**: Hardcoded JWT secret enables token forgery.

**Mitigation**:
```typescript
// BAD
const JWT_SECRET = 'my-super-secret-key';

// GOOD
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  throw new Error('JWT_SECRET environment variable required');
}
```

**Verification**: Unit test that startup fails without env var.

---

#### R2: Insufficient Input Validation

**Problem**: Unvalidated input can cause injection attacks or crashes.

**Mitigation**:
```typescript
// Every endpoint MUST use validation middleware
router.post('/products',
  authenticate,
  authorize('admin'),
  validate(createProductSchema),  // REQUIRED
  productController.create
);
```

**Verification**: Integration tests attempt invalid inputs on all endpoints.

---

#### R3: Sensitive Data in Logs

**Problem**: Passwords/tokens in logs expose credentials.

**Mitigation**:
```typescript
// Logger middleware sanitizes sensitive fields
const sanitizeBody = (body: unknown) => {
  if (typeof body !== 'object' || body === null) return body;
  const sanitized = { ...body };
  const sensitiveFields = ['password', 'passwordHash', 'token', 'refreshToken'];
  for (const field of sensitiveFields) {
    if (field in sanitized) {
      sanitized[field] = '[REDACTED]';
    }
  }
  return sanitized;
};
```

**Verification**: Log output inspection in tests.

---

### 5.3 P1 Risks (Fix Before Production)

#### R4: Inventory Race Condition

**Problem**: Concurrent order creation can oversell inventory.

**Mitigation**:
```typescript
// Atomic decrement with check
async decrementStock(productId: string, quantity: number): Promise<boolean> {
  const product = this.products.get(productId);
  if (!product || product.stock < quantity) {
    return false;  // Atomic check-and-fail
  }
  product.stock -= quantity;
  return true;
}
```

**Note**: True atomicity requires database transactions. In-memory Map operations are synchronous in Node.js single-thread, providing implicit atomicity.

---

#### R5: Cart Expiration Not Enforced

**Problem**: Stale carts consume memory and may have outdated prices.

**Mitigation**:
```typescript
// Cleanup interval
setInterval(() => {
  const now = new Date();
  for (const [id, cart] of carts) {
    if (new Date(cart.expiresAt) < now) {
      carts.delete(id);
    }
  }
}, 60000);  // Every minute
```

---

### 5.4 P2 Risks (Quality Improvement)

#### R6: Missing Request Logging

**Impact**: Debugging production issues is difficult.

**Mitigation**: Implement configurable request/response logger.

---

#### R7: Unbounded Memory Growth

**Impact**: Long-running server accumulates data.

**Mitigation**:
- Cart expiration cleanup
- Order archival (move old orders to separate storage)
- Rate limit map cleanup

---

### 5.5 P3 Risks (Future Enhancement)

#### R9: No Graceful Shutdown

**Impact**: In-flight requests may be terminated.

**Mitigation**:
```typescript
process.on('SIGTERM', async () => {
  console.log('Received SIGTERM, shutting down gracefully...');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});
```

---

## 6. API Error Response Format

### 6.1 Standard Response Envelope

```typescript
// Success Response
{
  "success": true,
  "data": { /* resource data */ },
  "meta": {
    "page": 1,
    "pageSize": 20,
    "totalCount": 100,
    "totalPages": 5
  }
}

// Error Response
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "field": "email",
        "message": "Invalid email format"
      }
    ],
    "timestamp": "2026-01-19T10:30:00.000Z",
    "path": "/api/auth/register"
  }
}
```

### 6.2 Error Code Reference

| Code | HTTP Status | When Used |
|------|-------------|-----------|
| `VALIDATION_ERROR` | 400 | Zod validation failure |
| `INVALID_CREDENTIALS` | 401 | Wrong email/password |
| `TOKEN_EXPIRED` | 401 | JWT expired |
| `TOKEN_INVALID` | 401 | JWT malformed/invalid signature |
| `UNAUTHORIZED` | 401 | No token provided |
| `FORBIDDEN` | 403 | Valid token but insufficient role |
| `NOT_FOUND` | 404 | Resource doesn't exist |
| `ALREADY_EXISTS` | 409 | Duplicate resource (email, etc.) |
| `INSUFFICIENT_STOCK` | 409 | Not enough inventory |
| `INVALID_STATUS_TRANSITION` | 409 | Invalid order status change |
| `CART_EXPIRED` | 410 | Cart no longer valid |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

### 6.3 Validation Error Detail Format

```typescript
// Zod error transformation
{
  "success": false,
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Request validation failed",
    "details": [
      {
        "path": "body.email",
        "message": "Invalid email format",
        "received": "not-an-email"
      },
      {
        "path": "body.password",
        "message": "Password must be at least 8 characters",
        "received": "short"
      }
    ]
  }
}
```

---

## 7. Implementation Order (Parallel-Safe Groupings)

### 7.1 Dependency Graph

```
                              ┌─────────────┐
                              │   Types &   │
                              │   Schemas   │
                              └──────┬──────┘
                                     │
                    ┌────────────────┼────────────────┐
                    ▼                ▼                ▼
              ┌───────────┐   ┌───────────┐   ┌───────────┐
              │  Storage  │   │   Utils   │   │   Errors  │
              │ Interface │   │           │   │           │
              └─────┬─────┘   └─────┬─────┘   └─────┬─────┘
                    │               │               │
                    └───────────────┼───────────────┘
                                    ▼
                              ┌───────────┐
                              │ InMemory  │
                              │  Storage  │
                              └─────┬─────┘
                                    │
          ┌─────────────────────────┼─────────────────────────┐
          ▼                         ▼                         ▼
    ┌───────────┐           ┌───────────────┐          ┌───────────┐
    │   Auth    │           │   Product     │          │   Cart    │
    │  Service  │           │   Service     │          │  Service  │
    └─────┬─────┘           └───────┬───────┘          └─────┬─────┘
          │                         │                        │
          │                         ▼                        │
          │                 ┌───────────────┐                │
          │                 │  Inventory    │                │
          │                 │   Service     │                │
          │                 └───────┬───────┘                │
          │                         │                        │
          │                         ▼                        │
          │                 ┌───────────────┐                │
          │                 │    Order      │◀───────────────┘
          │                 │   Service     │
          │                 └───────────────┘
          │                         │
          └─────────────────────────┼─────────────────────────┘
                                    ▼
                              ┌───────────┐
                              │Middleware │
                              └─────┬─────┘
                                    ▼
                              ┌───────────┐
                              │  Routes   │
                              └─────┬─────┘
                                    ▼
                              ┌───────────┐
                              │  Server   │
                              └───────────┘
```

### 7.2 Implementation Phases

#### Phase 3.1: Foundation Layer (Parallel)

| Task | File | Dependencies | Can Parallelize With |
|------|------|--------------|---------------------|
| Types definition | `src/types/index.ts` | None | All Phase 3.1 |
| Zod schemas | `src/schemas/*.ts` | Types | All Phase 3.1 |
| Error classes | `src/errors/index.ts` | Types | All Phase 3.1 |
| Utils (uuid, date) | `src/utils/*.ts` | None | All Phase 3.1 |
| Storage interface | `src/storage/interface.ts` | Types | All Phase 3.1 |

**Estimated Time**: 2 hours (all tasks parallel)

---

#### Phase 3.2: Storage Layer

| Task | File | Dependencies | Can Parallelize With |
|------|------|--------------|---------------------|
| InMemory storage | `src/storage/memory.ts` | Interface, Types | None |

**Estimated Time**: 1 hour

---

#### Phase 3.3: Service Layer (Partial Parallel)

| Task | File | Dependencies | Can Parallelize With |
|------|------|--------------|---------------------|
| Auth service | `src/services/auth.ts` | Storage | Product, Cart |
| Product service | `src/services/product.ts` | Storage | Auth, Cart |
| Cart service | `src/services/cart.ts` | Storage | Auth, Product |
| Inventory service | `src/services/inventory.ts` | Storage, Product | After Product |
| Order service | `src/services/order.ts` | Storage, Cart, Inventory | Last |

**Parallelization Groups**:
- Group A: Auth, Product, Cart (parallel)
- Group B: Inventory (after Product)
- Group C: Order (after all above)

**Estimated Time**: 4 hours (with parallelization)

---

#### Phase 3.4: Middleware Layer (Parallel)

| Task | File | Dependencies | Can Parallelize With |
|------|------|--------------|---------------------|
| Auth middleware | `src/middleware/auth.ts` | Auth service | All Phase 3.4 |
| Validation middleware | `src/middleware/validate.ts` | Schemas | All Phase 3.4 |
| Rate limiter | `src/middleware/rateLimiter.ts` | None | All Phase 3.4 |
| Error handler | `src/middleware/errorHandler.ts` | Errors | All Phase 3.4 |
| Logger | `src/middleware/logger.ts` | None | All Phase 3.4 |

**Estimated Time**: 2 hours (all tasks parallel)

---

#### Phase 3.5: Route Layer (Parallel)

| Task | File | Dependencies | Can Parallelize With |
|------|------|--------------|---------------------|
| Auth routes | `src/routes/auth.ts` | Auth service, middleware | All Phase 3.5 |
| Product routes | `src/routes/product.ts` | Product service, middleware | All Phase 3.5 |
| Cart routes | `src/routes/cart.ts` | Cart service, middleware | All Phase 3.5 |
| Order routes | `src/routes/order.ts` | Order service, middleware | All Phase 3.5 |
| Inventory routes | `src/routes/inventory.ts` | Inventory service, middleware | All Phase 3.5 |

**Estimated Time**: 3 hours (all tasks parallel)

---

#### Phase 3.6: Integration

| Task | File | Dependencies | Can Parallelize With |
|------|------|--------------|---------------------|
| Server composition | `src/server.ts` | All above | None |
| Config | `src/config/index.ts` | None | Server |

**Estimated Time**: 1 hour

---

#### Phase 3.7: Testing (Parallel)

| Task | File | Dependencies | Can Parallelize With |
|------|------|--------------|---------------------|
| Auth tests | `tests/auth.test.ts` | Auth routes | All tests |
| Product tests | `tests/product.test.ts` | Product routes | All tests |
| Cart tests | `tests/cart.test.ts` | Cart routes | All tests |
| Order tests | `tests/order.test.ts` | Order routes | All tests |
| Inventory tests | `tests/inventory.test.ts` | Inventory routes | All tests |
| Integration tests | `tests/integration/*.ts` | All routes | After unit tests |

**Estimated Time**: 4 hours (unit tests parallel, integration sequential)

---

### 7.3 Total Implementation Estimate

| Phase | Duration | Parallelization |
|-------|----------|-----------------|
| 3.1 Foundation | 2 hours | Full parallel |
| 3.2 Storage | 1 hour | Sequential |
| 3.3 Services | 4 hours | Partial parallel |
| 3.4 Middleware | 2 hours | Full parallel |
| 3.5 Routes | 3 hours | Full parallel |
| 3.6 Integration | 1 hour | Sequential |
| 3.7 Testing | 4 hours | Partial parallel |
| **Total** | **17 hours** | **~10 hours with max parallelization** |

---

## 8. File Structure

```
ecommerce-api/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── .env.example
├── README.md
├── PROBLEM_DEFINITION.md
├── DESIGN.md
│
├── src/
│   ├── server.ts                    # Express app composition
│   ├── config/
│   │   └── index.ts                 # Environment configuration
│   │
│   ├── types/
│   │   ├── index.ts                 # Re-exports
│   │   ├── user.ts                  # User types
│   │   ├── product.ts               # Product types
│   │   ├── cart.ts                  # Cart types
│   │   ├── order.ts                 # Order types
│   │   └── common.ts                # Shared types (pagination, etc.)
│   │
│   ├── schemas/
│   │   ├── index.ts                 # Re-exports
│   │   ├── auth.schema.ts           # Auth validation schemas
│   │   ├── product.schema.ts        # Product validation schemas
│   │   ├── cart.schema.ts           # Cart validation schemas
│   │   ├── order.schema.ts          # Order validation schemas
│   │   └── common.schema.ts         # Shared schemas (pagination, etc.)
│   │
│   ├── errors/
│   │   └── index.ts                 # Custom error classes
│   │
│   ├── storage/
│   │   ├── interface.ts             # Storage interface definitions
│   │   └── memory.ts                # In-memory implementation
│   │
│   ├── services/
│   │   ├── auth.service.ts          # Authentication business logic
│   │   ├── product.service.ts       # Product business logic
│   │   ├── cart.service.ts          # Cart business logic
│   │   ├── order.service.ts         # Order business logic
│   │   └── inventory.service.ts     # Inventory business logic
│   │
│   ├── middleware/
│   │   ├── auth.ts                  # JWT authentication
│   │   ├── authorize.ts             # Role-based authorization
│   │   ├── validate.ts              # Zod validation middleware
│   │   ├── rateLimiter.ts           # Rate limiting
│   │   ├── errorHandler.ts          # Global error handler
│   │   └── logger.ts                # Request logging
│   │
│   ├── routes/
│   │   ├── index.ts                 # Route aggregation
│   │   ├── auth.routes.ts           # Auth endpoints
│   │   ├── product.routes.ts        # Product endpoints
│   │   ├── cart.routes.ts           # Cart endpoints
│   │   ├── order.routes.ts          # Order endpoints
│   │   └── inventory.routes.ts      # Inventory endpoints
│   │
│   └── utils/
│       ├── jwt.ts                   # JWT utilities
│       ├── password.ts              # Password hashing
│       └── response.ts              # Response formatters
│
└── tests/
    ├── setup.ts                     # Test configuration
    ├── helpers/
    │   └── testClient.ts            # Supertest helper
    │
    ├── unit/
    │   ├── services/
    │   │   ├── auth.service.test.ts
    │   │   ├── product.service.test.ts
    │   │   ├── cart.service.test.ts
    │   │   ├── order.service.test.ts
    │   │   └── inventory.service.test.ts
    │   └── middleware/
    │       ├── auth.test.ts
    │       ├── validate.test.ts
    │       └── rateLimiter.test.ts
    │
    └── integration/
        ├── auth.test.ts
        ├── product.test.ts
        ├── cart.test.ts
        ├── order.test.ts
        └── inventory.test.ts
```

---

## 9. Verification Strategy

### 9.1 Unit Test Coverage Requirements

| Component | Minimum Coverage | Critical Paths |
|-----------|------------------|----------------|
| Auth Service | 90% | Token generation, password validation |
| Product Service | 85% | CRUD operations, soft delete |
| Cart Service | 85% | Item operations, expiration |
| Order Service | 90% | Status workflow, inventory integration |
| Inventory Service | 90% | Stock operations, audit logging |
| Middleware | 80% | Auth, validation, error handling |

### 9.2 Integration Test Scenarios

| Scenario | Endpoints Covered | Expected Result |
|----------|-------------------|-----------------|
| User registration flow | POST /auth/register | User created, tokens returned |
| Login and access protected | POST /auth/login, GET /auth/me | Tokens work, user data returned |
| Token refresh flow | POST /auth/refresh | New access token issued |
| Product CRUD as admin | All /products endpoints | Full lifecycle works |
| Anonymous cart flow | All /cart endpoints | Cart created, items managed |
| Complete checkout | POST /cart, POST /orders | Order created, inventory decremented |
| Order cancellation | POST /orders/:id/cancel | Order cancelled, inventory restored |

### 9.3 End-to-End Test Flow

```
1. Register user (user role)
2. Register admin (admin role)
3. Admin creates products
4. User browses products (unauthenticated)
5. User creates cart
6. User adds items to cart
7. User updates quantities
8. User logs in
9. User creates order from cart
10. Admin updates order status
11. User views order history
12. User cancels order
13. Verify inventory restored
```

---

**Document Version**: 1.0
**Created**: 2026-01-19
**Phase**: 2 - Design (Complete)
**Next Phase**: 3 - Implementation
