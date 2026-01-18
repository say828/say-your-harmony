# Shopping Cart System - Problem Definition (Phase 1: Planning)

**Date**: 2026-01-18
**Task ID**: shopping-cart
**Complexity**: Simple-Medium
**Domain**: E-commerce / Cart Management
**Meta Status**: Baseline (0 existing meta-analyses)
**Planner Agent**: opus

---

## Executive Summary

This is **Step 1 of the incremental meta-learning experiment**. We are building a shopping cart REST API with discount engine, cart abandonment tracking, and session management to establish baseline metrics and foundational patterns for subsequent tasks.

**Key Context**: This is the first task in a 15-task incremental experiment designed to validate meta-learning accumulation effects. No prior meta-analyses exist - this is a clean baseline.

---

## 1. Problem Definition

### 1.1 What Problem Are We Solving?

We are building a **complete shopping cart REST API** that enables:
1. Creating and managing shopping carts (anonymous and authenticated users)
2. Adding, updating, and removing items from carts
3. Applying discount coupons with percentage and fixed-amount support
4. Calculating accurate cart totals with tax and discounts
5. Tracking cart abandonment for analytics
6. Managing cart lifecycle states (active, abandoned, converted)

### 1.2 Why Is This Important?

**For the Meta-Learning Experiment**:
- Establishes baseline efficiency metrics (time, turns, tool calls, web searches)
- Creates foundational patterns that will transfer to subsequent 14 tasks
- Validates QuickMeta system for pattern extraction and storage
- Tests the 4-phase Harmony workflow from a clean state

**For the Domain**:
- Shopping carts are critical e-commerce infrastructure
- Discount engines drive conversion and revenue
- Abandonment tracking enables retargeting campaigns
- Session management supports both anonymous and authenticated flows

### 1.3 What Are the Constraints?

**Technical Constraints**:
- In-memory storage only (Map-based, no database)
- TypeScript strict mode required
- Port 3000 for Express server
- Zod for all input validation
- Vitest for testing framework
- 80%+ test coverage mandatory

**Business Constraints**:
- Tax rate: 8% (configurable)
- Cart abandonment timeout: 30 minutes of inactivity
- Quantity limits: 1-99 per item
- Coupon code length: 1-50 characters
- All P0 success criteria must pass

**Time Constraints**:
- Baseline estimate: 40-50 minutes
- Must complete in single Harmony session
- All 4 phases required (plan, design, build, operate)

**Quality Constraints**:
- Zero TypeScript errors
- Zero ESLint errors
- 100% test pass rate
- No implicit any types

### 1.4 What Is Out of Scope?

**Explicitly Excluded**:
- Database integration (in-memory only)
- User authentication/authorization system
- Payment processing
- Product catalog management
- Order creation/checkout flow
- Inventory management
- Shipping calculations
- Multi-currency support
- Real-time cart sync across devices
- Cart recovery emails
- Performance optimization for scale

**P2 Features (Nice-to-Have, Not Required)**:
- Cart merge on login (anonymous to authenticated)
- Request/response logging middleware
- Price change notifications
- Saved for later functionality

---

## 2. Requirements Analysis

### 2.1 Functional Requirements (Detailed Breakdown)

#### FR-1: Cart Creation (POST /api/cart)
- **Input**: None (or optional userId/sessionId)
- **Output**: Cart object with UUID v4 ID
- **Success**: 201 Created
- **Business Logic**:
  - Generate unique cart ID using uuid.v4()
  - Initialize empty items array
  - Initialize empty coupons array
  - Set createdAt, updatedAt, lastActivityAt to current ISO timestamp
  - Set status to 'active'
  - Support both anonymous (sessionId) and authenticated (userId) carts

#### FR-2: Cart Retrieval (GET /api/cart/:cartId)
- **Input**: Cart ID (UUID)
- **Output**: Full cart object with items, coupons, totals
- **Success**: 200 OK
- **Errors**: 404 Not Found if cart doesn't exist
- **Business Logic**:
  - Validate cart ID format (UUID)
  - Lookup cart in storage
  - Return cart with calculated subtotals for each item

#### FR-3: Add Item to Cart (POST /api/cart/:cartId/items)
- **Input**: `{ productId: string, name: string, quantity: number, price: number }`
- **Output**: Updated cart object
- **Success**: 200 OK
- **Errors**: 400 Bad Request (validation), 404 Not Found (cart)
- **Business Logic**:
  - If item exists: Add quantity to existing quantity
  - If item is new: Add to items array
  - Calculate item subtotal: price * quantity
  - Update cart.updatedAt
  - Update cart.lastActivityAt

