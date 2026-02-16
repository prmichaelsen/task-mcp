/**
 * DTO Module Exports
 * 
 * Exports all API Response DTOs and transformation functions.
 * Use these types and functions when building REST API endpoints.
 */

// Export all DTO types
export type {
  // Status enums
  TaskStatus,
  MilestoneStatus,
  TaskItemStatus,
  MessageRole,
  
  // Response DTOs
  TaskItemApiResponse,
  MilestoneApiResponse,
  TaskProgressApiResponse,
  TaskConfigApiResponse,
  TaskMetadataApiResponse,
  TaskApiResponse,
  TaskListApiResponse,
  TaskMessageApiResponse,
  TaskMessageListApiResponse,
  
  // Input DTOs
  CreateTaskDto,
  UpdateTaskDto,
  CreateMessageDto,
  UpdateProgressDto,
  CreateMilestoneDto,
  CreateTaskItemDto
} from './task-api.dto.js'

// Export all transformer functions
export {
  toTaskItemApiResponse,
  toMilestoneApiResponse,
  toTaskProgressApiResponse,
  toTaskConfigApiResponse,
  toTaskMetadataApiResponse,
  toTaskApiResponse,
  toTaskMessageApiResponse,
  toTaskListApiResponse,
  toTaskMessageListApiResponse
} from './transformers.js'
