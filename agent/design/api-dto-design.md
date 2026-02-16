# API DTO Design

**Concept**: Define Data Transfer Objects (DTOs) for REST API responses
**Created**: 2026-02-16
**Status**: Design Specification

---

## Overview

This document defines the API response DTOs for task-mcp REST API. These DTOs are based on the internal schemas but exclude internal fields and match the structure expected by agentbase.me.

## Problem Statement

Our internal schemas ([`src/schemas/task.ts`](../../src/schemas/task.ts)) contain fields that should not be exposed via REST API:

- `execution.api_messages` - Internal Anthropic API conversation
- `execution.tool_results` - Internal MCP tool execution details
- Other internal implementation details

We need separate DTOs for API responses that:
1. Exclude internal fields
2. Match agentbase.me's expected structure
3. Use updated field naming conventions
4. Provide clear TypeScript types for API consumers

## Solution

Create API response DTOs in `src/dto/task-api.dto.ts` that transform internal schemas into public API responses.

### DTO Structure

```typescript
// src/dto/task-api.dto.ts

/**
 * API Response DTOs
 * 
 * These DTOs define the structure of REST API responses.
 * They exclude internal fields and match agentbase.me expectations.
 */

// ============================================================================
// Status Enums
// ============================================================================

export type TaskStatus = 'not_started' | 'in_progress' | 'paused' | 'completed' | 'failed'
export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed'
export type TaskItemStatus = 'not_started' | 'in_progress' | 'completed'
export type MessageRole = 'user' | 'assistant' | 'system'

// ============================================================================
// Nested DTOs
// ============================================================================

export interface TaskItemApiResponse {
  id: string
  name: string
  description: string
  status: TaskItemStatus
  estimated_hours?: number
  completed_at?: string  // ISO 8601 timestamp
  notes?: string
}

export interface MilestoneApiResponse {
  id: string
  name: string
  description: string
  status: MilestoneStatus
  progress: number  // 0-100
  tasks_completed: number
  tasks_total: number
  started_at?: string  // ISO 8601 timestamp
  completed_at?: string  // ISO 8601 timestamp
}

export interface TaskProgressApiResponse {
  current_milestone: string
  current_task: string
  overall_percentage: number  // 0-100
  milestones: MilestoneApiResponse[]
  tasks: Record<string, TaskItemApiResponse[]>  // Keyed by milestone ID
}

export interface TaskConfigApiResponse {
  system_prompt: string
  auto_approve: boolean
  max_iterations?: number
}

export interface TaskMetadataApiResponse {
  conversation_id?: string
  parent_task_id?: string
  tags?: string[]
}

// ============================================================================
// Main Task DTO
// ============================================================================

export interface TaskApiResponse {
  id: string
  user_id: string
  title: string
  description: string
  status: TaskStatus
  created_at: string  // ISO 8601 timestamp
  updated_at: string  // ISO 8601 timestamp
  started_at?: string  // ISO 8601 timestamp
  completed_at?: string  // ISO 8601 timestamp
  
  progress: TaskProgressApiResponse
  config: TaskConfigApiResponse
  metadata?: TaskMetadataApiResponse
  
  // Note: execution field is EXCLUDED from API responses
  // Internal fields (api_messages, tool_results) are not exposed
}

// ============================================================================
// List Response DTO
// ============================================================================

export interface TaskListApiResponse {
  tasks: TaskApiResponse[]
  total: number
}

// ============================================================================
// Message DTO
// ============================================================================

export interface TaskMessageApiResponse {
  id: string
  task_id: string
  role: MessageRole
  content: string
  timestamp: string  // ISO 8601 timestamp
  metadata?: any
}

export interface TaskMessageListApiResponse {
  messages: TaskMessageApiResponse[]
  total: number
}
```

## Transformation Logic

### From Schema to DTO

```typescript
// src/dto/transformers.ts

import { Task, TaskMessage } from '../schemas/task.js'
import { TaskApiResponse, TaskMessageApiResponse } from './task-api.dto.js'

/**
 * Transform internal Task schema to API response DTO
 * Excludes internal execution details
 */
export function toTaskApiResponse(task: Task): TaskApiResponse {
  return {
    id: task.id,
    user_id: task.user_id,
    title: task.title,
    description: task.description,
    status: task.status,
    created_at: task.created_at,
    updated_at: task.updated_at,
    started_at: task.started_at,
    completed_at: task.completed_at,
    
    progress: {
      current_milestone: task.progress.current_milestone,
      current_task: task.progress.current_task,
      overall_percentage: task.progress.overall_percentage,
      milestones: task.progress.milestones.map(m => ({
        id: m.id,
        name: m.name,
        description: m.description,
        status: m.status,
        progress: m.progress,
        tasks_completed: m.tasks_completed,
        tasks_total: m.tasks_total,
        started_at: m.started_at,
        completed_at: m.completed_at
      })),
      tasks: task.progress.tasks
    },
    
    config: {
      system_prompt: task.config.system_prompt,
      auto_approve: task.config.auto_approve,
      max_iterations: task.config.max_iterations
    },
    
    metadata: task.metadata
    
    // execution field is intentionally excluded
  }
}

/**
 * Transform internal TaskMessage schema to API response DTO
 */
export function toTaskMessageApiResponse(message: TaskMessage): TaskMessageApiResponse {
  return {
    id: message.id,
    task_id: message.task_id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
    metadata: message.metadata
  }
}
```

