# Bank Service API - Problem Definition

## Phase 1: Planning Document

**Project**: Bank Service REST API
**Location**: `experimentals/1.pre_validation/bank-service/`
**Complexity**: Medium
**Domain**: Financial Services / Banking

---

## 1. Problem Statement

### What problem are we solving?

Build a comprehensive Bank Service REST API that enables:
1. **Account Management** - Create, view, and manage bank accounts
2. **Deposit Operations** - Add funds to accounts with transaction tracking
3. **Withdrawal Operations** - Remove funds with balance validation
4. **Balance Inquiry** - Real-time balance checking
5. **Transaction History** - Complete audit trail of all account activities
6. **Data Validation** - Comprehensive input validation for financial operations

### Business Context

This API serves as a proof-of-concept banking backend supporting:
- Account creation with owner identification
- Secure deposit and withdrawal operations
- Real-time balance queries
- Transaction history with filtering and pagination
- Audit logging for compliance

### Why is this important?

Banking services require:
- **Data Integrity**: Financial transactions must be atomic and consistent
- **Audit Trail**: All operations must be logged for compliance
- **Validation**: Strict input validation to prevent invalid transactions
- **Security**: Protection against unauthorized access and double-spending

---

## 2. Functional Requirements

### 2.1 Account Management (CRUD)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/accounts` | POST | Create new bank account | Yes |
| `/api/accounts` | GET | List user's accounts | Yes |
| `/api/accounts/:id` | GET | Get single account details | Yes (owner) |
| `/api/accounts/:id` | DELETE | Close account (soft delete) | Yes (owner) |

**Account Data Model:**
```typescript
interface Account {
  id: string;                    // UUID v4
  accountNumber: string;         // Unique 10-digit number
  ownerId: string;               // User ID of account owner
  ownerName: string;             // Account holder name
  accountType: AccountType;      // 'checking' | 'savings'
  balance: number;               // Current balance (in cents)
  currency: string;              // ISO 4217 currency code (default: 'KRW')
  status: AccountStatus;         // 'active' | 'frozen' | 'closed'
  createdAt: string;             // ISO 8601 timestamp
  updatedAt: string;             // ISO 8601 timestamp
}

type AccountType = 'checking' | 'savings';
type AccountStatus = 'active' | 'frozen' | 'closed';
```

**Business Rules:**
- Account number is auto-generated (unique 10-digit)
- Initial balance is 0
- Balance stored in smallest currency unit (cents/won)
- Only active accounts can perform transactions
- Account closure requires zero balance
- Users can only access their own accounts

### 2.2 Deposit Operations

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/accounts/:id/deposit` | POST | Deposit funds | Yes (owner) |

**Deposit Request:**
```typescript
interface DepositRequest {
  amount: number;               // Amount in cents (positive integer)
  description?: string;         // Optional description (max 200 chars)
  idempotencyKey?: string;      // Client-provided for duplicate prevention
}
```

**Business Rules:**
- Amount must be positive integer
- Maximum single deposit: 100,000,000 (1억원)
- Idempotency key prevents duplicate deposits (24h TTL)
- Transaction recorded in history

### 2.3 Withdrawal Operations

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/accounts/:id/withdraw` | POST | Withdraw funds | Yes (owner) |

**Withdrawal Request:**
```typescript
interface WithdrawalRequest {
  amount: number;               // Amount in cents (positive integer)
  description?: string;         // Optional description (max 200 chars)
  idempotencyKey?: string;      // Client-provided for duplicate prevention
}
```

**Business Rules:**
- Amount must be positive integer
- Amount cannot exceed current balance
- Maximum single withdrawal: 10,000,000 (1천만원)
- Savings accounts: max 3 withdrawals per month
- Atomic operation (check balance + deduct)
- Transaction recorded in history

### 2.4 Balance Inquiry

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/accounts/:id/balance` | GET | Get current balance | Yes (owner) |

**Balance Response:**
```typescript
interface BalanceResponse {
  accountId: string;
  accountNumber: string;
  balance: number;              // Current balance in cents
  availableBalance: number;     // Balance minus pending holds
  currency: string;
  asOf: string;                 // ISO 8601 timestamp
}
```

### 2.5 Transaction History

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/accounts/:id/transactions` | GET | List transactions | Yes (owner) |
| `/api/transactions/:txId` | GET | Get single transaction | Yes (owner) |

