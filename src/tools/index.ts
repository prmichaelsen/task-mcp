/**
 * MCP Tools Index
 * 
 * Exports all task management tools for the MCP server.
 * 
 * Tool Naming Convention:
 * - task_<verb>_<entity> (e.g., task_create_task, task_get_milestone)
 * - Consistent CRUD operations for all entities
 */

import { taskCreateTaskTool, handleTaskCreateTask } from './task-create-task.js'
import { taskGetTasksTool, handleTaskGetTasks } from './task-get-tasks.js'
import { taskGetTaskTool, handleTaskGetTask } from './task-get-task.js'
import { taskUpdateTaskTool, handleTaskUpdateTask } from './task-update-task.js'
import { taskDeleteTaskTool, handleTaskDeleteTask } from './task-delete-task.js'

import { taskCreateMilestoneTool, handleTaskCreateMilestone } from './task-create-milestone.js'
import { taskGetMilestoneTool, handleTaskGetMilestone } from './task-get-milestone.js'
import { taskUpdateMilestoneTool, handleTaskUpdateMilestone } from './task-update-milestone.js'

import { taskCreateTaskItemTool, handleTaskCreateTaskItem } from './task-create-task-item.js'
import { taskGetTaskItemTool, handleTaskGetTaskItem } from './task-get-task-item.js'
import { taskUpdateTaskItemTool, handleTaskUpdateTaskItem } from './task-update-task-item.js'

import { taskUpdateProgressTool, handleTaskUpdateProgress } from './task-update-progress.js'
import { taskAddMessageTool, handleTaskAddMessage } from './task-add-message.js'

/**
 * All tool definitions organized by entity
 */
export const allTools = [
  // Task CRUD (5 tools)
  taskCreateTaskTool,
  taskGetTasksTool,
  taskGetTaskTool,
  taskUpdateTaskTool,
  taskDeleteTaskTool,
  
  // Milestone CRU (3 tools - no delete, milestones are part of task)
  taskCreateMilestoneTool,
  taskGetMilestoneTool,
  taskUpdateMilestoneTool,
  
  // Task Item CRU (3 tools - no delete, task items are part of milestone)
  taskCreateTaskItemTool,
  taskGetTaskItemTool,
  taskUpdateTaskItemTool,
  
  // Progress & Communication (2 tools)
  taskUpdateProgressTool,
  taskAddMessageTool
]

/**
 * Tool handlers mapped by tool name
 */
export const toolHandlers = {
  // Task CRUD
  'task_create_task': handleTaskCreateTask,
  'task_get_tasks': handleTaskGetTasks,
  'task_get_task': handleTaskGetTask,
  'task_update_task': handleTaskUpdateTask,
  'task_delete_task': handleTaskDeleteTask,
  
  // Milestone CRU
  'task_create_milestone': handleTaskCreateMilestone,
  'task_get_milestone': handleTaskGetMilestone,
  'task_update_milestone': handleTaskUpdateMilestone,
  
  // Task Item CRU
  'task_create_task_item': handleTaskCreateTaskItem,
  'task_get_task_item': handleTaskGetTaskItem,
  'task_update_task_item': handleTaskUpdateTaskItem,
  
  // Progress & Communication
  'task_update_progress': handleTaskUpdateProgress,
  'task_add_message': handleTaskAddMessage
}

/**
 * Get tool handler by name
 */
export function getToolHandler(toolName: string) {
  return toolHandlers[toolName as keyof typeof toolHandlers]
}

// Re-export individual tools for direct imports
export {
  // Task CRUD
  taskCreateTaskTool,
  handleTaskCreateTask,
  taskGetTasksTool,
  handleTaskGetTasks,
  taskGetTaskTool,
  handleTaskGetTask,
  taskUpdateTaskTool,
  handleTaskUpdateTask,
  taskDeleteTaskTool,
  handleTaskDeleteTask,
  
  // Milestone CRU
  taskCreateMilestoneTool,
  handleTaskCreateMilestone,
  taskGetMilestoneTool,
  handleTaskGetMilestone,
  taskUpdateMilestoneTool,
  handleTaskUpdateMilestone,
  
  // Task Item CRU
  taskCreateTaskItemTool,
  handleTaskCreateTaskItem,
  taskGetTaskItemTool,
  handleTaskGetTaskItem,
  taskUpdateTaskItemTool,
  handleTaskUpdateTaskItem,
  
  // Progress & Communication
  taskUpdateProgressTool,
  handleTaskUpdateProgress,
  taskAddMessageTool,
  handleTaskAddMessage
}
