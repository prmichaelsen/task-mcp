/**
 * Tests for task_get_status tool
 */

import { handleTaskGetStatus, taskGetStatusTool } from './task-get-status.js'
import { FirebaseClient } from '@/client.js'
import type { Task } from '@/schemas/task.js'

// Mock FirebaseClient
jest.mock('@/client.js')

describe('task_get_status', () => {
  let mockClient: jest.Mocked<FirebaseClient>
  
  beforeEach(() => {
    mockClient = {
      getTask: jest.fn()
    } as any
  })
  
  describe('Tool Definition', () => {
    it('should have correct name', () => {
      expect(taskGetStatusTool.name).toBe('task_get_status')
    })
    
    it('should have description', () => {
      expect(taskGetStatusTool.description).toBeTruthy()
    })
    
    it('should require task_id parameter', () => {
      expect(taskGetStatusTool.inputSchema.required).toContain('task_id')
    })
  })
  
  describe('Handler', () => {
    it('should return task status for valid task', async () => {
      const mockTask: Task = {
        id: 'task-123',
        user_id: 'user-456',
        title: 'Test Task',
        description: 'Test description',
        status: 'in_progress',
        created_at: '2026-02-16T00:00:00Z',
        updated_at: '2026-02-16T00:00:00Z',
        progress: {
          current_milestone: 'milestone-1',
          current_task: 'task-1',
          overall_percentage: 50,
          milestones: [
            {
              id: 'milestone-1',
              name: 'Milestone 1',
              description: 'First milestone',
              status: 'in_progress',
              progress: 50,
              tasks_completed: 1,
              tasks_total: 2
            }
          ],
          tasks: {
            'milestone-1': [
              {
                id: 'task-1',
                name: 'Task 1',
                description: 'First task',
                status: 'in_progress'
              }
            ]
          }
        },
        execution: {
          api_messages: [],
          task_messages: [],
          tool_results: []
        },
        config: {
          
          system_prompt: '',
          auto_approve: true
        },
        metadata: undefined
      }
      
      mockClient.getTask.mockResolvedValue(mockTask)
      
      const result = await handleTaskGetStatus(mockClient, { task_id: 'task-123' })
      const parsed = JSON.parse(result)
      
      expect(parsed.task_id).toBe('task-123')
      expect(parsed.task_title).toBe('Test Task')
      expect(parsed.status).toBe('in_progress')
      expect(parsed.overall_progress).toBe(50)
      expect(parsed.current_milestone).toBeTruthy()
      expect(parsed.current_milestone.name).toBe('Milestone 1')
      expect(parsed.current_task).toBeTruthy()
      expect(parsed.current_task.name).toBe('Task 1')
    })
    
    it('should throw error if task not found', async () => {
      mockClient.getTask.mockResolvedValue(null)
      
      await expect(
        handleTaskGetStatus(mockClient, { task_id: 'nonexistent' })
      ).rejects.toThrow('Task not found: nonexistent')
    })
    
    it('should handle task with no current milestone', async () => {
      const mockTask: Task = {
        id: 'task-123',
        user_id: 'user-456',
        title: 'Test Task',
        description: 'Test description',
        status: 'not_started',
        created_at: '2026-02-16T00:00:00Z',
        updated_at: '2026-02-16T00:00:00Z',
        progress: {
          current_milestone: '',
          current_task: '',
          overall_percentage: 0,
          milestones: [],
          tasks: {}
        },
        execution: {
          api_messages: [],
          task_messages: [],
          tool_results: []
        },
        config: {
          
          system_prompt: '',
          auto_approve: true
        },
        metadata: undefined
      }
      
      mockClient.getTask.mockResolvedValue(mockTask)
      
      const result = await handleTaskGetStatus(mockClient, { task_id: 'task-123' })
      const parsed = JSON.parse(result)
      
      expect(parsed.current_milestone).toBeNull()
      expect(parsed.current_task).toBeNull()
      expect(parsed.milestones_summary.total).toBe(0)
    })
    
    it('should include milestones summary', async () => {
      const mockTask: Task = {
        id: 'task-123',
        user_id: 'user-456',
        title: 'Test Task',
        description: 'Test description',
        status: 'in_progress',
        created_at: '2026-02-16T00:00:00Z',
        updated_at: '2026-02-16T00:00:00Z',
        progress: {
          current_milestone: 'milestone-2',
          current_task: '',
          overall_percentage: 50,
          milestones: [
            {
              id: 'milestone-1',
              name: 'Milestone 1',
              description: 'First',
              status: 'completed',
              progress: 100,
              tasks_completed: 2,
              tasks_total: 2
            },
            {
              id: 'milestone-2',
              name: 'Milestone 2',
              description: 'Second',
              status: 'in_progress',
              progress: 50,
              tasks_completed: 1,
              tasks_total: 2
            },
            {
              id: 'milestone-3',
              name: 'Milestone 3',
              description: 'Third',
              status: 'not_started',
              progress: 0,
              tasks_completed: 0,
              tasks_total: 2
            }
          ],
          tasks: {}
        },
        execution: {
          api_messages: [],
          task_messages: [],
          tool_results: []
        },
        config: {
          
          system_prompt: '',
          auto_approve: true
        },
        metadata: undefined
      }
      
      mockClient.getTask.mockResolvedValue(mockTask)
      
      const result = await handleTaskGetStatus(mockClient, { task_id: 'task-123' })
      const parsed = JSON.parse(result)
      
      expect(parsed.milestones_summary.total).toBe(3)
      expect(parsed.milestones_summary.completed).toBe(1)
      expect(parsed.milestones_summary.in_progress).toBe(1)
    })
  })
})
