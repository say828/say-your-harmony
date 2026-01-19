# Complex Task: E-commerce Microservices with Event Sourcing

## Task ID
`complex-microservices-event-sourcing`

## Complexity Level
**Complex**

## Domain
Microservices Architecture with Event Sourcing

## Estimated Time
- **Baseline (no meta)**: 60-90 minutes
- **With meta**: 35-50 minutes (target: 40%+ reduction)

---

## Task Description

Build a complete e-commerce order processing system using microservices architecture with event sourcing and saga orchestration. The system must handle order placement, inventory management, payment processing, and customer notifications with proper transactional consistency.

---

## Requirements

### 1. Architecture Requirements

#### Microservices (4 services)
1. **Order Service**: Manages order lifecycle
2. **Inventory Service**: Tracks product availability
3. **Payment Service**: Processes payments
4. **Notification Service**: Sends customer notifications

#### Event Sourcing
- All state changes captured as events
- Event store implementation
- Event replay capability
- Projection building from events

#### Saga Pattern
- Distributed transaction coordination
- Compensating transactions for failures
- Order fulfillment saga implementation
- Rollback on any step failure

### 2. Technical Requirements

#### Structure
- **Monorepo** with workspace configuration
- Shared types package
- Individual service packages
- Shared utilities package

#### Tech Stack
- **Runtime**: Node.js 20+
- **Language**: TypeScript (strict mode)
- **Testing**: Vitest
- **API**: Express.js for REST endpoints
- **Event Bus**: In-memory event bus (simple implementation)

#### Code Quality
- TypeScript strict mode enabled
- ESLint configured
- Test coverage >= 80%
- All public APIs documented with JSDoc

### 3. Service Specifications

#### Order Service

**Responsibilities**:
- Create orders
- Track order status
- Emit order events
- Handle saga coordination

**API Endpoints**:
```typescript
POST /orders
  Body: { customerId: string, items: OrderItem[] }
  Returns: { orderId: string, status: 'pending' }

GET /orders/:orderId
  Returns: Order details with current status

GET /orders/:orderId/events
  Returns: Event history for order
```

**Events Emitted**:
- `OrderCreated`
- `OrderConfirmed`
- `OrderCancelled`
- `OrderCompleted`

**State Machine**:
```
pending -> inventory_reserved -> payment_processed -> completed
         -> inventory_failed -> cancelled
         -> payment_failed -> inventory_released -> cancelled
```

#### Inventory Service

**Responsibilities**:
- Track product stock levels
- Reserve inventory for orders
- Release reservations on cancellation

**API Endpoints**:
```typescript
GET /inventory/:productId
  Returns: { productId, availableStock, reservedStock }

POST /inventory/reserve
  Body: { reservationId, items: { productId, quantity }[] }
  Returns: { success: boolean, reservationId? }

POST /inventory/release
  Body: { reservationId }
  Returns: { success: boolean }
```

**Events Emitted**:
- `InventoryReserved`
- `InventoryReservationFailed`
- `InventoryReleased`

#### Payment Service

**Responsibilities**:
- Process payments
- Handle refunds
- Simulate payment gateway integration

**API Endpoints**:
```typescript
POST /payments/charge
  Body: { paymentId, customerId, amount }
  Returns: { success: boolean, transactionId? }

POST /payments/refund
  Body: { transactionId }
  Returns: { success: boolean }
```

**Events Emitted**:
- `PaymentProcessed`
- `PaymentFailed`
- `PaymentRefunded`

#### Notification Service

**Responsibilities**:
- Send order confirmation emails (simulated)
- Send order status updates
- Log all notifications

**API Endpoints**:
```typescript
POST /notifications/send
  Body: { customerId, type, message }
  Returns: { success: boolean, notificationId }

GET /notifications/:customerId
  Returns: Notification history
```

**Events Handled**:
- `OrderConfirmed` -> Send confirmation
- `OrderCompleted` -> Send completion notice
- `OrderCancelled` -> Send cancellation notice

### 4. Event Sourcing Implementation

#### Event Store
```typescript
interface Event {
  eventId: string;
  aggregateId: string;
  aggregateType: string;
  eventType: string;
  payload: unknown;
  timestamp: Date;
  version: number;
}

interface EventStore {
  append(event: Event): Promise<void>;
  getEvents(aggregateId: string): Promise<Event[]>;
  getAllEvents(): Promise<Event[]>;
  getEventsByType(eventType: string): Promise<Event[]>;
}
```

#### Projections
- Current state derived from events
- Separate read models per service
- Rebuild capability from event history

### 5. Saga Implementation

#### Order Fulfillment Saga

**Steps**:
1. Create Order (Order Service)
2. Reserve Inventory (Inventory Service)
3. Process Payment (Payment Service)
4. Confirm Order (Order Service)
5. Send Notification (Notification Service)

**Compensations** (if any step fails):
- Payment failed -> Release inventory
- Inventory failed -> Cancel order
- Any failure -> Send cancellation notification

**Implementation**:
```typescript
class OrderFulfillmentSaga {
  async execute(orderId: string): Promise<SagaResult>;
  async compensate(orderId: string, failedStep: string): Promise<void>;
}
```

### 6. Testing Requirements

#### Unit Tests (>60% coverage)
- Event store operations
- State projections
- Business logic in each service
- Saga step execution

#### Integration Tests (>20% coverage)
- End-to-end order flow (happy path)
- Inventory failure compensation
- Payment failure compensation
- Event replay and projection rebuild

#### Test Scenarios
1. **Happy Path**: Order -> Reserve -> Pay -> Confirm -> Notify
2. **Inventory Shortage**: Order -> Reserve fails -> Cancel -> Notify
3. **Payment Failure**: Order -> Reserve -> Pay fails -> Release -> Cancel -> Notify
4. **Event Replay**: Create events -> Clear state -> Replay -> Verify state matches

