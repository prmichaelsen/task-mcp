/**
 * MCP Tool: task_delete_milestone
 * 
 * Delete a milestone and all its task items from a task.
 * This action cannot be undone.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'

export const taskDeleteMilestoneTool = {
  name: 'task_delete_milestone',
  description: 'Delete a milestone and all its task items permanently (cannot be undone)',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID'
      },
      milestone_id: {
        type: 'string',
        description: 'Milestone ID to delete'
      },
      confirm: {
        type: 'boolean',
        description: 'Confirmation flag - must be true to delete',
        default: false
      }
    },
    required: ['task_id', 'milestone_id', 'confirm']
  }
}

export async function handleTaskDeleteMilestone(
  client: FirebaseClient,
  args: { task_id: string; milestone_id: string; confirm: boolean }
): Promise<string> {
  try {
    // Require explicit confirmation
    if (!args.confirm) {
      return JSON.stringify({
        success: false,
        message: 'Deletion requires confirmation. Set confirm=true to proceed.',
        warning: 'This will delete the milestone and all its task items. This action cannot be undone.'
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
    
    const milestoneName = milestone.name
    const taskItemsCount = (task.progress.tasks[args.milestone_id] || []).length
    
    // Note: This requires a general updateTask method in FirebaseClient
    // which doesn't currently exist. This is a limitation that needs to be
    // addressed in task-core package.
    throw new Error('Delete milestone operation requires task-core enhancement. FirebaseClient needs updateTask() method to modify embedded arrays.')
    
  } catch (error) {
    throw new Error(`Failed to delete milestone: ${error instanceof Error ? error.message : String(error)}`)
  }
}
