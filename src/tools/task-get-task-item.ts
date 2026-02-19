/**
 * MCP Tool: task_task_item_get
 * 
 * Get a task item by ID from a milestone.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'

export const taskGetTaskItemTool = {
  name: 'task_get_task_item',
  description: 'Get a task item by ID',
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
        description: 'Task item ID to retrieve'
      }
    },
    required: ['task_id', 'milestone_id', 'task_item_id']
  }
}

export async function handleTaskGetTaskItem(
  client: FirebaseClient,
  args: { task_id: string; milestone_id: string; task_item_id: string }
): Promise<string> {
  try {
    const task = await client.getTask(args.task_id)
    
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`)
    }
    
    const milestone = task.progress.milestones.find(m => m.id === args.milestone_id)
    
    if (!milestone) {
      throw new Error(`Milestone not found: ${args.milestone_id}`)
    }
    
    const milestoneItems = task.progress.tasks[args.milestone_id] || []
    const taskItem = milestoneItems.find(item => item.id === args.task_item_id)
    
    if (!taskItem) {
      throw new Error(`Task item not found: ${args.task_item_id}`)
    }
    
    return JSON.stringify(taskItem, null, 2)
  } catch (error) {
    throw new Error(`Failed to get task item: ${error instanceof Error ? error.message : String(error)}`)
  }
}
