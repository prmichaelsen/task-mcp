/**
 * MCP Tool: task_create_task
 *
 * Create a new task with title, description, and optional configuration.
 * Returns the created task ID and initial status.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'
import type { Task } from '@prmichaelsen/task-core/schemas'

export const taskCreateTaskTool = {
  name: 'task_create_task',
  description: `Create a new task with title and description.

NOTE: Tasks in this system correspond to ACP Projects. The task's progress structure follows the ACP progress.yaml format with:
- Milestones (major phases)
- Task Items (granular work items within milestones)
- Progress tracking (percentages, status, completion dates)

After creating a task, use:
- task_create_milestone to add milestones
- task_create_task_item to add task items to milestones
- task_update_progress to track overall completion

The progress structure matches agent/progress.yaml format but stored as Firestore objects.`,
  inputSchema: {
    type: 'object',
    properties: {
      title: {
        type: 'string',
        description: 'Task title (1-200 characters)'
      },
      description: {
        type: 'string',
        description: 'Task description (1-5000 characters)'
      },
      working_directory: {
        type: 'string',
        description: 'Working directory path for task execution'
      },
      auto_approve: {
        type: 'boolean',
        description: 'Whether to auto-approve task steps (optional)',
        default: false
      }
    },
    required: ['title', 'description', 'working_directory']
  }
}

export async function handleTaskCreateTask(
  client: FirebaseClient,
  args: {
    title: string
    description: string
    working_directory: string
    auto_approve?: boolean
  }
): Promise<string> {
  try {
    // Validate input
    if (!args.title || args.title.trim().length === 0) {
      throw new Error('Task title is required')
    }
    
    if (!args.description || args.description.trim().length === 0) {
      throw new Error('Task description is required')
    }
    
    if (args.title.length > 200) {
      throw new Error('Task title must be 200 characters or less')
    }
    
    if (args.description.length > 5000) {
      throw new Error('Task description must be 5000 characters or less')
    }
    
    // Prepare task configuration
    const config: Partial<Task['config']> = {
      system_prompt: 'You are an AI assistant helping to complete tasks using the Agent Context Protocol (ACP).',
      auto_approve: args.auto_approve ?? false
    }
    
    // Create task in Firestore using FirebaseClient API
    const createdTask = await client.createTask(
      args.title.trim(),
      args.description.trim(),
      args.working_directory,
      config,
      {} // metadata
    )
    
    return JSON.stringify({
      success: true,
      task_id: createdTask.id,
      task: {
        id: createdTask.id,
        title: createdTask.title,
        description: createdTask.description,
        status: createdTask.status,
        created_at: createdTask.created_at
      },
      message: `Task "${createdTask.title}" created successfully`,
      next_steps: [
        'Use task_create_milestone to add milestones',
        'Use task_create_task_item to add tasks to milestones',
        'Use task_get_status to check task progress',
        'Use task_get_next_step to begin work'
      ]
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to create task: ${error instanceof Error ? error.message : String(error)}`)
  }
}
