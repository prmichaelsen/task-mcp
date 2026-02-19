/**
 * MCP Tool: task_update_milestone
 * 
 * Update milestone properties including status, progress, and task counts.
 * Allows partial updates - only specified fields will be changed.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'
import type { Milestone } from '@prmichaelsen/task-core/schemas'

export const taskUpdateMilestoneTool = {
  name: 'task_update_milestone',
  description: 'Update milestone properties (status, progress, description, etc.)',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID'
      },
      milestone_id: {
        type: 'string',
        description: 'Milestone ID to update'
      },
      status: {
        type: 'string',
        enum: ['not_started', 'in_progress', 'completed'],
        description: 'New milestone status (optional)'
      },
      progress: {
        type: 'number',
        minimum: 0,
        maximum: 100,
        description: 'Progress percentage 0-100 (optional)'
      },
      description: {
        type: 'string',
        description: 'Updated description (optional)'
      }
    },
    required: ['task_id', 'milestone_id']
  }
}

export async function handleTaskUpdateMilestone(
  client: FirebaseClient,
  args: { 
    task_id: string
    milestone_id: string
    status?: Milestone['status']
    progress?: number
    description?: string
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
    
    // Build updates object
    const updates: Partial<Milestone> = {}
    const changes: string[] = []
    
    if (args.status) {
      updates.status = args.status
      changes.push(`status: ${milestone.status} → ${args.status}`)
    }
    
    if (args.progress !== undefined) {
      updates.progress = args.progress
      changes.push(`progress: ${milestone.progress}% → ${args.progress}%`)
    }
    
    if (args.description) {
      updates.description = args.description
      changes.push(`description updated`)
    }
    
    if (changes.length === 0) {
      return JSON.stringify({
        success: false,
        message: 'No updates specified. Provide at least one field to update.'
      }, null, 2)
    }
    
    // Update milestone
    await client.updateMilestone(args.task_id, args.milestone_id, updates)
    
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      milestone_id: args.milestone_id,
      milestone_name: milestone.name,
      updates: changes,
      message: `Milestone "${milestone.name}" updated successfully`
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to update milestone: ${error instanceof Error ? error.message : String(error)}`)
  }
}