**Validation Rules**:
- productId: required, non-empty string
- name: required, non-empty string
- quantity: required, integer, 1-99
- price: required, positive number, >= 0.01

#### FR-4: Update Item Quantity (PUT /api/cart/:cartId/items/:productId)
- **Input**: `{ quantity: number }`
- **Output**: Updated cart object
- **Success**: 200 OK
- **Errors**: 400 Bad Request (validation), 404 Not Found (cart or item)
- **Business Logic**:
  - Find item in cart
  - Update quantity
  - Recalculate subtotal: price * newQuantity
  - Update cart timestamps

**Validation Rules**:
- quantity: required, integer, 1-99

#### FR-5: Remove Item from Cart (DELETE /api/cart/:cartId/items/:productId)
- **Input**: Cart ID, Product ID
- **Output**: Updated cart object
- **Success**: 200 OK
- **Errors**: 404 Not Found (cart or item)
- **Business Logic**:
  - Find item in cart
  - Remove from items array
  - Update cart timestamps

#### FR-6: Apply Coupon (POST /api/cart/:cartId/coupons)
- **Input**: `{ code: string }`
- **Output**: Updated cart with discount applied
- **Success**: 200 OK
- **Errors**: 400 Bad Request (invalid/expired coupon)
- **Business Logic**:
  - Validate coupon exists
  - Check coupon not expired (if expiresAt set)
  - Check max uses not exceeded (if maxUses set)
  - Check minimum cart value met (if minCartValue set)
  - Add to cart.coupons array
  - Increment coupon.usedCount
  - Update cart timestamps

**Validation Rules**:
- code: required, string, 1-50 characters

#### FR-7: Get Cart Total (GET /api/cart/:cartId/total)
- **Input**: Cart ID
- **Output**: CartTotals object
- **Success**: 200 OK
- **Errors**: 404 Not Found (cart)
- **Calculation Logic**:
  1. Subtotal = Sum of all item subtotals
  2. Discount = Apply all coupons (see FR-8)
  3. Tax = (Subtotal - Discount) * taxRate
  4. Total = Subtotal - Discount + Tax

#### FR-8: Discount Calculation Rules
- **Percentage Discounts**:
  - Calculate: subtotal * (value / 100)
  - Example: $100 cart * 10% = $10 discount
- **Fixed Discounts**:
  - Calculate: value (flat amount)
  - Example: $5 off coupon = $5 discount
- **Multiple Coupons**:
  - Option A: Stack all discounts (simpler)
  - Option B: Take best single discount (more realistic)
  - **Decision Required**: Choose stacking strategy in Phase 2
- **Floor Protection**:
  - Total can never be negative
  - If discounts exceed subtotal, cap at subtotal

#### FR-9: Cart Abandonment Tracking
- **Trigger**: lastActivityAt > 30 minutes ago
- **Detection**: Background check or on-access check
- **Action**: Update cart.status to 'abandoned'
- **Activities that Reset Timer**:
  - Add item
  - Update item
  - Remove item
  - Apply coupon
  - Get cart (retrieve)

### 2.2 Non-Functional Requirements

#### NFR-1: Type Safety
- TypeScript strict mode enabled
- No implicit any types
- All function signatures with explicit return types
- All interfaces properly typed
- Zod for runtime validation

#### NFR-2: Error Handling
- HTTP status codes:
  - 200 OK: Successful operations
  - 201 Created: New cart creation
  - 400 Bad Request: Validation failures
  - 404 Not Found: Cart or item not found
  - 500 Internal Server Error: Unexpected errors
- Structured error response format:
  ```typescript
  {
    error: string;      // Human-readable message
    code: string;       // Machine-readable code (e.g., "CART_NOT_FOUND")
    details?: any;      // Additional context (validation errors)
  }
  ```

#### NFR-3: Testing Coverage
- Minimum 80% code coverage
- Test all endpoints (7 total)
- Test success cases
- Test error cases (validation, not found)
- Test edge cases (empty cart, max quantity, expired coupons)
- Use Vitest as framework
- Use supertest for HTTP endpoint testing

#### NFR-4: Code Quality
- ESLint with TypeScript plugin
- Zero ESLint errors
- Zero TypeScript compiler errors
- Consistent formatting (Prettier recommended)
- JSDoc comments on public functions

#### NFR-5: Documentation
- README.md with:
  - Setup instructions
  - Running the server
  - API endpoint documentation
  - Testing instructions
  - Example curl commands

---

## 3. Data Models

### 3.1 Cart Interface

