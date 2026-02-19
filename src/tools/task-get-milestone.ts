/**
 * MCP Tool: task_milestone_get
 * 
 * Get a milestone by ID from a task.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'

export const taskGetMilestoneTool = {
  name: 'task_get_milestone',
  description: 'Get a milestone by ID',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID'
      },
      milestone_id: {
        type: 'string',
        description: 'Milestone ID to retrieve'
      }
    },
    required: ['task_id', 'milestone_id']
  }
}

export async function handleTaskGetMilestone(
  client: FirebaseClient,
  args: { task_id: string; milestone_id: string }
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
    
    return JSON.stringify(milestone, null, 2)
  } catch (error) {
    throw new Error(`Failed to get milestone: ${error instanceof Error ? error.message : String(error)}`)
  }
}
