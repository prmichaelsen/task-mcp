# Code Extraction Guide: Roo Code to task-mcp

**Purpose**: Document specific code patterns and components to extract from Roo Code for task-mcp implementation
**Created**: 2026-02-16
**Status**: Active Reference
**Roo Code Repository**: `/home/prmichaelsen/Roo-Code`

---

## Overview

This document identifies specific code samples from Roo Code that should be ported to task-mcp, with adaptation notes for the MCP server environment.

**Important**: When referencing Roo Code source files, use the full path `/home/prmichaelsen/Roo-Code/` to locate files. This is the root directory of the Roo Code repository that contains the implementation patterns we're porting.

### How to Use This Guide

1. **Locate Source Files**: All file paths are relative to `/home/prmichaelsen/Roo-Code/`
2. **Read Source Code**: Use the full path when reading files (e.g., `/home/prmichaelsen/Roo-Code/src/core/task/Task.ts`)
3. **Validate Assumptions**: Cross-reference this guide with actual source code before implementing
4. **Search for Patterns**: Use `search_files` tool in `/home/prmichaelsen/Roo-Code/` to find additional examples

---

## 1. Message Queue System

### Source: `/home/prmichaelsen/Roo-Code/src/core/message-queue/MessageQueueService.ts`

**What it does**: Queues user messages while agent is working, processes them when idle

**Key Features**:
- Add/remove/update messages in queue
- Dequeue messages for processing
- Event emission for state changes
- Simple in-memory queue

**Port Strategy**:
```typescript
// task-mcp/src/utils/message-queue.ts
import { EventEmitter } from 'events'

export interface QueuedMessage {
  id: string
  timestamp: number
  text: string
  images?: string[]
}

export class MessageQueue extends EventEmitter {
  private messages: QueuedMessage[] = []
  
  addMessage(text: string, images?: string[]): QueuedMessage {
    const message = {
      id: crypto.randomUUID(),
      timestamp: Date.now(),
      text,
      images
    }
    this.messages.push(message)
    this.emit('stateChanged', this.messages)
    return message
  }
  
  dequeue(): QueuedMessage | undefined {
    const message = this.messages.shift()
    this.emit('stateChanged', this.messages)
    return message
  }
  
  isEmpty(): boolean {
    return this.messages.length === 0
  }
  
  // ... other methods
}
```

**Adaptations**:
- ✅ Keep as-is (no VSCode dependencies)
- ✅ Use in task execution loop
- ✅ Persist queue to Firestore for resumability
- ✅ Add priority handling (optional)

---

## 2. Tool Execution Pattern

### Source: `/home/prmichaelsen/Roo-Code/src/core/tools/BaseTool.ts` and tool implementations

**What it does**: Base class for all tools with common execution logic

**Key Pattern**:
```typescript
// Roo Code pattern
export abstract class BaseTool<TName extends ToolName> {
  abstract readonly name: TName
  
  async handle(
    task: Task,
    toolUse: ToolUse<TName>,
    callbacks: ToolCallbacks
  ): Promise<void> {
    // 1. Validate parameters
    // 2. Ask for approval if needed
    // 3. Execute tool logic
    // 4. Format result
    // 5. Push result to task
  }
}
```

**Port Strategy for task-mcp**:
```typescript
// task-mcp/src/tools/base-tool.ts
export interface ToolDefinition {
  name: string
  description: string
  inputSchema: object
}

export interface ToolHandler {
  (client: FirebaseClient, args: any): Promise<string>
}

// Each tool exports both definition and handler
export interface Tool {
  definition: ToolDefinition
  handler: ToolHandler
}
```

**Adaptations**:
- ❌ Remove BaseTool class (not needed for MCP)
- ✅ Use simple function exports per bootstrap pattern
- ✅ Each tool file exports definition + handler
- ❌ Remove approval logic (handled by agent)
- ✅ Return JSON strings directly

---

## 3. Tool Examples to Port

