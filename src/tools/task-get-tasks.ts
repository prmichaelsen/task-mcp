/**
 * MCP Tool: task_get_tasks
 * 
 * List all tasks for the current user. Supports filtering by status.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'
import type { Task } from '@prmichaelsen/task-core/schemas'

export const taskGetTasksTool = {
  name: 'task_get_tasks',
  description: 'List all tasks for the current user, optionally filtered by status',
  inputSchema: {
    type: 'object',
    properties: {
      status: {
        type: 'string',
        enum: ['not_started', 'in_progress', 'paused', 'completed', 'failed'],
        description: 'Filter by task status (optional)'
      },
      limit: {
        type: 'number',
        minimum: 1,
        maximum: 100,
        default: 50,
        description: 'Maximum number of tasks to return (optional, default: 50)'
      }
    },
    required: []
  }
}

export async function handleTaskGetTasks(
  client: FirebaseClient,
  args: { status?: Task['status']; limit?: number }
): Promise<string> {
  try {
    let tasks: Task[]
    
    if (args.status) {
      tasks = await client.getTasksByStatus(args.status, args.limit || 50)
    } else {
      tasks = await client.listTasks(args.limit || 50)
    }
    
    return JSON.stringify({
      tasks: tasks.map(t => ({
        id: t.id,
        title: t.title,
        status: t.status,
        created_at: t.created_at,
        updated_at: t.updated_at,
        overall_progress: t.progress.progress.overall,
        current_milestone: t.progress.project.current_milestone,
        milestones_count: t.progress.milestones.length
      })),
      count: tasks.length,
      message: `Found ${tasks.length} task(s)`
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to get tasks: ${error instanceof Error ? error.message : String(error)}`)
  }
}
