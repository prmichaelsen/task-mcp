/**
 * MCP Tool: task_create_milestone
 * 
 * Create a new milestone in a task.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'
import type { Milestone } from '@prmichaelsen/task-core/schemas'
import { MILESTONE_TEMPLATE } from './templates.js'

export const taskCreateMilestoneTool = {
  name: 'task_create_milestone',
  description: `Create a new milestone in a task.

NOTE: Milestones correspond to ACP Milestones and should follow this structure:

${MILESTONE_TEMPLATE}

Use the 'description' parameter to provide the full milestone content following this structure.`,
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID'
      },
      milestone_id: {
        type: 'string',
        description: 'Unique milestone ID (e.g., "milestone-1")'
      },
      name: {
        type: 'string',
        description: 'Milestone name'
      },
      description: {
        type: 'string',
        description: 'Milestone description'
      }
    },
    required: ['task_id', 'milestone_id', 'name', 'description']
  }
}

export async function handleTaskCreateMilestone(
  client: FirebaseClient,
  args: { task_id: string; milestone_id: string; name: string; description: string }
): Promise<string> {
  try {
    const milestone: Milestone = {
      id: args.milestone_id,
      name: args.name,
      description: args.description,
      status: 'not_started',
      progress: 0,
      tasks_completed: 0,
      tasks_total: 0
    }
    
    await client.createMilestone(args.task_id, milestone)
    
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      milestone: {
        id: milestone.id,
        name: milestone.name,
        description: milestone.description
      },
      message: `Milestone "${milestone.name}" created successfully`
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to create milestone: ${error instanceof Error ? error.message : String(error)}`)
  }
}