```typescript
interface Cart {
  id: string;                    // UUID v4
  sessionId?: string;            // For anonymous carts
  userId?: string;               // For authenticated users
  items: CartItem[];             // Array of cart items
  coupons: AppliedCoupon[];      // Applied coupons
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  lastActivityAt: string;        // For abandonment tracking
  status: 'active' | 'abandoned' | 'converted';
}
```

**Field Details**:
- `id`: Primary identifier, must be unique, generated with uuid.v4()
- `sessionId`: Optional for anonymous users (browser session)
- `userId`: Optional for authenticated users
- `items`: Initially empty array
- `coupons`: Initially empty array
- `createdAt`: Set once on creation, immutable
- `updatedAt`: Updated on every modification
- `lastActivityAt`: Updated on every activity (see FR-9)
- `status`: Defaults to 'active', changes to 'abandoned' after timeout

### 3.2 CartItem Interface

```typescript
interface CartItem {
  productId: string;
  name: string;
  price: number;                 // Unit price (per item)
  quantity: number;              // Quantity in cart (1-99)
  subtotal: number;              // Calculated: price * quantity
}
```

**Field Details**:
- `productId`: Product identifier (from external catalog)
- `name`: Display name for product
- `price`: Price per unit, must be >= 0.01
- `quantity`: Integer 1-99
- `subtotal`: Always calculated, not stored separately

**Calculation Rules**:
- subtotal = price * quantity
- Round to 2 decimal places for currency

### 3.3 Coupon Interface

```typescript
interface Coupon {
  code: string;                  // Unique coupon code
  type: 'percentage' | 'fixed';  // Discount type
  value: number;                 // Percentage (0-100) or fixed amount
  minCartValue?: number;         // Optional minimum cart value
  expiresAt?: string;            // Optional expiration (ISO 8601)
  maxUses?: number;              // Optional max use count
  usedCount: number;             // Current use count
}
```

**Field Details**:
- `code`: Unique identifier (e.g., "SAVE10", "WELCOME20")
- `type`: Determines calculation method
- `value`:
  - For percentage: 0-100 (e.g., 10 = 10% off)
  - For fixed: Dollar amount (e.g., 5.00 = $5 off)
- `minCartValue`: Coupon only applies if subtotal >= this value
- `expiresAt`: Coupon invalid after this timestamp
- `maxUses`: Coupon invalid after this many uses
- `usedCount`: Incremented on each application

**Validation Rules**:
- Percentage value must be 0-100
- Fixed value must be positive
- expiresAt must be future date
- maxUses must be positive integer

### 3.4 AppliedCoupon Interface

```typescript
interface AppliedCoupon {
  code: string;                  // Reference to coupon code
  discountAmount: number;        // Calculated discount amount
}
```

**Field Details**:
- `code`: Links to Coupon.code
- `discountAmount`: Actual dollar amount saved (calculated)

### 3.5 CartTotals Interface

```typescript
interface CartTotals {
  subtotal: number;              // Sum of all item subtotals
  taxRate: number;               // Tax rate (e.g., 0.08 for 8%)
  taxAmount: number;             // Calculated tax
  discountAmount: number;        // Total discount from coupons
  total: number;                 // Final amount
}
```

**Calculation Formula**:
```
subtotal = sum(item.subtotal for all items)
discountAmount = sum(appliedCoupon.discountAmount for all coupons)
taxableAmount = subtotal - discountAmount
taxAmount = taxableAmount * taxRate
total = subtotal - discountAmount + taxAmount
```

**Rounding Rules**:
- All currency values rounded to 2 decimal places
- Use standard rounding (0.5 rounds up)

---

## 4. Edge Cases and Validation

### 4.1 Edge Cases to Handle

#### EC-1: Empty Cart
- **Scenario**: Cart has no items
- **Behavior**:
  - Subtotal = 0
  - Tax = 0
  - Total = 0
  - Coupons should not apply (or apply but save $0)

#### EC-2: Adding Existing Item
- **Scenario**: User adds item already in cart
- **Behavior**: Increase quantity, not duplicate entry
- **Validation**: Ensure quantity doesn't exceed 99

#### EC-3: Coupon Exceeds Cart Value
- **Scenario**: $50 coupon applied to $30 cart
- **Behavior**:
  - Discount capped at $30
  - Total = $0 (no negative total)

#### EC-4: Expired Coupon
- **Scenario**: Coupon.expiresAt < current time
- **Behavior**:
  - Return 400 Bad Request
  - Error code: "COUPON_EXPIRED"

#### EC-5: Minimum Cart Value Not Met
- **Scenario**: Coupon requires $50 minimum, cart is $30
- **Behavior**:
  - Return 400 Bad Request
  - Error code: "MINIMUM_CART_VALUE_NOT_MET"

