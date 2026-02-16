# task-mcp SDK Requirements for agentbase.me Integration

**Concept**: Requirements for task-mcp to export TypeScript types and REST API SDK for consumption by agentbase.me
**Created**: 2026-02-16
**Status**: Design Specification
**Audience**: task-mcp development team

---

## Overview

For agentbase.me to integrate with task-mcp without duplicating code, task-mcp must export:
1. **TypeScript types** - Shared type definitions for tasks, milestones, and task items
2. **REST API SDK** - Client library for calling task-mcp REST endpoints
3. **MCP tools** - Already implemented for agent use

This document specifies what agentbase.me expects from the task-mcp npm package.

---

## Package Structure

```
task-mcp/
├── package.json
├── src/
│   ├── index.ts                    # Main exports
│   ├── types/                      # TypeScript types (exported)
│   │   ├── index.ts
│   │   ├── task.ts
│   │   ├── milestone.ts
│   │   └── task-item.ts
│   │
│   ├── sdk/                        # REST API SDK (exported)
│   │   ├── index.ts
│   │   ├── client.ts
│   │   ├── tasks.ts
│   │   ├── milestones.ts
│   │   └── progress.ts
│   │
│   ├── tools/                      # MCP tools (not exported)
│   │   └── ...
│   │
│   └── server/                     # MCP server (not exported)
│       └── ...
│
└── dist/                           # Built package
    ├── index.js
    ├── index.d.ts
    ├── types/
    └── sdk/
```

---

## 1. TypeScript Types Export

### What to Export

Export all TypeScript types from Zod schemas:

```typescript
// task-mcp/src/types/index.ts
export * from './task'
export * from './milestone'
export * from './task-item'

// task-mcp/src/types/task.ts
import { z } from 'zod'

// Zod schemas
export const TaskStatusSchema = z.enum([
  'not_started',
  'in_progress',
  'paused',
  'completed',
  'failed'
])

export const TaskSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(5000),
  status: TaskStatusSchema,
  created_at: z.string(),
  updated_at: z.string(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  progress: TaskProgressSchema,
  execution: TaskExecutionSchema,
  config: TaskConfigSchema,
  metadata: TaskMetadataSchema
})

// TypeScript types
export type TaskStatus = z.infer<typeof TaskStatusSchema>
export type Task = z.infer<typeof TaskSchema>
export type TaskProgress = z.infer<typeof TaskProgressSchema>
export type TaskExecution = z.infer<typeof TaskExecutionSchema>
export type TaskConfig = z.infer<typeof TaskConfigSchema>
export type TaskMetadata = z.infer<typeof TaskMetadataSchema>

// Helper functions
export function createTaskTemplate(
  userId: string,
  title: string,
  description: string,
  config?: Partial<TaskConfig>
): Omit<Task, 'id'>

export function validateTask(data: unknown): 
  | { success: true; data: Task }
  | { success: false; error: z.ZodError }
```

### Usage in agentbase.me

```typescript
// In agentbase.me
import { Task, Milestone, TaskItem, createTaskTemplate } from 'task-mcp'

// Use types
const task: Task = {
  id: 'task_123',
  user_id: 'user_456',
  // ...
}

// Use helpers
const template = createTaskTemplate('user_456', 'My Task', 'Description')
```

---

## 2. REST API SDK Export

### SDK Client Interface

```typescript
// task-mcp/src/sdk/client.ts
export interface TaskMCPClientConfig {
  endpoint: string          // https://task-mcp.agentbase.me
  serviceToken: string      // Authentication token
  timeout?: number          // Request timeout (default: 30000ms)
}

export class TaskMCPClient {
  constructor(config: TaskMCPClientConfig)
  
  // Task operations
  tasks: TasksAPI
  
  // Milestone operations
  milestones: MilestonesAPI
  
  // Progress operations
  progress: ProgressAPI
}
```

### Tasks API

```typescript
// task-mcp/src/sdk/tasks.ts
export interface TasksAPI {
  // List user's tasks
  list(userId: string, options?: {
    status?: TaskStatus
    limit?: number
    offset?: number
  }): Promise<Task[]>
  
  // Get single task
  get(userId: string, taskId: string): Promise<Task | null>
  
  // Create task
  create(userId: string, data: Omit<Task, 'id' | 'created_at' | 'updated_at'>): Promise<Task>
  
  // Update task
  update(userId: string, taskId: string, data: Partial<Task>): Promise<Task>
  
  // Delete task
  delete(userId: string, taskId: string): Promise<void>
  
  // Get task messages
  getMessages(userId: string, taskId: string, options?: {
    limit?: number
    startAfter?: string
  }): Promise<TaskMessage[]>
}
```

