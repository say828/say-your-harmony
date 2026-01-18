# Validation Checklist: Simple REST API Task

This checklist provides comprehensive validation criteria for the Simple REST API task. Use this to verify task completion and quality.

---

## Phase 1: Setup and Configuration (P0)

### File Structure

- [ ] `package.json` exists in project root
- [ ] `tsconfig.json` exists with strict mode enabled
- [ ] `.eslintrc.json` exists with TypeScript configuration
- [ ] `README.md` exists with complete documentation
- [ ] `src/` directory exists with proper structure
- [ ] `tests/` directory exists

### Dependencies Installation

- [ ] All required dependencies installed (`express`, `zod`, `uuid`)
- [ ] All dev dependencies installed (`typescript`, `tsx`, `vitest`, etc.)
- [ ] `node_modules/` directory created
- [ ] `package-lock.json` or `yarn.lock` created

### TypeScript Configuration

- [ ] `strict: true` enabled
- [ ] `noImplicitAny: true` (implied by strict)
- [ ] `target` set to ES2022 or newer
- [ ] `outDir` configured (e.g., `./dist`)
- [ ] `rootDir` configured (e.g., `./src`)
- [ ] `esModuleInterop: true`

---

## Phase 2: Type Definitions (P0)

### src/types/note.ts

- [ ] `Note` interface defined with all required fields:
  - [ ] `id: string`
  - [ ] `title: string`
  - [ ] `content: string`
  - [ ] `createdAt: string`
  - [ ] `updatedAt: string`
- [ ] `CreateNoteInput` interface defined (title, content)
- [ ] `UpdateNoteInput` interface defined (partial title/content)
- [ ] `ErrorResponse` interface defined
- [ ] All interfaces exported
- [ ] No `any` types used

### Type Safety Verification

```bash
npm run type-check
```
- [ ] Zero TypeScript errors
- [ ] No implicit any warnings
- [ ] All function return types explicit

---

## Phase 3: Validation Layer (P0)

### src/validators/note.ts

- [ ] `createNoteSchema` defined using Zod:
  - [ ] `title` is string, required, 1-200 characters
  - [ ] `content` is string, required, 1-5000 characters
- [ ] `updateNoteSchema` defined (partial validation)
- [ ] UUID validation helper function exists
- [ ] Schemas are exported

### Validation Testing

- [ ] Empty string rejected for title
- [ ] Empty string rejected for content
- [ ] Title over 200 characters rejected
- [ ] Content over 5000 characters rejected
- [ ] Valid inputs pass validation
- [ ] Partial updates validated correctly

---

## Phase 4: Storage Layer (P1)

### src/storage/notes.ts

- [ ] In-memory storage implemented (Map or object)
- [ ] `getAllNotes()` function implemented
- [ ] `getNoteById(id)` function implemented
- [ ] `createNote(input)` function implemented
- [ ] `updateNote(id, input)` function implemented
- [ ] `deleteNote(id)` function implemented
- [ ] UUID generation using `uuid` package
- [ ] Timestamps set correctly (ISO 8601 format)

### Storage Testing

- [ ] Create note returns note with generated ID
- [ ] Create note sets createdAt and updatedAt
- [ ] Get all notes returns empty array initially
- [ ] Get note by ID returns undefined for non-existent ID
- [ ] Update note updates updatedAt timestamp
- [ ] Update note doesn't change createdAt
- [ ] Delete note removes from storage
- [ ] Delete non-existent note returns false

---

## Phase 5: API Routes (P0)

### src/routes/notes.ts

- [ ] Express Router created
- [ ] GET /api/notes implemented
- [ ] GET /api/notes/:id implemented
- [ ] POST /api/notes implemented
- [ ] PUT /api/notes/:id implemented
- [ ] DELETE /api/notes/:id implemented
- [ ] All routes use async/await properly
- [ ] Error handling implemented for each route

### Route Handlers Validation

#### GET /api/notes
- [ ] Returns 200 status code
- [ ] Returns array of notes
- [ ] Returns empty array when no notes exist
- [ ] Content-Type is application/json

#### GET /api/notes/:id
- [ ] Returns 200 with note when found
- [ ] Returns 404 when note not found
- [ ] Validates UUID format
- [ ] Returns proper error structure

#### POST /api/notes
- [ ] Returns 201 on successful creation
- [ ] Returns created note in response
- [ ] Validates input with Zod schema
- [ ] Returns 400 on validation failure
- [ ] Generated ID is valid UUID
- [ ] Sets createdAt and updatedAt timestamps
- [ ] Rejects missing title
- [ ] Rejects missing content
- [ ] Rejects title > 200 chars
- [ ] Rejects content > 5000 chars

