# Task: Twitter Timeline with Fan-out and Caching

**Task ID**: `twitter-timeline`
**Complexity**: Medium
**Domain**: Big Tech Architecture / Social
**Estimated Duration**: 50-65 minutes (baseline, no meta-analysis)

---

## Overview

Build a fan-out timeline generation system with tweet caching, rate limiting, and real-time streaming API.

---

## Requirements

### Functional Requirements

#### API Endpoints

1. **POST /api/tweets** - Create tweet
2. **GET /api/timeline/:userId** - Get user's home timeline (posts from followed users)
3. **POST /api/follow** - Follow another user
4. **DELETE /api/follow/:userId** - Unfollow user
5. **GET /api/tweets/:tweetId** - Get single tweet
6. **POST /api/tweets/:tweetId/retweet** - Retweet

#### Data Models

```typescript
interface Tweet {
  id: string;
  userId: string;
  content: string;              // Max 280 characters
  createdAt: string;
  retweetCount: number;
  likeCount: number;
  isRetweet: boolean;
  originalTweetId?: string;
}

interface Timeline {
  userId: string;
  tweets: Tweet[];
  cachedAt: string;
  nextCursor?: string;
}

interface Follow {
  followerId: string;
  followingId: string;
  createdAt: string;
}
```

### Technical Requirements

- Fan-out on write or fan-out on read (choose one, document rationale)
- Timeline caching with TTL (5 minutes)
- Cache invalidation on new tweets from followed users
- Rate limiting: 100 tweets/hour per user, 1000 API calls/hour
- Pagination with cursor-based navigation
- TypeScript strict mode

### Success Criteria (P0)

- [ ] Tweet creation and storage
- [ ] Home timeline generation (follow-based)
- [ ] Timeline caching with invalidation
- [ ] Rate limiting (tweets per hour, API calls per minute)
- [ ] TypeScript strict mode with zero errors
- [ ] Test coverage >= 80%

### Time Estimates

| Baseline | With Meta |
|----------|-----------|
| 50-65 min | 32-40 min |

### Meta-Learning Opportunities

- Caching patterns from shopping-cart (session caching)
- Rate limiting as cross-cutting concern
- API design from all REST tasks
- Fan-out architecture pattern (new but composable)

**Expected Reduction**: 35% through caching and REST API pattern reuse.
