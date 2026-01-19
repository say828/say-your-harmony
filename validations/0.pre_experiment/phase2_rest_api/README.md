# Phase 2: REST API Server

A TypeScript REST API server built with Express.js and SQLite for validation experiments.

## Architecture

### 3-Tier Architecture
```
Routes → Services → Database
  ↓         ↓          ↓
HTTP    Business    SQLite
Layer    Logic     Storage
```

### Key Features
- **Defensive I/O**: Try-catch with auto-recovery in DB operations
- **Auto-initialization**: Creates DB + table if not exists
- **Type Safety**: Strict TypeScript interfaces
- **Three-tier Error Handling**: Middleware → Service → Database

## Tech Stack
- **Runtime**: Node.js + TypeScript
- **Framework**: Express.js
- **Database**: better-sqlite3 (synchronous driver)
- **Validation**: Custom middleware

## API Endpoints

### Base URL
```
http://localhost:3000
```

### Endpoints

#### 1. Get All Todos
```http
GET /todos
GET /todos?completed=true
```

#### 2. Get Todo by ID
```http
GET /todos/:id
```

#### 3. Create Todo
```http
POST /todos
Content-Type: application/json

{
  "title": "Todo title",
  "description": "Todo description"
}
```

#### 4. Update Todo
```http
PUT /todos/:id
Content-Type: application/json

{
  "title": "Updated title",
  "description": "Updated description",
  "completed": true
}
```

#### 5. Delete Todo
```http
DELETE /todos/:id
```

#### Health Check
```http
GET /health
```

## Installation

```bash
npm install
```

## Build

```bash
npm run build
```

## Run

### Development
```bash
npm run dev
```

### Production
```bash
npm start
```

## Project Structure

```
phase2_rest_api/
├── src/
│   ├── types/
│   │   └── todo.ts           # Type definitions
│   ├── db/
│   │   └── database.ts       # SQLite connection & schema
│   ├── services/
│   │   └── todo.ts           # Business logic
│   ├── middleware/
│   │   ├── validation.ts     # Input validation
│   │   └── error.ts          # Error handling
│   ├── routes/
│   │   └── todo.ts           # Route definitions
│   ├── app.ts                # Express app
│   └── index.ts              # Entry point
├── data/
│   └── todos.db              # SQLite database (auto-created)
├── dist/                     # Compiled JavaScript (auto-generated)
├── package.json
└── tsconfig.json
```

## Database Schema

```sql
CREATE TABLE todos (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  completed INTEGER NOT NULL DEFAULT 0,
  created_at TEXT NOT NULL DEFAULT (datetime('now')),
  updated_at TEXT NOT NULL DEFAULT (datetime('now'))
);

CREATE INDEX idx_todos_completed ON todos(completed);
```

## Validation Rules

### Create Todo
- `title`: Required, non-empty string, max 200 characters
- `description`: Required, non-empty string, max 1000 characters

### Update Todo
- `title`: Optional, non-empty string, max 200 characters
- `description`: Optional, non-empty string, max 1000 characters
- `completed`: Optional, boolean
- At least one field must be provided

## Error Responses

### 400 Bad Request
```json
{
  "error": "Bad Request",
  "message": "Title is required and must be a non-empty string"
}
```

### 404 Not Found
```json
{
  "error": "Not Found",
  "message": "Todo with id 1 not found"
}
```

### 500 Internal Server Error
```json
{
  "error": "Internal Server Error",
  "message": "Failed to fetch todos"
}
```

## Example Usage

### Create a Todo
```bash
curl -X POST http://localhost:3000/todos \
  -H "Content-Type: application/json" \
  -d '{"title": "Learn TypeScript", "description": "Study TypeScript fundamentals"}'
```

### Get All Todos
```bash
curl http://localhost:3000/todos
```

### Update a Todo
```bash
curl -X PUT http://localhost:3000/todos/1 \
  -H "Content-Type: application/json" \
  -d '{"completed": true}'
```

### Delete a Todo
```bash
curl -X DELETE http://localhost:3000/todos/1
```

## Testing

The server can be tested with:
- `curl` commands
- Postman
- Any HTTP client

## Graceful Shutdown

The server handles `SIGINT` and `SIGTERM` signals gracefully:
1. Stops accepting new requests
2. Closes server
3. Closes database connection
4. Exits process

Press `Ctrl+C` to trigger graceful shutdown.
