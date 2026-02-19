/**
 * MCP Tool: task_delete_task
 * 
 * Delete a task permanently. This action cannot be undone.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'

export const taskDeleteTaskTool = {
  name: 'task_delete_task',
  description: 'Delete a task permanently (cannot be undone)',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID to delete'
      },
      confirm: {
        type: 'boolean',
        description: 'Confirmation flag - must be true to delete',
        default: false
      }
    },
    required: ['task_id', 'confirm']
  }
}

export async function handleTaskDeleteTask(
  client: FirebaseClient,
  args: { task_id: string; confirm: boolean }
): Promise<string> {
  try {
    // Require explicit confirmation
    if (!args.confirm) {
      return JSON.stringify({
        success: false,
        message: 'Deletion requires confirmation. Set confirm=true to proceed.',
        warning: 'This action cannot be undone'
      }, null, 2)
    }
    
    // Validate task exists before deletion
    const task = await client.getTask(args.task_id)
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`)
    }
    
    const taskTitle = task.title
    
    // Delete the task
    await client.deleteTask(args.task_id)
    
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      task_title: taskTitle,
      message: `Task "${taskTitle}" deleted successfully`
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to delete task: ${error instanceof Error ? error.message : String(error)}`)
  }
}
