/**
 * MCP Tool: task_get_next_step
 * 
 * Get instructions for the next step in the current task.
 * Returns the current task item with steps and verification criteria.
 */

import { FirebaseClient } from '@/client.js'

export const taskGetNextStepTool = {
  name: 'task_get_next_step',
  description: 'Get instructions for the next step in the current task',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID'
      }
    },
    required: ['task_id']
  }
}

export async function handleTaskGetNextStep(
  client: FirebaseClient,
  args: { task_id: string }
): Promise<string> {
  try {
    const task = await client.getTask(args.task_id)
    
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`)
    }
    
    // Check if task is paused or completed
    if (task.status === 'paused') {
      return JSON.stringify({
        status: 'paused',
        message: 'Task is paused. Resume the task to continue.',
        instructions: null
      }, null, 2)
    }
    
    if (task.status === 'completed') {
      return JSON.stringify({
        status: 'completed',
        message: 'Task is already completed.',
        instructions: null
      }, null, 2)
    }
    
    // Find current milestone
    const currentMilestone = task.progress.milestones.find(
      m => m.id === task.progress.current_milestone
    )
    
    if (!currentMilestone) {
      return JSON.stringify({
        status: 'no_milestone',
        message: 'No current milestone. Create milestones to begin work.',
        instructions: 'Use task_create_milestone to add milestones to this task.'
      }, null, 2)
    }
    
    // Find current task item
    const milestoneItems = task.progress.tasks[task.progress.current_milestone] || []
    const currentTaskItem = milestoneItems.find(
      item => item.id === task.progress.current_task
    )
    
    if (!currentTaskItem) {
      // Find next not_started or in_progress task
      const nextTask = milestoneItems.find(
        item => item.status === 'not_started' || item.status === 'in_progress'
      )
      
      if (!nextTask) {
        return JSON.stringify({
          status: 'milestone_complete',
          message: `Milestone "${currentMilestone.name}" is complete.`,
          instructions: 'Move to the next milestone or complete the task.',
          current_milestone: currentMilestone.name
        }, null, 2)
      }
      
      return JSON.stringify({
        status: 'ready',
        current_milestone: {
          id: currentMilestone.id,
          name: currentMilestone.name
        },
        next_task: {
          id: nextTask.id,
          name: nextTask.name,
          description: nextTask.description,
          status: nextTask.status,
          estimated_hours: nextTask.estimated_hours
        },
        instructions: `Begin work on: ${nextTask.name}\n\nDescription: ${nextTask.description}`
      }, null, 2)
    }
    
    // Return current task item details
    return JSON.stringify({
      status: 'in_progress',
      current_milestone: {
        id: currentMilestone.id,
        name: currentMilestone.name,
        progress: currentMilestone.progress
      },
      current_task: {
        id: currentTaskItem.id,
        name: currentTaskItem.name,
        description: currentTaskItem.description,
        status: currentTaskItem.status,
        estimated_hours: currentTaskItem.estimated_hours,
        notes: currentTaskItem.notes
      },
      instructions: `Continue work on: ${currentTaskItem.name}\n\nDescription: ${currentTaskItem.description}${currentTaskItem.notes ? `\n\nNotes: ${currentTaskItem.notes}` : ''}`
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to get next step: ${error instanceof Error ? error.message : String(error)}`)
  }
}
