# Milestone 2: MCP Server Foundation

**Goal**: Create task-mcp server with core task management tools
**Duration**: 2 weeks
**Dependencies**: None (can start immediately)
**Status**: Not Started

---

## Overview

This milestone creates the `task-mcp` MCP server project following the [MCP Server Bootstrap Pattern](https://github.com/prmichaelsen/remember-mcp/blob/main/agent/patterns/bootstrap.md). The server exposes task management tools via MCP protocol and uses Firebase Admin SDK for direct Firestore access.

## Deliverables

1. **task-mcp Project Structure**
   - Initialize Node.js project with TypeScript
   - Set up esbuild for bundling
   - Configure tsconfig.json for ESM
   - Set up testing infrastructure (Jest)
   - Create directory structure per bootstrap pattern

2. **Firebase Admin SDK Client**
   - Wrapper class for Firestore operations
   - Service account authentication
   - User-scoped data access
   - Connection management
   - Error handling

3. **Core Task Management Tools** (8 tools)
   - `task_get_status` - Get current status
   - `task_update_progress` - Update progress
   - `task_pause` - Pause execution
   - `task_resume` - Resume execution
   - `task_create_milestone` - Create milestone
   - `task_create_task` - Create task item
   - `task_complete_task` - Mark task complete
   - `task_complete_milestone` - Mark milestone complete

4. **MCP Server Implementation**
   - Server class with stdio transport
   - Server factory for multi-tenant
   - Tool registration
   - Request handling
   - Error handling

5. **Testing**
   - Unit tests for each tool
   - E2E tests with Firestore emulator
   - Integration tests for MCP protocol
   - Test coverage > 80%

6. **Deployment Configuration**
   - Dockerfile for Cloud Run
   - Cloud Run deployment config
   - Service account setup
   - Environment variables

## Success Criteria

- [ ] task-mcp project builds successfully
- [ ] All 8 core tools implemented
- [ ] MCP server starts with stdio transport
- [ ] Tools can be called via MCP protocol
- [ ] Firebase operations work correctly
- [ ] User isolation enforced
- [ ] Unit tests pass (>80% coverage)
- [ ] E2E tests pass
- [ ] Can deploy to Cloud Run
- [ ] Service account has minimal permissions

## Key Files to Create

```
task-mcp/
├── src/
│   ├── index.ts                      # CLI entry (stdio)
│   ├── server.ts                     # Standalone server
│   ├── server.ts.spec.ts             # Server tests
│   ├── server-factory.ts             # Multi-tenant factory
│   ├── server-factory.spec.ts        # Factory tests
│   ├── client.ts                     # Firebase client
│   ├── client.spec.ts                # Client tests
│   ├── types.ts                      # Shared types
│   │
│   ├── tools/
│   │   ├── index.ts
│   │   ├── task-get-status.ts
│   │   ├── task-get-status.spec.ts
│   │   ├── task-update-progress.ts
│   │   ├── task-update-progress.spec.ts
│   │   ├── task-pause.ts
│   │   ├── task-pause.spec.ts
│   │   ├── task-resume.ts
│   │   ├── task-resume.spec.ts
│   │   ├── task-create-milestone.ts
│   │   ├── task-create-milestone.spec.ts
│   │   ├── task-create-task.ts
│   │   ├── task-create-task.spec.ts
│   │   ├── task-complete-task.ts
│   │   ├── task-complete-task.spec.ts
│   │   ├── task-complete-milestone.ts
│   │   └── task-complete-milestone.spec.ts
│   │
│   └── utils/
│       ├── logger.ts
│       ├── logger.spec.ts
│       ├── error-serializer.ts
│       └── error-serializer.spec.ts
│
├── agent/                            # ACP docs
│   ├── design/
│   ├── milestones/
│   ├── tasks/
│   └── progress.yaml
│
├── package.json
├── tsconfig.json
├── esbuild.build.js
├── esbuild.watch.js
├── jest.config.js
├── Dockerfile
├── .env.example
├── .gitignore
└── README.md
```

## Tool Implementation Pattern

Each tool follows the bootstrap pattern:

```typescript
// src/tools/task-get-status.ts
import { FirebaseClient } from '../client.js'

export const taskGetStatusTool = {
  name: 'task_get_status',
  description: 'Get current task status and progress',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID to get status for'
      }
    },
    required: ['task_id']
  }
}

export async function handleTaskGetStatus(
  client: FirebaseClient,
  args: { task_id: string }
): Promise<string> {
  try {
    const task = await client.getTask(args.task_id)
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`)
    }
    
    return JSON.stringify({
      task_title: task.title,
      status: task.status,
      current_milestone: task.progress.current_milestone,
      overall_progress: task.progress.overall_percentage
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to get status: ${error instanceof Error ? error.message : String(error)}`)
  }
}
```

## Technical Decisions

1. **Project Structure**: Follow MCP Bootstrap Pattern exactly
2. **Transport**: Start with stdio, add SSE in Phase 2
3. **Authentication**: Server factory with user_id parameter
4. **Database**: Firebase Admin SDK with service account
5. **Deployment**: Cloud Run for scalability

## Risks and Mitigation

**Risk**: Firebase Admin SDK complexity
- **Mitigation**: Create wrapper client class, comprehensive tests

**Risk**: MCP protocol learning curve
- **Mitigation**: Follow bootstrap pattern, reference remember-mcp

**Risk**: Service account security
- **Mitigation**: Minimal permissions, audit logging, secret management

## Dependencies

- Firebase project with Firestore
- Service account key
- Node.js 18+
- Google Cloud account (for Cloud Run)

## Next Milestone

[Milestone 3: agentbase.me Integration](milestone-3-agentbase-integration.md)

---

**Status**: Not Started
**Estimated Effort**: 80 hours
**Priority**: High
**Owner**: Development Team
