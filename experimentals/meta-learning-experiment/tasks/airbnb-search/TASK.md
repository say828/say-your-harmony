# Task: Airbnb Search with Multi-Filter and Geospatial

**Task ID**: `airbnb-search`
**Complexity**: Complex
**Domain**: Big Tech Architecture / Marketplace
**Estimated Duration**: 70-85 minutes (baseline, no meta-analysis)

---

## Overview

Implement a multi-filter search system with availability calendar, pricing optimization, and geospatial queries.

---

## Requirements

### Functional Requirements

#### API Endpoints

1. **POST /api/listings** - Create listing
2. **GET /api/listings/:id** - Get listing details
3. **GET /api/search** - Search listings with filters
4. **GET /api/listings/:id/availability** - Check date availability
5. **POST /api/listings/:id/block-dates** - Block dates (owner maintenance)
6. **GET /api/listings/:id/pricing** - Get pricing for date range

#### Data Models

```typescript
interface Listing {
  id: string;
  hostId: string;
  title: string;
  description: string;
  propertyType: 'apartment' | 'house' | 'condo' | 'villa';
  location: {
    address: string;
    city: string;
    country: string;
    coordinates: { lat: number; lon: number };
  };
  amenities: string[];
  maxGuests: number;
  bedrooms: number;
  bathrooms: number;
  basePrice: number;           // Per night
  currency: string;
  instantBook: boolean;
  rating?: number;
  reviewCount: number;
  blockedDates: DateRange[];
  createdAt: string;
}

interface DateRange {
  startDate: string;           // ISO date
  endDate: string;
}

interface SearchFilters {
  location?: string;           // City or coordinates
  radiusKm?: number;           // For coordinate search
  checkIn?: string;
  checkOut?: string;
  guests?: number;
  minPrice?: number;
  maxPrice?: number;
  propertyTypes?: string[];
  amenities?: string[];
  instantBook?: boolean;
  minRating?: number;
}

interface SearchResult {
  listing: Listing;
  totalPrice: number;          // For date range
  pricePerNight: number;       // Average for range
  available: boolean;
  distance?: number;           // km from search point
}

interface PricingQuote {
  listingId: string;
  checkIn: string;
  checkOut: string;
  nights: number;
  basePrice: number;
  seasonalAdjustment: number;  // +/- based on demand
  lengthOfStayDiscount: number; // Weekly/monthly discounts
  totalPrice: number;
  breakdown: PriceBreakdown[];
}

interface PriceBreakdown {
  date: string;
  price: number;
  reason?: string;             // "high_demand", "weekend", etc.
}
```

### Technical Requirements

- Composable filter predicates (AND logic)
- Geospatial queries: bounding box and radius search
- Date range availability check (no overlaps with blocked dates)
- Dynamic pricing based on:
  - Seasonality (high/low season)
  - Day of week (weekend premium)
  - Length of stay (weekly/monthly discounts)
  - Demand (simplified algorithm)
- Pagination and sorting (price, rating, distance)
- TypeScript strict mode

### Success Criteria (P0)

- [ ] Listing CRUD operations
- [ ] Search with multiple filters (location, dates, guests, price range)
- [ ] Availability calendar with blocked dates
- [ ] Geospatial search (city-based or coordinates)
- [ ] Dynamic pricing calculation
- [ ] TypeScript strict mode with zero errors
- [ ] Test coverage >= 80%

### Time Estimates

| Baseline | With Meta |
|----------|-----------|
| 70-85 min | 42-52 min |

### Meta-Learning Opportunities

- Geospatial patterns (Haversine distance from fraud-detection)
- Filter composition from REST API patterns
- Caching strategies from twitter-timeline
- Date range logic from calendar patterns
- Pricing algorithms from shopping-cart discounts

**Expected Reduction**: 40% through geospatial, filter, and pricing pattern reuse.
