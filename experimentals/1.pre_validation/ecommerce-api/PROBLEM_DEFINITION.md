# E-commerce API - Problem Definition

## Phase 1: Planning Document

**Project**: E-commerce REST API
**Location**: `experimentals/1.pre_validation/ecommerce-api/`
**Complexity**: Medium
**Domain**: E-commerce / Retail

---

## 1. Problem Statement

### What problem are we solving?

Build a complete E-commerce REST API that enables:
1. **Product Management** - Full CRUD operations for product catalog
2. **Shopping Cart** - Session-based cart with add/remove/update operations
3. **Order Processing** - Order creation with status workflow management
4. **Inventory Management** - Real-time stock tracking and updates
5. **User Authentication** - JWT-based secure authentication
6. **Data Validation** - Comprehensive input validation with Zod

### Business Context

This API serves as the backend for a small-to-medium e-commerce platform supporting:
- Anonymous browsing and cart management (session-based)
- Authenticated user checkout and order history
- Admin product and inventory management
- Order fulfillment workflow

---

## 2. Functional Requirements

### 2.1 Product Management (CRUD)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/products` | GET | List all products (paginated) | No |
| `/api/products/:id` | GET | Get single product details | No |
| `/api/products` | POST | Create new product | Admin |
| `/api/products/:id` | PUT | Update product | Admin |
| `/api/products/:id` | DELETE | Delete product | Admin |
| `/api/products/search` | GET | Search products by name/category | No |

**Product Data Model:**
```typescript
interface Product {
  id: string;                    // UUID v4
  name: string;                  // 1-200 characters
  description: string;           // 0-2000 characters
  price: number;                 // Positive decimal, 2 decimal places
  category: string;              // Product category
  imageUrl?: string;             // Optional image URL
  stock: number;                 // Current inventory count
  isActive: boolean;             // Soft delete flag
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}
```

**Business Rules:**
- Price must be positive and have max 2 decimal places
- Stock cannot be negative
- Deleting a product sets `isActive: false` (soft delete)
- Products with `isActive: false` excluded from public listings

### 2.2 Shopping Cart System

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/cart` | POST | Create new cart | No |
| `/api/cart/:cartId` | GET | Get cart contents | No |
| `/api/cart/:cartId/items` | POST | Add item to cart | No |
| `/api/cart/:cartId/items/:productId` | PUT | Update item quantity | No |
| `/api/cart/:cartId/items/:productId` | DELETE | Remove item from cart | No |
| `/api/cart/:cartId/clear` | DELETE | Clear all items | No |

**Cart Data Model:**
```typescript
interface Cart {
  id: string;                    // UUID v4
  sessionId?: string;            // For anonymous users
  userId?: string;               // For authenticated users
  items: CartItem[];
  createdAt: string;
  updatedAt: string;
  expiresAt: string;             // Cart expiration (24 hours)
}

interface CartItem {
  productId: string;
  productName: string;           // Snapshot at add time
  unitPrice: number;             // Snapshot at add time
  quantity: number;              // 1-99
  subtotal: number;              // unitPrice * quantity
}
```

**Business Rules:**
- Cart expires after 24 hours of inactivity
- Maximum 99 units per product per cart
- Price snapshot taken at time of adding to cart
- Quantity update recalculates subtotal

### 2.3 Order Processing Workflow

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/orders` | POST | Create order from cart | Yes |
| `/api/orders` | GET | List user's orders | Yes |
| `/api/orders/:id` | GET | Get order details | Yes |
| `/api/orders/:id/status` | PATCH | Update order status | Admin |
| `/api/orders/:id/cancel` | POST | Cancel order | Yes (owner) |

**Order Data Model:**
```typescript
interface Order {
  id: string;                    // UUID v4
  userId: string;                // Required - must be authenticated
  items: OrderItem[];
  status: OrderStatus;
  subtotal: number;
  tax: number;                   // 8% tax rate
  total: number;
  shippingAddress: Address;
  createdAt: string;
  updatedAt: string;
}

type OrderStatus =
  | 'pending'      // Initial state
  | 'confirmed'    // Payment confirmed
  | 'processing'   // Being prepared
  | 'shipped'      // In transit
  | 'delivered'    // Completed
  | 'cancelled';   // Cancelled by user or admin
```

**Order Status Workflow:**
```
pending → confirmed → processing → shipped → delivered
    ↓         ↓           ↓
cancelled  cancelled  cancelled (refund required)
```

**Business Rules:**
- Order creation requires authenticated user
- Order creation decrements inventory
- Orders can only be cancelled in pending/confirmed/processing states
- Cancellation restores inventory
- Users can only view/cancel their own orders
- Admins can view all orders and update status

