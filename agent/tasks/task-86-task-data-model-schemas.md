# Task 86: Task Data Model and Schemas

**Milestone**: Milestone 1 - Task Infrastructure
**Estimated Time**: 8 hours
**Dependencies**: None
**Status**: Not Started

---

## Objective

Create Firestore data model, TypeScript interfaces, and Zod schemas for the task execution system. This includes Task documents, TaskMessage subcollections, and Firestore security rules.

## Steps

### 1. Create Task Schema

Create `src/schemas/task.ts` with Zod schemas for:
- Task document
- Milestone
- TaskItem
- TaskMessage
- Progress tracking structures

### 2. Create TypeScript Interfaces

Export TypeScript types from Zod schemas:
- `Task`
- `Milestone`
- `TaskItem`
- `TaskMessage`
- `TaskProgress`
- `TaskExecution`
- `TaskConfig`

### 3. Update Firestore Security Rules

Add security rules to `firestore.rules`:
- Users can only access their own tasks
- Tasks are scoped to `users/{userId}/tasks/{taskId}`
- Messages are scoped to `users/{userId}/tasks/{taskId}/messages/{messageId}`
- Validate task structure on write

### 4. Create Collection Constants

Update `src/constant/collections.ts`:
- Add `getUserTasks(userId)` helper
- Add `getUserTaskMessages(userId, taskId)` helper

## Verification

- [ ] Schemas compile without errors
- [ ] All required fields are present
- [ ] Optional fields are properly typed
- [ ] Firestore rules pass security tests
- [ ] Collection helpers return correct paths
- [ ] Zod validation works for valid data
- [ ] Zod validation rejects invalid data

## Example Schema Structure

```typescript
// src/schemas/task.ts
import { z } from 'zod'

export const MilestoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  progress: z.number().min(0).max(100),
  tasks_completed: z.number(),
  tasks_total: z.number(),
  started: z.string().optional(),
  completed: z.string().optional()
})

export const TaskItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  estimated_hours: z.number().optional(),
  completed_date: z.string().optional(),
  notes: z.string().optional()
})

export const TaskSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(['not_started', 'in_progress', 'paused', 'completed', 'failed']),
  created_at: z.string(),
  updated_at: z.string(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  
  progress: z.object({
    current_milestone: z.string(),
    current_task: z.string(),
    overall_percentage: z.number().min(0).max(100),
    milestones: z.array(MilestoneSchema),
    tasks: z.record(z.array(TaskItemSchema))
  }),
  
  execution: z.object({
    api_messages: z.array(z.any()),
    task_messages: z.array(z.any()),
    tool_results: z.array(z.any()),
    error: z.string().optional(),
    abort_reason: z.string().optional()
  }),
  
  config: z.object({
    model: z.string(),
    system_prompt: z.string(),
    auto_approve: z.boolean(),
    max_iterations: z.number().optional(),
    timeout_minutes: z.number().optional()
  }),
  
  metadata: z.object({
    conversation_id: z.string().optional(),
    parent_task_id: z.string().optional(),
    tags: z.array(z.string()).optional()
  }).optional()
})

export type Task = z.infer<typeof TaskSchema>
export type Milestone = z.infer<typeof MilestoneSchema>
export type TaskItem = z.infer<typeof TaskItemSchema>
```

## Files to Create

- `src/schemas/task.ts`
- Update `firestore.rules`
- Update `src/constant/collections.ts`

---

**Next Task**: [Task 87: Task Database Service](task-87-task-database-service.md)
