/**
 * MCP Tools Index
 *
 * Exports all task management tools for the MCP server.
 */

import { taskCreateTaskTool, handleTaskCreateTask } from './task-create-task.js'
import { taskUpdateTaskTool, handleTaskUpdateTask } from './task-update-task.js'
import { taskDeleteTaskTool, handleTaskDeleteTask } from './task-delete-task.js'
import { taskGetStatusTool, handleTaskGetStatus } from './task-get-status.js'
import { taskGetNextStepTool, handleTaskGetNextStep } from './task-get-next-step.js'
import { taskUpdateProgressTool, handleTaskUpdateProgress } from './task-update-progress.js'
import { taskCompleteTaskItemTool, handleTaskCompleteTaskItem } from './task-complete-task-item.js'
import { taskCreateMilestoneTool, handleTaskCreateMilestone } from './task-create-milestone.js'
import { taskCreateTaskItemTool, handleTaskCreateTaskItem } from './task-create-task-item.js'
import { taskReportCompletionTool, handleTaskReportCompletion } from './task-report-completion.js'
import { taskAddMessageTool, handleTaskAddMessage } from './task-add-message.js'

/**
 * All tool definitions
 */
export const allTools = [
  taskCreateTaskTool,
  taskUpdateTaskTool,
  taskDeleteTaskTool,
  taskGetStatusTool,
  taskGetNextStepTool,
  taskUpdateProgressTool,
  taskCompleteTaskItemTool,
  taskCreateMilestoneTool,
  taskCreateTaskItemTool,
  taskReportCompletionTool,
  taskAddMessageTool
]

/**
 * Tool handlers mapped by tool name
 */
export const toolHandlers = {
  'task_create_task': handleTaskCreateTask,
  'task_update_task': handleTaskUpdateTask,
  'task_delete_task': handleTaskDeleteTask,
  'task_get_status': handleTaskGetStatus,
  'task_get_next_step': handleTaskGetNextStep,
  'task_update_progress': handleTaskUpdateProgress,
  'task_complete_task_item': handleTaskCompleteTaskItem,
  'task_create_milestone': handleTaskCreateMilestone,
  'task_create_task_item': handleTaskCreateTaskItem,
  'task_report_completion': handleTaskReportCompletion,
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
  taskCreateTaskTool,
  handleTaskCreateTask,
  taskUpdateTaskTool,
  handleTaskUpdateTask,
  taskDeleteTaskTool,
  handleTaskDeleteTask,
  taskGetStatusTool,
  handleTaskGetStatus,
  taskGetNextStepTool,
  handleTaskGetNextStep,
  taskUpdateProgressTool,
  handleTaskUpdateProgress,
  taskCompleteTaskItemTool,
  handleTaskCompleteTaskItem,
  taskCreateMilestoneTool,
  handleTaskCreateMilestone,
  taskCreateTaskItemTool,
  handleTaskCreateTaskItem,
  taskReportCompletionTool,
  handleTaskReportCompletion,
  taskAddMessageTool,
  handleTaskAddMessage
}
