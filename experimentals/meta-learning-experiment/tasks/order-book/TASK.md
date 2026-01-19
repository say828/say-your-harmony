# Task: Order Book Matching Engine

**Task ID**: `order-book`
**Complexity**: Complex
**Domain**: FinTech / Trading
**Estimated Duration**: 70-85 minutes (baseline, no meta-analysis)

---

## Overview

Implement an order book matching engine with price-time priority, multiple order types, and trade execution.

---

## Requirements

### Functional Requirements

#### API Endpoints

1. **POST /api/orders** - Submit order (limit, market, stop)
2. **GET /api/orders/:id** - Get order details
3. **DELETE /api/orders/:id** - Cancel order
4. **GET /api/orderbook/:symbol** - Get order book snapshot
5. **GET /api/trades** - Get recent trades
6. **GET /api/orders/user/:userId** - Get user's orders

#### Data Models

```typescript
interface Order {
  id: string;
  userId: string;
  symbol: string;              // e.g., "BTC/USD"
  type: 'limit' | 'market' | 'stop_loss' | 'stop_limit';
  side: 'buy' | 'sell';
  quantity: number;
  price?: number;              // Required for limit, optional for market
  stopPrice?: number;          // For stop orders
  status: 'pending' | 'open' | 'partially_filled' | 'filled' | 'cancelled';
  filledQuantity: number;
  remainingQuantity: number;
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;          // For GTT (Good Till Time)
}

interface OrderBook {
  symbol: string;
  bids: PriceLevel[];          // Buy orders, sorted desc by price
  asks: PriceLevel[];          // Sell orders, sorted asc by price
  lastTrade?: Trade;
  timestamp: string;
}

interface PriceLevel {
  price: number;
  quantity: number;            // Total quantity at this price
  orderCount: number;
}

interface Trade {
  id: string;
  symbol: string;
  buyOrderId: string;
  sellOrderId: string;
  price: number;
  quantity: number;
  buyerId: string;
  sellerId: string;
  executedAt: string;
}

interface Fill {
  orderId: string;
  tradeId: string;
  quantity: number;
  price: number;
  side: 'buy' | 'sell';
  executedAt: string;
}
```

### Technical Requirements

- Price-time priority matching algorithm
- Order book data structure: Red-black tree or sorted arrays for price levels
- Atomic order matching (prevent race conditions)
- Partial fill support
- Stop order activation monitoring
- Trade event emission
- TypeScript strict mode

### Success Criteria (P0)

- [ ] Order submission (limit and market orders)
- [ ] Order book with bid/ask levels
- [ ] Price-time priority matching
- [ ] Trade execution with fill reporting
- [ ] Order cancellation
- [ ] Partial fills handling
- [ ] TypeScript strict mode with zero errors
- [ ] Test coverage >= 85% (financial accuracy critical)

### Time Estimates

| Baseline | With Meta |
|----------|-----------|
| 70-85 min | 42-52 min |

### Meta-Learning Opportunities

- State machine from fraud-detection and inventory
- Event emission patterns from previous tasks
- Priority queue/sorting algorithms
- Atomic operations from inventory reservations
- Testing strategies for financial systems

**Expected Reduction**: 40% through state machine and priority handling reuse.