### Example 1: UpdateTodoListTool

**Source**: `/home/prmichaelsen/Roo-Code/src/core/tools/UpdateTodoListTool.ts`

**Roo Code Implementation**:
```typescript
export class UpdateTodoListTool extends BaseTool<"update_todo_list"> {
  readonly name = "update_todo_list" as const
  
  async handle(task: Task, toolUse: ToolUse<"update_todo_list">, callbacks: ToolCallbacks) {
    const { todos } = toolUse.params
    
    // Parse markdown checklist
    const todoItems = parseTodoList(todos)
    
    // Update task's todo list
    task.todoList = todoItems
    
    // Save to disk
    await saveTodoList(task.taskId, todoItems)
    
    // Push result
    await task.pushToolResult(toolUse, "Todo list updated")
  }
}
```

**task-mcp Port**:
```typescript
// task-mcp/src/tools/task-update-todos.ts
export const taskUpdateTodosTool = {
  name: 'task_update_todos',
  description: 'Update the todo list for a task',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: { type: 'string', description: 'Task ID' },
      todos: { type: 'string', description: 'Markdown checklist' }
    },
    required: ['task_id', 'todos']
  }
}

export async function handleTaskUpdateTodos(
  client: FirebaseClient,
  args: { task_id: string; todos: string }
): Promise<string> {
  // Parse markdown checklist
  const todoItems = parseTodoList(args.todos)
  
  // Update in Firestore
  await client.updateTaskTodos(args.task_id, todoItems)
  
  return JSON.stringify({
    success: true,
    todos_count: todoItems.length,
    completed: todoItems.filter(t => t.completed).length
  }, null, 2)
}
```

**Key Differences**:
- No Task class dependency
- No callbacks needed
- Direct Firestore operations
- Returns JSON string
- Simpler, more focused

### Example 2: ExecuteCommandTool (NOT PORTED)

**Source**: `/home/prmichaelsen/Roo-Code/src/core/tools/ExecuteCommandTool.ts`

**Why NOT port**: 
- Requires terminal access (not available in MCP server)
- VSCode-specific terminal integration
- Not applicable to task management

**Alternative**: 
- Tasks in agentbase.me will use external integrations (GitHub API, Vercel API, etc.)
- No direct command execution in web environment

### Example 3: ReadFileTool (ADAPTED)

**Source**: `/home/prmichaelsen/Roo-Code/src/core/tools/ReadFileTool.ts`

**Roo Code**: Reads files from local file system

**task-mcp Adaptation**: Read files from virtual file system (Firestore/R2)

```typescript
// task-mcp/src/tools/task-read-file.ts
export const taskReadFileTool = {
  name: 'task_read_file',
  description: 'Read a file from the task virtual file system',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: { type: 'string' },
      path: { type: 'string', description: 'Virtual file path' }
    },
    required: ['task_id', 'path']
  }
}

export async function handleTaskReadFile(
  client: FirebaseClient,
  args: { task_id: string; path: string }
): Promise<string> {
  // Read from Firestore or R2
  const content = await client.readVirtualFile(args.task_id, args.path)
  
  return JSON.stringify({
    path: args.path,
    content,
    size: content.length
  }, null, 2)
}
```

---

## 4. Task Lifecycle Management

### Source: `/home/prmichaelsen/Roo-Code/src/core/task/Task.ts` (lines 1924-2100)

**Full Path**: `/home/prmichaelsen/Roo-Code/src/core/task/Task.ts`

**Key Methods**:
```typescript
private async startTask(task?: string, images?: string[]): Promise<void>
private async resumeTaskFromHistory(): Promise<void>
async pauseTask(): Promise<void>
async abortTask(): Promise<void>
```

