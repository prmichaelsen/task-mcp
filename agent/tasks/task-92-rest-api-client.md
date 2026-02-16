# Task 92: REST API Client

**Milestone**: Milestone 2 - MCP Server Foundation
**Estimated Time**: 6 hours
**Dependencies**: Task 89 (MCP Server Implementation), API DTOs
**Status**: Not Started

---

## Objective

Create a REST API client for agentbase.me to consume the task-mcp REST API. The client will handle authentication, request/response transformation, and provide a clean TypeScript interface for all REST endpoints.

## Steps

### 1. Create TaskApiClient Class

Create `src/api-client/task-api-client.ts`:
- Accept `baseUrl` and `serviceToken` in constructor
- Handle authentication headers
- Implement request/response interceptors
- Handle errors and retries
- Type-safe methods using DTOs

### 2. Implement Task Management Methods

```typescript
class TaskApiClient {
  // Task CRUD
  async getTasks(options?: GetTasksOptions): Promise<TaskListApiResponse>
  async getTask(taskId: string): Promise<TaskApiResponse>
  async createTask(data: CreateTaskDto): Promise<TaskApiResponse>
  async updateTask(taskId: string, data: UpdateTaskDto): Promise<TaskApiResponse>
  async deleteTask(taskId: string): Promise<void>
  
  // Task status
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void>
}
```

### 3. Implement Progress Management Methods

```typescript
class TaskApiClient {
  // Progress
  async updateProgress(taskId: string, data: UpdateProgressDto): Promise<void>
  
  // Milestones
  async createMilestone(taskId: string, data: CreateMilestoneDto): Promise<void>
  async updateMilestone(taskId: string, milestoneId: string, data: Partial<MilestoneApiResponse>): Promise<void>
  async completeMilestone(taskId: string, milestoneId: string): Promise<void>
  
  // Task Items
  async createTaskItem(taskId: string, milestoneId: string, data: CreateTaskItemDto): Promise<void>
  async updateTaskItem(taskId: string, milestoneId: string, taskItemId: string, data: Partial<TaskItemApiResponse>): Promise<void>
  async completeTaskItem(taskId: string, milestoneId: string, taskItemId: string): Promise<void>
}
```

### 4. Implement Message Methods

```typescript
class TaskApiClient {
  // Messages
  async getMessages(taskId: string, limit?: number): Promise<TaskMessageListApiResponse>
  async addMessage(taskId: string, data: CreateMessageDto): Promise<{ message_id: string }>
}
```

### 5. Add Error Handling

Create `src/api-client/errors.ts`:
- `TaskApiError` - Base error class
- `TaskNotFoundError` - 404 errors
- `UnauthorizedError` - 401 errors
- `ValidationError` - 400 errors
- `ServerError` - 500 errors

### 6. Add Request/Response Interceptors

- Automatic authentication header injection
- Request logging (optional)
- Response transformation
- Error transformation
- Retry logic for transient failures

### 7. Create Client Configuration

```typescript
interface TaskApiClientConfig {
  baseUrl: string
  serviceToken: string
  timeout?: number
  retries?: number
  logger?: Logger
}
```

### 8. Write Unit Tests

Create `src/api-client/task-api-client.spec.ts`:
- Test all methods with mocked fetch
- Test error handling
- Test authentication
- Test retry logic
- Test request/response transformation

### 9. Create Index Export

Create `src/api-client/index.ts`:
- Export `TaskApiClient`
- Export error classes
- Export configuration types

### 10. Update package.json Exports

Add new export:
```json
{
  "exports": {
    "./api-client": {
      "types": "./dist/api-client/index.d.ts",
      "import": "./dist/api-client/index.js"
    }
  }
}
```

## Verification

- [ ] TaskApiClient class created
- [ ] All task management methods implemented
- [ ] All progress management methods implemented
- [ ] All message methods implemented
- [ ] Error handling implemented
- [ ] Request/response interceptors working
- [ ] Unit tests written and passing
- [ ] TypeScript types are correct
- [ ] Package export added
- [ ] Can be imported from `@prmichaelsen/task-mcp/api-client`

## Example Usage

```typescript
// In agentbase.me
import { TaskApiClient } from '@prmichaelsen/task-mcp/api-client'
import type { CreateTaskDto } from '@prmichaelsen/task-mcp/dto'

// Initialize client
const client = new TaskApiClient({
  baseUrl: 'https://task-mcp-api.example.com',
  serviceToken: process.env.TASK_MCP_SERVICE_TOKEN!,
  timeout: 5000,
  retries: 3
})

// Create a task
const task = await client.createTask({
  title: 'Build new feature',
  description: 'Implement user authentication',
  config: {
    system_prompt: 'You are a helpful assistant',
    auto_approve: true,
    max_iterations: 500
  }
})

// Get task status
const taskDetails = await client.getTask(task.id)

// Update progress
await client.updateProgress(task.id, { percentage: 50 })

// Add message
await client.addMessage(task.id, {
  role: 'user',
  content: 'Please focus on security'
})

// Complete task item
await client.completeTaskItem(task.id, 'milestone-1', 'task-1')
```

## Example Error Handling

```typescript
import { TaskApiClient, TaskNotFoundError, UnauthorizedError } from '@prmichaelsen/task-mcp/api-client'

try {
  const task = await client.getTask('invalid-id')
} catch (error) {
  if (error instanceof TaskNotFoundError) {
    console.error('Task not found:', error.taskId)
  } else if (error instanceof UnauthorizedError) {
    console.error('Invalid service token')
  } else {
    console.error('Unexpected error:', error)
  }
}
```

## Implementation Notes

### HTTP Client

Use native `fetch` API (available in Node.js 18+):
```typescript
class TaskApiClient {
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const response = await fetch(`${this.baseUrl}${path}`, {
      method,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.serviceToken}`
      },
      body: body ? JSON.stringify(body) : undefined
    })
    
    if (!response.ok) {
      throw await this.handleError(response)
    }
    
    return response.json()
  }
}
```

### Retry Logic

Implement exponential backoff for transient failures:
```typescript
private async retryRequest<T>(
  fn: () => Promise<T>,
  retries: number = this.config.retries || 3
): Promise<T> {
  try {
    return await fn()
  } catch (error) {
    if (retries > 0 && this.isRetryable(error)) {
      await this.delay(Math.pow(2, 3 - retries) * 1000)
      return this.retryRequest(fn, retries - 1)
    }
    throw error
  }
}
```

## Files to Create

- `src/api-client/task-api-client.ts` - Main client class
- `src/api-client/errors.ts` - Error classes
- `src/api-client/types.ts` - Client-specific types
- `src/api-client/index.ts` - Module exports
- `src/api-client/task-api-client.spec.ts` - Unit tests

## Benefits

1. **Type Safety**: Full TypeScript support with DTOs
2. **Easy Integration**: Simple API for agentbase.me
3. **Error Handling**: Structured error classes
4. **Retry Logic**: Automatic retry for transient failures
5. **Authentication**: Automatic service token injection
6. **Testability**: Easy to mock for testing

---

**Next Task**: Task 90 (Build Configuration) should be completed first, then Task 91 (Deployment), then this task.
