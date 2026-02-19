# Migration Guide: task-mcp → @prmichaelsen/task-core

**Project**: task-mcp
**Target**: Migrate from local core files to @prmichaelsen/task-core package
**Version**: task-mcp v1.0.0 (breaking change)

---

## Overview

This guide explains how to migrate task-mcp from using local core files to the published `@prmichaelsen/task-core` npm package.

## Benefits

- ✅ Shared code between MCP server and REST API
- ✅ Independent versioning of core logic
- ✅ Smaller task-mcp package size
- ✅ Better separation of concerns
- ✅ Easier testing and maintenance

---

## Migration Steps

### Step 1: Install @prmichaelsen/task-core

```bash
cd /home/prmichaelsen/task-mcp
npm install @prmichaelsen/task-core@^1.0.0
```

### Step 2: Remove Local Core Files

Delete the following files (they're now in task-core):

```bash
rm -rf src/schemas/
rm -rf src/dto/
rm -rf src/services/task-database.service.ts
rm -rf src/services/task-database.service.spec.ts
rm -rf src/services/task-database.service.e2e.ts
rm src/client.ts
rm src/client.spec.ts
rm -rf src/constant/
```

### Step 3: Update Import Statements

Replace local imports with task-core imports:

**Before** (local imports):
```typescript
import { TaskSchema, type Task } from '@/schemas/task.js'
import { toTaskApiResponse } from '@/dto/transformers.js'
import { TaskDatabaseService } from '@/services/task-database.service.js'
import { FirebaseClient } from '@/client.js'
import { getUserTasks } from '@/constant/collections.js'
```

**After** (task-core imports):
```typescript
import { TaskSchema, type Task } from '@prmichaelsen/task-core/schemas'
import { toTaskApiResponse } from '@prmichaelsen/task-core/dto'
import { TaskDatabaseService } from '@prmichaelsen/task-core/services'
import { FirebaseClient } from '@prmichaelsen/task-core/client'
import { getUserTasks } from '@prmichaelsen/task-core/constants'
```

### Step 4: Update All Tool Files

Update imports in all MCP tool files:

**Files to update**:
- `src/tools/create-task.ts`
- `src/tools/get-task.ts`
- `src/tools/list-tasks.ts`
- `src/tools/update-task.ts`
- `src/tools/delete-task.ts`
- `src/tools/add-milestone.ts`
- `src/tools/update-milestone.ts`
- `src/tools/remove-milestone.ts`
- `src/tools/add-task-item.ts`
- `src/tools/update-task-item.ts`
- `src/tools/remove-task-item.ts`
- `src/tools/add-message.ts`
- `src/tools/list-messages.ts`
- Any other files importing from schemas, dto, services, client, or constants

**Find and replace**:
```bash
# Find all files with old imports
grep -r "@/schemas" src/
grep -r "@/dto" src/
grep -r "@/services" src/
grep -r "@/client" src/
grep -r "@/constant" src/
```

### Step 5: Update Test Files

Update test imports:

**Files to update**:
- `src/tools/*.spec.ts` - All tool test files
- `src/server.spec.ts` - Server tests
- `src/server-factory.spec.ts` - Factory tests

**Replace**:
- `@/schemas/task.js` → `@prmichaelsen/task-core/schemas`
- `@/dto/*` → `@prmichaelsen/task-core/dto`
- `@/services/*` → `@prmichaelsen/task-core/services`
- `@/client.js` → `@prmichaelsen/task-core/client`
- `@/constant/*` → `@prmichaelsen/task-core/constants`

### Step 6: Update package.json

**Remove** (no longer needed):
```json
{
  "exports": {
    "./schemas": "...",
    "./dto": "...",
    "./services": "...",
    "./client": "...",
    "./constants": "..."
  }
}
```

**Keep** (MCP-specific):
```json
{
  "exports": {
    "./server": {
      "types": "./dist/server.d.ts",
      "import": "./dist/server.js"
    }
  }
}
```

**Update dependencies**:
```json
{
  "dependencies": {
    "@prmichaelsen/task-core": "^1.0.0",
    "@modelcontextprotocol/sdk": "^1.26.0"
  }
}
```

**Remove** (now in task-core):
```json
{
  "dependencies": {
    "firebase-admin": "...",  // Now in task-core
    "zod": "..."              // Now in task-core
  }
}
```

### Step 7: Update esbuild Configuration

Update `esbuild.build.js` and `esbuild.watch.js`:

**Remove** these entry points (now in task-core):
```javascript
const entryPoints = [
  // Remove these:
  // 'src/schemas/task.ts',
  // 'src/dto/index.ts',
  // 'src/services/task-database.service.ts',
  // 'src/client.ts',
  // 'src/constant/collections.ts',
  
  // Keep only MCP-specific:
  'src/server.ts',
  'src/server-factory.ts',
  'src/tools/index.ts'
]
```

**Add external** (don't bundle task-core):
```javascript
const sharedConfig = {
  bundle: true,
  platform: 'node',
  target: 'node20',
  format: 'esm',
  sourcemap: true,
  external: [
    '@modelcontextprotocol/sdk',
    '@prmichaelsen/task-core',  // Add this
    'firebase-admin',
    'zod'
  ]
}
```

### Step 8: Update tsconfig.json

**Remove** path aliases for core files (if they exist):
```json
{
  "compilerOptions": {
    "paths": {
      // Remove these if present:
      // "@/schemas/*": ["src/schemas/*"],
      // "@/dto/*": ["src/dto/*"],
      // "@/services/*": ["src/services/*"],
      // "@/client": ["src/client"],
      // "@/constant/*": ["src/constant/*"]
    }
  }
}
```

### Step 9: Run Tests

```bash
# Type check
npm run typecheck

# Run tests
npm test

# Build
npm run build
```

**Expected results**:
- ✅ TypeScript compiles without errors
- ✅ All tests pass (18 tool tests + 8 server tests = 26 total)
- ✅ Build succeeds

### Step 10: Update Documentation

Update `README.md`:

**Add dependency note**:
```markdown
## Dependencies

This package uses `@prmichaelsen/task-core` for core business logic (schemas, DTOs, services).
```

**Update installation**:
```markdown
## Installation

\`\`\`bash
npm install @prmichaelsen/task-mcp
\`\`\`

The core business logic is provided by `@prmichaelsen/task-core`.
```

### Step 11: Update CHANGELOG.md

Add breaking change entry:

```markdown
## [1.0.0] - 2026-02-18

### Changed
- **BREAKING**: Extracted core business logic to `@prmichaelsen/task-core` package
- task-mcp now depends on `@prmichaelsen/task-core@^1.0.0`
- Reduced package size (only MCP-specific code)

### Removed
- Local schemas, DTOs, services, client, and constants (moved to task-core)

### Migration
- Install `@prmichaelsen/task-core@^1.0.0`
- Update imports from `@/schemas/*` to `@prmichaelsen/task-core/schemas`
- Update imports from `@/dto/*` to `@prmichaelsen/task-core/dto`
- Update imports from `@/services/*` to `@prmichaelsen/task-core/services`
- Update imports from `@/client` to `@prmichaelsen/task-core/client`
- Update imports from `@/constant/*` to `@prmichaelsen/task-core/constants`
```

### Step 12: Bump Version to 1.0.0

Update `package.json`:
```json
{
  "version": "1.0.0"
}
```

This is a major version bump because it's a breaking change for anyone importing core files directly.

### Step 13: Commit Changes

```bash
git add -A
git commit -m "feat!: migrate to @prmichaelsen/task-core package

BREAKING CHANGE: Core business logic extracted to separate package.

- Install @prmichaelsen/task-core@^1.0.0
- Remove local schemas, dto, services, client, constants
- Update all imports to use task-core package
- Reduce package size (MCP-specific code only)

Migration:
- @/schemas/* → @prmichaelsen/task-core/schemas
- @/dto/* → @prmichaelsen/task-core/dto
- @/services/* → @prmichaelsen/task-core/services
- @/client → @prmichaelsen/task-core/client
- @/constant/* → @prmichaelsen/task-core/constants

Version: 1.0.0"
```

### Step 14: Publish

```bash
npm publish --access public
```

---

## Verification Checklist

After migration, verify:

- [ ] `npm install` succeeds
- [ ] `npm run typecheck` passes
- [ ] `npm test` passes (26 tests)
- [ ] `npm run build` succeeds
- [ ] No references to old local paths remain
- [ ] Package size reduced (check with `npm pack --dry-run`)
- [ ] MCP server starts correctly
- [ ] All tools work as expected

---

## Import Reference

### Quick Reference Table

| Old Import | New Import |
|------------|------------|
| `@/schemas/task.js` | `@prmichaelsen/task-core/schemas` |
| `@/dto/transformers.js` | `@prmichaelsen/task-core/dto` |
| `@/dto/task-api.dto.js` | `@prmichaelsen/task-core/dto` |
| `@/services/task-database.service.js` | `@prmichaelsen/task-core/services` |
| `@/client.js` | `@prmichaelsen/task-core/client` |
| `@/constant/collections.js` | `@prmichaelsen/task-core/constants` |

### Example Migration

**Before**:
```typescript
// src/tools/create-task.ts
import { TaskSchema, type Task } from '@/schemas/task.js'
import { toTaskApiResponse } from '@/dto/transformers.js'
import { TaskDatabaseService } from '@/services/task-database.service.js'

export async function createTask(userId: string, title: string) {
  const task = await TaskDatabaseService.createTask(userId, title)
  return toTaskApiResponse(task)
}
```

**After**:
```typescript
// src/tools/create-task.ts
import { TaskSchema, type Task } from '@prmichaelsen/task-core/schemas'
import { toTaskApiResponse } from '@prmichaelsen/task-core/dto'
import { TaskDatabaseService } from '@prmichaelsen/task-core/services'

export async function createTask(userId: string, title: string) {
  const task = await TaskDatabaseService.createTask(userId, title)
  return toTaskApiResponse(task)
}
```

---

## Troubleshooting

### Issue: Module not found '@prmichaelsen/task-core'

**Solution**: Install the package:
```bash
npm install @prmichaelsen/task-core@^1.0.0
```

### Issue: TypeScript errors after migration

**Solution**: 
1. Check all imports are updated
2. Run `npm run typecheck` to see specific errors
3. Ensure `@prmichaelsen/task-core` is in dependencies

### Issue: Tests failing after migration

**Solution**:
1. Update test imports
2. Check mock paths if using mocks
3. Ensure test data matches task-core schemas

### Issue: Build fails

**Solution**:
1. Update esbuild config to external task-core
2. Remove old entry points
3. Check for remaining local imports

---

## Rollback Plan

If migration fails, rollback:

```bash
git reset --hard HEAD~1
npm install
```

Then investigate issues before retrying.

---

## Support

- task-core docs: See `@prmichaelsen/task-core` README
- task-core version: `npm view @prmichaelsen/task-core version`
- Report issues: GitHub Issues

---

**Migration Time**: ~30-60 minutes  
**Complexity**: Medium  
**Risk**: Low (breaking change, but straightforward)  
**Benefit**: High (code reuse, better architecture)
