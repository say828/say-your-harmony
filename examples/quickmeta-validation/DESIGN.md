# QuickMeta Validation API - Design Document

## Architecture Decisions

### 1. Storage: In-Memory Map
**Decision**: Use `Map<string, Note>` for storage
**Rationale**:
- Simplest possible implementation
- No external dependencies
- Perfect for validation testing
- Data resets on restart (acceptable for test)

**Tradeoffs**:
- ❌ Data lost on restart
- ✅ Zero setup overhead
- ✅ Synchronous operations

### 2. Validation: Zod
**Decision**: Use Zod for request validation
**Rationale**:
- Already in dependencies
- Type-safe validation
- Clear error messages
- Minimal boilerplate

**Schema Design**:
```typescript
Note: { id: string, title: string, content: string, createdAt: Date }
CreateNoteInput: { title: string, content: string }
```

### 3. API Design: REST
**Decision**: Classic REST endpoints
**Rationale**:
- Simplest to implement
- Easy to test
- Standard patterns

**Endpoints**:
- `GET /api/notes` - List all (returns Note[])
- `POST /api/notes` - Create (body: CreateNoteInput, returns Note)
- `GET /api/notes/:id` - Get single (returns Note)
- `DELETE /api/notes/:id` - Delete (returns 204)

### 4. Error Handling
**Decision**: Basic HTTP status codes
- 200: Success
- 201: Created
- 204: No Content
- 400: Bad Request (validation)
- 404: Not Found

### 5. Testing Strategy
**Decision**: Vitest with in-memory server
**Test Cases**:
1. Create note - success
2. Create note - validation error
3. List notes - empty
4. List notes - with data
5. Get note - success
6. Get note - not found
7. Delete note - success
8. Delete note - not found

## File Structure
```
src/
  index.ts      - Express app, routes, storage
  schemas.ts    - Zod schemas

tests/
  api.test.ts   - All endpoint tests
```

## QuickMeta Capture Points
This phase captures:
- Storage architecture decision (Map vs DB)
- Validation approach (Zod)
- API design patterns (REST)
- Error handling strategy
- Test coverage strategy