#### EC-6: Max Uses Exceeded
- **Scenario**: Coupon.usedCount >= Coupon.maxUses
- **Behavior**:
  - Return 400 Bad Request
  - Error code: "COUPON_MAX_USES_EXCEEDED"

#### EC-7: Cart Not Found
- **Scenario**: Request for non-existent cart ID
- **Behavior**:
  - Return 404 Not Found
  - Error code: "CART_NOT_FOUND"

#### EC-8: Item Not in Cart
- **Scenario**: Update/delete item not in cart
- **Behavior**:
  - Return 404 Not Found
  - Error code: "ITEM_NOT_FOUND"

#### EC-9: Invalid UUID
- **Scenario**: Cart ID is not valid UUID
- **Behavior**:
  - Return 400 Bad Request
  - Error code: "INVALID_CART_ID"

#### EC-10: Quantity Exceeds Maximum
- **Scenario**: User tries to add quantity > 99
- **Behavior**:
  - Return 400 Bad Request
  - Error code: "QUANTITY_EXCEEDS_MAXIMUM"

#### EC-11: Negative Price
- **Scenario**: Price < 0
- **Behavior**:
  - Return 400 Bad Request
  - Error code: "INVALID_PRICE"

#### EC-12: Concurrent Cart Modifications
- **Scenario**: Two requests modify cart simultaneously
- **Behavior**:
  - In-memory storage should handle sequentially
  - Last write wins (acceptable for in-memory)
  - Not required: Optimistic locking

### 4.2 Validation Schema Requirements

**Zod Schemas Needed**:

1. **CreateCartSchema**: Optional sessionId, userId
2. **AddItemSchema**: productId, name, quantity (1-99), price (>= 0.01)
3. **UpdateQuantitySchema**: quantity (1-99)
4. **ApplyCouponSchema**: code (string, 1-50 chars)
5. **UUIDSchema**: Valid UUID v4 format

**Common Validation Rules**:
- Non-empty strings: `.min(1)`
- Quantity range: `.int().min(1).max(99)`
- Price minimum: `.number().min(0.01)`
- UUID format: Use Zod's `.uuid()` validator

---

## 5. Business Logic Rules

### 5.1 Discount Calculation Logic

#### Rule 1: Order of Operations
1. Calculate subtotal from items
2. Apply all discount coupons
3. Calculate tax on (subtotal - discounts)
4. Calculate final total

#### Rule 2: Percentage Discount Calculation
```
discountAmount = subtotal * (coupon.value / 100)
Example: $100 cart * 10% = $10 discount
```

#### Rule 3: Fixed Discount Calculation
```
discountAmount = coupon.value
Example: $5 off coupon = $5 discount
```

#### Rule 4: Multiple Coupon Strategy
**Decision Point for Phase 2 (Architect)**:
- **Option A**: Stack all discounts (apply all, sum discounts)
- **Option B**: Best single discount (apply highest discount only)

**Recommendation**: Option A (stacking) for simplicity, unless user requests otherwise.

#### Rule 5: Discount Floor
```
If (subtotal - totalDiscounts) < 0:
  totalDiscounts = subtotal
  finalTotal = taxOnly
```

### 5.2 Tax Calculation Logic

#### Rule 1: Tax Rate
- Default: 0.08 (8%)
- Configurable via environment variable: `TAX_RATE`

#### Rule 2: Tax Calculation
```
taxableAmount = subtotal - totalDiscounts
taxAmount = taxableAmount * taxRate
```

#### Rule 3: Tax on Discounted Amount
- Tax is calculated AFTER discounts are applied
- Never tax the original subtotal

### 5.3 Cart Abandonment Logic

#### Rule 1: Abandonment Trigger
- Cart is abandoned when: `now - lastActivityAt > 30 minutes`
- 30 minutes = 1800000 milliseconds

#### Rule 2: Abandonment Detection
**Options for Implementation**:
- **Option A**: Check on every cart access (lazy evaluation)
- **Option B**: Background timer that periodically checks all carts
- **Recommendation**: Option A for simplicity (in-memory storage)

#### Rule 3: Activities that Reset Timer
Any of these actions update `lastActivityAt`:
- GET /api/cart/:cartId
- POST /api/cart/:cartId/items
- PUT /api/cart/:cartId/items/:productId
- DELETE /api/cart/:cartId/items/:productId
- POST /api/cart/:cartId/coupons
- GET /api/cart/:cartId/total

#### Rule 4: Abandoned Cart Behavior
- Status changes to 'abandoned'
- Cart still accessible (can be reactivated)
- Reactivation: Any activity sets status back to 'active'

### 5.4 Session Management Logic

