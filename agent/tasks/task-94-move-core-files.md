# Task 94: Move Core Files to task-core

**Milestone**: Milestone 3 - Core Library Extraction
**Estimated Time**: 4 hours
**Dependencies**: Task 93 (Initialize task-core Project)
**Status**: Not Started

---

## Objective

Move core business logic files (schemas, DTOs, services, client, constants) from `task-mcp` to `task-core` and update import paths.

## Steps

### 1. Copy Schema Files

```bash
# From task-mcp directory
cp src/schemas/task.ts ../task-core/src/schemas/
```

**Update imports in `task-core/src/schemas/task.ts`**:
- No changes needed (only imports from `zod`)

### 2. Copy DTO Files

```bash
# From task-mcp directory
cp src/dto/task-api.dto.ts ../task-core/src/dto/
cp src/dto/transformers.ts ../task-core/src/dto/
cp src/dto/index.ts ../task-core/src/dto/
```

**Update imports in `task-core/src/dto/transformers.ts`**:
```typescript
// Before
import type { Task, Milestone, TaskItem, TaskMessage } from '../schemas/task.js'

// After (no change needed - relative path still works)
import type { Task, Milestone, TaskItem, TaskMessage } from '../schemas/task.js'
```

**Update imports in `task-core/src/dto/index.ts`**:
- No changes needed (relative imports)

### 3. Copy Constants

```bash
# From task-mcp directory
cp src/constant/collections.ts ../task-core/src/constant/
```

**Update imports in `task-core/src/constant/collections.ts`**:
- No changes needed (no imports)

### 4. Copy Services

```bash
# From task-mcp directory
cp src/services/task-database.service.ts ../task-core/src/services/
```

**Update imports in `task-core/src/services/task-database.service.ts`**:
```typescript
// Before
import { getUserTasks, getUserTaskMessages, getUserTask, getUserTaskMessage } from '../constant/collections.js'
import { TaskSchema, type Task, type Milestone, type TaskItem, type TaskMessage } from '../schemas/task.js'

// After (no change needed - relative paths work)
import { getUserTasks, getUserTaskMessages, getUserTask, getUserTaskMessage } from '../constant/collections.js'
import { TaskSchema, type Task, type Milestone, type TaskItem, type TaskMessage } from '../schemas/task.js'
```

### 5. Copy Firebase Client

```bash
# From task-mcp directory
cp src/client.ts ../task-core/
```

**Update imports in `task-core/src/client.ts`**:
```typescript
// Before
import { TaskDatabaseService } from '@/services/task-database.service.js'
import type { Task, Milestone, TaskItem } from '@/schemas/task.js'

// After
import { TaskDatabaseService } from './services/task-database.service.js'
import type { Task, Milestone, TaskItem } from './schemas/task.js'
```

### 6. Copy Test Files

```bash
# From task-mcp directory
cp src/schemas/task.spec.ts ../task-core/__tests__/schemas/ 2>/dev/null || echo "No schema tests to copy"
cp src/dto/transformers.spec.ts ../task-core/__tests__/dto/
cp src/services/task-database.service.spec.ts ../task-core/__tests__/services/
cp src/services/task-database.service.e2e.ts ../task-core/__tests__/services/
cp src/client.spec.ts ../task-core/__tests__/
```

**Update imports in test files**:

`__tests__/dto/transformers.spec.ts`:
```typescript
// Before
import { toTaskApiResponse, toTaskListApiResponse, /* ... */ } from '@/dto/transformers.js'
import type { Task, Milestone, TaskItem, TaskMessage } from '@/schemas/task.js'

// After
import { toTaskApiResponse, toTaskListApiResponse, /* ... */ } from '../../src/dto/transformers.js'
import type { Task, Milestone, TaskItem, TaskMessage } from '../../src/schemas/task.js'
```

`__tests__/services/task-database.service.spec.ts`:
```typescript
// Before
import { TaskDatabaseService } from '@/services/task-database.service.js'
import type { Task } from '@/schemas/task.js'

// After
import { TaskDatabaseService } from '../../src/services/task-database.service.js'
import type { Task } from '../../src/schemas/task.js'
```

