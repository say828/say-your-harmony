# Task: Fraud Detection System with Rule Engine

**Task ID**: `fraud-detection`
**Complexity**: Medium
**Domain**: FinTech / Security
**Estimated Duration**: 50-65 minutes (baseline, no meta-analysis)

---

## Overview

Build a rule-based fraud detection system with scoring engine, real-time alerting, and case management. This task tests rule engine patterns, state machines, and real-time event processing.

---

## Requirements

### 1. Functional Requirements

#### API Endpoints

1. **POST /api/transactions/analyze**
   - Analyzes transaction for fraud risk
   - Request body: Transaction details
   - Response: Risk score, triggered rules, alert status
   - Response: `200 OK` with analysis result

2. **POST /api/rules**
   - Creates a new fraud detection rule
   - Request body: Rule configuration
   - Response: `201 Created` with rule object

3. **GET /api/rules**
   - Lists all active rules
   - Response: `200 OK` with array of rules

4. **PUT /api/rules/:ruleId**
   - Updates rule configuration or priority
   - Response: `200 OK` with updated rule

5. **DELETE /api/rules/:ruleId**
   - Deactivates a rule
   - Response: `204 No Content`

6. **GET /api/cases**
   - Lists fraud cases
   - Query params: `status`, `riskLevel`, `page`, `limit`
   - Response: `200 OK` with paginated cases

7. **GET /api/cases/:caseId**
   - Gets case details with all related transactions
   - Response: `200 OK` with case object

8. **PUT /api/cases/:caseId/status**
   - Updates case status (investigating, resolved, false_positive)
   - Response: `200 OK` with updated case

#### Data Models

```typescript
interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  merchantId: string;
  merchantCategory: string;
  location: {
    country: string;
    city: string;
    coordinates?: { lat: number; lon: number };
  };
  timestamp: string;
  paymentMethod: string;
  metadata?: Record<string, any>;
}

interface Rule {
  id: string;
  name: string;
  description: string;
  type: 'velocity' | 'amount' | 'location' | 'pattern' | 'custom';
  config: RuleConfig;
  weight: number;              // 0-100, contribution to risk score
  priority: number;            // Execution order
  active: boolean;
  createdAt: string;
  updatedAt: string;
}

interface RuleConfig {
  // Velocity rules
  maxTransactionsPerHour?: number;
  maxTransactionsPerDay?: number;

  // Amount rules
  minAmount?: number;
  maxAmount?: number;

  // Location rules
  allowedCountries?: string[];
  blockedCountries?: string[];
  requireGeoConsistency?: boolean;
  maxDistanceKm?: number;      // Max distance from previous transaction

  // Pattern rules
  unusualTimeOfDay?: boolean;
  unusualMerchant?: boolean;
  rapidSuccessiveAttempts?: boolean;

  // Custom condition (JavaScript expression)
  customCondition?: string;
}

interface FraudAnalysis {
  transactionId: string;
  riskScore: number;           // 0-100
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  triggeredRules: TriggeredRule[];
  recommendation: 'approve' | 'review' | 'block';
  shouldAlert: boolean;
  analyzedAt: string;
}

interface TriggeredRule {
  ruleId: string;
  ruleName: string;
  matched: boolean;
  contribution: number;        // Points added to risk score
  reason: string;
}

interface FraudCase {
  id: string;
  transactionId: string;
  userId: string;
  riskScore: number;
  riskLevel: 'low' | 'medium' | 'high' | 'critical';
  status: 'open' | 'investigating' | 'resolved' | 'false_positive';
  triggeredRules: TriggeredRule[];
  assignedTo?: string;
  notes: CaseNote[];
  createdAt: string;
  updatedAt: string;
  resolvedAt?: string;
}

interface CaseNote {
  id: string;
  author: string;
  content: string;
  createdAt: string;
}
```

### 2. Technical Requirements

#### Rule Engine Implementation

1. **Rule Evaluation**:
   - Execute rules in priority order
   - Support short-circuit evaluation (stop if critical)
   - Cache user transaction history for velocity checks
   - Calculate risk score as weighted sum of triggered rules

2. **Rule Types**:
   - **Velocity**: Count transactions in time windows
   - **Amount**: Threshold-based checks
   - **Location**: Geographic consistency and blocklists
   - **Pattern**: Unusual behavior detection
   - **Custom**: JavaScript expression evaluation (sandboxed)

3. **Risk Score Calculation**:
   ```typescript
   riskScore = min(100, Σ(triggered_rule.weight))

   riskLevel:
     0-25: low
     26-50: medium
     51-75: high
     76-100: critical

   recommendation:
     low: approve
     medium: review
     high/critical: block
   ```

4. **Alert Triggers**:
   - Auto-create case if riskScore >= 51
   - Send alert if riskLevel is 'high' or 'critical'

#### Storage

- In-memory storage for transactions, rules, cases
- User transaction history cache (last 24 hours)
- Transaction geolocation cache

#### Framework

- Express.js for HTTP server
- Port: 3000 (configurable via environment variable)

### 3. Quality Requirements

#### Testing

- Minimum 80% test coverage
- Use Vitest as testing framework
- Test scenarios:
  - Individual rule triggering
  - Multiple rules combining
  - Velocity checks with time windows
  - Geographic distance calculations
  - Case lifecycle transitions
  - Edge cases (first transaction, missing data)

#### Code Quality

- TypeScript strict mode with zero errors
- ESLint configuration with zero errors
- Zod validation on all inputs
- Consistent code formatting

#### Documentation

- README.md with:
  - Setup and running instructions
  - API documentation
  - Rule configuration examples
  - Case management workflow
- JSDoc comments for rule evaluation logic

---

## Success Criteria