### Milestones API

```typescript
// task-mcp/src/sdk/milestones.ts
export interface MilestonesAPI {
  // List milestones for a task
  list(userId: string, taskId: string): Promise<Milestone[]>
  
  // Get single milestone
  get(userId: string, taskId: string, milestoneId: string): Promise<Milestone | null>
  
  // Create milestone
  create(userId: string, taskId: string, data: Omit<Milestone, 'id'>): Promise<Milestone>
  
  // Update milestone
  update(userId: string, taskId: string, milestoneId: string, data: Partial<Milestone>): Promise<Milestone>
  
  // Complete milestone
  complete(userId: string, taskId: string, milestoneId: string): Promise<Milestone>
}
```

### Progress API

```typescript
// task-mcp/src/sdk/progress.ts
export interface ProgressAPI {
  // Get task progress
  get(userId: string, taskId: string): Promise<TaskProgress>
  
  // Update progress
  update(userId: string, taskId: string, progress: Partial<TaskProgress>): Promise<TaskProgress>
  
  // Complete task item
  completeTaskItem(userId: string, taskId: string, milestoneId: string, taskItemId: string): Promise<void>
}
```

### Usage in agentbase.me

```typescript
// In agentbase.me
import { TaskMCPClient } from 'task-mcp/sdk'
import { MCPServerDatabaseService } from '@/services/mcp-server-database.service'

// Get credentials from MCP integrations service (not env vars)
const server = await MCPServerDatabaseService.getServerById('task-mcp')
if (!server) {
  throw new Error('task-mcp server not registered')
}

const client = new TaskMCPClient({
  endpoint: server.endpoint,
  serviceToken: server.service_token
})

// List tasks
const tasks = await client.tasks.list('user_123', {
  status: 'in_progress',
  limit: 10
})

// Create task
const newTask = await client.tasks.create('user_123', {
  title: 'My Task',
  description: 'Task description',
  status: 'not_started',
  // ...
})

// Get progress
const progress = await client.progress.get('user_123', 'task_456')
```

**Note**: Credentials retrieved from MCP integrations service (Firestore `mcp_servers` collection), following the same pattern as other MCP servers.

---

## 3. Package Configuration

### package.json

```json
{
  "name": "task-mcp",
  "version": "1.0.0",
  "description": "MCP server for autonomous task execution with SDK",
  "type": "module",
  "main": "dist/index.js",
  "types": "dist/index.d.ts",
  "exports": {
    ".": {
      "import": "./dist/index.js",
      "types": "./dist/index.d.ts"
    },
    "./types": {
      "import": "./dist/types/index.js",
      "types": "./dist/types/index.d.ts"
    },
    "./sdk": {
      "import": "./dist/sdk/index.js",
      "types": "./dist/sdk/index.d.ts"
    }
  },
  "files": [
    "dist"
  ],
  "scripts": {
    "build": "tsc",
    "prepublishOnly": "npm run build"
  },
  "dependencies": {
    "zod": "^4.3.6"
  },
  "peerDependencies": {
    "zod": "^4.0.0"
  }
}
```

### Main Export

```typescript
// task-mcp/src/index.ts
// Export types
export * from './types'

// Export SDK
export * from './sdk'

// Do NOT export server or tools (internal only)
```

---

## 4. REST API Endpoints (task-mcp Server)

The SDK calls these REST endpoints on the task-mcp server:

### Task Endpoints

```
GET    /api/tasks?user_id={userId}&status={status}&limit={limit}&offset={offset}
POST   /api/tasks
GET    /api/tasks/{taskId}?user_id={userId}
PATCH  /api/tasks/{taskId}?user_id={userId}
DELETE /api/tasks/{taskId}?user_id={userId}
GET    /api/tasks/{taskId}/messages?user_id={userId}&limit={limit}&startAfter={cursor}
```

### Milestone Endpoints

```
GET    /api/tasks/{taskId}/milestones?user_id={userId}
POST   /api/tasks/{taskId}/milestones?user_id={userId}
GET    /api/tasks/{taskId}/milestones/{milestoneId}?user_id={userId}
PATCH  /api/tasks/{taskId}/milestones/{milestoneId}?user_id={userId}
POST   /api/tasks/{taskId}/milestones/{milestoneId}/complete?user_id={userId}
```

### Progress Endpoints

```
GET    /api/tasks/{taskId}/progress?user_id={userId}
PATCH  /api/tasks/{taskId}/progress?user_id={userId}
POST   /api/tasks/{taskId}/progress/complete-item?user_id={userId}
```