**Port Strategy**:
```typescript
// task-mcp/src/tools/task-lifecycle.ts

// Tool: task_start
export async function handleTaskStart(
  client: FirebaseClient,
  args: { task_id: string }
): Promise<string> {
  await client.updateTaskStatus(args.task_id, 'in_progress')
  await client.setTaskStartTime(args.task_id, new Date().toISOString())
  
  return JSON.stringify({
    status: 'started',
    task_id: args.task_id,
    started_at: new Date().toISOString()
  }, null, 2)
}

// Tool: task_pause
export async function handleTaskPause(
  client: FirebaseClient,
  args: { task_id: string }
): Promise<string> {
  await client.updateTaskStatus(args.task_id, 'paused')
  
  return JSON.stringify({
    status: 'paused',
    task_id: args.task_id
  }, null, 2)
}

// Tool: task_resume
export async function handleTaskResume(
  client: FirebaseClient,
  args: { task_id: string }
): Promise<string> {
  await client.updateTaskStatus(args.task_id, 'in_progress')
  
  return JSON.stringify({
    status: 'resumed',
    task_id: args.task_id
  }, null, 2)
}
```

**Adaptations**:
- ❌ Remove VSCode-specific code
- ✅ Keep state management logic
- ✅ Use Firestore instead of file system
- ✅ Emit events for WebSocket updates (via client)

---

## 5. Progress Tracking

### Source: `/home/prmichaelsen/Roo-Code/src/core/task-persistence/taskMetadata.ts`

**What it does**: Manages task metadata and progress tracking

**Key Concepts**:
- Task metadata stored alongside messages
- Progress percentages calculated
- Milestone/task completion tracking

**Port Strategy**:
```typescript
// task-mcp/src/utils/progress-calculator.ts

export function calculateMilestoneProgress(milestone: Milestone): number {
  if (milestone.tasks_total === 0) return 0
  return Math.round((milestone.tasks_completed / milestone.tasks_total) * 100)
}

export function calculateOverallProgress(milestones: Milestone[]): number {
  if (milestones.length === 0) return 0
  
  const totalProgress = milestones.reduce((sum, m) => sum + m.progress, 0)
  return Math.round(totalProgress / milestones.length)
}

export function findCurrentTask(
  tasks: Record<string, TaskItem[]>,
  currentMilestone: string
): TaskItem | null {
  const milestoneTasks = tasks[currentMilestone] || []
  return milestoneTasks.find(t => 
    t.status === 'in_progress' || t.status === 'not_started'
  ) || null
}
```

**Adaptations**:
- ✅ Extract calculation logic
- ✅ Make pure functions (no side effects)
- ✅ Use in tools for progress updates

---

## 6. API Message History

### Source: `/home/prmichaelsen/Roo-Code/src/core/task/Task.ts` (lines 862-1010)

**Full Path**: `/home/prmichaelsen/Roo-Code/src/core/task/Task.ts`

**What it does**: Manages conversation history with API

**Key Methods**:
```typescript
private async getSavedApiConversationHistory(): Promise<ApiMessage[]>
private async addToApiConversationHistory(message: Anthropic.MessageParam)
```

**Port Strategy**:
```typescript
// task-mcp/src/client.ts (Firebase client method)

export class FirebaseClient {
  async getApiMessages(taskId: string): Promise<any[]> {
    const task = await this.getTask(taskId)
    return task?.execution.api_messages || []
  }
  
  async addApiMessage(taskId: string, message: any): Promise<void> {
    const task = await this.getTask(taskId)
    if (!task) throw new Error('Task not found')
    
    task.execution.api_messages.push({
      ...message,
      ts: Date.now()
    })
    
    await this.updateTask(taskId, {
      execution: task.execution,
      updated_at: new Date().toISOString()
    })
  }
}
```

**Adaptations**:
- ✅ Store in Firestore instead of file system
- ✅ Keep message format compatible with Anthropic API
- ✅ Add timestamp for ordering
- ❌ Remove VSCode-specific metadata

---

## 7. Tool Result Formatting

### Source: `/home/prmichaelsen/Roo-Code/src/core/tools/helpers/toolResultFormatting.ts`

