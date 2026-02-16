# REST API Integration Design

**Concept**: Expose task-mcp business logic via REST endpoints alongside MCP tools
**Created**: 2026-02-16
**Status**: Design Specification

---

## Overview

This document specifies how task-mcp exposes REST API endpoints alongside MCP tools, following industry best practices for dual-interface architecture. The REST API provides HTTP access to the same business logic used by MCP tools, enabling both AI agents (via MCP) and web UIs (via REST) to interact with the task management system.

**Core Principle**: Share business logic between MCP tools and REST endpoints. Don't duplicate code or create 1:1 mappings.

---

## Architecture Pattern

### Dual Interface Architecture

```
┌─────────────────────────────────────────────────────┐
│                  agentbase.me                       │
│                                                     │
│  ┌──────────────┐         ┌──────────────┐        │
│  │   Web UI     │         │  AI Agent    │        │
│  └──────┬───────┘         └──────┬───────┘        │
│         │                        │                 │
│         ▼                        ▼                 │
│  ┌──────────────┐         ┌──────────────┐        │
│  │  REST API    │         │  MCP Client  │        │
│  └──────┬───────┘         └──────┬───────┘        │
│         │                        │                 │
│         │                        │ MCP Protocol    │
└─────────┼────────────────────────┼─────────────────┘
          │                        │
          │ HTTP                   │
          │                        ▼
          │                 ┌──────────────┐
          │                 │  MCP Server  │
          │                 │  (task-mcp)  │
          │                 └──────┬───────┘
          │                        │
          │                        ▼
          │                 ┌──────────────┐
          │                 │  MCP Tools   │
          │                 └──────┬───────┘
          │                        │
          ▼                        ▼
    ┌─────────────────────────────────┐
    │      Shared Business Logic      │
    │  ┌────────────────────────────┐ │
    │  │    FirebaseClient          │ │
    │  │    TaskDatabaseService     │ │
    │  └────────────────────────────┘ │
    └─────────────────────────────────┘
                   │
                   ▼
            ┌──────────────┐
            │   Firestore  │
            └──────────────┘
```

### Key Design Decisions

1. **Shared Business Logic**: Both MCP tools and REST endpoints use the same `FirebaseClient` and `TaskDatabaseService`
2. **Separate Concerns**: MCP tools designed for agent workflows, REST endpoints designed for UI operations
3. **User-Scoped**: All operations (MCP and REST) are scoped to `userId` for multi-tenancy
4. **No 1:1 Mapping**: REST endpoints are NOT 1:1 mappings of MCP tools

---

## REST API Endpoints

### Task Management

**Base Path**: `/api/tasks`

#### 1. List Tasks
```
GET /api/tasks
Query Parameters:
  - status?: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'failed'
  - limit?: number (default: 50)
  - search?: string

Response: Task[]
```

#### 2. Get Task
```
GET /api/tasks/:taskId

Response: Task
```

#### 3. Create Task
```
POST /api/tasks
Body: {
  title: string
  description: string
  config?: Partial<TaskConfig>
  metadata?: TaskMetadata
}

Response: Task
```

#### 4. Update Task Status
```
PATCH /api/tasks/:taskId/status
Body: {
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'failed'
}

Response: { success: boolean }
```

#### 5. Delete Task
```
DELETE /api/tasks/:taskId

Response: { success: boolean }
```

### Progress Management

#### 6. Update Progress
```
PATCH /api/tasks/:taskId/progress
Body: {
  percentage: number
}

Response: { success: boolean, progress: number }
```

#### 7. Get Task Messages
```
GET /api/tasks/:taskId/messages
Query Parameters:
  - limit?: number (default: 100)

Response: TaskMessage[]
```

#### 8. Add Message
```
POST /api/tasks/:taskId/messages
Body: {
  role: 'user' | 'assistant' | 'system'
  content: string
  metadata?: any
}

Response: { message_id: string }
```

### Milestone Management

#### 9. Create Milestone
```
POST /api/tasks/:taskId/milestones
Body: {
  milestone_id: string
  name: string
  description: string
}

Response: { success: boolean, milestone: Milestone }
```

