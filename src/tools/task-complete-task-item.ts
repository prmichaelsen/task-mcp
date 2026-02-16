/**
 * MCP Tool: task_complete_task_item
 * 
 * Mark a task item as complete and update milestone progress.
 */

import { FirebaseClient } from '@/client.js'

export const taskCompleteTaskItemTool = {
  name: 'task_complete_task_item',
  description: 'Mark a task item as complete',
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
        description: 'Task item ID to complete'
      }
    },
    required: ['task_id', 'milestone_id', 'task_item_id']
  }
}

export async function handleTaskCompleteTaskItem(
  client: FirebaseClient,
  args: { task_id: string; milestone_id: string; task_item_id: string }
): Promise<string> {
  try {
    // Complete the task item
    await client.completeTaskItem(args.task_id, args.milestone_id, args.task_item_id)
    
    // Get updated task to calculate new progress
    const task = await client.getTask(args.task_id)
    
    if (!task) {
      throw new Error('Task not found after update')
    }
    
    // Find the milestone
    const milestone = task.progress.milestones.find(m => m.id === args.milestone_id)
    const milestoneItems = task.progress.tasks[args.milestone_id] || []
    const completedCount = milestoneItems.filter(item => item.status === 'completed').length
    
    // Update milestone progress
    const milestoneProgress = milestone ? Math.round((completedCount / milestoneItems.length) * 100) : 0
    
    if (milestone && milestone.progress !== milestoneProgress) {
      await client.updateMilestone(args.task_id, args.milestone_id, {
        progress: milestoneProgress,
        tasks_completed: completedCount,
        tasks_total: milestoneItems.length
      })
    }
    
    // Find next task
    const nextTask = milestoneItems.find(
      item => item.status === 'not_started' || item.status === 'in_progress'
    )
    
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      completed_task: args.task_item_id,
      milestone_progress: milestoneProgress,
      milestone_tasks_completed: completedCount,
      milestone_tasks_total: milestoneItems.length,
      next_task: nextTask ? {
        id: nextTask.id,
        name: nextTask.name
      } : null,
      message: nextTask 
        ? `Task item completed. Next: ${nextTask.name}`
        : 'Task item completed. Milestone complete!'
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to complete task item: ${error instanceof Error ? error.message : String(error)}`)
  }
}
