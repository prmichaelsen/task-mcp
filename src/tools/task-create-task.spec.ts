/**
 * Tests for task_create_task tool
 */

import { handleTaskCreateTask, taskCreateTaskTool } from './task-create-task.js'
import { FirebaseClient } from '@prmichaelsen/task-core/client'
import type { Task } from '@prmichaelsen/task-core/schemas'

// Mock FirebaseClient
jest.mock('@prmichaelsen/task-core/client')

describe('task_create_task', () => {
  let mockClient: jest.Mocked<FirebaseClient>
  
  beforeEach(() => {
    mockClient = {
      createTask: jest.fn()
    } as any
  })
  
  describe('Tool Definition', () => {
    it('should have correct name', () => {
      expect(taskCreateTaskTool.name).toBe('task_create_task')
    })
    
    it('should have description', () => {
      expect(taskCreateTaskTool.description).toBeTruthy()
    })
    
    it('should require title and description parameters', () => {
      expect(taskCreateTaskTool.inputSchema.required).toContain('title')
      expect(taskCreateTaskTool.inputSchema.required).toContain('description')
    })
    
    it('should have auto_approve as optional parameter', () => {
      expect(taskCreateTaskTool.inputSchema.properties.auto_approve).toBeDefined()
      expect(taskCreateTaskTool.inputSchema.required).not.toContain('auto_approve')
    })
  })
  
  describe('Handler', () => {
    it('should create task with valid inputs', async () => {
      const mockTask: Task = {
        id: 'task-123',
        user_id: 'user-456',
        title: 'New Task',
        description: 'Task description',
        status: 'not_started',
        created_at: '2026-02-19T00:00:00Z',
        updated_at: '2026-02-19T00:00:00Z',
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
          system_prompt: 'You are an AI assistant helping to complete tasks using the Agent Context Protocol (ACP).',
          auto_approve: false
        },
        metadata: {}
      }
      
      mockClient.createTask.mockResolvedValue(mockTask)
      
      const result = await handleTaskCreateTask(mockClient, {
        title: 'New Task',
        description: 'Task description'
      })
      
      const parsed = JSON.parse(result)
      
      expect(parsed.success).toBe(true)
      expect(parsed.task_id).toBe('task-123')
      expect(parsed.task.title).toBe('New Task')
      expect(parsed.task.description).toBe('Task description')
      expect(parsed.task.status).toBe('not_started')
      expect(parsed.message).toContain('created successfully')
      expect(parsed.next_steps).toBeInstanceOf(Array)
      expect(parsed.next_steps.length).toBeGreaterThan(0)
    })
    
    it('should create task with auto_approve enabled', async () => {
      const mockTask: Task = {
        id: 'task-123',
        user_id: 'user-456',
        title: 'Auto Task',
        description: 'Auto approved task',
        status: 'not_started',
        created_at: '2026-02-19T00:00:00Z',
        updated_at: '2026-02-19T00:00:00Z',
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
          system_prompt: 'You are an AI assistant helping to complete tasks using the Agent Context Protocol (ACP).',
          auto_approve: true
        },
        metadata: {}
      }
      
      mockClient.createTask.mockResolvedValue(mockTask)
      
      await handleTaskCreateTask(mockClient, {
        title: 'Auto Task',
        description: 'Auto approved task',
        auto_approve: true
      })
      
      expect(mockClient.createTask).toHaveBeenCalledWith(
        'Auto Task',
        'Auto approved task',
        expect.objectContaining({
          auto_approve: true
        }),
        {}
      )
    })
    
    it('should trim whitespace from title and description', async () => {
      const mockTask: Task = {
        id: 'task-123',
        user_id: 'user-456',
        title: 'Trimmed Task',
        description: 'Trimmed description',
        status: 'not_started',
        created_at: '2026-02-19T00:00:00Z',
        updated_at: '2026-02-19T00:00:00Z',
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
          system_prompt: 'You are an AI assistant helping to complete tasks using the Agent Context Protocol (ACP).',
          auto_approve: false
        },
        metadata: {}
      }
      
      mockClient.createTask.mockResolvedValue(mockTask)
      
      await handleTaskCreateTask(mockClient, {
        title: '  Trimmed Task  ',
        description: '  Trimmed description  '
      })
      
      expect(mockClient.createTask).toHaveBeenCalledWith(
        'Trimmed Task',
        'Trimmed description',
        expect.any(Object),
        {}
      )
    })
    
    it('should throw error if title is empty', async () => {
      await expect(
        handleTaskCreateTask(mockClient, {
          title: '',
          description: 'Valid description'
        })
      ).rejects.toThrow('Task title is required')
    })
    
    it('should throw error if title is only whitespace', async () => {
      await expect(
        handleTaskCreateTask(mockClient, {
          title: '   ',
          description: 'Valid description'
        })
      ).rejects.toThrow('Task title is required')
    })
    
    it('should throw error if description is empty', async () => {
      await expect(
        handleTaskCreateTask(mockClient, {
          title: 'Valid title',
          description: ''
        })
      ).rejects.toThrow('Task description is required')
    })
    
    it('should throw error if description is only whitespace', async () => {
      await expect(
        handleTaskCreateTask(mockClient, {
          title: 'Valid title',
          description: '   '
        })
      ).rejects.toThrow('Task description is required')
    })
    
    it('should throw error if title exceeds 200 characters', async () => {
      const longTitle = 'a'.repeat(201)
      
      await expect(
        handleTaskCreateTask(mockClient, {
          title: longTitle,
          description: 'Valid description'
        })
      ).rejects.toThrow('Task title must be 200 characters or less')
    })
    
    it('should throw error if description exceeds 5000 characters', async () => {
      const longDescription = 'a'.repeat(5001)
      
      await expect(
        handleTaskCreateTask(mockClient, {
          title: 'Valid title',
          description: longDescription
        })
      ).rejects.toThrow('Task description must be 5000 characters or less')
    })
    
    it('should handle client errors gracefully', async () => {
      mockClient.createTask.mockRejectedValue(new Error('Firestore error'))
      
      await expect(
        handleTaskCreateTask(mockClient, {
          title: 'Valid title',
          description: 'Valid description'
        })
      ).rejects.toThrow('Failed to create task: Firestore error')
    })
  })
})