**Transaction Data Model:**
```typescript
interface Transaction {
  id: string;                    // UUID v4
  accountId: string;             // Associated account
  type: TransactionType;         // 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out'
  amount: number;                // Transaction amount in cents
  balanceBefore: number;         // Balance before transaction
  balanceAfter: number;          // Balance after transaction
  description: string;           // Transaction description
  reference?: string;            // External reference number
  status: TransactionStatus;     // 'pending' | 'completed' | 'failed' | 'reversed'
  idempotencyKey?: string;       // For duplicate prevention
  createdAt: string;             // ISO 8601 timestamp
  completedAt?: string;          // When transaction completed
}

type TransactionType = 'deposit' | 'withdrawal' | 'transfer_in' | 'transfer_out' | 'interest' | 'fee';
type TransactionStatus = 'pending' | 'completed' | 'failed' | 'reversed';
```

**Query Parameters:**
```typescript
interface TransactionQuery {
  startDate?: string;           // ISO 8601 date
  endDate?: string;             // ISO 8601 date
  type?: TransactionType;       // Filter by type
  minAmount?: number;           // Minimum amount
  maxAmount?: number;           // Maximum amount
  page?: number;                // Page number (default: 1)
  pageSize?: number;            // Items per page (default: 20, max: 100)
}
```

### 2.6 Transfer Operations (P1 - Should Have)

| Endpoint | Method | Description | Auth Required |
|----------|--------|-------------|---------------|
| `/api/transfers` | POST | Transfer between accounts | Yes (source owner) |

**Transfer Request:**
```typescript
interface TransferRequest {
  fromAccountId: string;        // Source account
  toAccountNumber: string;      // Destination account number
  amount: number;               // Amount in cents
  description?: string;         // Optional description
  idempotencyKey?: string;      // Client-provided
}
```

**Business Rules:**
- Cannot transfer to same account
- Source account must have sufficient balance
- Both accounts must be active
- Creates two transactions (transfer_out and transfer_in)
- Atomic operation (both succeed or both fail)

---

## 3. Non-Functional Requirements

### 3.1 Performance
- API response time < 100ms for balance queries
- Transaction operations < 200ms
- History queries < 300ms with pagination
- Pagination for list endpoints (default: 20 items, max: 100)

### 3.2 Data Integrity
- All monetary operations must be atomic
- Balance must never go negative
- Transaction history is immutable
- Idempotency support for all write operations

### 3.3 Security
- JWT-based authentication
- Users can only access their own accounts
- Input validation on all endpoints
- Amount validation (positive integers only)
- Rate limiting on sensitive operations

### 3.4 Auditability
- All transactions logged with before/after balance
- Timestamps on all records
- Transaction status tracking
- Idempotency key tracking

### 3.5 Maintainability
- TypeScript strict mode enabled
- Modular architecture (controllers, services, storage)
- Comprehensive test coverage (>= 85% for financial logic)
- Clear separation of concerns

---

## 4. Constraints & Assumptions

### 4.1 Technical Constraints

| Constraint | Reason |
|------------|--------|
| In-memory storage only | Simplicity for validation (proof-of-concept) |
| Node.js 20+ | Native ESM support |
| Express.js | Consistency with other experimentals |
| TypeScript strict mode | Type safety for financial operations |
| Zod for validation | Specified in project requirements |
| Vitest for testing | Specified in project requirements |
| All amounts in cents (integer) | Avoid floating-point precision issues |

### 4.2 Assumptions

- Single currency per account (KRW default)
- No interest calculation automation
- No scheduled transactions
- No external payment gateway integration
- Authentication provided (mock or simplified JWT)

### 4.3 Out of Scope

- Multi-currency accounts
- Interest rate calculation
- Scheduled/recurring transactions
- Bill payments
- External bank transfers (ACH, wire)
- KYC/AML verification
- Two-factor authentication
- Mobile banking features
- Statement generation (PDF)

---

## 5. Success Criteria

### 5.1 Must Have (P0)

