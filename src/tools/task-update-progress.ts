/**
 * MCP Tool: task_update_progress
 * 
 * Update the overall progress percentage for a task.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'

export const taskUpdateProgressTool = {
  name: 'task_update_progress',
  description: 'Update the overall progress percentage for a task',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID'
      },
      percentage: {
        type: 'number',
        description: 'Progress percentage (0-100)',
        minimum: 0,
        maximum: 100
      }
    },
    required: ['task_id', 'percentage']
  }
}

export async function handleTaskUpdateProgress(
  client: FirebaseClient,
  args: { task_id: string; percentage: number }
): Promise<string> {
  try {
    // Validate percentage
    const percentage = Math.min(100, Math.max(0, args.percentage))
    
    await client.updateOverallProgress(args.task_id, percentage)
    
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      progress: percentage,
      message: `Progress updated to ${percentage}%`
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to update progress: ${error instanceof Error ? error.message : String(error)}`)
  }
}
