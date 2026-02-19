/**
 * MCP Tool: task_update_task_item
 * 
 * Update task item properties including status, description, and estimated hours.
 * Allows partial updates - only specified fields will be changed.
 * Automatically updates milestone progress when task item status changes.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'
import type { TaskItem } from '@prmichaelsen/task-core/schemas'

export const taskUpdateTaskItemTool = {
  name: 'task_update_task_item',
  description: 'Update task item properties (status, description, estimated_hours)',
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
        description: 'Task item ID to update'
      },
      status: {
        type: 'string',
        enum: ['not_started', 'in_progress', 'completed'],
        description: 'New task item status (optional)'
      },
      description: {
        type: 'string',
        description: 'Updated description (optional)'
      },
      estimated_hours: {
        type: 'number',
        minimum: 0,
        description: 'Estimated hours to complete (optional)'
      }
    },
    required: ['task_id', 'milestone_id', 'task_item_id']
  }
}

export async function handleTaskUpdateTaskItem(
  client: FirebaseClient,
  args: { 
    task_id: string
    milestone_id: string
    task_item_id: string
    status?: TaskItem['status']
    description?: string
    estimated_hours?: number
  }
): Promise<string> {
  try {
    // Validate task exists
    const task = await client.getTask(args.task_id)
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`)
    }
    
    // Validate milestone exists
    const milestone = task.progress.milestones.find(m => m.id === args.milestone_id)
    if (!milestone) {
      throw new Error(`Milestone not found: ${args.milestone_id}`)
    }
    
    // Validate task item exists
    const milestoneItems = task.progress.tasks[args.milestone_id] || []
    const taskItem = milestoneItems.find(item => item.id === args.task_item_id)
    if (!taskItem) {
      throw new Error(`Task item not found: ${args.task_item_id}`)
    }
    
    // Build updates object
    const updates: Partial<TaskItem> = {}
    const changes: string[] = []
    
    if (args.status) {
      updates.status = args.status
      changes.push(`status: ${taskItem.status} → ${args.status}`)
    }
    
    if (args.description) {
      updates.description = args.description
      changes.push(`description updated`)
    }
    
    if (args.estimated_hours !== undefined) {
      updates.estimated_hours = args.estimated_hours
      changes.push(`estimated_hours: ${taskItem.estimated_hours || 'none'} → ${args.estimated_hours}`)
    }
    
    if (changes.length === 0) {
      return JSON.stringify({
        success: false,
        message: 'No updates specified. Provide at least one field to update.'
      }, null, 2)
    }
    
    // Update task item
    await client.updateTaskItem(args.task_id, args.milestone_id, args.task_item_id, updates)
    
    // If status changed, recalculate milestone progress
    let milestoneProgressUpdate = null
    if (args.status) {
      const updatedTask = await client.getTask(args.task_id)
      if (updatedTask) {
        const updatedItems = updatedTask.progress.tasks[args.milestone_id] || []
        const completedCount = updatedItems.filter(item => item.status === 'completed').length
        const totalCount = updatedItems.length
        const newProgress = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0
        
        // Update milestone progress
        await client.updateMilestone(args.task_id, args.milestone_id, {
          progress: newProgress,
          tasks_completed: completedCount,
          status: completedCount === totalCount ? 'completed' : 
                  completedCount > 0 ? 'in_progress' : 'not_started'
        })
        
        milestoneProgressUpdate = {
          completed: completedCount,
          total: totalCount,
          progress: newProgress
        }
      }
    }
    
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      milestone_id: args.milestone_id,
      task_item_id: args.task_item_id,
      task_item_name: taskItem.name,
      updates: changes,
      milestone_progress: milestoneProgressUpdate,
      message: `Task item "${taskItem.name}" updated successfully`
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to update task item: ${error instanceof Error ? error.message : String(error)}`)
  }
}