**What it does**: Formats tool invocations and results for display

**Key Function**:
```typescript
export function formatToolInvocation(toolName: string, params: Record<string, any>): string {
  // Creates readable format for tool calls
  return `Tool: ${toolName}\nParameters: ${JSON.stringify(params, null, 2)}`
}
```

**Port Strategy**:
```typescript
// task-mcp/src/utils/tool-formatter.ts

export function formatToolCall(
  toolName: string,
  args: any
): string {
  return `[Tool Call] ${toolName}\n${JSON.stringify(args, null, 2)}`
}

export function formatToolResult(
  toolName: string,
  result: any,
  error?: string
): string {
  if (error) {
    return `[Tool Error] ${toolName}\n${error}`
  }
  return `[Tool Result] ${toolName}\n${result}`
}
```

**Adaptations**:
- ✅ Keep formatting logic
- ✅ Simplify for MCP context
- ✅ Use for audit logging

---

## 8. Auto-Approval Logic

### Source: `/home/prmichaelsen/Roo-Code/src/core/auto-approval/AutoApprovalHandler.ts`

**What it does**: Automatically approves certain tool calls based on patterns

**Key Concept**: Pattern-based approval rules

**Port Strategy**:
```typescript
// task-mcp/src/utils/auto-approval.ts

export interface ApprovalRule {
  toolName: string
  condition?: (args: any) => boolean
  autoApprove: boolean
}

export const DEFAULT_APPROVAL_RULES: ApprovalRule[] = [
  // All task tools are auto-approved
  { toolName: 'task_get_status', autoApprove: true },
  { toolName: 'task_create_milestone', autoApprove: true },
  { toolName: 'task_create_task', autoApprove: true },
  { toolName: 'task_update_progress', autoApprove: true },
  { toolName: 'task_complete_task', autoApprove: true },
  // ... all task tools
]

export function shouldAutoApprove(
  toolName: string,
  args: any,
  rules: ApprovalRule[] = DEFAULT_APPROVAL_RULES
): boolean {
  const rule = rules.find(r => r.toolName === toolName)
  if (!rule) return false
  
  if (rule.condition) {
    return rule.condition(args)
  }
  
  return rule.autoApprove
}
```

**Adaptations**:
- ✅ Simplify for task-mcp (all tools auto-approved)
- ✅ Keep rule system for extensibility
- ❌ Remove complex approval UI (not needed in MCP server)

---

## 9. Error Handling Patterns

### Source: Multiple tool files in `/home/prmichaelsen/Roo-Code/src/core/tools/`

**Common Pattern**:
```typescript
try {
  // Tool logic
  const result = await doSomething()
  return formatSuccess(result)
} catch (error) {
  throw new Error(`Tool failed: ${error instanceof Error ? error.message : String(error)}`)
}
```

**Port Strategy**:
```typescript
// task-mcp/src/utils/error-handler.ts

export function wrapToolHandler<T extends any[], R>(
  toolName: string,
  handler: (...args: T) => Promise<R>
): (...args: T) => Promise<string> {
  return async (...args: T): Promise<string> => {
    try {
      const result = await handler(...args)
      return JSON.stringify(result, null, 2)
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)
      throw new Error(`${toolName} failed: ${errorMessage}`)
    }
  }
}

// Usage
export const handleTaskGetStatus = wrapToolHandler(
  'task_get_status',
  async (client: FirebaseClient, args: { task_id: string }) => {
    const task = await client.getTask(args.task_id)
    if (!task) throw new Error('Task not found')
    return { /* status data */ }
  }
)
```

**Adaptations**:
- ✅ Keep error wrapping pattern
- ✅ Add tool name to errors
- ✅ Return structured error responses

---

## 10. State Persistence

### Source: `/home/prmichaelsen/Roo-Code/src/core/task-persistence/`

**What it does**: Save and restore task state from file system

