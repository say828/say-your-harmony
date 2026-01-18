# Task: Shopping Cart System with Discount Engine

**Task ID**: `shopping-cart`
**Complexity**: Simple-Medium
**Domain**: E-commerce / Cart
**Estimated Duration**: 40-50 minutes (baseline, no meta-analysis)

---

## Overview

Build a shopping cart system with discount/coupon engine, cart abandonment tracking, and session management. This task serves as the baseline for the incremental experiment and establishes foundational patterns.

---

## Requirements

### 1. Functional Requirements

#### Cart Management Endpoints

Implement the following RESTful endpoints:

1. **POST /api/cart**
   - Creates a new cart (session-based or authenticated)
   - Response: `201 Created` with cart object including empty items array

2. **GET /api/cart/:cartId**
   - Returns cart with all items and calculated totals
   - Response: `200 OK` with full cart details
   - Response: `404 Not Found` if cart doesn't exist

3. **POST /api/cart/:cartId/items**
   - Adds item to cart or updates quantity if already exists
   - Request body: `{ productId: string, quantity: number, price: number }`
   - Response: `200 OK` with updated cart
   - Response: `400 Bad Request` if validation fails

4. **PUT /api/cart/:cartId/items/:productId**
   - Updates quantity of existing item
   - Request body: `{ quantity: number }`
   - Response: `200 OK` with updated cart
   - Response: `404 Not Found` if cart or item doesn't exist

5. **DELETE /api/cart/:cartId/items/:productId**
   - Removes item from cart
   - Response: `200 OK` with updated cart
   - Response: `404 Not Found` if cart or item doesn't exist

6. **POST /api/cart/:cartId/coupons**
   - Applies coupon code to cart
   - Request body: `{ code: string }`
   - Response: `200 OK` with updated cart and discount applied
   - Response: `400 Bad Request` if coupon is invalid or expired

7. **GET /api/cart/:cartId/total**
   - Returns calculated totals with tax and discounts
   - Response: `200 OK` with breakdown of subtotal, tax, discounts, total

#### Data Models

```typescript
interface Cart {
  id: string;                    // UUID v4
  sessionId?: string;            // For anonymous carts
  userId?: string;               // For authenticated users
  items: CartItem[];
  coupons: AppliedCoupon[];
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
  lastActivityAt: string;        // For abandonment tracking
  status: 'active' | 'abandoned' | 'converted';
}

interface CartItem {
  productId: string;
  name: string;
  price: number;                 // Unit price
  quantity: number;
  subtotal: number;              // price * quantity
}

interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;                 // Percentage (0-100) or fixed amount
  minCartValue?: number;         // Minimum cart value to apply
  expiresAt?: string;            // ISO 8601 timestamp
  maxUses?: number;
  usedCount: number;
}

interface AppliedCoupon {
  code: string;
  discountAmount: number;
}

interface CartTotals {
  subtotal: number;
  taxRate: number;               // e.g., 0.08 for 8%
  taxAmount: number;
  discountAmount: number;
  total: number;
}
```

#### Storage

- Use in-memory storage (Map or object)
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
- Cart ID: required, valid UUID
- Product ID: required, string
- Quantity: required, positive integer, max 99
- Price: required, positive number
- Coupon code: required, string, 1-50 characters
- Validate all incoming requests before processing

#### Error Handling

- Proper HTTP status codes for all scenarios
- Structured error responses:
  ```typescript
  {
    error: string;      // Error message
    code: string;       // Error code (e.g., "CART_NOT_FOUND")
    details?: any;      // Additional details
  }
  ```

#### Business Logic

1. **Discount Calculation**:
   - Percentage discounts: Apply percentage to subtotal
   - Fixed discounts: Subtract fixed amount from subtotal
   - Multiple coupons: Stack if valid, or take best single discount
   - Ensure total never goes below 0

2. **Tax Calculation**:
   - Apply tax after discounts
   - Configurable tax rate (default 8%)

3. **Cart Abandonment**:
   - Mark cart as 'abandoned' after 30 minutes of inactivity
   - Track lastActivityAt on every cart modification

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
  - Edge cases (empty cart, multiple items, coupon stacking)

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
2. **src/routes/cart.ts** - Cart API route handlers
3. **src/types/cart.ts** - TypeScript interfaces for Cart models
4. **src/validators/cart.ts** - Zod schemas for validation
5. **src/storage/cart.ts** - In-memory cart storage implementation
6. **src/storage/coupon.ts** - Coupon storage and validation
7. **src/services/discount.ts** - Discount calculation logic
8. **src/services/abandonment.ts** - Cart abandonment detection
9. **tests/cart.test.ts** - Comprehensive test suite
10. **package.json** - Dependencies and scripts
11. **tsconfig.json** - TypeScript configuration
12. **.eslintrc.json** - ESLint configuration
13. **README.md** - Documentation

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