## Field Mapping

### Included Fields

| Schema Field | DTO Field | Notes |
|--------------|-----------|-------|
| `id` | `id` | ✅ Included |
| `user_id` | `user_id` | ✅ Included |
| `title` | `title` | ✅ Included |
| `description` | `description` | ✅ Included |
| `status` | `status` | ✅ Included |
| `created_at` | `created_at` | ✅ Included |
| `updated_at` | `updated_at` | ✅ Included |
| `started_at` | `started_at` | ✅ Included |
| `completed_at` | `completed_at` | ✅ Included |
| `progress` | `progress` | ✅ Included (all subfields) |
| `config` | `config` | ✅ Included (all subfields) |
| `metadata` | `metadata` | ✅ Included (all subfields) |

### Excluded Fields

| Schema Field | Reason for Exclusion |
|--------------|---------------------|
| `execution.api_messages` | Internal Anthropic API conversation |
| `execution.task_messages` | Stored in separate messages collection |
| `execution.tool_results` | Internal MCP tool execution details |
| `execution.error` | Internal error details (may expose sensitive info) |
| `execution.abort_reason` | Internal abort details |

## Usage in REST API

### Example: GET /api/tasks/:taskId

```typescript
// REST API handler
import { TaskDatabaseService } from '../services/task-database.service.js'
import { toTaskApiResponse } from '../dto/transformers.js'

export async function getTask(req, res) {
  const { taskId } = req.params
  const userId = req.user.id  // From auth middleware
  
  const task = await TaskDatabaseService.getTask(userId, taskId)
  
  if (!task) {
    return res.status(404).json({ error: 'Task not found' })
  }
  
  // Transform to DTO before sending
  const dto = toTaskApiResponse(task)
  
  return res.json(dto)
}
```

### Example: GET /api/tasks

```typescript
export async function listTasks(req, res) {
  const userId = req.user.id
  const { status, limit = 10, offset = 0 } = req.query
  
  const tasks = await TaskDatabaseService.listTasks(userId, limit)
  
  // Transform all tasks to DTOs
  const dtos = tasks.map(toTaskApiResponse)
  
  return res.json({
    tasks: dtos,
    total: dtos.length
  })
}
```

## Compatibility with agentbase.me

The DTOs match the structure expected by agentbase.me's mock service:

**Reference**: [`/home/prmichaelsen/agentbase.me/src/services/task-mock.service.ts`](../../../agentbase.me/src/services/task-mock.service.ts)

### Key Differences from Mock Service

1. ✅ **Updated field names**: `completed_at` (not `completed_date`)
2. ✅ **Simplified config**: No `model` or `timeout_minutes` fields
3. ✅ **Excluded execution**: Internal fields not exposed

### Migration Path for agentbase.me

When agentbase.me switches from mock service to real task-mcp client:

```typescript
// Before (mock service)
import { TaskMockService } from './services/task-mock.service'
const tasks = await TaskMockService.getTasks()

// After (real client)
import { TaskMCPClient } from 'task-mcp/client'
const client = new TaskMCPClient({ apiUrl: 'https://task-mcp.example.com' })
const tasks = await client.getTasks()

// Response structure is identical!
```

## Benefits

1. **Security**: Internal implementation details not exposed
2. **Stability**: API contract separate from internal schema changes
3. **Clarity**: Clear TypeScript types for API consumers
4. **Compatibility**: Matches agentbase.me expectations
5. **Flexibility**: Can evolve internal schemas without breaking API

## Implementation Files

When implementing, create:

1. `src/dto/task-api.dto.ts` - DTO type definitions
2. `src/dto/transformers.ts` - Schema-to-DTO transformation functions
3. `src/dto/index.ts` - Export all DTOs

Update `package.json` exports:
```json
{
  "exports": {
    "./dto": {
      "types": "./dist/dto/index.d.ts",
      "import": "./dist/dto/index.js"
    }
  }
}
```

## Future Considerations

### Input DTOs (for write operations)

When implementing write operations, create input DTOs:

```typescript
export interface CreateTaskDto {
  title: string
  description: string
  config?: Partial<TaskConfigApiResponse>
  metadata?: TaskMetadataApiResponse
}

export interface UpdateTaskDto {
  title?: string
  description?: string
  status?: TaskStatus
  config?: Partial<TaskConfigApiResponse>
}
```

### Validation

Use Zod to validate DTOs:

```typescript
import { z } from 'zod'

export const CreateTaskDtoSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().min(1).max(2000),
  config: z.object({
    system_prompt: z.string().optional(),
    auto_approve: z.boolean().optional(),
    max_iterations: z.number().min(1).max(1000).optional()
  }).optional()
})
```

---

**Status**: Design Complete
**Recommendation**: Implement DTOs when building REST API (Task 90)
