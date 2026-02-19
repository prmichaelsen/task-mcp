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
  
  const createMockTask = (title: string, autoApprove: boolean = false): Task => ({
    id: 'task-123',
    user_id: 'user-456',
    title,
    description: 'Task description',
    status: 'not_started',
    created_at: '2026-02-19T00:00:00Z',
    updated_at: '2026-02-19T00:00:00Z',
    machine_id: 'test-machine',
    working_directory: '/test/path',
    progress: {
      project: {
        name: 'Test',
        version: '1.0.0',
        started: '2026-02-19',
        status: 'not_started' as const,
        current_milestone: '',
        description: 'Test'
      },
      milestones: [],
      tasks: {},
      documentation: {
        design_documents: 0,
        milestone_documents: 0,
        pattern_documents: 0,
        task_documents: 0,
        last_updated: '2026-02-19'
      },
      progress: {
        planning: 0,
        implementation: 0,
        testing: 0,
        documentation: 0,
        overall: 0
      },
      recent_work: [],
      next_steps: [],
      notes: [],
      current_blockers: []
    },
    execution: {
      api_messages: [],
      task_messages: [],
      tool_results: []
    },
    config: {
      system_prompt: 'You are an AI assistant helping to complete tasks using the Agent Context Protocol (ACP).',
      auto_approve: autoApprove
    },
    metadata: {}
  })
  
  describe('Tool Definition', () => {
    it('should have correct name', () => {
      expect(taskCreateTaskTool.name).toBe('task_create_task')
    })
    
    it('should have description', () => {
      expect(taskCreateTaskTool.description).toBeTruthy()
    })
    
    it('should require title, description, and working_directory parameters', () => {
      expect(taskCreateTaskTool.inputSchema.required).toContain('title')
      expect(taskCreateTaskTool.inputSchema.required).toContain('description')
      expect(taskCreateTaskTool.inputSchema.required).toContain('working_directory')
    })
    
    it('should have auto_approve as optional parameter', () => {
      expect(taskCreateTaskTool.inputSchema.properties.auto_approve).toBeDefined()
      expect(taskCreateTaskTool.inputSchema.required).not.toContain('auto_approve')
    })
  })
  
  describe('Handler', () => {
    it('should create task with valid inputs', async () => {
      const mockTask = createMockTask('New Task')
      mockClient.createTask.mockResolvedValue(mockTask)
      
      const result = await handleTaskCreateTask(mockClient, {
        title: 'New Task',
        description: 'Task description',
        working_directory: '/test/path'
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
      const mockTask = createMockTask('Auto Task', true)
      mockClient.createTask.mockResolvedValue(mockTask)
      
      await handleTaskCreateTask(mockClient, {
        title: 'Auto Task',
        description: 'Auto approved task',
        working_directory: '/test/path',
        auto_approve: true
      })
      
      expect(mockClient.createTask).toHaveBeenCalledWith(
        'Auto Task',
        'Auto approved task',
        '/test/path',
        expect.objectContaining({
          auto_approve: true
        }),
        {}
      )
    })
    
    it('should trim whitespace from title and description', async () => {
      const mockTask = createMockTask('Trimmed Task')
      mockClient.createTask.mockResolvedValue(mockTask)
      
      await handleTaskCreateTask(mockClient, {
        title: '  Trimmed Task  ',
        description: '  Trimmed description  ',
        working_directory: '/test/path'
      })
      
      expect(mockClient.createTask).toHaveBeenCalledWith(
        'Trimmed Task',
        'Trimmed description',
        '/test/path',
        expect.any(Object),
        {}
      )
    })
    
    it('should throw error if title is empty', async () => {
      await expect(
        handleTaskCreateTask(mockClient, {
          title: '',
          description: 'Valid description',
          working_directory: '/test/path'
        })
      ).rejects.toThrow('Task title is required')
    })
    
    it('should throw error if title is only whitespace', async () => {
      await expect(
        handleTaskCreateTask(mockClient, {
          title: '   ',
          description: 'Valid description',
          working_directory: '/test/path'
        })
      ).rejects.toThrow('Task title is required')
    })
    
    it('should throw error if description is empty', async () => {
      await expect(
        handleTaskCreateTask(mockClient, {
          title: 'Valid title',
          description: '',
          working_directory: '/test/path'
        })
      ).rejects.toThrow('Task description is required')
    })
    
    it('should throw error if description is only whitespace', async () => {
      await expect(
        handleTaskCreateTask(mockClient, {
          title: 'Valid title',
          description: '   ',
          working_directory: '/test/path'
        })
      ).rejects.toThrow('Task description is required')
    })
    
    it('should throw error if title exceeds 200 characters', async () => {
      const longTitle = 'a'.repeat(201)
      
      await expect(
        handleTaskCreateTask(mockClient, {
          title: longTitle,
          description: 'Valid description',
          working_directory: '/test/path'
        })
      ).rejects.toThrow('Task title must be 200 characters or less')
    })
    
    it('should throw error if description exceeds 5000 characters', async () => {
      const longDescription = 'a'.repeat(5001)
      
      await expect(
        handleTaskCreateTask(mockClient, {
          title: 'Valid title',
          description: longDescription,
          working_directory: '/test/path'
        })
      ).rejects.toThrow('Task description must be 5000 characters or less')
    })
    
    it('should handle client errors gracefully', async () => {
      mockClient.createTask.mockRejectedValue(new Error('Firestore error'))
      
      await expect(
        handleTaskCreateTask(mockClient, {
          title: 'Valid title',
          description: 'Valid description',
          working_directory: '/test/path'
        })
      ).rejects.toThrow('Failed to create task: Firestore error')
    })
  })
})