- [ ] Account CRUD operations working
- [ ] Deposit operation with validation
- [ ] Withdrawal operation with balance check
- [ ] Balance inquiry endpoint
- [ ] Transaction history with pagination
- [ ] TypeScript compiles (0 errors)
- [ ] All tests pass
- [ ] Test coverage >= 85% for services
- [ ] Atomic transaction operations
- [ ] Input validation on all endpoints

### 5.2 Should Have (P1)

- [ ] Transfer between accounts
- [ ] Idempotency key support
- [ ] Transaction filtering (date, type, amount)
- [ ] Account type-specific rules (savings withdrawal limit)
- [ ] Rate limiting on transactions
- [ ] Structured error responses
- [ ] README with API documentation

### 5.3 Nice to Have (P2)

- [ ] Account freeze/unfreeze functionality
- [ ] Transaction reversal support
- [ ] Balance history over time
- [ ] Health check endpoint
- [ ] Request logging middleware

---

## 6. API Endpoints Summary

### Total Endpoints: 11 (P0) + 2 (P1) = 13

| Domain | Endpoints | Auth Required |
|--------|-----------|---------------|
| Accounts | 4 | Yes |
| Deposits | 1 | Yes (owner) |
| Withdrawals | 1 | Yes (owner) |
| Balance | 1 | Yes (owner) |
| Transactions | 2 | Yes (owner) |
| Transfers (P1) | 1 | Yes (owner) |
| Auth | 3 | Mixed |

### Authentication Endpoints (Simplified)

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/register` | POST | Register new user |
| `/api/auth/login` | POST | Login and get token |
| `/api/auth/me` | GET | Get current user |

---

## 7. Project Structure

```
bank-service/
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
│   │   ├── account.ts               # Account types
│   │   ├── transaction.ts           # Transaction types
│   │   ├── transfer.ts              # Transfer types
│   │   └── common.ts                # Shared types (pagination, etc.)
│   │
│   ├── schemas/
│   │   ├── index.ts                 # Re-exports
│   │   ├── account.schema.ts        # Account validation schemas
│   │   ├── transaction.schema.ts    # Transaction schemas
│   │   ├── transfer.schema.ts       # Transfer schemas
│   │   └── common.schema.ts         # Shared schemas
│   │
│   ├── errors/
│   │   └── index.ts                 # Custom error classes
│   │
│   ├── storage/
│   │   ├── interface.ts             # Storage interface definitions
│   │   └── memory.ts                # In-memory implementation
│   │
│   ├── services/
│   │   ├── account.service.ts       # Account business logic
│   │   ├── transaction.service.ts   # Transaction business logic
│   │   ├── transfer.service.ts      # Transfer business logic
│   │   └── idempotency.service.ts   # Idempotency key management
│   │
│   ├── middleware/
│   │   ├── auth.ts                  # JWT authentication
│   │   ├── validate.ts              # Zod validation middleware
│   │   ├── rateLimiter.ts           # Rate limiting
│   │   └── errorHandler.ts          # Global error handler
│   │
│   ├── routes/
│   │   ├── index.ts                 # Route aggregation
│   │   ├── auth.routes.ts           # Auth endpoints
│   │   ├── account.routes.ts        # Account endpoints
│   │   └── transaction.routes.ts    # Transaction endpoints
│   │
│   └── utils/
│       ├── accountNumber.ts         # Account number generation
│       ├── jwt.ts                   # JWT utilities
│       └── response.ts              # Response formatters
│
└── tests/
    ├── setup.ts                     # Test configuration
    ├── helpers/
    │   └── testClient.ts            # Supertest helper
    │
    ├── unit/
    │   └── services/
    │       ├── account.service.test.ts
    │       ├── transaction.service.test.ts
    │       └── transfer.service.test.ts
    │
    └── integration/
        ├── account.test.ts
        ├── deposit.test.ts
        ├── withdrawal.test.ts
        └── transfer.test.ts
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
    "@types/supertest": "^6.0.2",
    "@types/uuid": "^10.0.0",
    "@vitest/coverage-v8": "^2.1.0"
  }
}
```

---

## 9. Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Request validation failed |
| `INVALID_AMOUNT` | 400 | Amount is invalid or out of range |
| `UNAUTHORIZED` | 401 | Missing or invalid authentication |
| `FORBIDDEN` | 403 | Not authorized for this account |
| `ACCOUNT_NOT_FOUND` | 404 | Account does not exist |
| `TRANSACTION_NOT_FOUND` | 404 | Transaction does not exist |
| `INSUFFICIENT_BALANCE` | 409 | Not enough funds |
| `ACCOUNT_NOT_ACTIVE` | 409 | Account is frozen or closed |
| `DUPLICATE_TRANSACTION` | 409 | Idempotency key already used |
| `WITHDRAWAL_LIMIT_EXCEEDED` | 409 | Monthly withdrawal limit reached |
| `RATE_LIMITED` | 429 | Too many requests |
| `INTERNAL_ERROR` | 500 | Unexpected server error |

---

## 10. Example Usage

### Create Account

```bash
curl -X POST http://localhost:3000/api/accounts \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "ownerName": "홍길동",
    "accountType": "checking"
  }'