#### PUT /api/notes/:id
- [ ] Returns 200 on successful update
- [ ] Returns updated note in response
- [ ] Returns 404 when note not found
- [ ] Returns 400 on validation failure
- [ ] Allows partial updates (only title or content)
- [ ] Updates updatedAt timestamp
- [ ] Doesn't change createdAt timestamp
- [ ] Validates UUID format

#### DELETE /api/notes/:id
- [ ] Returns 204 on successful deletion
- [ ] Returns 404 when note not found
- [ ] Actually removes note from storage
- [ ] Validates UUID format
- [ ] No response body on success

---

## Phase 6: Server Setup (P0)

### src/server.ts

- [ ] Express app created
- [ ] `express.json()` middleware registered
- [ ] Routes registered under `/api/notes`
- [ ] Server listens on port 3000 (or from env)
- [ ] Server exports app for testing
- [ ] Error handling middleware configured
- [ ] Graceful shutdown handling (optional)

### Server Startup

```bash
npm run dev
```
- [ ] Server starts without errors
- [ ] Logs indicate port listening
- [ ] No uncaught exceptions
- [ ] Process doesn't exit immediately

---

## Phase 7: Testing (P0)

### tests/notes.test.ts

- [ ] Test file exists
- [ ] Supertest imported and configured
- [ ] All endpoints have test coverage
- [ ] Success cases tested
- [ ] Error cases tested
- [ ] Edge cases tested

### Test Execution

```bash
npm test
```
- [ ] All tests pass
- [ ] No failing assertions
- [ ] No timeout errors
- [ ] Test output is clear and readable

### Test Coverage

```bash
npm run test:coverage
```
- [ ] Overall coverage >= 80%
- [ ] src/routes/notes.ts >= 90%
- [ ] src/storage/notes.ts >= 85%
- [ ] src/validators/note.ts >= 75%
- [ ] All critical paths covered

### Specific Test Scenarios

- [ ] GET /api/notes returns empty array initially
- [ ] POST creates note and returns 201
- [ ] GET /api/notes returns created notes
- [ ] GET /api/notes/:id returns specific note
- [ ] GET /api/notes/:id returns 404 for invalid ID
- [ ] POST returns 400 for missing title
- [ ] POST returns 400 for missing content
- [ ] POST returns 400 for title too long
- [ ] POST returns 400 for content too long
- [ ] PUT updates note successfully
- [ ] PUT allows partial updates
- [ ] PUT returns 404 for invalid ID
- [ ] PUT returns 400 for invalid data
- [ ] DELETE removes note successfully
- [ ] DELETE returns 404 for invalid ID
- [ ] Multiple notes can be created
- [ ] Each note has unique ID

---

## Phase 8: Code Quality (P1)

### ESLint

```bash
npm run lint
```
- [ ] Zero ESLint errors
- [ ] Zero ESLint warnings (critical)
- [ ] TypeScript ESLint rules active
- [ ] No unused variables
- [ ] No unreachable code

### Code Style

- [ ] Consistent indentation (2 or 4 spaces)
- [ ] Proper error handling (try/catch or async error handlers)
- [ ] No console.log in production code (only in dev mode)
- [ ] Functions are small and focused
- [ ] No code duplication

### Type Safety

- [ ] No `any` types used
- [ ] All function parameters typed
- [ ] All function return types explicit
- [ ] No type assertions (`as`) without good reason
- [ ] Interfaces used instead of inline types

---

## Phase 9: Documentation (P1)

### README.md

- [ ] Project description included
- [ ] Setup instructions clear and complete
- [ ] Installation steps documented
- [ ] Running the server documented
- [ ] All API endpoints documented:
  - [ ] GET /api/notes
  - [ ] GET /api/notes/:id
  - [ ] POST /api/notes
  - [ ] PUT /api/notes/:id
  - [ ] DELETE /api/notes/:id
- [ ] Request/response examples provided
- [ ] Error response formats documented
- [ ] Testing instructions included
- [ ] Environment variables documented (if any)

### Code Documentation

- [ ] JSDoc comments on public functions
- [ ] Interface fields have descriptions
- [ ] Complex logic has inline comments
- [ ] README references are accurate

---

## Phase 10: Integration Testing (P0)

### Manual API Testing

Start server:
```bash
npm run dev
```

