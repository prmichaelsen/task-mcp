/**
 * MCP Tool: task_get_status
 * 
 * Get current task status and progress information.
 * Returns task title, status, current milestone, and overall progress.
 */

import { FirebaseClient } from '@prmichaelsen/task-core/client'

export const taskGetStatusTool = {
  name: 'task_get_status',
  description: 'Get current task status and progress',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID to get status for'
      }
    },
    required: ['task_id']
  }
}

export async function handleTaskGetStatus(
  client: FirebaseClient,
  args: { task_id: string }
): Promise<string> {
  try {
    const task = await client.getTask(args.task_id)
    
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`)
    }
    
    // Find current milestone details
    const currentMilestone = task.progress.milestones.find(
      m => m.id === task.progress.current_milestone
    )
    
    // Find current task item details
    let currentTaskItem = null
    if (task.progress.current_task && task.progress.current_milestone) {
      const milestoneItems = task.progress.tasks[task.progress.current_milestone] || []
      currentTaskItem = milestoneItems.find(
        item => item.id === task.progress.current_task
      )
    }
    
    return JSON.stringify({
      task_id: task.id,
      task_title: task.title,
      status: task.status,
      overall_progress: task.progress.overall_percentage,
      current_milestone: currentMilestone ? {
        id: currentMilestone.id,
        name: currentMilestone.name,
        status: currentMilestone.status,
        progress: currentMilestone.progress,
        tasks_completed: currentMilestone.tasks_completed,
        tasks_total: currentMilestone.tasks_total
      } : null,
      current_task: currentTaskItem ? {
        id: currentTaskItem.id,
        name: currentTaskItem.name,
        status: currentTaskItem.status
      } : null,
      milestones_summary: {
        total: task.progress.milestones.length,
        completed: task.progress.milestones.filter(m => m.status === 'completed').length,
        in_progress: task.progress.milestones.filter(m => m.status === 'in_progress').length
      }
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to get task status: ${error instanceof Error ? error.message : String(error)}`)
  }
}
