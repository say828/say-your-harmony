# Task: Payment Processing Pipeline (Stripe-like)

**Task ID**: `stripe-payment-processor`
**Complexity**: Complex
**Domain**: Big Tech Architecture / Payments
**Estimated Duration**: 70-85 minutes (baseline, no meta-analysis)

---

## Overview

Implement a payment processing pipeline with idempotency handling, retry logic with exponential backoff, and webhook delivery with at-least-once guarantees.

---

## Requirements

### Functional Requirements

#### API Endpoints

1. **POST /api/payment-intents** - Create payment intent
2. **POST /api/payment-intents/:id/confirm** - Confirm payment
3. **GET /api/payment-intents/:id** - Get payment intent status
4. **POST /api/refunds** - Create refund
5. **POST /api/webhooks/subscribe** - Subscribe to webhook events
6. **GET /api/webhooks/events** - List webhook delivery attempts

#### Data Models

```typescript
interface PaymentIntent {
  id: string;
  amount: number;              // Amount in cents
  currency: string;
  status: 'requires_payment_method' | 'requires_confirmation' |
          'processing' | 'succeeded' | 'canceled' | 'requires_action';
  customerId: string;
  paymentMethodId?: string;
  metadata: Record<string, string>;
  idempotencyKey?: string;     // Client-provided for deduplication
  createdAt: string;
  updatedAt: string;
}

interface PaymentMethod {
  id: string;
  type: 'card' | 'bank_account';
  customerId: string;
  details: CardDetails | BankDetails;
  createdAt: string;
}

interface CardDetails {
  last4: string;
  brand: string;
  expiryMonth: number;
  expiryYear: number;
}

interface Refund {
  id: string;
  paymentIntentId: string;
  amount: number;
  reason?: string;
  status: 'pending' | 'succeeded' | 'failed';
  createdAt: string;
  processedAt?: string;
}

interface WebhookSubscription {
  id: string;
  url: string;
  events: string[];            // e.g., ["payment_intent.succeeded", "refund.created"]
  secret: string;              // For signature verification
  active: boolean;
  createdAt: string;
}

interface WebhookEvent {
  id: string;
  type: string;                // Event type
  data: any;                   // Event payload
  createdAt: string;
}

interface WebhookDelivery {
  id: string;
  eventId: string;
  subscriptionId: string;
  url: string;
  attempt: number;
  status: 'pending' | 'succeeded' | 'failed';
  responseCode?: number;
  nextRetryAt?: string;
  deliveredAt?: string;
  error?: string;
}
```

### Technical Requirements

- **Idempotency**:
  - Store idempotency key with request
  - Return cached result if key seen within TTL (24 hours)
  - Prevent duplicate charges

- **Retry Logic**:
  - Exponential backoff: delay = base_delay * 2^attempt + jitter
  - Base delay: 1 second
  - Max attempts: 5
  - Jitter: random(0, 1000ms) to prevent thundering herd

- **Webhook Delivery**:
  - At-least-once delivery guarantee
  - Retry failed deliveries with exponential backoff
  - Signature verification (HMAC-SHA256)
  - Dead letter queue after max retries

- **Transaction Audit**:
  - Log all state transitions
  - Immutable event log

- TypeScript strict mode
- Zod validation

### Success Criteria (P0)

- [ ] Payment intent creation and processing
- [ ] Idempotency key handling (prevent duplicate charges)
- [ ] Exponential backoff retry for external calls
- [ ] Webhook event delivery with signature verification
- [ ] Transaction audit logging
- [ ] Refund processing
- [ ] TypeScript strict mode with zero errors
- [ ] Test coverage >= 85% (financial system)

### Time Estimates

| Baseline | With Meta |
|----------|-----------|
| 70-85 min | 40-50 min |

### Meta-Learning Opportunities

- State machine heavily reused (payment status lifecycle)
- Idempotency pattern (new but critical)
- Retry with backoff (error resilience)
- Webhook patterns (event-driven from fraud-detection)
- Audit logging patterns
- Testing financial systems (from order-book)

**Expected Reduction**: 42% through state machine, event-driven, and testing pattern reuse.
