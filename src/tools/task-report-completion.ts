/**
 * MCP Tool: task_report_completion
 * 
 * Agent reports completion of a task item and gets next instructions.
 * This is a convenience tool that combines completing a task item and getting the next step.
 */

import { FirebaseClient } from '@/client.js'
import { handleTaskCompleteTaskItem } from './task-complete-task-item.js'
import { handleTaskGetNextStep } from './task-get-next-step.js'

export const taskReportCompletionTool = {
  name: 'task_report_completion',
  description: 'Report completion of a task item and get next instructions',
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
        description: 'Task item ID that was completed'
      },
      notes: {
        type: 'string',
        description: 'Optional notes about the completion'
      }
    },
    required: ['task_id', 'milestone_id', 'task_item_id']
  }
}

export async function handleTaskReportCompletion(
  client: FirebaseClient,
  args: { 
    task_id: string
    milestone_id: string
    task_item_id: string
    notes?: string
  }
): Promise<string> {
  try {
    // Add notes if provided
    if (args.notes) {
      await client.updateTaskItem(
        args.task_id,
        args.milestone_id,
        args.task_item_id,
        { notes: args.notes }
      )
    }
    
    // Complete the task item
    const completionResult = await handleTaskCompleteTaskItem(client, {
      task_id: args.task_id,
      milestone_id: args.milestone_id,
      task_item_id: args.task_item_id
    })
    
    // Get next step
    const nextStepResult = await handleTaskGetNextStep(client, {
      task_id: args.task_id
    })
    
    const completion = JSON.parse(completionResult)
    const nextStep = JSON.parse(nextStepResult)
    
    return JSON.stringify({
      completion: {
        success: completion.success,
        completed_task: completion.completed_task,
        milestone_progress: completion.milestone_progress
      },
      next_step: nextStep,
      message: completion.message
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to report completion: ${error instanceof Error ? error.message : String(error)}`)
  }
}