#### Rule 1: Anonymous Carts
- Use `sessionId` field
- Generated client-side (e.g., browser localStorage)
- No authentication required

#### Rule 2: Authenticated Carts
- Use `userId` field
- Requires authentication (out of scope for this task)
- P2 Feature: Merge anonymous cart on login

#### Rule 3: Cart Ownership
- Cart belongs to sessionId OR userId
- Both can coexist (for migration scenarios)

---

## 6. API Endpoint Specifications

### 6.1 Endpoint Summary Table

| Method | Endpoint | Description | Success | Errors |
|--------|----------|-------------|---------|--------|
| POST | /api/cart | Create new cart | 201 | 400 |
| GET | /api/cart/:cartId | Get cart by ID | 200 | 404 |
| POST | /api/cart/:cartId/items | Add item to cart | 200 | 400, 404 |
| PUT | /api/cart/:cartId/items/:productId | Update item quantity | 200 | 400, 404 |
| DELETE | /api/cart/:cartId/items/:productId | Remove item | 200 | 404 |
| POST | /api/cart/:cartId/coupons | Apply coupon | 200 | 400, 404 |
| GET | /api/cart/:cartId/total | Get cart total | 200 | 404 |

### 6.2 Detailed Endpoint Specifications

See Section 2.1 (Functional Requirements) for detailed request/response specifications for each endpoint.

---

## 7. Success Criteria

### 7.1 P0 (Must Have) - Blocking Issues

These must all be met for the task to be considered complete:

- [ ] **EP-1**: POST /api/cart creates new cart with unique ID
- [ ] **EP-2**: GET /api/cart/:cartId returns cart or 404
- [ ] **EP-3**: POST /api/cart/:cartId/items adds/updates items
- [ ] **EP-4**: PUT /api/cart/:cartId/items/:productId updates quantity
- [ ] **EP-5**: DELETE /api/cart/:cartId/items/:productId removes item
- [ ] **EP-6**: POST /api/cart/:cartId/coupons applies discount
- [ ] **EP-7**: GET /api/cart/:cartId/total returns accurate totals
- [ ] **BL-1**: Percentage discounts calculated correctly
- [ ] **BL-2**: Fixed discounts calculated correctly
- [ ] **BL-3**: Tax applied after discounts (8% default)
- [ ] **BL-4**: Totals never negative (floor protection)
- [ ] **TS-1**: TypeScript strict mode enabled, zero errors
- [ ] **VAL-1**: Zod validation on all input endpoints
- [ ] **TEST-1**: Test coverage >= 80%
- [ ] **TEST-2**: All tests passing (100% pass rate)
- [ ] **DOC-1**: README.md with setup and API docs
- [ ] **BUILD-1**: npm run build succeeds
- [ ] **LINT-1**: npm run lint shows zero errors

### 7.2 P1 (Should Have) - High Priority

These should be implemented if time permits:

- [ ] **BL-5**: Cart abandonment after 30 minutes tracked
- [ ] **BL-6**: Multiple coupon handling (stacking or best-single)
- [ ] **ERR-1**: Proper HTTP status codes for all scenarios
- [ ] **ERR-2**: Structured error responses with codes
- [ ] **VAL-2**: ESLint configured with TypeScript plugin
- [ ] **DOC-2**: JSDoc comments on public APIs
- [ ] **TEST-3**: Edge case coverage (empty cart, expired coupons)

### 7.3 P2 (Nice to Have) - Low Priority

These are optional enhancements:

- [ ] Cart merge on login (anonymous to authenticated)
- [ ] Request/response logging middleware
- [ ] Price change notifications
- [ ] Saved for later functionality

### 7.4 Meta-Learning Success Criteria

For the experiment:

- [ ] **META-1**: QuickMeta session directory created
- [ ] **META-2**: planning.json generated with patterns
- [ ] **META-3**: design.json generated with decisions
- [ ] **META-4**: implementation.json generated with metrics
- [ ] **META-5**: operation.json generated with handoff note
- [ ] **META-6**: All meta files < 2KB (performance goal)
- [ ] **EXP-1**: Baseline metrics recorded (time, turns, tools, searches)

---

## 8. Architecture Decisions Needed (Phase 2)

The following decisions require architect input:

### Decision 1: Coupon Stacking Strategy
- **Question**: Should multiple coupons stack or should we take the best single discount?
- **Options**:
  - A. Stack all discounts (simpler, more generous)
  - B. Best single discount (more realistic e-commerce)
- **Recommendation**: A (stacking) for baseline simplicity

### Decision 2: Abandonment Detection Method
- **Question**: How to detect abandoned carts?
- **Options**:
  - A. Lazy evaluation on cart access
  - B. Background timer process
