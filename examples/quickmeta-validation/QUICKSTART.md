# QuickMeta Validation API - Quick Start

## Installation

```bash
cd examples/quickmeta-validation
npm install
```

## Run Tests

```bash
npm test
```

**Expected Output:**
```
✓ test/api.test.ts (8 tests) 19ms

Test Files  1 passed (1)
     Tests  8 passed (8)
```

## Start Development Server

```bash
npm run dev
```

Server will start at `http://localhost:3000`

## API Usage Examples

### Create a Note
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": "My First Note", "content": "Hello World"}'
```

Response:
```json
{
  "id": "550e8400-e29b-41d4-a716-446655440000",
  "title": "My First Note",
  "content": "Hello World",
  "createdAt": "2024-01-18T16:00:00.000Z"
}
```

### List All Notes
```bash
curl http://localhost:3000/api/notes
```

### Get Single Note
```bash
curl http://localhost:3000/api/notes/{id}
```

### Delete Note
```bash
curl -X DELETE http://localhost:3000/api/notes/{id}
```

## Project Structure

```
quickmeta-validation/
├── src/
│   ├── index.ts      # Express app + routes
│   └── schemas.ts    # Zod validation
├── test/
│   └── api.test.ts   # API tests
├── DESIGN.md         # Architecture decisions
├── VERIFICATION.md   # Test results
└── META_ANALYSIS.md  # Session analysis
```

## Validation Example

Invalid request will return 400:
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title": ""}'
```

Response:
```json
{
  "error": "Invalid input",
  "details": "..."
}
```

## QuickMeta Capture Points

This minimal API demonstrates pattern capture across all 4 phases:

1. **Planning**: Requirements analysis, dependency decisions
2. **Design**: Architecture rationale, tradeoff analysis
3. **Implementation**: CRUD patterns, validation integration
4. **Operation**: Test verification, deployment readiness

See [META_ANALYSIS.md](META_ANALYSIS.md) for detailed insights.