- [ ] All 7 endpoints implemented and working
- [ ] Cart CRUD operations functional
- [ ] Discount engine supports percentage and fixed coupons
- [ ] Tax calculation applied correctly
- [ ] TypeScript strict mode enabled with zero errors
- [ ] Zod validation on all inputs
- [ ] Test coverage >= 80%
- [ ] All tests passing
- [ ] README with complete API documentation

### Should Have (P1)

- [ ] Cart abandonment tracking with 30-minute timeout
- [ ] Multiple coupon handling (stacking or best-single logic)
- [ ] Proper HTTP status codes for all scenarios
- [ ] Structured error responses
- [ ] ESLint configured and zero errors
- [ ] JSDoc comments on public APIs

### Nice to Have (P2)

- [ ] Cart merge functionality (anonymous to authenticated)
- [ ] Request/response logging middleware
- [ ] Price change notifications
- [ ] Saved for later functionality

---

## Example Usage

### Create a Cart

```bash
curl -X POST http://localhost:3000/api/cart \
  -H "Content-Type: application/json"
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "items": [],
  "coupons": [],
  "createdAt": "2026-01-18T15:30:00.000Z",
  "updatedAt": "2026-01-18T15:30:00.000Z",
  "lastActivityAt": "2026-01-18T15:30:00.000Z",
  "status": "active"
}
```

### Add Item to Cart

```bash
curl -X POST http://localhost:3000/api/cart/550e8400-e29b-41d4-a716-446655440000/items \
  -H "Content-Type: application/json" \
  -d '{"productId": "prod-123", "name": "Widget", "quantity": 2, "price": 29.99}'
```

### Apply Coupon

```bash
curl -X POST http://localhost:3000/api/cart/550e8400-e29b-41d4-a716-446655440000/coupons \
  -H "Content-Type: application/json" \
  -d '{"code": "SAVE10"}'
```

### Get Cart Total

```bash
curl http://localhost:3000/api/cart/550e8400-e29b-41d4-a716-446655440000/total
```

Response:
```json
{
  "subtotal": 59.98,
  "taxRate": 0.08,
  "taxAmount": 4.32,
  "discountAmount": 6.00,
  "total": 58.30
}
```

---

## Testing Guidelines

### Required Test Cases

1. **Cart Creation**
   - Creates cart with unique ID
   - Returns empty cart with correct structure
   - Sets timestamps correctly

2. **Add Items**
   - Adds new item to cart
   - Updates quantity if item already exists
   - Calculates subtotal correctly
   - Validates quantity limits

3. **Remove Items**
   - Removes item from cart
   - Returns 404 if item not in cart
   - Updates cart totals

4. **Coupon Application**
   - Applies percentage discount correctly
   - Applies fixed discount correctly
   - Validates coupon existence and expiration
   - Handles minimum cart value requirements
   - Prevents applying expired coupons

5. **Total Calculation**
   - Calculates subtotal correctly
   - Applies discounts before tax
   - Calculates tax on discounted amount
   - Handles multiple items

6. **Cart Abandonment**
   - Marks cart abandoned after 30 minutes
   - Updates lastActivityAt on modifications

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

1. **Start with types** - Define Cart, CartItem, Coupon interfaces first
2. **Implement storage** - Simple Map-based storage for carts and coupons
3. **Build discount service** - Separate logic for calculating discounts
4. **Add validation** - Set up Zod schemas before route handlers
5. **Build routes incrementally** - Start with cart CRUD, then items, then coupons
6. **Test as you go** - Write tests alongside implementation

---

## Common Pitfalls to Avoid

1. **Forgetting to parse JSON** - Use `express.json()` middleware
2. **Tax calculation order** - Apply discounts before calculating tax
3. **Mutation issues** - Return copies of carts, not direct references
4. **Coupon validation** - Check expiration, min cart value, max uses
5. **Missing error handling** - Always handle validation errors from Zod
6. **Inconsistent timestamps** - Use `new Date().toISOString()` for consistency

---

## Time Estimates

| Phase | Estimated Time |
|-------|---------------|
| Setup (package.json, tsconfig) | 3-5 min |
| Types and storage | 5-7 min |
| Validation schemas | 5 min |
| Discount service | 7-10 min |
| Route handlers | 12-15 min |
| Tests | 12-18 min |
| Documentation | 5 min |
| **Total (baseline)** | **49-65 min** |
| **Total (with meta)** | **25-32 min** |

---

## Meta-Learning Opportunities

This task establishes foundational patterns that will transfer to subsequent tasks:

1. **CRUD Patterns**: Cart management patterns transfer to all REST APIs
2. **Rule Engine**: Discount/coupon logic transfers to fraud detection, inventory alerts
3. **Session Management**: Session handling transfers to auth systems
4. **State Management**: Cart status lifecycle transfers to order fulfillment
5. **Validation Strategies**: Zod validation patterns transfer universally
6. **Testing Strategies**: Test organization transfers to all tasks

**Expected Efficiency Gain with Meta-Analysis**: 35-40% reduction in time and turns through:
- Pre-existing knowledge of Express/Zod patterns
- Reuse of validation strategies
- Established testing patterns
- CRUD API design patterns
- Discount calculation patterns
