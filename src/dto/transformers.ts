/**
 * DTO Transformers
 * 
 * Functions to transform internal schemas to API response DTOs.
 * These transformers exclude internal fields and ensure API responses
 * match the expected structure for agentbase.me.
 */

import type { Task, TaskMessage, Milestone, TaskItem } from '../schemas/task.js'
import type {
  TaskApiResponse,
  TaskMessageApiResponse,
  MilestoneApiResponse,
  TaskItemApiResponse,
  TaskProgressApiResponse,
  TaskConfigApiResponse,
  TaskMetadataApiResponse
} from './task-api.dto.js'

/**
 * Transform Task Item schema to API response DTO
 */
export function toTaskItemApiResponse(item: TaskItem): TaskItemApiResponse {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    status: item.status,
    estimated_hours: item.estimated_hours,
    completed_at: item.completed_at,
    notes: item.notes
  }
}

/**
 * Transform Milestone schema to API response DTO
 */
export function toMilestoneApiResponse(milestone: Milestone): MilestoneApiResponse {
  return {
    id: milestone.id,
    name: milestone.name,
    description: milestone.description,
    status: milestone.status,
    progress: milestone.progress,
    tasks_completed: milestone.tasks_completed,
    tasks_total: milestone.tasks_total,
    started_at: milestone.started_at,
    completed_at: milestone.completed_at
  }
}

/**
 * Transform Task Progress schema to API response DTO
 */
export function toTaskProgressApiResponse(progress: Task['progress']): TaskProgressApiResponse {
  return {
    current_milestone: progress.current_milestone,
    current_task: progress.current_task,
    overall_percentage: progress.overall_percentage,
    milestones: progress.milestones.map(toMilestoneApiResponse),
    tasks: Object.fromEntries(
      Object.entries(progress.tasks).map(([milestoneId, items]) => [
        milestoneId,
        items.map(toTaskItemApiResponse)
      ])
    )
  }
}

/**
 * Transform Task Config schema to API response DTO
 */
export function toTaskConfigApiResponse(config: Task['config']): TaskConfigApiResponse {
  return {
    system_prompt: config.system_prompt,
    auto_approve: config.auto_approve,
    max_iterations: config.max_iterations
  }
}

/**
 * Transform Task Metadata schema to API response DTO
 */
export function toTaskMetadataApiResponse(
  metadata: Task['metadata']
): TaskMetadataApiResponse | undefined {
  if (!metadata) {
    return undefined
  }
  
  return {
    conversation_id: metadata.conversation_id,
    parent_task_id: metadata.parent_task_id,
    tags: metadata.tags
  }
}

/**
 * Transform internal Task schema to API response DTO
 * Excludes internal execution details (api_messages, tool_results)
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
    
    progress: toTaskProgressApiResponse(task.progress),
    config: toTaskConfigApiResponse(task.config),
    metadata: toTaskMetadataApiResponse(task.metadata)
    
    // execution field is intentionally excluded
    // Internal fields (api_messages, tool_results) are not exposed
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

/**
 * Transform array of tasks to list response DTO
 */
export function toTaskListApiResponse(tasks: Task[]): {
  tasks: TaskApiResponse[]
  total: number
} {
  return {
    tasks: tasks.map(toTaskApiResponse),
    total: tasks.length
  }
}

/**
 * Transform array of messages to list response DTO
 */
export function toTaskMessageListApiResponse(messages: TaskMessage[]): {
  messages: TaskMessageApiResponse[]
  total: number
} {
  return {
    messages: messages.map(toTaskMessageApiResponse),
    total: messages.length
  }
}
