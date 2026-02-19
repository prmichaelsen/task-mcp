/**
 * MCP Tool: task_task_get
 * 
 * Get a task by ID. Returns the complete task object.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'

export const taskGetTaskTool = {
  name: 'task_get_task',
  description: 'Get a task by ID',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID to retrieve'
      }
    },
    required: ['task_id']
  }
}

export async function handleTaskGetTask(
  client: FirebaseClient,
  args: { task_id: string }
): Promise<string> {
  try {
    const task = await client.getTask(args.task_id)
    
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`)
    }
    
    return JSON.stringify(task, null, 2)
  } catch (error) {
    throw new Error(`Failed to get task: ${error instanceof Error ? error.message : String(error)}`)
  }
}
