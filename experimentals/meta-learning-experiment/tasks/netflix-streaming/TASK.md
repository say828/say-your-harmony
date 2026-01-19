# Task: Video Streaming Service with Adaptive Bitrate

**Task ID**: `netflix-streaming`
**Complexity**: Medium-High
**Domain**: Big Tech Architecture / Streaming
**Estimated Duration**: 55-70 minutes (baseline, no meta-analysis)

---

## Overview

Design and implement a video streaming service simulator with adaptive bitrate streaming (ABR), CDN edge caching simulation, and personalized recommendations.

---

## Requirements

### Functional Requirements

#### API Endpoints

1. **GET /api/videos/:id/manifest** - Get streaming manifest (HLS/DASH-like)
2. **POST /api/player/session** - Start playback session
3. **PUT /api/player/session/:id/quality** - Report quality change
4. **PUT /api/player/session/:id/event** - Report player event (buffering, error)
5. **GET /api/cdn/segment/:videoId/:quality/:segment** - Fetch video segment (with CDN sim)
6. **GET /api/recommendations/:userId** - Get recommended content

#### Data Models

```typescript
interface Video {
  id: string;
  title: string;
  duration: number;            // seconds
  availableQualities: Quality[];
  segments: number;            // Number of segments
  metadata: VideoMetadata;
}

interface Quality {
  name: string;                // e.g., "1080p", "720p", "480p"
  bitrate: number;             // kbps
  resolution: { width: number; height: number };
}

interface StreamingManifest {
  videoId: string;
  qualities: QualityManifest[];
  segmentDuration: number;     // seconds per segment
  totalDuration: number;
}

interface QualityManifest {
  quality: string;
  bitrate: number;
  segmentUrls: string[];
}

interface PlaybackSession {
  id: string;
  userId: string;
  videoId: string;
  currentQuality: string;
  currentSegment: number;
  state: 'loading' | 'playing' | 'buffering' | 'paused' | 'ended' | 'error';
  bandwidthEstimate: number;   // kbps
  bufferLevel: number;         // seconds of video buffered
  qualityChanges: QualityChange[];
  events: PlayerEvent[];
  startedAt: string;
  updatedAt: string;
}

interface PlayerEvent {
  type: 'play' | 'pause' | 'buffering' | 'quality_change' | 'error' | 'segment_loaded';
  timestamp: string;
  metadata?: Record<string, any>;
}

interface QualityChange {
  from: string;
  to: string;
  reason: 'bandwidth' | 'buffer' | 'manual';
  timestamp: string;
}

interface CDNCache {
  videoId: string;
  quality: string;
  segment: number;
  data: string;                // Simulated segment data
  cachedAt: string;
  expiresAt: string;
  hits: number;
}

interface Recommendation {
  userId: string;
  recommendedVideos: RecommendedVideo[];
  algorithm: 'collaborative_filtering' | 'content_based';
  generatedAt: string;
}

interface RecommendedVideo {
  videoId: string;
  score: number;
  reason: string;
}
```

### Technical Requirements

- **Adaptive Bitrate Algorithm**:
  - Buffer-based: Switch quality based on buffer level
  - Or Throughput-based: Switch based on bandwidth estimate
  - Rules:
    - If buffer < 10s and bandwidth low → downgrade quality
    - If buffer > 30s and bandwidth high → upgrade quality
    - Prevent frequent switching (hysteresis)

- **CDN Caching Simulation**:
  - In-memory cache with LRU eviction
  - Configurable cache size (MB)
  - TTL for cached segments
  - Track cache hit/miss ratio
  - Optional: Geographic edge simulation (different caches per region)

- **Recommendation Engine**:
  - Collaborative filtering: Users who watched X also watched Y
  - Or Content-based: Similar genre, tags, actors
  - Return top N recommendations

- **Player State Machine**:
  - States: loading, playing, buffering, paused, ended, error
  - Valid transitions defined

- TypeScript strict mode

### Success Criteria (P0)

- [ ] Video player state machine (loading, playing, buffering, paused, error)
- [ ] Adaptive bitrate selection based on bandwidth estimation
- [ ] CDN cache simulation with configurable cache size and TTL
- [ ] Basic recommendation API returning similar content
- [ ] Stream quality metrics (buffering ratio, quality switches)
- [ ] TypeScript strict mode with zero errors
- [ ] Test coverage >= 80%

### Time Estimates

| Baseline | With Meta |
|----------|-----------|
| 55-70 min | 35-45 min |

### Meta-Learning Opportunities

- State machine from fraud-detection, order-book, uber
- Caching strategies from twitter-timeline, airbnb
- Algorithm selection patterns
- Recommendation scoring from fraud-detection
- Event tracking and metrics

**Expected Reduction**: 35% through state machine and caching pattern reuse.