### Must Have (P0)

- [ ] Transaction analysis endpoint working
- [ ] Rule CRUD operations functional
- [ ] At least 4 rule types implemented (velocity, amount, location, pattern)
- [ ] Risk score calculation with weighted rules
- [ ] Auto-case creation for high-risk transactions
- [ ] Case lifecycle management (open, investigating, resolved, false_positive)
- [ ] TypeScript strict mode enabled with zero errors
- [ ] Test coverage >= 80%
- [ ] All tests passing

### Should Have (P1)

- [ ] Rule priority and ordering
- [ ] Historical pattern detection (unusual behavior)
- [ ] False positive tracking and learning
- [ ] Transaction history caching for velocity checks
- [ ] Geographic distance calculation
- [ ] Pagination for cases endpoint

### Nice to Have (P2)

- [ ] Rule A/B testing framework
- [ ] Machine learning score integration hook
- [ ] Real-time alerting via webhooks
- [ ] Dashboard data aggregation endpoints

---

## Example Usage

### Create Velocity Rule

```bash
curl -X POST http://localhost:3000/api/rules \
  -H "Content-Type: application/json" \
  -d '{
    "name": "High Transaction Velocity",
    "description": "Flag if more than 5 transactions in 1 hour",
    "type": "velocity",
    "config": {
      "maxTransactionsPerHour": 5
    },
    "weight": 30,
    "priority": 1,
    "active": true
  }'
```

### Analyze Transaction

```bash
curl -X POST http://localhost:3000/api/transactions/analyze \
  -H "Content-Type: application/json" \
  -d '{
    "id": "txn-123",
    "userId": "user-456",
    "amount": 5000,
    "currency": "USD",
    "merchantId": "merchant-789",
    "merchantCategory": "electronics",
    "location": {
      "country": "US",
      "city": "New York"
    },
    "timestamp": "2026-01-18T15:30:00Z",
    "paymentMethod": "credit_card"
  }'
```

Response:
```json
{
  "transactionId": "txn-123",
  "riskScore": 65,
  "riskLevel": "high",
  "triggeredRules": [
    {
      "ruleId": "rule-1",
      "ruleName": "High Transaction Velocity",
      "matched": true,
      "contribution": 30,
      "reason": "6 transactions in last hour (limit: 5)"
    },
    {
      "ruleId": "rule-2",
      "ruleName": "Large Amount",
      "matched": true,
      "contribution": 35,
      "reason": "Amount $5000 exceeds threshold $3000"
    }
  ],
  "recommendation": "block",
  "shouldAlert": true,
  "analyzedAt": "2026-01-18T15:30:01Z"
}
```

### Update Case Status

```bash
curl -X PUT http://localhost:3000/api/cases/case-123/status \
  -H "Content-Type: application/json" \
  -d '{
    "status": "resolved",
    "note": "Verified with customer, legitimate purchase"
  }'
```

---

## Testing Guidelines

### Required Test Cases

1. **Rule Evaluation**
   - Single rule triggers correctly
   - Multiple rules combine scores
   - Priority order is respected
   - Inactive rules are skipped

2. **Velocity Rules**
   - Transaction count in time windows
   - First transaction (no history)
   - Time window boundary cases

3. **Amount Rules**
   - Threshold detection (above, below, within range)
   - Edge cases (zero, negative, very large)

4. **Location Rules**
   - Country blocklist/allowlist
   - Geographic distance calculation
   - Missing location data handling

5. **Case Management**
   - Auto-creation on high risk
   - Status transitions (open -> investigating -> resolved)
   - Cannot transition from resolved to open

6. **Risk Scoring**
   - Score capping at 100
   - Correct risk level assignment
   - Recommendation logic

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

1. **Start with rule data model** - Define Rule and RuleConfig interfaces
2. **Implement basic rules first** - Amount and velocity are simplest
3. **Build rule engine** - Separate service for rule evaluation
4. **Add case management** - Lifecycle and status transitions
5. **Test incrementally** - Each rule type independently
6. **Use Haversine formula** - For geographic distance calculation

---

## Common Pitfalls to Avoid

1. **Time zones** - Always use UTC for timestamps
2. **Floating point precision** - Use integer cents for currency amounts
3. **Rule ordering** - Ensure priority is respected
4. **Memory leaks** - Clean up old transaction history cache
5. **State machine violations** - Validate case status transitions
6. **Missing data** - Handle optional fields gracefully

---

## Time Estimates

| Phase | Estimated Time |
|-------|---------------|
| Setup (package.json, tsconfig) | 3-5 min |
| Types and storage | 6-8 min |
| Rule engine core | 10-12 min |
| Individual rule implementations | 12-15 min |
| Case management | 8-10 min |
| Route handlers | 10-12 min |
| Tests | 15-20 min |
| Documentation | 5 min |
| **Total (baseline)** | **69-87 min** |
| **Total (with meta)** | **30-40 min** |

---

## Meta-Learning Opportunities

This task builds on and extends patterns from previous tasks:

1. **Rule Engine Pattern**: Transfers to discount engine (shopping-cart), inventory alerts
2. **State Machine**: Case lifecycle mirrors cart/order status patterns
3. **Scoring System**: Weighted scoring transfers to recommendations, risk calculations
4. **Event Processing**: Real-time analysis transfers to streaming, timeline tasks
5. **Validation Strategies**: Zod patterns from previous tasks
6. **CRUD Operations**: Rule and case management reuses REST patterns

**Expected Efficiency Gain with Meta-Analysis**: 38-42% reduction through:
- Rule engine patterns from shopping-cart discount logic
- State machine patterns from cart status
- REST API patterns accumulated
- Testing strategies for business logic
- Validation and error handling patterns
