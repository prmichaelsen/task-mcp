/**
 * Task Data Model and Schemas
 * 
 * Zod schemas and TypeScript interfaces for the task execution system.
 * These schemas define the structure of Task documents in Firestore.
 */

import { z } from 'zod'

/**
 * Milestone Schema
 * Represents a major phase in task execution with multiple sub-tasks
 */
export const MilestoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  progress: z.number().min(0).max(100),
  tasks_completed: z.number().min(0),
  tasks_total: z.number().min(0),
  started: z.string().optional(),
  completed: z.string().optional()
})

/**
 * Task Item Schema
 * Represents a granular work item within a milestone
 */
export const TaskItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(['not_started', 'in_progress', 'completed']),
  estimated_hours: z.number().optional(),
  completed_date: z.string().optional(),
  notes: z.string().optional()
})

/**
 * Task Progress Schema
 * Tracks overall progress and milestone/task completion
 */
export const TaskProgressSchema = z.object({
  current_milestone: z.string(),
  current_task: z.string(),
  overall_percentage: z.number().min(0).max(100),
  milestones: z.array(MilestoneSchema),
  tasks: z.record(z.string(), z.array(TaskItemSchema))
})

/**
 * Task Execution Schema
 * Stores execution state including messages and tool results
 */
export const TaskExecutionSchema = z.object({
  api_messages: z.array(z.any()),
  task_messages: z.array(z.any()),
  tool_results: z.array(z.any()),
  error: z.string().optional(),
  abort_reason: z.string().optional()
})

/**
 * Task Configuration Schema
 * Configuration for task execution behavior
 */
export const TaskConfigSchema = z.object({
  model: z.string(),
  system_prompt: z.string(),
  auto_approve: z.boolean(),
  max_iterations: z.number().optional(),
  timeout_minutes: z.number().optional()
})

/**
 * Task Metadata Schema
 * Optional metadata for task organization and tracking
 */
export const TaskMetadataSchema = z.object({
  conversation_id: z.string().optional(),
  parent_task_id: z.string().optional(),
  tags: z.array(z.string()).optional()
}).optional()

/**
 * Task Schema
 * Complete task document structure
 */
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
  
  progress: TaskProgressSchema,
  execution: TaskExecutionSchema,
  config: TaskConfigSchema,
  metadata: TaskMetadataSchema
})

/**
 * Task Message Schema
 * Messages in the task conversation thread
 */
export const TaskMessageSchema = z.object({
  id: z.string(),
  task_id: z.string(),
  role: z.enum(['user', 'assistant', 'system']),
  content: z.string(),
  timestamp: z.string(),
  metadata: z.any().optional()
})

// Export TypeScript types inferred from Zod schemas
export type Milestone = z.infer<typeof MilestoneSchema>
export type TaskItem = z.infer<typeof TaskItemSchema>
export type TaskProgress = z.infer<typeof TaskProgressSchema>
export type TaskExecution = z.infer<typeof TaskExecutionSchema>
export type TaskConfig = z.infer<typeof TaskConfigSchema>
export type TaskMetadata = z.infer<typeof TaskMetadataSchema>
export type Task = z.infer<typeof TaskSchema>
export type TaskMessage = z.infer<typeof TaskMessageSchema>

// Export status enums for convenience
export const TaskStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  FAILED: 'failed'
} as const

export const MilestoneStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
} as const

export const TaskItemStatus = {
  NOT_STARTED: 'not_started',
  IN_PROGRESS: 'in_progress',
  COMPLETED: 'completed'
} as const

export const MessageRole = {
  USER: 'user',
  ASSISTANT: 'assistant',
  SYSTEM: 'system'
} as const
