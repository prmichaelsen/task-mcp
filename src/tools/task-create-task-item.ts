/**
 * MCP Tool: task_create_task_item
 * 
 * Create a new task item within a milestone.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'
import type { TaskItem } from '@prmichaelsen/task-core/schemas'

export const taskCreateTaskItemTool = {
  name: 'task_create_task_item',
  description: 'Create a new task item within a milestone',
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
        description: 'Unique task item ID (e.g., "task-1")'
      },
      name: {
        type: 'string',
        description: 'Task item name'
      },
      description: {
        type: 'string',
        description: 'Task item description'
      },
      estimated_hours: {
        type: 'number',
        description: 'Estimated hours to complete (optional)'
      }
    },
    required: ['task_id', 'milestone_id', 'task_item_id', 'name', 'description']
  }
}

export async function handleTaskCreateTaskItem(
  client: FirebaseClient,
  args: { 
    task_id: string
    milestone_id: string
    task_item_id: string
    name: string
    description: string
    estimated_hours?: number
  }
): Promise<string> {
  try {
    const taskItem: TaskItem = {
      id: args.task_item_id,
      name: args.name,
      description: args.description,
      status: 'not_started',
      estimated_hours: args.estimated_hours
    }
    
    await client.createTaskItem(args.task_id, args.milestone_id, taskItem)
    
    // Update milestone task count
    const task = await client.getTask(args.task_id)
    if (task) {
      const milestoneItems = task.progress.tasks[args.milestone_id] || []
      await client.updateMilestone(args.task_id, args.milestone_id, {
        tasks_total: milestoneItems.length
      })
    }
    
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      milestone_id: args.milestone_id,
      task_item: {
        id: taskItem.id,
        name: taskItem.name,
        description: taskItem.description,
        estimated_hours: taskItem.estimated_hours
      },
      message: `Task item "${taskItem.name}" created in milestone`
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to create task item: ${error instanceof Error ? error.message : String(error)}`)
  }
}
