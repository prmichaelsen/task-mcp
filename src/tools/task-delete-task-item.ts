/**
 * MCP Tool: task_delete_task_item
 * 
 * Delete a task item from a milestone.
 * This action cannot be undone.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'

export const taskDeleteTaskItemTool = {
  name: 'task_delete_task_item',
  description: 'Delete a task item permanently (cannot be undone)',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID'
      },
      milestone_id: {
        type: 'string',
        description: 'Milestone ID'
      },
      task_item_id: {
        type: 'string',
        description: 'Task item ID to delete'
      },
      confirm: {
        type: 'boolean',
        description: 'Confirmation flag - must be true to delete',
        default: false
      }
    },
    required: ['task_id', 'milestone_id', 'task_item_id', 'confirm']
  }
}

export async function handleTaskDeleteTaskItem(
  client: FirebaseClient,
  args: { task_id: string; milestone_id: string; task_item_id: string; confirm: boolean }
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
    
    // Get task
    const task = await client.getTask(args.task_id)
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`)
    }
    
    // Find milestone
    const milestone = task.progress.milestones.find(m => m.id === args.milestone_id)
    if (!milestone) {
      throw new Error(`Milestone not found: ${args.milestone_id}`)
    }
    
    // Find task item
    const milestoneItems = task.progress.tasks[args.milestone_id] || []
    const taskItem = milestoneItems.find(item => item.id === args.task_item_id)
    if (!taskItem) {
      throw new Error(`Task item not found: ${args.task_item_id}`)
    }
    
    const taskItemName = taskItem.name
    
    // Note: This requires a general updateTask method in FirebaseClient
    // which doesn't currently exist. This is a limitation that needs to be
    // addressed in task-core package.
    throw new Error('Delete task item operation requires task-core enhancement. FirebaseClient needs updateTask() method to modify embedded arrays.')
    
  } catch (error) {
    throw new Error(`Failed to delete task item: ${error instanceof Error ? error.message : String(error)}`)
  }
}