---

## Deliverables

### File Structure
```
packages/
├── shared/
│   ├── package.json
│   ├── tsconfig.json
│   └── src/
│       ├── types/
│       │   ├── events.ts
│       │   ├── order.ts
│       │   └── common.ts
│       └── event-store/
│           ├── event-store.ts
│           └── in-memory-event-store.ts
│
├── order-service/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── order-service.ts
│   │   ├── order-saga.ts
│   │   ├── projections/
│   │   │   └── order-projection.ts
│   │   └── api/
│   │       └── order-routes.ts
│   └── tests/
│       ├── order-service.test.ts
│       └── order-saga.test.ts
│
├── inventory-service/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── inventory-service.ts
│   │   ├── projections/
│   │   │   └── inventory-projection.ts
│   │   └── api/
│   │       └── inventory-routes.ts
│   └── tests/
│       └── inventory-service.test.ts
│
├── payment-service/
│   ├── package.json
│   ├── tsconfig.json
│   ├── src/
│   │   ├── index.ts
│   │   ├── payment-service.ts
│   │   ├── payment-gateway.ts (mock)
│   │   └── api/
│   │       └── payment-routes.ts
│   └── tests/
│       └── payment-service.test.ts
│
└── notification-service/
    ├── package.json
    ├── tsconfig.json
    ├── src/
    │   ├── index.ts
    │   ├── notification-service.ts
    │   └── api/
    │       └── notification-routes.ts
    └── tests/
        └── notification-service.test.ts
```

### Configuration Files

**Root package.json**:
```json
{
  "name": "ecommerce-microservices",
  "version": "1.0.0",
  "private": true,
  "workspaces": [
    "packages/*"
  ],
  "scripts": {
    "build": "npm run build --workspaces",
    "test": "vitest run --workspace",
    "test:watch": "vitest --workspace",
    "lint": "eslint . --ext .ts",
    "type-check": "tsc --noEmit --workspaces"
  }
}
```

**Root tsconfig.json**:
```json
{
  "compilerOptions": {
    "target": "ES2022",
    "module": "ESNext",
    "moduleResolution": "bundler",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true
  }
}
```

### Documentation

**Required Documentation**:
1. `README.md` - System overview, setup, running instructions
2. `ARCHITECTURE.md` - Architecture decisions, event flow diagrams
3. `API.md` - Complete API documentation for all services
4. Each service: JSDoc comments on all public methods

---

## Success Criteria

### Functional Requirements
- [ ] All 4 microservices implemented
- [ ] Event sourcing with event store
- [ ] Saga pattern with compensation
- [ ] Happy path order flow works end-to-end
- [ ] Compensation triggers on failures
- [ ] Event replay capability working

### Quality Requirements
- [ ] TypeScript strict mode enabled
- [ ] Test coverage >= 80%
- [ ] All tests passing
- [ ] No TypeScript errors
- [ ] No ESLint errors
- [ ] All public APIs documented

### Performance Requirements
- [ ] Order processing < 100ms (simulated)
- [ ] Event replay < 1 second for 100 events
- [ ] Saga execution completes all steps

### Architecture Requirements
- [ ] Services are loosely coupled
- [ ] Communication only via events
- [ ] Compensating transactions implemented
- [ ] State derived from events only (projections)

---

## Validation Commands

```bash
# Install dependencies
npm install

# Type check
npm run type-check

# Run all tests
npm test

# Check coverage
npm test -- --coverage

# Lint code
npm run lint

# Build all packages
npm run build

# Integration test (end-to-end)
npm run test:integration
```

---

## Expected Baseline Metrics (No Meta)

- **Turns**: 50-70 turns
- **Duration**: 60-90 minutes
- **Tool Calls**: 120-150
- **Web Searches**: 8-12 (event sourcing patterns, saga pattern, TypeScript monorepo setup, testing strategies)
- **Decisions**: 15-20 (architecture choices, error handling, state management)

## Expected Metrics (With Meta)

- **Turns**: 25-35 turns (50% reduction)
- **Duration**: 35-50 minutes (40%+ reduction)
- **Tool Calls**: 60-80 (50% reduction)
- **Web Searches**: 0-2 (90%+ reduction - patterns already known)
- **Decisions**: 5-8 (60%+ reduction - decisions referenced)

---

## Complexity Drivers

1. **Multiple Services**: Coordination across 4 independent services
2. **Event Sourcing**: Complex state management pattern
3. **Saga Pattern**: Distributed transaction orchestration
4. **Monorepo**: Workspace configuration and shared packages
5. **High Test Coverage**: Extensive testing requirements
6. **Compensation Logic**: Rollback and error handling complexity

---

## Meta-Analysis Opportunities

If meta-analysis is available from previous tasks, expect efficiency gains from:

1. **Pattern Reuse**: Event sourcing and saga patterns already understood
2. **Decision Caching**: Architecture decisions (monorepo vs polyrepo, event store implementation) already made
3. **Web Search Elimination**: No need to research event sourcing or saga patterns
4. **Test Strategy**: Testing approaches for distributed systems already established
5. **Code Structure**: File organization and TypeScript setup patterns reused

---

## Notes

- This is a **learning exercise** - the focus is on architecture patterns, not production-ready implementation
- Payment gateway and email sending are **simulated** (no real external calls)
- In-memory event bus is acceptable (no need for Kafka/RabbitMQ)
- Services can run in same process for testing (no need for Docker/networking)
- Focus on **correctness** of event sourcing and saga patterns over performance optimization
