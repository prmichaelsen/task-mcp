# Task 87: Task Database Service

**Milestone**: Milestone 1 - Task Infrastructure
**Estimated Time**: 12 hours
**Dependencies**: Task 86 (Task Data Model and Schemas)
**Status**: Not Started

---

## Objective

Create a database service for task CRUD operations, task message operations, and progress tracking. This service will handle all Firestore interactions for tasks.

## Steps

### 1. Create TaskDatabaseService Class

Create `src/services/task-database.service.ts` with methods for:
- Creating tasks
- Reading tasks
- Updating tasks
- Deleting tasks
- Listing user tasks

### 2. Implement Task Message Operations

Add methods for:
- Adding messages to task
- Getting task messages
- Updating message
- Deleting message

### 3. Implement Progress Operations

Add methods for:
- Updating overall progress
- Creating milestone
- Updating milestone
- Completing milestone
- Creating task item
- Updating task item
- Completing task item

### 4. Add Query Methods

Add methods for:
- Get tasks by status
- Get active tasks
- Get completed tasks
- Search tasks by title

### 5. Write Unit Tests

Create `src/services/__tests__/task-database.service.spec.ts`:
- Test CRUD operations with mocked Firestore
- Test progress operations
- Test query methods
- Test error handling

### 6. Write E2E Tests

Create `src/services/__tests__/task-database.service.e2e.ts`:
- Test with real Firestore emulator
- Test concurrent operations
- Test transaction handling

## Verification

- [ ] All CRUD operations work
- [ ] Task messages can be added/retrieved
- [ ] Progress can be updated
- [ ] Milestones can be managed
- [ ] Task items can be managed
- [ ] Query methods return correct results
- [ ] User isolation is enforced
- [ ] Unit tests pass
- [ ] E2E tests pass
- [ ] Error handling works correctly

## Example Service Structure

```typescript
// src/services/task-database.service.ts
import { getDocument, setDocument, addDocument, queryDocuments } from '@prmichaelsen/firebase-admin-sdk-v8'
import { getUserTasks, getUserTaskMessages } from '@/constant/collections'
import { TaskSchema, type Task, type Milestone, type TaskItem } from '@/schemas/task'

export class TaskDatabaseService {
  /**
   * Create a new task
   */
  static async createTask(
    userId: string,
    title: string,
    description: string,
    config?: Partial<Task['config']>
  ): Promise<Task> {
    const now = new Date().toISOString()
    
    const task: Omit<Task, 'id'> = {
      user_id: userId,
      title,
      description,
      status: 'not_started',
      created_at: now,
      updated_at: now,
      progress: {
        current_milestone: '',
        current_task: '',
        overall_percentage: 0,
        milestones: [],
        tasks: {}
      },
      execution: {
        api_messages: [],
        task_messages: [],
        tool_results: []
      },
      config: {
        model: config?.model || 'us.anthropic.claude-sonnet-4-5-20250929-v1:0',
        system_prompt: config?.system_prompt || '',
        auto_approve: config?.auto_approve ?? true,
        max_iterations: config?.max_iterations || 100,
        timeout_minutes: config?.timeout_minutes || 120
      }
    }
    
    const tasksPath = getUserTasks(userId)
    const docRef = await addDocument(tasksPath, task)
    
    return {
      id: docRef.id,
      ...task
    }
  }
  
  /**
   * Get a task by ID
   */
  static async getTask(userId: string, taskId: string): Promise<Task | null> {
    const tasksPath = getUserTasks(userId)
    const doc = await getDocument(tasksPath, taskId)
    
    if (!doc) return null
    
    const result = TaskSchema.safeParse({ id: taskId, ...doc })
    return result.success ? result.data : null
  }
  
  /**
   * Update task status
   */
  static async updateTaskStatus(
    userId: string,
    taskId: string,
    status: Task['status']
  ): Promise<void> {
    const tasksPath = getUserTasks(userId)
    await setDocument(tasksPath, taskId, {
      status,
      updated_at: new Date().toISOString()
    }, { merge: true })
  }
  
  /**
   * Create a milestone
   */
  static async createMilestone(
    userId: string,
    taskId: string,
    milestone: Milestone
  ): Promise<void> {
    const task = await this.getTask(userId, taskId)
    if (!task) throw new Error('Task not found')
    
    task.progress.milestones.push(milestone)
    
    const tasksPath = getUserTasks(userId)
    await setDocument(tasksPath, taskId, {
      progress: task.progress,
      updated_at: new Date().toISOString()
    }, { merge: true })
  }
  
  /**
   * Add message to task
   */
  static async addMessage(
    userId: string,
    taskId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: any
  ): Promise<string> {
    const messagesPath = getUserTaskMessages(userId, taskId)
    const message = {
      task_id: taskId,
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata
    }
    
    const docRef = await addDocument(messagesPath, message)
    return docRef.id
  }
  
  // ... more methods
}
```

## Files to Create

- `src/services/task-database.service.ts`
- `src/services/__tests__/task-database.service.spec.ts`
- `src/services/__tests__/task-database.service.e2e.ts`

---

**Next Task**: [Task 88: Task Execution Engine](task-88-task-execution-engine.md)