#### Test 1: Create a note
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"Test Note","content":"Test content"}'
```
- [ ] Returns 201 status
- [ ] Response contains valid UUID
- [ ] Response contains title and content
- [ ] Response contains timestamps

#### Test 2: Get all notes
```bash
curl http://localhost:3000/api/notes
```
- [ ] Returns 200 status
- [ ] Returns array with created note
- [ ] JSON is properly formatted

#### Test 3: Get specific note
```bash
curl http://localhost:3000/api/notes/{id}
```
- [ ] Returns 200 status
- [ ] Returns correct note
- [ ] JSON is properly formatted

#### Test 4: Update note
```bash
curl -X PUT http://localhost:3000/api/notes/{id} \
  -H "Content-Type: application/json" \
  -d '{"title":"Updated Title"}'
```
- [ ] Returns 200 status
- [ ] Title is updated
- [ ] updatedAt is newer than createdAt

#### Test 5: Delete note
```bash
curl -X DELETE http://localhost:3000/api/notes/{id}
```
- [ ] Returns 204 status
- [ ] Subsequent GET returns 404

#### Test 6: Error handling
```bash
curl -X POST http://localhost:3000/api/notes \
  -H "Content-Type: application/json" \
  -d '{"title":"","content":"test"}'
```
- [ ] Returns 400 status
- [ ] Error response has proper structure
- [ ] Error message is descriptive

---

## Phase 11: Build and Production (P1)

### Build Process

```bash
npm run build
```
- [ ] TypeScript compiles successfully
- [ ] No compilation errors
- [ ] `dist/` directory created
- [ ] All source files transpiled
- [ ] Output is valid JavaScript

### Production Run

```bash
npm start
```
- [ ] Server starts from compiled code
- [ ] All endpoints work correctly
- [ ] No runtime errors

---

## Final Verification Checklist

### Critical (Must Pass)

- [ ] All 5 endpoints functional
- [ ] TypeScript strict mode: zero errors
- [ ] Test coverage >= 80%
- [ ] All tests passing
- [ ] README complete
- [ ] Server starts without errors

### Important (Should Pass)

- [ ] ESLint: zero errors
- [ ] Proper HTTP status codes
- [ ] Structured error responses
- [ ] JSDoc comments present
- [ ] Build succeeds

### Nice to Have (Optional)

- [ ] Test coverage >= 90%
- [ ] Request logging middleware
- [ ] CORS configuration
- [ ] Environment variable support
- [ ] Graceful shutdown handling

---

## Success Metrics

### Quantitative

- **Lines of Code**: 700-1000 LOC
- **Test Coverage**: >= 80% (target: 85-90%)
- **TypeScript Errors**: 0
- **ESLint Errors**: 0
- **Test Pass Rate**: 100%
- **API Response Time**: < 50ms (in-memory)

### Qualitative

- **Code Readability**: Functions are clear and well-named
- **Error Messages**: Descriptive and actionable
- **Documentation**: Complete and accurate
- **Type Safety**: Comprehensive typing throughout
- **Test Quality**: Tests are meaningful, not just for coverage

---

## Common Issues and Fixes

### Issue: TypeScript errors on Express types
**Fix**: Ensure `@types/express` is installed

### Issue: Tests hanging
**Fix**: Ensure server doesn't start during tests; export app separately

### Issue: Validation not working
**Fix**: Verify Zod schema is applied before route handler logic

### Issue: 404 on all routes
**Fix**: Check route registration in server.ts

### Issue: CORS errors in browser
**Fix**: Add `cors` middleware (optional enhancement)

### Issue: Port already in use
**Fix**: Change port or kill process on port 3000

---

## Time Benchmark

| Phase | Baseline Time | With Meta |
|-------|---------------|-----------|
| Setup | 5 min | 2 min |
| Types & Storage | 10 min | 6 min |
| Validation | 5 min | 3 min |
| Routes | 15 min | 10 min |
| Tests | 15 min | 10 min |
| Documentation | 5 min | 3 min |
| **Total** | **55 min** | **34 min** |
| **Efficiency Gain** | - | **38%** |

---

## Completion Confirmation

Once all items are checked:

1. **Build**: `npm run build` succeeds
2. **Type Check**: `npm run type-check` passes
3. **Lint**: `npm run lint` passes
4. **Test**: `npm test` passes with >= 80% coverage
5. **Manual Test**: All 5 endpoints work via curl/Postman
6. **Documentation**: README is complete and accurate

### Final Sign-Off

- [ ] All P0 items complete
- [ ] All P1 items complete (or documented as future work)
- [ ] Code is production-ready
- [ ] Peer review completed (if applicable)
- [ ] Ready for deployment

---

**Task Complete**: Simple REST API with CRUD Operations ✓