**Key Functions**:
```typescript
export async function saveApiMessages(options: SaveOptions): Promise<void>
export async function readApiMessages(options: ReadOptions): Promise<ApiMessage[]>
export async function saveTaskMessages(options: SaveOptions): Promise<void>
export async function readTaskMessages(options: ReadOptions): Promise<ClineMessage[]>
```

**Port Strategy**:
```typescript
// task-mcp/src/client.ts (Firebase client methods)

export class FirebaseClient {
  // Save API messages
  async saveApiMessages(taskId: string, messages: any[]): Promise<void> {
    await this.firestore
      .collection('users').doc(this.userId)
      .collection('tasks').doc(taskId)
      .update({
        'execution.api_messages': messages,
        updated_at: new Date().toISOString()
      })
  }
  
  // Read API messages
  async getApiMessages(taskId: string): Promise<any[]> {
    const task = await this.getTask(taskId)
    return task?.execution.api_messages || []
  }
  
  // Save task messages (to subcollection)
  async addTaskMessage(
    taskId: string,
    role: 'user' | 'assistant' | 'system',
    content: string
  ): Promise<string> {
    const messageRef = await this.firestore
      .collection('users').doc(this.userId)
      .collection('tasks').doc(taskId)
      .collection('messages')
      .add({
        role,
        content,
        timestamp: new Date().toISOString()
      })
    
    return messageRef.id
  }
}
```

**Adaptations**:
- ❌ Replace file system with Firestore
- ✅ Keep message format
- ✅ Use subcollections for messages
- ✅ Add timestamps for ordering

---

## 11. Event Emission for UI Updates

### Source: `/home/prmichaelsen/Roo-Code/src/core/task/Task.ts` (EventEmitter usage)

**Full Path**: `/home/prmichaelsen/Roo-Code/src/core/task/Task.ts`

**What it does**: Emits events for UI to listen to

**Roo Code Pattern**:
```typescript
export class Task extends EventEmitter<TaskEvents> {
  // Emit events
  this.emit('task:started', { taskId: this.taskId })
  this.emit('task:progress', { progress: 50 })
  this.emit('task:completed', { taskId: this.taskId })
}
```

**Port Strategy**:
```typescript
// task-mcp/src/client.ts

export class FirebaseClient {
  private eventEmitter = new EventEmitter()
  
  // Emit event and save to Firestore
  async emitTaskEvent(
    taskId: string,
    eventType: string,
    data: any
  ): Promise<void> {
    // Save event to Firestore for WebSocket pickup
    await this.firestore
      .collection('users').doc(this.userId)
      .collection('task_events')
      .add({
        task_id: taskId,
        event_type: eventType,
        data,
        timestamp: new Date().toISOString()
      })
    
    // Also emit locally
    this.eventEmitter.emit(eventType, data)
  }
}
```

**Adaptations**:
- ✅ Keep event pattern
- ✅ Save events to Firestore
- ✅ WebSocket server listens to Firestore events
- ✅ Stream to UI in real-time

---

## 12. Tool Registry Pattern

### Source: `/home/prmichaelsen/Roo-Code/src/core/prompts/tools/native-tools/index.ts`

**What it does**: Registers all available tools

**Roo Code Pattern**:
```typescript
export const nativeTools = [
  readFileTool,
  writeToFileTool,
  executeCommandTool,
  // ... all tools
]
```

**Port Strategy**:
```typescript
// task-mcp/src/tools/index.ts

import { taskGetStatusTool, handleTaskGetStatus } from './task-get-status.js'
import { taskCreateMilestoneTool, handleTaskCreateMilestone } from './task-create-milestone.js'
// ... import all tools

export const allTools = [
  taskGetStatusTool,
  taskCreateMilestoneTool,
  taskCreateTaskTool,
  taskUpdateProgressTool,
  taskCompleteTaskTool,
  taskCompleteMilestoneTool,
  taskPauseTool,
  taskResumeTool,
  taskInitTool,
  taskGetDetailedStatusTool,
  taskSyncTool,
  taskGenerateReportTool,
  taskValidateTool
]

export const toolHandlers = {
  'task_get_status': handleTaskGetStatus,
  'task_create_milestone': handleTaskCreateMilestone,
  // ... all handlers
}
```

