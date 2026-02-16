# Task 88: Task Execution Engine

**Milestone**: Milestone 1 - Task Infrastructure
**Estimated Time**: 16 hours
**Dependencies**: Task 87 (Task Database Service)
**Status**: Not Started

---

## Objective

Create a simplified task execution engine adapted from Roo Code's Task class. This engine manages task lifecycle (start, pause, resume, stop), streams API responses, coordinates tool execution, and persists state to Firestore.

## Steps

### 1. Create TaskExecutor Class

Create `src/lib/task-execution/TaskExecutor.ts`:
- Initialize with task ID and user ID
- Load task state from Firestore
- Manage execution lifecycle
- Stream API responses from Bedrock
- Coordinate tool execution
- Emit events for UI updates

### 2. Create TaskLifecycle Manager

Create `src/lib/task-execution/TaskLifecycle.ts`:
- Handle start/pause/resume/stop transitions
- Validate state transitions
- Update task status in Firestore
- Emit lifecycle events

### 3. Create TaskPersistence Layer

Create `src/lib/task-execution/TaskPersistence.ts`:
- Save API messages to Firestore
- Save task messages to Firestore
- Save tool results to Firestore
- Load execution state from Firestore
- Implement checkpoint/resume logic

### 4. Integrate with Bedrock Chat

Adapt existing Bedrock chat integration:
- Use `streamChatResponse` from `src/lib/chat/bedrock.ts`
- Pass task-specific tools
- Handle tool execution results
- Stream responses to task thread

### 5. Implement Event System

Create event emitter for:
- `task:started`
- `task:paused`
- `task:resumed`
- `task:stopped`
- `task:completed`
- `task:error`
- `task:progress_update`
- `task:message`

### 6. Write Tests

Create tests for:
- Task lifecycle transitions
- API streaming
- Tool execution
- State persistence
- Error handling
- Event emission

## Verification

- [ ] Can start task execution
- [ ] Can pause task execution
- [ ] Can resume task execution
- [ ] Can stop task execution
- [ ] API responses stream correctly
- [ ] Tools execute correctly
- [ ] State persists to Firestore
- [ ] Events emit correctly
- [ ] Errors handled gracefully
- [ ] Tests pass

## Example TaskExecutor Structure

```typescript
// src/lib/task-execution/TaskExecutor.ts
import { EventEmitter } from 'events'
import { TaskDatabaseService } from '@/services/task-database.service'
import { streamChatResponse } from '@/lib/chat/bedrock'
import { createBedrockClient } from '@/lib/chat/bedrock'
import type { Task } from '@/schemas/task'

export class TaskExecutor extends EventEmitter {
  private taskId: string
  private userId: string
  private task: Task | null = null
  private isRunning = false
  private isPaused = false
  private abortController: AbortController | null = null
  
  constructor(taskId: string, userId: string) {
    super()
    this.taskId = taskId
    this.userId = userId
  }
  
  /**
   * Start task execution
   */
  async start(): Promise<void> {
    // Load task from Firestore
    this.task = await TaskDatabaseService.getTask(this.userId, this.taskId)
    if (!this.task) {
      throw new Error('Task not found')
    }
    
    // Update status
    await TaskDatabaseService.updateTaskStatus(this.userId, this.taskId, 'in_progress')
    this.task.status = 'in_progress'
    
    // Emit event
    this.emit('task:started', { taskId: this.taskId })
    
    // Start execution loop
    this.isRunning = true
    await this.executionLoop()
  }
  
  /**
   * Pause task execution
   */
  async pause(): Promise<void> {
    this.isPaused = true
    this.abortController?.abort()
    
    await TaskDatabaseService.updateTaskStatus(this.userId, this.taskId, 'paused')
    this.emit('task:paused', { taskId: this.taskId })
  }
  
  /**
   * Resume task execution
   */
  async resume(): Promise<void> {
    this.isPaused = false
    await TaskDatabaseService.updateTaskStatus(this.userId, this.taskId, 'in_progress')
    this.emit('task:resumed', { taskId: this.taskId })
    
    await this.executionLoop()
  }
  
  /**
   * Stop task execution
   */
  async stop(): Promise<void> {
    this.isRunning = false
    this.abortController?.abort()
    
    await TaskDatabaseService.updateTaskStatus(this.userId, this.taskId, 'paused')
    this.emit('task:stopped', { taskId: this.taskId })
  }
  
  /**
   * Main execution loop
   */
  private async executionLoop(): Promise<void> {
    while (this.isRunning && !this.isPaused) {
      try {
        // Get current milestone and task
        const currentMilestone = this.getCurrentMilestone()
        const currentTask = this.getCurrentTask()
        
        if (!currentTask) {
          // All tasks complete
          await this.complete()
          break
        }
        
        // Execute task
        await this.executeTask(currentTask)
        
        // Update progress
        await this.updateProgress()
        
      } catch (error) {
        await this.handleError(error)
        break
      }
    }
  }
  
  /**
   * Execute a single task
   */
  private async executeTask(taskItem: any): Promise<void> {
    // Create Bedrock client
    const bedrock = createBedrockClient()
    
    // Prepare messages
    const messages = this.prepareMessages()
    
    // Prepare tools
    const tools = this.prepareTools()
    
    // Stream response
    this.abortController = new AbortController()
    
    const result = await streamChatResponse(
      bedrock,
      messages,
      tools,
      {
        maxTokens: 4096,
        temperature: 0.7,
        systemPrompt: this.task!.config.system_prompt
      },
      (chunk) => {
        // Emit chunk event
        this.emit('task:message', {
          taskId: this.taskId,
          role: 'assistant',
          content: chunk,
          streaming: true
        })
      },
      (toolCall) => {
        // Handle tool call
        this.emit('task:tool_call', {
          taskId: this.taskId,
          toolCall
        })
      }
    )
    
    // Save result
    await this.saveResult(result)
  }
  
  /**
   * Complete task
   */
  private async complete(): Promise<void> {
    await TaskDatabaseService.updateTaskStatus(this.userId, this.taskId, 'completed')
    this.isRunning = false
    this.emit('task:completed', { taskId: this.taskId })
  }
  
  /**
   * Handle error
   */
  private async handleError(error: any): Promise<void> {
    await TaskDatabaseService.updateTaskStatus(this.userId, this.taskId, 'failed')
    this.isRunning = false
    this.emit('task:error', {
      taskId: this.taskId,
      error: error instanceof Error ? error.message : String(error)
    })
  }
  
  // ... more methods
}
```

## Files to Create

- `src/lib/task-execution/TaskExecutor.ts`
- `src/lib/task-execution/TaskLifecycle.ts`
- `src/lib/task-execution/TaskPersistence.ts`
- `src/lib/task-execution/__tests__/TaskExecutor.spec.ts`
- `src/lib/task-execution/__tests__/TaskLifecycle.spec.ts`
- `src/lib/task-execution/__tests__/TaskPersistence.spec.ts`

---

**Next Task**: [Task 89: Task API Endpoints](task-89-task-api-endpoints.md)
