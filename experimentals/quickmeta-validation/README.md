# QuickMeta Validation - Note API

A minimal REST API for validating QuickMeta data capture across all 4 phases.

## Purpose

This lightweight example tests if QuickMeta successfully captures:
- **Phase 1 (Planning)**: Requirements clarification patterns
- **Phase 2 (Design)**: Architecture decisions (REST, in-memory)
- **Phase 3 (Implementation)**: CRUD patterns, validation patterns
- **Phase 4 (Operation)**: Test verification patterns

## API Endpoints

```
GET    /api/notes      - List all notes
POST   /api/notes      - Create note { title, content }
GET    /api/notes/:id  - Get single note
DELETE /api/notes/:id  - Delete note
```

## Tech Stack

- TypeScript (strict mode)
- Express.js
- Zod validation
- In-memory storage (Map)
- Vitest for testing

## Quick Start

```bash
# Install dependencies
npm install

# Run tests
npm test

# Start dev server
npm run dev
```

## Project Structure

```
src/
  index.ts      - Express app, routes, storage
  schemas.ts    - Zod validation schemas
tests/
  api.test.ts   - API endpoint tests
```

## Implementation Time

Target: 15-20 minutes
- Phase 1 (Planning): 3 min
- Phase 2 (Design): 3 min
- Phase 3 (Implementation): 8 min
- Phase 4 (Operation): 4 min