**Adaptations**:
- ✅ Keep registry pattern
- ✅ Export both definitions and handlers
- ✅ Use in MCP server setup

---

## Summary of Ports

### ✅ Port These Components:
1. **MessageQueue** - Queue user messages during execution
2. **Progress Calculation** - Calculate milestone/task percentages
3. **Tool Result Formatting** - Format tool calls/results
4. **Error Handling** - Wrap errors with context
5. **State Persistence Logic** - Save/restore patterns (adapted for Firestore)
6. **Event Emission** - Notify UI of changes
7. **Tool Registry** - Register all tools

### ❌ Don't Port These:
1. **Terminal Integration** - Not applicable to web
2. **File System Tools** - Use virtual file system instead
3. **VSCode-specific APIs** - No VSCode in MCP server
4. **Diff View Provider** - UI-specific, not needed
5. **Checkpoint System** - Git-based, not applicable

### 🔄 Adapt These:
1. **Tool Execution** - Simplify for MCP protocol
2. **File Operations** - Use Firestore/R2 instead of file system
3. **Lifecycle Management** - Remove VSCode dependencies
4. **Auto-Approval** - Simplify (all tools auto-approved in task mode)

---

## Quick Reference: Key Roo Code Files

For quick access when implementing task-mcp, here are the most important source files:

### Core Task Implementation
- **Main Task Class**: `/home/prmichaelsen/Roo-Code/src/core/task/Task.ts`
  - Lines 1924-2100: Lifecycle management (start, pause, resume, abort)
  - Lines 862-1010: API message history management
  - Full file: ~2500 lines of task execution logic

### Tool System
- **Base Tool**: `/home/prmichaelsen/Roo-Code/src/core/tools/BaseTool.ts`
- **Tool Registry**: `/home/prmichaelsen/Roo-Code/src/core/prompts/tools/native-tools/index.ts`
- **Tool Implementations**: `/home/prmichaelsen/Roo-Code/src/core/tools/*.ts`

### State Management
- **Message Queue**: `/home/prmichaelsen/Roo-Code/src/core/message-queue/MessageQueueService.ts`
- **Task Persistence**: `/home/prmichaelsen/Roo-Code/src/core/task-persistence/`
- **Task Metadata**: `/home/prmichaelsen/Roo-Code/src/core/task-persistence/taskMetadata.ts`

### Utilities
- **Tool Formatting**: `/home/prmichaelsen/Roo-Code/src/core/tools/helpers/toolResultFormatting.ts`
- **Auto-Approval**: `/home/prmichaelsen/Roo-Code/src/core/auto-approval/AutoApprovalHandler.ts`

### Search Tips

When you need to find specific patterns in Roo Code:

```bash
# Search for tool implementations
search_files path="/home/prmichaelsen/Roo-Code/src/core/tools" regex="class.*Tool.*extends.*BaseTool"

# Search for event emissions
search_files path="/home/prmichaelsen/Roo-Code/src/core/task" regex="this\.emit\("

# Search for Firestore operations (if any)
search_files path="/home/prmichaelsen/Roo-Code" regex="firestore|Firestore"

# Search for API message handling
search_files path="/home/prmichaelsen/Roo-Code/src/core/task" regex="ApiMessage|api.*message"
```

## Next Steps

1. Create detailed extraction documents for each component
2. Create code samples for each tool
3. Document Firebase client methods needed
4. Create migration guide for each pattern

---

**Status**: Active Reference
**Roo Code Path**: `/home/prmichaelsen/Roo-Code`
**Last Updated**: 2026-02-16