- **Recommendation**: A (lazy) for in-memory simplicity

### Decision 3: Storage Structure
- **Question**: Map with cart ID as key, or array?
- **Options**:
  - A. Map<string, Cart> (O(1) lookup)
  - B. Array with .find() (O(n) lookup)
- **Recommendation**: A (Map) for performance

### Decision 4: Coupon Storage
- **Question**: Should coupons be pre-seeded or dynamically created?
- **Options**:
  - A. Pre-seed 5-10 test coupons on startup
  - B. Provide admin endpoint to create coupons
- **Recommendation**: A (pre-seed) for testing simplicity

### Decision 5: Timestamp Precision
- **Question**: Use Date.now() milliseconds or ISO strings?
- **Options**:
  - A. ISO 8601 strings (human-readable)
  - B. Unix timestamps (milliseconds)
- **Recommendation**: A (ISO) for API clarity

---

## 9. File Structure and Organization

### 9.1 Recommended Directory Structure

```
step1-shopping-cart/
├── src/
│   ├── server.ts                 # Express server setup, middleware
│   ├── types/
│   │   └── cart.ts               # All TypeScript interfaces
│   ├── validators/
│   │   └── cart.ts               # Zod schemas
│   ├── storage/
│   │   ├── cart.ts               # Cart storage (Map)
│   │   └── coupon.ts             # Coupon storage, validation
│   ├── services/
│   │   ├── discount.ts           # Discount calculation logic
│   │   └── abandonment.ts        # Abandonment detection
│   └── routes/
│       └── cart.ts               # Express route handlers
├── tests/
│   └── cart.test.ts              # Comprehensive test suite
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

**types/cart.ts**:
- Export all TypeScript interfaces
- Cart, CartItem, Coupon, AppliedCoupon, CartTotals

**validators/cart.ts**:
- Zod schemas for all endpoints
- Export validation functions

**storage/cart.ts**:
- Map-based cart storage
- CRUD operations: create, get, update, delete
- Export getCart, createCart, updateCart, deleteCart

**storage/coupon.ts**:
- Map-based coupon storage
- Validation: exists, not expired, max uses
- Export getCoupon, validateCoupon, incrementUsage

**services/discount.ts**:
- Calculate discount amount from coupons
- Handle percentage vs fixed logic
- Export calculateDiscount(cart, coupons)

**services/abandonment.ts**:
- Check if cart abandoned
- Update cart status if needed
- Export checkAbandonment(cart)

**routes/cart.ts**:
- Express Router with all 7 endpoints
- Request validation using Zod
- Business logic coordination
- Response formatting

---

## 10. Dependencies and Setup

### 10.1 Production Dependencies

```json
{
  "express": "^4.18.2",
  "zod": "^3.22.4",
  "uuid": "^9.0.1"
}
```

### 10.2 Development Dependencies

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
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules", "dist", "tests"]
}
```

---

## 11. Testing Strategy

### 11.1 Test Categories

#### Unit Tests
- Discount calculation service
- Abandonment detection service
- Storage operations (get, set, update, delete)

#### Integration Tests
- All 7 API endpoints
- Request validation with invalid inputs
- Error handling and status codes

#### Edge Case Tests
- Empty cart totals
- Expired coupons
- Max quantity exceeded
- Coupon exceeds cart value
- Multiple items in cart
- Multiple coupons applied

### 11.2 Test Coverage Goals

- Overall: >= 80%
- Routes: >= 90% (critical path)
- Services: >= 85%
- Storage: >= 75%
- Types/validators: >= 60% (mostly type-level)

### 11.3 Test Organization

```typescript
describe('Shopping Cart API', () => {
  describe('POST /api/cart', () => {
    it('should create new cart with unique ID', async () => {});
    it('should return 201 status', async () => {});
    it('should initialize empty items array', async () => {});
  });

  describe('POST /api/cart/:cartId/items', () => {
    it('should add new item to cart', async () => {});
    it('should update quantity if item exists', async () => {});
    it('should validate quantity range', async () => {});
    it('should return 404 if cart not found', async () => {});
  });

  // ... more endpoint tests
});

describe('Discount Service', () => {
  it('should calculate percentage discount correctly', () => {});
  it('should calculate fixed discount correctly', () => {});
  it('should handle multiple coupons', () => {});
  it('should cap discount at subtotal', () => {});
});

describe('Abandonment Service', () => {
  it('should mark cart abandoned after 30 minutes', () => {});
  it('should not mark cart abandoned if recently active', () => {});
});
```

---

## 12. Risk Analysis

### 12.1 P0 Risks (Critical - Block Implementation)

