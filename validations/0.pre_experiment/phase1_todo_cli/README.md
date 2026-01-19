# Phase 1: Simple Todo CLI App

A minimal command-line todo application built with TypeScript and Node.js.

## Features

- Add todos
- List all todos
- Mark todos as done
- Delete todos
- Persistent storage in JSON file
- Full error handling

## Project Structure

```
phase1_todo_cli/
├── src/
│   ├── index.ts     # CLI interface with argv parsing
│   └── store.ts     # Data layer with CRUD operations
├── dist/            # Compiled JavaScript (generated)
├── package.json     # Project configuration
├── tsconfig.json    # TypeScript configuration
└── todos.json       # Data storage (auto-created)
```

## Installation

```bash
npm install
npm run build
```

## Usage

### Add a todo
```bash
node dist/index.js add "Buy groceries"
# Output: Added task #1: Buy groceries
```

### List all todos
```bash
node dist/index.js list
# Output:
# Todos:
#   [ ] #1: Buy groceries
#   [x] #2: Write documentation
#   [ ] #3: Review pull requests
```

### Mark a todo as done
```bash
node dist/index.js done 1
# Output: Marked task #1 as done: Buy groceries
```

### Delete a todo
```bash
node dist/index.js delete 1
# Output: Deleted task #1
```

## Implementation Details

### Type Definitions

```typescript
interface Task {
  id: number;
  text: string;
  done: boolean;
  createdAt: string;
}

interface TodoStore {
  tasks: Task[];
  nextId: number;
}
```

### Key Design Decisions

1. **No External Dependencies**: Uses only Node.js built-ins (`fs`, `path`)
2. **Synchronous I/O**: Simple blocking file operations for CLI use case
3. **Manual Argument Parsing**: Uses `process.argv` without libraries
4. **Auto-initialization**: Creates `todos.json` if it doesn't exist
5. **Strict TypeScript**: Full type safety with strict mode enabled

### Error Handling

- Empty todo text validation
- Invalid task ID detection
- Non-existent task handling
- Unknown command detection
- File I/O error recovery

## Testing Results

All commands tested successfully:

1. **Add Command**: Creates new todos with auto-incrementing IDs
2. **List Command**: Displays all todos with done/pending status
3. **Done Command**: Marks todos as complete with [x] indicator
4. **Delete Command**: Removes todos from storage
5. **Error Cases**: All validation working correctly

## Build Verification

```bash
npm run build
# Compilation successful, no errors
# Generated files:
#   - dist/index.js (+ source maps, declarations)
#   - dist/store.js (+ source maps, declarations)
```

## Data Storage

Data is stored in `todos.json` in the project root:

```json
{
  "tasks": [
    {
      "id": 2,
      "text": "Write documentation",
      "done": true,
      "createdAt": "2026-01-19T11:32:57.344Z"
    }
  ],
  "nextId": 4
}
```

## Phase 1 Completion Checklist

- [x] Project structure created
- [x] package.json with build scripts
- [x] tsconfig.json with strict TypeScript
- [x] store.ts with CRUD operations
- [x] index.ts with CLI interface
- [x] `npm run build` compiles successfully
- [x] All 4 commands working (add, list, done, delete)
- [x] Error handling for invalid inputs
- [x] Auto-create todos.json if missing
- [x] All commands tested and verified