### Authentication

All endpoints require authentication via service token:

```
Authorization: Bearer {serviceToken}
X-User-ID: {userId}
```

---

## 5. Error Handling

### SDK Error Types

```typescript
// task-mcp/src/sdk/errors.ts
export class TaskMCPError extends Error {
  constructor(
    message: string,
    public statusCode: number,
    public code: string
  ) {
    super(message)
    this.name = 'TaskMCPError'
  }
}

export class TaskNotFoundError extends TaskMCPError {
  constructor(taskId: string) {
    super(`Task not found: ${taskId}`, 404, 'TASK_NOT_FOUND')
  }
}

export class UnauthorizedError extends TaskMCPError {
  constructor() {
    super('Unauthorized', 401, 'UNAUTHORIZED')
  }
}

export class ValidationError extends TaskMCPError {
  constructor(message: string) {
    super(message, 400, 'VALIDATION_ERROR')
  }
}
```

### Usage in agentbase.me

```typescript
import { TaskMCPClient, TaskNotFoundError } from 'task-mcp/sdk'

try {
  const task = await client.tasks.get('user_123', 'task_456')
} catch (error) {
  if (error instanceof TaskNotFoundError) {
    // Handle not found
  } else {
    // Handle other errors
  }
}
```

---

## 6. Installation in agentbase.me

### Install Package

```bash
npm install task-mcp
```

### Configure Client

```typescript
// agentbase.me/src/lib/task-mcp-client.ts
import { TaskMCPClient } from 'task-mcp/sdk'

export const taskMCPClient = new TaskMCPClient({
  endpoint: process.env.TASK_MCP_ENDPOINT!,
  serviceToken: process.env.TASK_MCP_SERVICE_TOKEN!,
  timeout: 30000
})
```

### Use in Components

```typescript
// agentbase.me/src/components/TaskList.tsx
import { Task } from 'task-mcp'
import { taskMCPClient } from '@/lib/task-mcp-client'

export function TaskList({ userId }: { userId: string }) {
  const [tasks, setTasks] = useState<Task[]>([])
  
  useEffect(() => {
    taskMCPClient.tasks.list(userId, { status: 'in_progress' })
      .then(setTasks)
  }, [userId])
  
  return (
    <div>
      {tasks.map(task => (
        <TaskCard key={task.id} task={task} />
      ))}
    </div>
  )
}
```

---

## 7. Deliverables Checklist

For task-mcp to be consumable by agentbase.me:

- [ ] Export TypeScript types from Zod schemas
- [ ] Export helper functions (createTaskTemplate, validateTask, etc.)
- [ ] Implement TaskMCPClient class
- [ ] Implement TasksAPI with all methods
- [ ] Implement MilestonesAPI with all methods
- [ ] Implement ProgressAPI with all methods
- [ ] Implement error classes
- [ ] Create REST API endpoints on task-mcp server
- [ ] Add authentication middleware (service token + user_id)
- [ ] Build and publish npm package
- [ ] Generate TypeScript declaration files (.d.ts)
- [ ] Document SDK usage in README

---

## 8. Testing

### Unit Tests (task-mcp)

```typescript
// task-mcp/src/sdk/client.spec.ts
describe('TaskMCPClient', () => {
  it('should list tasks', async () => {
    const client = new TaskMCPClient({ endpoint, serviceToken })
    const tasks = await client.tasks.list('user_123')
    expect(tasks).toBeInstanceOf(Array)
  })
})
```

### Integration Tests (agentbase.me)

```typescript
// agentbase.me/src/lib/task-mcp-client.spec.ts
import { taskMCPClient } from './task-mcp-client'

describe('task-mcp integration', () => {
  it('should create and retrieve task', async () => {
    const created = await taskMCPClient.tasks.create('user_123', {
      title: 'Test Task',
      description: 'Test',
      // ...
    })
    
    const retrieved = await taskMCPClient.tasks.get('user_123', created.id)
    expect(retrieved).toEqual(created)
  })
})
```

---

## Summary

For agentbase.me to successfully integrate with task-mcp:

1. **task-mcp exports types** - No duplication of schemas
2. **task-mcp exports SDK** - Clean REST API client
3. **task-mcp provides REST endpoints** - SDK calls these
4. **agentbase.me imports and uses** - No direct Firestore access

This creates a clean separation:
- **task-mcp**: Data layer + MCP tools + REST API + SDK
- **agentbase.me**: UI layer + Agent orchestration + SDK consumer

---

**Status**: Design Specification
**Next Action**: Implement SDK in task-mcp
**Owner**: task-mcp development team
**Consumer**: agentbase.me
