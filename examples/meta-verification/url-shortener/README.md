# URL Shortener API

A TypeScript-based URL shortener with Express.js, Zod validation, and in-memory storage.

## Purpose

This project verifies the Say-Your-Harmony meta-learning system by implementing a complete 4-phase development workflow with automatic semantic meta extraction after each phase.

## Features

- 3 RESTful endpoints (create, retrieve, redirect)
- 6-character cryptographic short IDs
- TypeScript strict mode compliance
- Zod validation
- 80%+ test coverage
- In-memory Map-based storage

## API Endpoints

### 1. POST /api/shorten

Create a short URL from a long URL.

**Request**:
```json
{
  "url": "https://example.com/very/long/path"
}
```

**Response** (201 Created):
```json
{
  "id": "aB3xY9",
  "shortUrl": "http://localhost:3000/aB3xY9",
  "longUrl": "https://example.com/very/long/path"
}
```

### 2. GET /api/urls/:id

Get URL details including click count and timestamps.

**Response** (200 OK):
```json
{
  "id": "aB3xY9",
  "longUrl": "https://example.com/very/long/path",
  "clicks": 42,
  "createdAt": "2026-01-18T14:30:00.000Z"
}
```

### 3. GET /:id

Redirect to the original URL (301 Permanent Redirect) and increment click counter.

**Response**: HTTP 301 with `Location` header

## Installation

```bash
npm install
```

## Usage

### Development

```bash
npm run dev
```

Server runs on `http://localhost:3000`

### Production Build

```bash
npm run build
npm start
```

### Testing

```bash
# Run tests
npm test

# Run tests once
npm run test:run

# Coverage report
npm run test:coverage
```

## Architecture

```
url-shortener/
├── src/
│   ├── server.ts          # Express app setup
│   ├── routes/
│   │   └── url.routes.ts  # Route handlers
│   ├── services/
│   │   └── url.service.ts # Business logic
│   ├── storage/
│   │   └── url.storage.ts # In-memory Map
│   ├── validation/
│   │   └── schemas.ts     # Zod schemas
│   └── types/
│       └── index.ts       # TypeScript types
└── tests/
    ├── url.routes.test.ts
    ├── url.service.test.ts
    ├── url.storage.test.ts
    └── validation.test.ts
```

## Meta-Learning Verification

This project is part of the Say-Your-Harmony meta-learning experiment. After each development phase (Planning, Design, Implementation, Operation), the system automatically extracts semantic metadata including:

- `sequentialDeps`: Tasks that must complete before this phase
- `parallelSuccesses`: Tasks that successfully ran in parallel
- Decisions, challenges, risks, and insights

Meta files are stored in `~/.claude/meta/{phase}/recent/`

## Technical Stack

- TypeScript 5.3+ (strict mode)
- Express.js 4.18+
- Zod 3.23+
- Vitest 1.1+
- Node.js 20+

## License

MIT
