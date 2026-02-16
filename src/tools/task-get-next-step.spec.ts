/**
 * Tests for task_get_next_step tool
 */

import { handleTaskGetNextStep, taskGetNextStepTool } from './task-get-next-step.js'
import { FirebaseClient } from '@/client.js'
import type { Task } from '@/schemas/task.js'

jest.mock('@/client.js')

describe('task_get_next_step', () => {
  let mockClient: jest.Mocked<FirebaseClient>
  
  beforeEach(() => {
    mockClient = {
      getTask: jest.fn()
    } as any
  })
  
  describe('Tool Definition', () => {
    it('should have correct name', () => {
      expect(taskGetNextStepTool.name).toBe('task_get_next_step')
    })
    
    it('should require task_id parameter', () => {
      expect(taskGetNextStepTool.inputSchema.required).toContain('task_id')
    })
  })
  
  describe('Handler', () => {
    it('should return paused status for paused task', async () => {
      const mockTask: Task = {
        id: 'task-123',
        user_id: 'user-456',
        title: 'Test Task',
        description: 'Test',
        status: 'paused',
        created_at: '2026-02-16T00:00:00Z',
        updated_at: '2026-02-16T00:00:00Z',
        progress: {
          current_milestone: '',
          current_task: '',
          overall_percentage: 0,
          milestones: [],
          tasks: {}
        },
        execution: { api_messages: [], task_messages: [], tool_results: [] },
        config: { model: 'claude-3', system_prompt: '', auto_approve: true },
        metadata: undefined
      }
      
      mockClient.getTask.mockResolvedValue(mockTask)
      
      const result = await handleTaskGetNextStep(mockClient, { task_id: 'task-123' })
      const parsed = JSON.parse(result)
      
      expect(parsed.status).toBe('paused')
      expect(parsed.instructions).toBeNull()
    })
    
    it('should return no_milestone status when no milestones exist', async () => {
      const mockTask: Task = {
        id: 'task-123',
        user_id: 'user-456',
        title: 'Test Task',
        description: 'Test',
        status: 'in_progress',
        created_at: '2026-02-16T00:00:00Z',
        updated_at: '2026-02-16T00:00:00Z',
        progress: {
          current_milestone: '',
          current_task: '',
          overall_percentage: 0,
          milestones: [],
          tasks: {}
        },
        execution: { api_messages: [], task_messages: [], tool_results: [] },
        config: { model: 'claude-3', system_prompt: '', auto_approve: true },
        metadata: undefined
      }
      
      mockClient.getTask.mockResolvedValue(mockTask)
      
      const result = await handleTaskGetNextStep(mockClient, { task_id: 'task-123' })
      const parsed = JSON.parse(result)
      
      expect(parsed.status).toBe('no_milestone')
    })
    
    it('should return current task instructions', async () => {
      const mockTask: Task = {
        id: 'task-123',
        user_id: 'user-456',
        title: 'Test Task',
        description: 'Test',
        status: 'in_progress',
        created_at: '2026-02-16T00:00:00Z',
        updated_at: '2026-02-16T00:00:00Z',
        progress: {
          current_milestone: 'milestone-1',
          current_task: 'task-1',
          overall_percentage: 50,
          milestones: [{
            id: 'milestone-1',
            name: 'Milestone 1',
            description: 'First milestone',
            status: 'in_progress',
            progress: 50,
            tasks_completed: 0,
            tasks_total: 2
          }],
          tasks: {
            'milestone-1': [{
              id: 'task-1',
              name: 'Task 1',
              description: 'First task',
              status: 'in_progress'
            }]
          }
        },
        execution: { api_messages: [], task_messages: [], tool_results: [] },
        config: { model: 'claude-3', system_prompt: '', auto_approve: true },
        metadata: undefined
      }
      
      mockClient.getTask.mockResolvedValue(mockTask)
      
      const result = await handleTaskGetNextStep(mockClient, { task_id: 'task-123' })
      const parsed = JSON.parse(result)
      
      expect(parsed.status).toBe('in_progress')
      expect(parsed.current_task.name).toBe('Task 1')
      expect(parsed.instructions).toContain('Task 1')
    })
  })
})