`__tests__/services/task-database.service.e2e.ts`:
```typescript
// Before
import { TaskDatabaseService } from '@/services/task-database.service.js'

// After
import { TaskDatabaseService } from '../../src/services/task-database.service.js'
```

`__tests__/client.spec.ts`:
```typescript
// Before
import { FirebaseClient } from '@/client.js'
import { TaskDatabaseService } from '@/services/task-database.service.js'

// After
import { FirebaseClient } from '../src/client.js'
import { TaskDatabaseService } from '../src/services/task-database.service.js'
```

### 7. Create Index File (Optional)

Create `task-core/src/index.ts` for convenience:
```typescript
/**
 * task-core - Core business logic for task execution system
 * 
 * This is a convenience export file. For optimal tree-shaking,
 * import from specific subpaths:
 * - @prmichaelsen/task-core/schemas
 * - @prmichaelsen/task-core/dto
 * - @prmichaelsen/task-core/services
 * - @prmichaelsen/task-core/client
 * - @prmichaelsen/task-core/constants
 */

// Re-export everything for convenience
export * from './schemas/task.js'
export * from './dto/index.js'
export * from './services/task-database.service.js'
export * from './client.js'
export * from './constant/collections.js'
```

### 8. Verify File Structure

```bash
cd task-core
tree src __tests__
```

Expected output:
```
src/
├── client.ts
├── index.ts
├── constant/
│   └── collections.ts
├── dto/
│   ├── index.ts
│   ├── task-api.dto.ts
│   └── transformers.ts
├── schemas/
│   └── task.ts
└── services/
    └── task-database.service.ts

__tests__/
├── client.spec.ts
├── dto/
│   └── transformers.spec.ts
└── services/
    ├── task-database.service.e2e.ts
    └── task-database.service.spec.ts
```

### 9. Run TypeScript Compiler

```bash
npm run typecheck
```

Expected: No errors

### 10. Run Tests

```bash
npm test
```

Expected: All 32 tests pass (14 database + 18 DTO + 11 client - some may fail initially due to mocking issues, will fix in next task)

### 11. Update Progress Tracking

Update `agent/progress.yaml`:
```yaml
tasks:
  milestone_1:
    - id: task-93
      name: Initialize task-core Project
      status: completed
      completed_date: 2026-02-18
    
    - id: task-94
      name: Move Core Files to task-core
      status: completed
      completed_date: 2026-02-18

progress:
  implementation: 40
  overall: 40

recent_work:
  - date: 2026-02-18
    description: Completed Task 94 - Moved core files from task-mcp
    items:
      - ✅ Copied schemas, DTOs, services, client, constants
      - ✅ Updated import paths in all files
      - ✅ Copied test files
      - ✅ TypeScript compilation successful
```

---

## Verification

- [ ] All source files copied to task-core
- [ ] All test files copied to task-core
- [ ] Import paths updated (no `@/` aliases)
- [ ] TypeScript compiles without errors
- [ ] File structure matches expected layout
- [ ] No references to task-mcp in copied files
- [ ] Tests run (may have failures, will fix in next task)

---

## Expected Output

### Files Moved
- `src/schemas/task.ts` (155 lines)
- `src/dto/task-api.dto.ts` (~100 lines)
- `src/dto/transformers.ts` (~100 lines)
- `src/dto/index.ts` (~50 lines)
- `src/constant/collections.ts` (~50 lines)
- `src/services/task-database.service.ts` (471 lines)
- `src/client.ts` (316 lines)
- Test files (~800 lines)

**Total**: ~2,000 lines of code moved

### Console Output
```
✓ Files copied successfully
✓ Import paths updated
✓ TypeScript compilation successful
⚠ Some tests may fail (will fix in Task 95)
```

---

## Notes

- Keep original files in task-mcp for now (will delete in Task 99)
- Some tests may fail due to mocking differences - will fix in Task 96
- Focus on getting files moved and compiling, not on test failures yet

---

## Next Task

[Task 95: Configure Build and Exports](task-95-configure-build-exports.md)

---

**Status**: Not Started
**Estimated Time**: 4 hours
**Priority**: High
**Owner**: Development Team
**Created**: 2026-02-18