#### 10. Update Milestone
```
PATCH /api/tasks/:taskId/milestones/:milestoneId
Body: Partial<Milestone>

Response: { success: boolean }
```

### Task Item Management

#### 11. Create Task Item
```
POST /api/tasks/:taskId/milestones/:milestoneId/items
Body: {
  task_item_id: string
  name: string
  description: string
  estimated_hours?: number
}

Response: { success: boolean, task_item: TaskItem }
```

#### 12. Complete Task Item
```
POST /api/tasks/:taskId/milestones/:milestoneId/items/:taskItemId/complete

Response: {
  success: boolean
  milestone_progress: number
  next_task: TaskItem | null
}
```

---

## Implementation Example

### REST API Handler (agentbase.me)

**Option 1: Using TaskDatabaseService (Recommended for REST API)**
```typescript
// In agentbase.me/src/routes/api/tasks/$taskId/index.tsx
import { TaskDatabaseService } from 'task-mcp'
import { getAuth } from '@/lib/auth/server-fn'

export const Route = createAPIFileRoute('/api/tasks/$taskId')({
  GET: async ({ request, params }) => {
    try {
      // Get authenticated user
      const auth = await getAuth(request)
      if (!auth) {
        return new Response(JSON.stringify({ error: 'Unauthorized' }), {
          status: 401,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      // Use TaskDatabaseService directly (simpler for REST)
      const task = await TaskDatabaseService.getTask(auth.uid, params.taskId)
      
      if (!task) {
        return new Response(JSON.stringify({ error: 'Task not found' }), {
          status: 404,
          headers: { 'Content-Type': 'application/json' }
        })
      }
      
      return new Response(JSON.stringify({ task }), {
        status: 200,
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      return new Response(JSON.stringify({
        error: 'Internal server error',
        message: error instanceof Error ? error.message : 'Unknown error'
      }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
})
```

**Option 2: Using FirebaseClient (For Connection Management)**
```typescript
// In agentbase.me - Alternative approach with client wrapper
import { FirebaseClient } from 'task-mcp'
import { getAuth } from '@/lib/auth/server-fn'

export const Route = createAPIFileRoute('/api/tasks/$taskId')({
  GET: async ({ request, params }) => {
    const auth = await getAuth(request)
    if (!auth) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { status: 401 })
    }
    
    // Create client instance (manages connection)
    const client = new FirebaseClient({
      userId: auth.uid,
      serviceAccountPath: process.env.FIREBASE_SERVICE_ACCOUNT_PATH
    })
    
    const task = await client.getTask(params.taskId)
    
    return new Response(JSON.stringify({ task }), { status: 200 })
  }
})
```

**Recommendation**: Use **TaskDatabaseService** directly in REST API handlers (Option 1) as it's simpler and matches agentbase.me's existing task documentation (Task 89).

### MCP Tool Handler (task-mcp)

```typescript
// In task-mcp/src/tools/task-get-status.ts
import { FirebaseClient } from '@/client.js'

export async function handleTaskGetStatus(
  client: FirebaseClient,
  args: { task_id: string }
): Promise<string> {
  // Uses same FirebaseClient as REST API
  const task = await client.getTask(args.task_id)
  
  if (!task) {
    throw new Error(`Task not found: ${args.task_id}`)
  }
  
  // Returns instructions for agent (different from REST)
  return JSON.stringify({
    task_title: task.title,
    status: task.status,
    current_milestone: /* ... */,
    instructions: /* ... */
  }, null, 2)
}
```

---

## Key Differences: MCP Tools vs REST Endpoints

### MCP Tools (Agent-Centric)
- **Purpose**: Provide instructions and guidance for AI agents
- **Response**: JSON with instructions, context, and next steps
- **Example**: `task_get_next_step` returns "Continue work on: Task 1\n\nDescription: ..."
- **Workflow**: Designed around agent decision-making

