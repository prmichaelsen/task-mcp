# Milestone 3: Core Library Extraction

**Goal**: Extract shared business logic into `@prmichaelsen/task-core` library
**Duration**: 1 week
**Dependencies**: Milestone 2 (completed)
**Status**: Not Started

---

## Overview

This milestone extracts core business logic (schemas, DTOs, services, Firebase client) from `task-mcp` into a separate `@prmichaelsen/task-core` npm package. This enables code reuse between the MCP server and the upcoming REST API service.

## Deliverables

1. **New `task-core` Package**
   - Standalone npm package with TypeScript
   - Contains schemas, DTOs, services, Firebase client
   - Published to npm as `@prmichaelsen/task-core`
   - Comprehensive documentation and examples

2. **Updated `task-mcp` Package**
   - Depends on `task-core` instead of local files
   - All imports updated to use `task-core`
   - Reduced package size (only MCP-specific code)
   - Published as v1.0.0 (breaking change)

3. **Testing and Validation**
   - All existing tests pass
   - Integration tests verify packages work together
   - No functionality lost in refactoring

## Success Criteria

- [ ] `task-core` package created and published to npm
- [ ] `task-core` exports 5 modules: schemas, dto, services, client, constants
- [ ] All 32 core tests pass (14 database + 18 DTO)
- [ ] `task-mcp` updated to use `task-core` dependency
- [ ] All 26 MCP tests pass (18 tools + 8 server)
- [ ] `task-mcp` published as v1.0.0
- [ ] Build artifacts generated correctly for both packages
- [ ] Documentation complete for both packages
- [ ] No breaking changes for end users (internal refactoring only)

## Key Files to Create

### task-core Project Structure
```
task-core/
├── src/
│   ├── schemas/
│   │   └── task.ts                    # Moved from task-mcp
│   ├── dto/
│   │   ├── task-api.dto.ts            # Moved from task-mcp
│   │   ├── transformers.ts            # Moved from task-mcp
│   │   └── index.ts                   # Moved from task-mcp
│   ├── services/
│   │   └── task-database.service.ts   # Moved from task-mcp
│   ├── constant/
│   │   └── collections.ts             # Moved from task-mcp
│   └── client.ts                      # Moved from task-mcp
│
├── __tests__/
│   ├── schemas/
│   │   └── task.spec.ts               # Moved from task-mcp
│   ├── dto/
│   │   └── transformers.spec.ts       # Moved from task-mcp
│   ├── services/
│   │   ├── task-database.service.spec.ts  # Moved from task-mcp
│   │   └── task-database.service.e2e.ts   # Moved from task-mcp
│   └── client.spec.ts                 # Moved from task-mcp
│
├── agent/                             # ACP documentation
│   ├── design/
│   │   └── requirements.md
│   ├── milestones/
│   │   └── milestone-1-core-extraction.md
│   ├── tasks/
│   │   ├── task-1-project-setup.md
│   │   ├── task-2-move-core-files.md
│   │   ├── task-3-configure-build.md
│   │   └── task-4-publish-package.md
│   └── progress.yaml
│
├── package.json
├── tsconfig.json
├── esbuild.build.js
├── jest.config.js
├── README.md
├── CHANGELOG.md
└── .gitignore
```

## Technical Decisions

1. **Package Scope**: Use `@prmichaelsen` scope for npm publishing
2. **Version**: Start at v1.0.0 (stable API)
3. **Build Tool**: esbuild (same as task-mcp)
4. **Test Framework**: Jest (same as task-mcp)
5. **Module System**: ESM (same as task-mcp)
6. **Exports**: 5 subpath exports for granular imports

## Dependencies

### task-core Dependencies
```json
{
  "dependencies": {
    "firebase-admin": "^13.6.1",
    "zod": "^4.3.6"
  },
  "devDependencies": {
    "@types/jest": "^29.5.14",
    "@types/node": "^25.2.3",
    "esbuild": "^0.27.3",
    "jest": "^29.7.0",
    "ts-jest": "^29.4.6",
    "typescript": "^5.9.3"
  }
}
```

### task-mcp Updated Dependencies
```json
{
  "dependencies": {
    "@prmichaelsen/task-core": "^1.0.0",
    "@modelcontextprotocol/sdk": "^1.26.0"
  }
}
```

## Risks and Mitigation

**Risk**: Breaking changes for existing task-mcp consumers
- **Mitigation**: Use major version bump (v1.0.0), provide migration guide

**Risk**: Import path changes cause runtime errors
- **Mitigation**: Comprehensive testing, verify all imports before publishing

**Risk**: Circular dependencies between packages
- **Mitigation**: task-core has zero dependencies on task-mcp

**Risk**: Build configuration issues
- **Mitigation**: Test build locally before publishing

## Migration Guide

### For task-mcp Consumers

**Before** (v0.4.0):
```typescript
import { TaskSchema } from '@prmichaelsen/task-mcp/schemas'
import { TaskDatabaseService } from '@prmichaelsen/task-mcp/services'
```

**After** (v1.0.0):
```typescript
import { TaskSchema } from '@prmichaelsen/task-core/schemas'
import { TaskDatabaseService } from '@prmichaelsen/task-core/services'
```

**Note**: MCP server and tools remain in `@prmichaelsen/task-mcp`

## Next Milestone

[Milestone 4: REST API Service](milestone-4-rest-api-service.md)

---

**Status**: Not Started
**Estimated Effort**: 40 hours (1 week)
**Priority**: High
**Owner**: Development Team
**Last Updated**: 2026-02-18

## Task List

- [ ] Task 93: Initialize task-core Project (2 hours)
- [ ] Task 94: Move Core Files to task-core (4 hours)
- [ ] Task 95: Configure Build and Exports (2 hours)
- [ ] Task 96: Move and Update Tests (3 hours)
- [ ] Task 97: Documentation and Examples (2 hours)
- [ ] Task 98: Publish task-core to npm (1 hour)
- [ ] Task 99: Update task-mcp Dependencies (2 hours)
- [ ] Task 100: Update task-mcp Imports (3 hours)
- [ ] Task 101: Update task-mcp Tests (2 hours)
- [ ] Task 102: Update task-mcp Build Config (1 hour)
- [ ] Task 103: Publish task-mcp v1.0.0 (1 hour)
- [ ] Task 104: Integration Testing (3 hours)

**Total**: 26 hours estimated
