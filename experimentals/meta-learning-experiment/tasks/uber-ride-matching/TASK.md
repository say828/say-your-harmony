# Task: Uber Ride Matching System

**Task ID**: `uber-ride-matching`
**Complexity**: Complex
**Domain**: Big Tech Architecture / Geospatial
**Estimated Duration**: 75-90 minutes (baseline, no meta-analysis)

---

## Overview

Build a real-time ride matching system with geospatial indexing, dynamic pricing (surge), and optimized driver-rider matching.

---

## Requirements

### Functional Requirements

#### API Endpoints

1. **POST /api/drivers** - Register driver
2. **PUT /api/drivers/:id/location** - Update driver location
3. **PUT /api/drivers/:id/status** - Set availability (available, busy, offline)
4. **POST /api/rides/request** - Request ride
5. **POST /api/rides/:id/accept** - Driver accepts ride
6. **PUT /api/rides/:id/status** - Update ride status
7. **GET /api/rides/:id** - Get ride details
8. **GET /api/pricing/:location** - Get current surge pricing

#### Data Models

```typescript
interface Driver {
  id: string;
  name: string;
  vehicleType: 'standard' | 'premium' | 'xl';
  location: Coordinates;
  status: 'available' | 'busy' | 'offline';
  rating: number;
  totalRides: number;
  updatedAt: string;
}

interface Coordinates {
  lat: number;
  lon: number;
}

interface RideRequest {
  id: string;
  riderId: string;
  pickup: {
    location: Coordinates;
    address: string;
  };
  dropoff: {
    location: Coordinates;
    address: string;
  };
  vehicleType: 'standard' | 'premium' | 'xl';
  requestedAt: string;
  status: 'pending' | 'matched' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
}

interface Ride {
  id: string;
  rideRequestId: string;
  riderId: string;
  driverId?: string;
  pickup: Location;
  dropoff: Location;
  estimatedDuration: number;   // minutes
  estimatedDistance: number;   // km
  baseFare: number;
  surgeMultiplier: number;
  totalFare: number;
  status: 'matched' | 'accepted' | 'picked_up' | 'in_progress' | 'completed';
  matchedAt?: string;
  acceptedAt?: string;
  pickedUpAt?: string;
  completedAt?: string;
}

interface Location {
  location: Coordinates;
  address: string;
}

interface SurgePricing {
  area: string;
  surgeMultiplier: number;     // e.g., 1.5 = 1.5x base price
  reason: string;
  calculatedAt: string;
}

interface MatchingResult {
  rideId: string;
  driverId: string;
  eta: number;                 // minutes to pickup
  distance: number;            // km to pickup location
  score: number;               // matching score
}
```

### Technical Requirements

- Geospatial indexing for efficient proximity queries
  - H3 hexagonal grid OR simple grid-based binning
  - Or use in-memory spatial index (e.g., simple quadtree)
- Matching algorithm:
  - Find available drivers within radius (e.g., 5km)
  - Rank by distance, rating, ETA
  - Return top match or top N matches
- Dynamic surge pricing:
  - Calculate supply/demand ratio in area
  - Apply surge when demand > supply * threshold
  - Simple grid-based areas (e.g., 1km² cells)
- Distance/ETA calculation:
  - Haversine distance for straight-line
  - Simple ETA: distance / avg_speed
- TypeScript strict mode

### Success Criteria (P0)

- [ ] Driver location storage with efficient proximity queries
- [ ] Ride request matching with ETA calculation
- [ ] Surge pricing based on driver availability ratio
- [ ] Trip lifecycle management (requested, matched, in-progress, completed)
- [ ] Geospatial queries (drivers within radius)
- [ ] TypeScript strict mode with zero errors
- [ ] Test coverage >= 80%

### Time Estimates

| Baseline | With Meta |
|----------|-----------|
| 75-90 min | 45-55 min |

### Meta-Learning Opportunities

- Geospatial patterns from airbnb-search (Haversine distance)
- State machine from order-book and fraud-detection
- Matching algorithm patterns from order-book
- Real-time updates and event patterns
- Pricing algorithms from shopping-cart and airbnb

**Expected Reduction**: 40% through geospatial, state machine, and matching pattern reuse.
