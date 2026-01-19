# Task: Multi-Warehouse Inventory Management

**Task ID**: `inventory-sync`
**Complexity**: Medium
**Domain**: E-commerce / Inventory
**Estimated Duration**: 50-65 minutes (baseline, no meta-analysis)

---

## Overview

Build a multi-warehouse inventory management system with real-time stock updates, reservation handling, and low stock alerts.

---

## Requirements

### Functional Requirements

#### API Endpoints

1. **POST /api/warehouses** - Create warehouse
2. **GET /api/warehouses** - List warehouses
3. **POST /api/inventory** - Add product to warehouse inventory
4. **PUT /api/inventory/:warehouseId/:productId** - Update stock level
5. **POST /api/reservations** - Reserve stock for cart/order
6. **DELETE /api/reservations/:id** - Release reservation
7. **GET /api/availability/:productId** - Check total availability across warehouses

#### Data Models

```typescript
interface Warehouse {
  id: string;
  name: string;
  location: {
    country: string;
    city: string;
    coordinates: { lat: number; lon: number };
  };
  active: boolean;
}

interface InventoryItem {
  warehouseId: string;
  productId: string;
  quantityAvailable: number;
  quantityReserved: number;
  quantityTotal: number;       // available + reserved
  lowStockThreshold?: number;
  updatedAt: string;
}

interface Reservation {
  id: string;
  warehouseId: string;
  productId: string;
  quantity: number;
  cartId?: string;
  orderId?: string;
  expiresAt: string;           // Auto-release after expiration
  createdAt: string;
  status: 'active' | 'released' | 'converted';
}

interface StockAlert {
  id: string;
  warehouseId: string;
  productId: string;
  type: 'low_stock' | 'out_of_stock';
  threshold: number;
  currentLevel: number;
  createdAt: string;
  acknowledged: boolean;
}
```

### Technical Requirements

- Concurrent stock update handling (optimistic locking or atomic operations)
- Automatic reservation expiration (30 minutes default)
- Low stock alert triggers when quantityAvailable < threshold
- Stock transfer between warehouses
- TypeScript strict mode
- Zod validation

### Success Criteria (P0)

- [ ] Warehouse and product management
- [ ] Stock level tracking per warehouse
- [ ] Stock reservation with expiration
- [ ] Inventory adjustment logging
- [ ] Low stock alert generation
- [ ] TypeScript strict mode with zero errors
- [ ] Test coverage >= 80%

### Time Estimates

| Baseline | With Meta |
|----------|-----------|
| 50-65 min | 30-40 min |

### Meta-Learning Opportunities

- Reservation patterns from shopping-cart
- Alert patterns from fraud-detection
- Multi-entity management patterns
- Concurrency handling (new pattern)
- State machine for reservation lifecycle

**Expected Reduction**: 40% through reservation and alert pattern reuse.