| Risk | Description | Mitigation | Owner |
|------|-------------|------------|-------|
| **R-P0-1** | Tax calculation order wrong (tax before discount) | Document calculation order clearly in this spec | Architect |
| **R-P0-2** | Negative total possible | Add floor protection in discount service | Builder |
| **R-P0-3** | Zod validation missing on endpoints | Create validation checklist for all 7 endpoints | Builder |

### 12.2 P1 Risks (High - Address Before Completion)

| Risk | Description | Mitigation | Owner |
|------|-------------|------------|-------|
| **R-P1-1** | Test coverage < 80% | Write tests alongside implementation, check coverage early | Builder |
| **R-P1-2** | TypeScript errors from implicit any | Enable strict mode from start, no any types | Builder |
| **R-P1-3** | Coupon validation logic incomplete | Implement all validation rules in storage/coupon.ts | Builder |

### 12.3 P2 Risks (Medium - Monitor)

| Risk | Description | Mitigation | Owner |
|------|-------------|------------|-------|
| **R-P2-1** | Concurrent modification race conditions | Document that in-memory storage uses last-write-wins | Architect |
| **R-P2-2** | Cart abandonment check performance | Use lazy evaluation, not background timer | Architect |

---

## 13. Implementation Phases (For Phase 3 Guidance)

### Phase 3A: Foundation (Est. 10-15 min)
1. Initialize npm project
2. Install dependencies
3. Configure TypeScript (strict mode)
4. Configure ESLint
5. Create directory structure
6. Define all types in types/cart.ts

### Phase 3B: Storage Layer (Est. 5-7 min)
1. Implement cart storage (Map-based)
2. Implement coupon storage with pre-seeded coupons
3. Create helper functions (get, create, update, delete)

### Phase 3C: Validation Layer (Est. 5 min)
1. Create Zod schemas for all endpoints
2. Export validation functions

### Phase 3D: Business Logic (Est. 8-10 min)
1. Implement discount service (percentage + fixed)
2. Implement abandonment service
3. Add total calculation logic

### Phase 3E: API Routes (Est. 10-12 min)
1. Implement POST /api/cart
2. Implement GET /api/cart/:cartId
3. Implement POST /api/cart/:cartId/items
4. Implement PUT /api/cart/:cartId/items/:productId
5. Implement DELETE /api/cart/:cartId/items/:productId
6. Implement POST /api/cart/:cartId/coupons
7. Implement GET /api/cart/:cartId/total

### Phase 3F: Testing (Est. 12-18 min)
1. Test cart creation
2. Test item operations (add, update, remove)
3. Test coupon application
4. Test total calculation
5. Test edge cases
6. Run coverage report
7. Fix any gaps

### Phase 3G: Documentation (Est. 5 min)
1. Write README.md
2. Add JSDoc comments
3. Create example curl commands

---

## 14. Meta-Learning Opportunities

### 14.1 Patterns Established by This Task

This baseline task will establish the following transferable patterns:

1. **CRUD API Pattern**:
   - RESTful endpoint design
   - HTTP status code usage
   - Request/response structure
   - **Transfers to**: All subsequent REST API tasks (14 tasks)

2. **Validation Pattern**:
   - Zod schema definition
   - Runtime type checking
   - Error message formatting
   - **Transfers to**: Every task with input validation (15 tasks)

3. **Rule Engine Pattern**:
   - Coupon eligibility rules
   - Discount calculation rules
   - **Transfers to**: fraud-detection, inventory-sync (2 tasks)

4. **State Management Pattern**:
   - Cart status lifecycle (active, abandoned, converted)
   - Status transition rules
   - **Transfers to**: order-book, stripe-payment, fulfillment (3 tasks)

5. **Session Management Pattern**:
   - Anonymous vs authenticated handling
   - Session tracking
   - **Transfers to**: twitter-timeline, netflix-streaming (2 tasks)

6. **Testing Strategy Pattern**:
   - Test organization (describe blocks)
   - Endpoint testing with supertest
   - Edge case identification
   - **Transfers to**: All tasks (15 tasks)

7. **Error Handling Pattern**:
   - Structured error responses
   - Error code conventions
   - HTTP status code mapping
   - **Transfers to**: All tasks (15 tasks)

### 14.2 Expected Reuse in Future Tasks

| Pattern | Reuse Count | High-Value Transfers |
|---------|-------------|---------------------|
| CRUD API | 14 tasks | stats-library, fraud-detection, ml-tracker |
| Validation | 15 tasks | All subsequent tasks |
| Rule Engine | 2 tasks | fraud-detection, inventory-sync |
| State Management | 8 tasks | order-book, stripe-payment, fulfillment |
| Testing Strategy | 15 tasks | All subsequent tasks |
| Error Handling | 15 tasks | All subsequent tasks |