```

Response:
```json
{
  "success": true,
  "data": {
    "id": "550e8400-e29b-41d4-a716-446655440000",
    "accountNumber": "1234567890",
    "ownerId": "user-123",
    "ownerName": "홍길동",
    "accountType": "checking",
    "balance": 0,
    "currency": "KRW",
    "status": "active",
    "createdAt": "2026-01-19T10:30:00.000Z",
    "updatedAt": "2026-01-19T10:30:00.000Z"
  }
}
```

### Deposit Funds

```bash
curl -X POST http://localhost:3000/api/accounts/550e8400.../deposit \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "amount": 1000000,
    "description": "Initial deposit"
  }'
```

### Withdraw Funds

```bash
curl -X POST http://localhost:3000/api/accounts/550e8400.../withdraw \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <token>" \
  -d '{
    "amount": 50000,
    "description": "ATM withdrawal"
  }'
```

### Get Transaction History

```bash
curl "http://localhost:3000/api/accounts/550e8400.../transactions?page=1&pageSize=10&type=withdrawal" \
  -H "Authorization: Bearer <token>"
```

---

## 11. Testing Guidelines

### Required Test Cases

1. **Account Operations**
   - Create account with valid data
   - Create account with missing fields (validation)
   - Get account by owner
   - Get account by non-owner (forbidden)
   - Close account with balance (should fail)
   - Close account with zero balance

2. **Deposit Operations**
   - Deposit valid amount
   - Deposit zero amount (validation)
   - Deposit negative amount (validation)
   - Deposit exceeding maximum (validation)
   - Deposit to frozen account (should fail)
   - Deposit with idempotency key (duplicate prevention)

3. **Withdrawal Operations**
   - Withdraw valid amount
   - Withdraw exceeding balance (insufficient funds)
   - Withdraw from savings (count limit)
   - Withdraw from frozen account (should fail)
   - Atomic withdrawal (concurrent safety)

4. **Transaction History**
   - List transactions for account
   - Filter by date range
   - Filter by type
   - Pagination validation
   - Get single transaction

5. **Transfer Operations (P1)**
   - Transfer between accounts
   - Transfer to same account (should fail)
   - Transfer exceeding balance
   - Atomic transfer (both sides)

---

## 12. Meta-Learning Opportunities

This task establishes foundational patterns that transfer to other financial services:

1. **Atomic Operations**: Balance management patterns transfer to inventory, quota systems
2. **Idempotency**: Duplicate prevention pattern transfers to payment processing
3. **Audit Trail**: Transaction logging transfers to any compliance-required system
4. **Amount Validation**: Currency/integer patterns transfer to e-commerce
5. **Owner Authorization**: Resource ownership patterns transfer to multi-tenant systems
6. **Status Management**: Account status workflow transfers to order management

**Expected Efficiency Gain with Meta-Analysis**: 35-45% reduction in time through:
- Pre-existing knowledge of Express/Zod patterns from ecommerce-api
- Reuse of error handling patterns
- Established testing strategies
- Storage interface patterns

---

**Document Version**: 1.0
**Created**: 2026-01-19
**Phase**: 1 - Planning (Complete)
**Next Phase**: 2 - Design
