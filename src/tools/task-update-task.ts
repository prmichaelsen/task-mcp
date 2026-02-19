/**
 * MCP Tool: task_update_task
 * 
 * Update task properties including status, title, description, and configuration.
 * Allows partial updates - only specified fields will be changed.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'
import type { Task } from '@prmichaelsen/task-core/schemas'

export const taskUpdateTaskTool = {
  name: 'task_update_task',
  description: 'Update task properties (status, title, description, config)',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID to update'
      },
      status: {
        type: 'string',
        enum: ['not_started', 'in_progress', 'paused', 'completed', 'failed'],
        description: 'New task status (optional)'
      }
    },
    required: ['task_id']
  }
}

export async function handleTaskUpdateTask(
  client: FirebaseClient,
  args: { 
    task_id: string
    status?: Task['status']
  }
): Promise<string> {
  try {
    // Validate task exists
    const task = await client.getTask(args.task_id)
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`)
    }
    
    const updates: string[] = []
    
    // Update status if provided
    if (args.status) {
      await client.updateTaskStatus(args.task_id, args.status)
      updates.push(`status: ${task.status} → ${args.status}`)
    }
    
    if (updates.length === 0) {
      return JSON.stringify({
        success: false,
        message: 'No updates specified. Provide at least one field to update.'
      }, null, 2)
    }
    
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      updates: updates,
      message: `Task updated successfully`
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to update task: ${error instanceof Error ? error.message : String(error)}`)
  }
}