### 2.4 Inventory Management

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/inventory/:productId` | GET | Get current stock level | Admin |
| `/api/inventory/:productId` | PUT | Update stock level | Admin |
| `/api/inventory/low-stock` | GET | Get products with low stock | Admin |
| `/api/inventory/audit` | GET | Get inventory change history | Admin |

**Inventory Rules:**
- Stock cannot go negative
- Order creation automatically decrements stock
- Order cancellation automatically restores stock
- Low stock threshold: 10 units (configurable)
- All stock changes logged for audit

### 2.5 User Authentication (JWT)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/auth/register` | POST | Register new user | No |
| `/api/auth/login` | POST | Login and get tokens | No |
| `/api/auth/refresh` | POST | Refresh access token | No |
| `/api/auth/me` | GET | Get current user | Yes |
| `/api/auth/logout` | POST | Invalidate refresh token | Yes |

**User Data Model:**
```typescript
interface User {
  id: string;                    // UUID v4
  email: string;                 // Unique, valid email format
  passwordHash: string;          // bcrypt hashed
  role: 'user' | 'admin';
  firstName: string;
  lastName: string;
  createdAt: string;
  updatedAt: string;
}
```

**Authentication Rules:**
- Password: min 8 chars, 1 uppercase, 1 lowercase, 1 number
- Access token expiry: 15 minutes
- Refresh token expiry: 7 days
- Rate limiting: 5 login attempts per minute per IP

---

## 3. Non-Functional Requirements

### 3.1 Performance
- API response time < 100ms for simple queries
- Cart operations < 50ms
- Order creation < 200ms
- Pagination for list endpoints (default: 20 items)

### 3.2 Security
- JWT tokens with secure signing (HS256)
- Password hashing with bcrypt (10 salt rounds)
- Input validation on all endpoints
- Rate limiting on authentication endpoints

### 3.3 Maintainability
- TypeScript strict mode enabled
- Modular architecture (controllers, services, storage)
- Comprehensive test coverage (>= 80%)

---

## 4. Constraints & Assumptions

### 4.1 Technical Constraints

| Constraint | Reason |
|------------|--------|
| In-memory storage only | Simplicity for validation |
| Node.js 20+ | Native ESM support |
| Express.js | Specified in requirements |
| TypeScript strict mode | Type safety |
| Zod for validation | Specified in requirements |
| Vitest for testing | Specified in requirements |

### 4.2 Out of Scope

- Database integration
- Payment gateway integration
- Email service integration
- File upload and image processing
- Multi-language support (i18n)
- WebSocket real-time updates

---

## 5. Success Criteria

### 5.1 Must Have (P0)

- [ ] All 6 feature domains implemented
- [ ] TypeScript compiles (0 errors)
- [ ] All tests pass
- [ ] Test coverage >= 80%
- [ ] JWT authentication working
- [ ] Role-based authorization working
- [ ] Input validation on all endpoints

### 5.2 Should Have (P1)

- [ ] Cart expiration (24 hours)
- [ ] Order status workflow complete
- [ ] Inventory auto-update on order/cancel
- [ ] Rate limiting on auth endpoints
- [ ] README with API documentation

### 5.3 Nice to Have (P2)

- [ ] Product search functionality
- [ ] Inventory audit log
- [ ] Health check endpoint

---

## 6. API Endpoints Summary

### Total Endpoints: 25

| Domain | Endpoints | Auth Required |
|--------|-----------|---------------|
| Products | 6 | Mixed |
| Cart | 6 | No |
| Orders | 5 | Yes |
| Inventory | 4 | Admin |
| Auth | 5 | Mixed |

---

## 7. Project Structure

```
ecommerce-api/
├── package.json
├── tsconfig.json
├── vitest.config.ts
├── README.md
│
├── src/
│   ├── server.ts
│   ├── types/
│   ├── schemas/
│   ├── storage/
│   ├── services/
│   ├── routes/
│   ├── middleware/
│   └── utils/
│
└── tests/
    ├── unit/
    └── integration/
```

---

## 8. Dependencies

```json
{
  "dependencies": {
    "express": "^4.21.0",
    "zod": "^3.23.8",
    "jsonwebtoken": "^9.0.2",
    "bcryptjs": "^2.4.3",
    "uuid": "^10.0.0"
  },
  "devDependencies": {
    "typescript": "^5.7.0",
    "tsx": "^4.19.0",
    "vitest": "^2.1.0",
    "supertest": "^7.0.0",
    "@types/express": "^5.0.0",
    "@types/jsonwebtoken": "^9.0.7",
    "@types/bcryptjs": "^2.4.6",
    "@types/supertest": "^6.0.2"
  }
}
```

---

**Document Version**: 1.0
**Created**: 2026-01-19
**Phase**: 1 - Planning (Complete)
**Next Phase**: 2 - Design