### 14.3 Hypothesis Validation

This task will validate:

**H1: Baseline Efficiency**
- Expected: 40-50 minutes total time
- Expected: 10-12 turns
- Expected: 35-45 tool calls
- Expected: 4-5 web searches

**H2: Pattern Extraction**
- QuickMeta should extract 6-8 patterns from this task
- Patterns should appear in planning.json, design.json, implementation.json

**H3: Quality Maintenance**
- Test coverage: >= 80%
- Test pass rate: 100%
- TypeScript errors: 0
- ESLint errors: 0

---

## 15. Handoff to Phase 2 (Design)

### 15.1 Architect Checklist

The architect (Phase 2) should address:

- [ ] Decide coupon stacking strategy (stack vs best-single)
- [ ] Decide abandonment detection method (lazy vs background)
- [ ] Design storage structure (Map vs Array)
- [ ] Design coupon pre-seeding approach
- [ ] Design error response format details
- [ ] Document all architectural decisions with rationale
- [ ] Create tradeoff analysis for key decisions
- [ ] Specify module interfaces and dependencies

### 15.2 Open Questions for Architect

1. Should we support cart merging (P2 feature)?
2. Should coupon application be idempotent (applying same coupon twice)?
3. Should we store discount amount or calculate on-demand?
4. Should abandoned carts be deletable or permanent?
5. How should we handle decimal precision for currency?

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

### 16.1 Example Coupon Seeds

Pre-seed these coupons for testing:

```typescript
const seedCoupons: Coupon[] = [
  {
    code: 'SAVE10',
    type: 'percentage',
    value: 10,
    usedCount: 0,
  },
  {
    code: 'SAVE20',
    type: 'percentage',
    value: 20,
    minCartValue: 50,
    usedCount: 0,
  },
  {
    code: 'FLAT5',
    type: 'fixed',
    value: 5,
    usedCount: 0,
  },
  {
    code: 'EXPIRED',
    type: 'percentage',
    value: 25,
    expiresAt: '2020-01-01T00:00:00.000Z', // Expired
    usedCount: 0,
  },
  {
    code: 'LIMITED',
    type: 'fixed',
    value: 10,
    maxUses: 1,
    usedCount: 0,
  },
];
```

### 16.2 Example Request/Response Flows

**Flow 1: Create Cart and Add Items**
```
1. POST /api/cart
   → 201 Created, cart ID: abc-123

2. POST /api/cart/abc-123/items
   Body: { productId: "prod-1", name: "Widget", quantity: 2, price: 29.99 }
   → 200 OK, cart with 1 item (subtotal: 59.98)

3. POST /api/cart/abc-123/items
   Body: { productId: "prod-2", name: "Gadget", quantity: 1, price: 49.99 }
   → 200 OK, cart with 2 items (subtotal: 109.97)

4. POST /api/cart/abc-123/coupons
   Body: { code: "SAVE10" }
   → 200 OK, cart with 10% discount applied

5. GET /api/cart/abc-123/total
   → 200 OK
   {
     subtotal: 109.97,
     taxRate: 0.08,
     taxAmount: 7.92,
     discountAmount: 10.99,
     total: 106.90
   }
```

### 16.3 Common Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| CART_NOT_FOUND | 404 | Cart ID doesn't exist |
| ITEM_NOT_FOUND | 404 | Product not in cart |
| INVALID_CART_ID | 400 | Cart ID format invalid |
| INVALID_QUANTITY | 400 | Quantity out of range (1-99) |
| INVALID_PRICE | 400 | Price <= 0 |
| COUPON_NOT_FOUND | 400 | Coupon code doesn't exist |
| COUPON_EXPIRED | 400 | Coupon past expiration |
| MINIMUM_CART_VALUE_NOT_MET | 400 | Cart below coupon minimum |
| COUPON_MAX_USES_EXCEEDED | 400 | Coupon usage limit reached |
| VALIDATION_ERROR | 400 | Zod validation failed |

---

## Document Status

**Status**: PLANNING COMPLETE
**Version**: 1.0
**Date**: 2026-01-18
**Next Phase**: Phase 2 - Design (Architect)
**Estimated Phase 2 Duration**: 8-12 minutes

---

## Approval

This problem definition is comprehensive and ready for Phase 2 (Design).

**Key Achievements**:
- Problem clearly defined
- All 7 endpoints specified
- Business rules documented
- Edge cases identified
- Data models defined
- Success criteria established
- Risks analyzed
- Meta-learning opportunities identified

**Phase 1 Complete**: ✅
