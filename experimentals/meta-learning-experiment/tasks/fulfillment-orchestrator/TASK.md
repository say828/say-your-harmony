# Task: Order Fulfillment Workflow Orchestrator

**Task ID**: `fulfillment-orchestrator`
**Complexity**: Complex
**Domain**: E-commerce / Fulfillment
**Estimated Duration**: 70-85 minutes (baseline, no meta-analysis)

---

## Overview

Create an order fulfillment workflow orchestrator with warehouse selection, shipping carrier integration, and delivery tracking using Saga pattern.

---

## Requirements

### Functional Requirements

#### API Endpoints

1. **POST /api/fulfillment/orders** - Initiate fulfillment for order
2. **GET /api/fulfillment/orders/:id** - Get fulfillment status
3. **POST /api/fulfillment/orders/:id/cancel** - Cancel and compensate
4. **GET /api/tracking/:orderId** - Get delivery tracking
5. **POST /api/carriers** - Register shipping carrier
6. **POST /api/warehouses** - Register warehouse

#### Data Models

```typescript
interface FulfillmentOrder {
  id: string;
  orderId: string;
  customerId: string;
  items: OrderItem[];
  deliveryAddress: Address;
  status: FulfillmentStatus;
  workflow: WorkflowStep[];
  selectedWarehouse?: string;
  selectedCarrier?: string;
  trackingNumber?: string;
  createdAt: string;
  updatedAt: string;
}

type FulfillmentStatus =
  | 'initiated'
  | 'warehouse_allocated'
  | 'inventory_reserved'
  | 'picked'
  | 'packed'
  | 'shipped'
  | 'in_transit'
  | 'delivered'
  | 'failed'
  | 'compensating'
  | 'compensated';

interface OrderItem {
  productId: string;
  quantity: number;
  warehouseId?: string;
}

interface Address {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
  coordinates?: { lat: number; lon: number };
}

interface WorkflowStep {
  name: string;
  status: 'pending' | 'in_progress' | 'completed' | 'failed' | 'compensated';
  startedAt?: string;
  completedAt?: string;
  error?: string;
  compensationAction?: string;
}

interface Warehouse {
  id: string;
  name: string;
  location: Address;
  inventory: WarehouseInventory[];
  active: boolean;
}

interface WarehouseInventory {
  productId: string;
  availableQuantity: number;
}

interface Carrier {
  id: string;
  name: string;
  serviceLevel: 'standard' | 'express' | 'overnight';
  ratePerKg: number;
  estimatedDays: number;
  active: boolean;
}

interface TrackingUpdate {
  orderId: string;
  trackingNumber: string;
  status: 'picked_up' | 'in_transit' | 'out_for_delivery' | 'delivered' | 'exception';
  location: string;
  timestamp: string;
  estimatedDelivery?: string;
}

interface WarehouseSelectionResult {
  warehouseId: string;
  distance: number;            // km from delivery address
  hasAllItems: boolean;
  score: number;               // Selection score
}
```

### Technical Requirements

- **Saga Pattern (Workflow Orchestration)**:
  - Define workflow steps in order
  - Execute steps sequentially
  - Track completion status
  - On failure: Execute compensation for completed steps in reverse order

- **Workflow Steps**:
  1. Validate order
  2. Select warehouse (nearest with all items)
  3. Reserve inventory
  4. Select carrier
  5. Generate shipping label
  6. Update order status to "shipped"

- **Compensation Logic** (on failure):
  - If inventory reserved → release reservation
  - If warehouse allocated → deallocate
  - If carrier assigned → cancel shipment

- **Warehouse Selection Strategy**:
  - Find warehouses with all items in stock
  - Calculate distance to delivery address
  - Select nearest warehouse
  - If split shipment needed: Select multiple warehouses

- **Carrier Selection**:
  - Based on service level preference
  - Cost calculation
  - Delivery time estimation

- TypeScript strict mode

### Success Criteria (P0)

- [ ] Order fulfillment workflow (validate, allocate, ship, deliver)
- [ ] Warehouse selection based on availability and distance
- [ ] Carrier abstraction with mock implementation
- [ ] Order tracking with status history
- [ ] Compensation logic for failures (Saga pattern)
- [ ] Workflow step tracking
- [ ] TypeScript strict mode with zero errors
- [ ] Test coverage >= 80%

### Time Estimates

| Baseline | With Meta |
|----------|-----------|
| 70-85 min | 42-52 min |

### Meta-Learning Opportunities

- Saga/Workflow pattern (event-driven orchestration)
- State machine from all previous tasks
- Warehouse selection from inventory-sync
- Distance calculation from uber/airbnb (geospatial)
- Compensation logic (error recovery patterns)
- Integration patterns (carrier abstraction)

**Expected Reduction**: 40% through saga, state machine, and geospatial pattern reuse.