### REST Endpoints (UI-Centric)
- **Purpose**: Provide data for web UI rendering
- **Response**: JSON with raw data
- **Example**: `GET /api/tasks/:id` returns complete Task object
- **Workflow**: Designed around CRUD operations

---

## Authentication & Authorization

### REST API
```typescript
// In agentbase.me
import { auth } from '@/lib/firebase-auth'

export async function GET(request: NextRequest) {
  // Verify Firebase Auth token
  const token = request.headers.get('Authorization')?.replace('Bearer ', '')
  const decodedToken = await auth.verifyIdToken(token)
  const userId = decodedToken.uid
  
  // Use userId for scoped operations
  const client = new FirebaseClient({ userId })
  // ...
}
```

### MCP Server
```typescript
// In task-mcp
export function createServer(userId: string, options: ServerOptions) {
  // userId passed from MCP client (agentbase.me)
  const client = new FirebaseClient({ userId })
  // All operations scoped to this user
}
```

---

## Security Considerations

### Shared Security Model
1. **User Isolation**: Both MCP and REST enforce user-scoped operations
2. **Firestore Rules**: Security rules apply to both access paths
3. **Service Account**: Same service account used by both
4. **Rate Limiting**: Apply to both MCP and REST endpoints

### REST-Specific Security
```typescript
// Rate limiting
import { rateLimit } from '@/lib/rate-limit'

export async function POST(request: NextRequest) {
  const userId = await getUserIdFromRequest(request)
  
  // Rate limit per user
  const { success } = await rateLimit.check(userId, 'tasks:create')
  if (!success) {
    return NextResponse.json(
      { error: 'Rate limit exceeded' },
      { status: 429 }
    )
  }
  
  // ... proceed with request
}
```

---

## Benefits of Dual Interface

1. **Code Reuse**: Single business logic layer for both interfaces
2. **Consistency**: Same data model and validation for MCP and REST
3. **Flexibility**: UI can use REST, agents can use MCP
4. **Maintainability**: Changes to business logic affect both interfaces
5. **Testing**: Test business logic once, works for both interfaces

---

## Anti-Patterns to Avoid

### ❌ 1:1 REST-to-MCP Mapping
```typescript
// WRONG - Just wrapping REST endpoints as MCP tools
export const taskGetTool = {
  name: 'task_get',
  // ...
}
// This is just GET /api/tasks/:id as an MCP tool
```

### ❌ Calling MCP Tools from REST
```typescript
// WRONG - Bypassing MCP protocol
import { handleTaskGetStatus } from 'task-mcp/tools'

app.get('/api/tasks/:id/status', async (req, res) => {
  const result = await handleTaskGetStatus(client, { task_id: req.params.id })
  res.json(JSON.parse(result))
})
```

### ✅ Correct Approach
```typescript
// CORRECT - Sharing business logic
import { FirebaseClient } from 'task-mcp'

app.get('/api/tasks/:id', async (req, res) => {
  const client = new FirebaseClient({ userId: req.user.id })
  const task = await client.getTask(req.params.id) // Shared logic
  res.json(task)
})
```

---

## Implementation Phases

### Phase 1: MCP Server (Current)
- ✅ FirebaseClient and TaskDatabaseService
- ✅ 8 MCP tools for agent workflows
- 📋 MCP server with stdio transport

### Phase 2: REST API (agentbase.me)
- 📋 REST endpoints using FirebaseClient
- 📋 Authentication middleware
- 📋 Rate limiting
- 📋 OpenAPI documentation

### Phase 3: Integration
- 📋 Deploy both MCP server and REST API
- 📋 Test dual interface
- 📋 Monitor performance

---

## Success Criteria

- [ ] REST endpoints use FirebaseClient (shared logic)
- [ ] No code duplication between MCP and REST
- [ ] User isolation enforced in both interfaces
- [ ] REST endpoints documented with OpenAPI
- [ ] Integration tests for both interfaces
- [ ] Performance metrics for both paths

---

**Status**: Design Specification
**Next Action**: Implement REST endpoints in agentbase.me after MCP server is complete
**Owner**: Development Team
**Created**: 2026-02-16
