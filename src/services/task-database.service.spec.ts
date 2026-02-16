/**
 * Unit Tests for TaskDatabaseService
 *
 * Tests all CRUD operations, message operations, and progress tracking
 * with mocked Firestore.
 */

import { describe, it, expect, jest, beforeAll, beforeEach } from '@jest/globals'
import { TaskDatabaseService } from '../../src/services/task-database.service.js'
import type { Task, Milestone, TaskItem } from '../../src/schemas/task.js'

// Mock Firestore
const mockGet = jest.fn<any>()
const mockAdd = jest.fn<any>()
const mockUpdate = jest.fn<any>()
const mockDelete = jest.fn<any>()
const mockWhere = jest.fn<any>()
const mockOrderBy = jest.fn<any>()
const mockLimit = jest.fn<any>()
const mockBatch = jest.fn<any>()
const mockCommit = jest.fn<any>()

const mockDoc = jest.fn<any>(() => ({
  get: mockGet,
  update: mockUpdate,
  delete: mockDelete
}))

const mockCollection = jest.fn<any>(() => ({
  add: mockAdd,
  get: mockGet,
  where: mockWhere,
  orderBy: mockOrderBy,
  limit: mockLimit,
  doc: mockDoc
}))

const mockDb = {
  collection: mockCollection,
  doc: mockDoc,
  batch: mockBatch
} as any

// Mock firebase-admin/firestore
jest.mock('firebase-admin/firestore', () => ({
  getFirestore: jest.fn(() => mockDb),
  FieldValue: {
    arrayUnion: jest.fn((value: any) => ({ _methodName: 'arrayUnion', _elements: [value] }))
  }
}))

describe('TaskDatabaseService', () => {
  beforeAll(() => {
    TaskDatabaseService.initialize(mockDb)
  })

  beforeEach(() => {
    jest.clearAllMocks()
    
    // Setup default mock chain
    mockWhere.mockReturnThis()
    mockOrderBy.mockReturnThis()
    mockLimit.mockReturnThis()
    mockBatch.mockReturnValue({
      delete: jest.fn().mockReturnThis(),
      commit: mockCommit
    })
  })

  describe('createTask', () => {
    it('should create a task with default config', async () => {
      const mockTaskId = 'task-123'
      mockAdd.mockResolvedValue({ id: mockTaskId })

      const task = await TaskDatabaseService.createTask(
        'user-456',
        'Test Task',
        'Test Description'
      )

      expect(task.id).toBe(mockTaskId)
      expect(task.title).toBe('Test Task')
      expect(task.description).toBe('Test Description')
      expect(task.user_id).toBe('user-456')
      expect(task.status).toBe('not_started')
      expect(task.config.auto_approve).toBe(true)
      expect(mockCollection).toHaveBeenCalledWith('users/user-456/tasks')
      expect(mockAdd).toHaveBeenCalled()
    })

    it('should create a task with custom config', async () => {
      const mockTaskId = 'task-789'
      mockAdd.mockResolvedValue({ id: mockTaskId })

      const task = await TaskDatabaseService.createTask(
        'user-456',
        'Custom Task',
        'Custom Description',
        {
          model: 'custom-model',
          auto_approve: false,
          max_iterations: 50
        }
      )

      expect(task.config.model).toBe('custom-model')
      expect(task.config.auto_approve).toBe(false)
      expect(task.config.max_iterations).toBe(50)
    })
  })

  describe('getTask', () => {
    it('should return a task if it exists', async () => {
      const mockTaskData = {
        user_id: 'user-456',
        title: 'Test Task',
        description: 'Test Description',
        status: 'in_progress',
        created_at: '2026-02-16T00:00:00Z',
        updated_at: '2026-02-16T00:00:00Z',
        progress: {
          current_milestone: 'M1',
          current_task: 'task-1',
          overall_percentage: 50,
          milestones: [],
          tasks: {}
        },
        execution: {
          api_messages: [],
          task_messages: [],
          tool_results: []
        },
        config: {
          model: 'test-model',
          system_prompt: 'test',
          auto_approve: true
        }
      }

      mockGet.mockResolvedValue({
        exists: true,
        id: 'task-123',
        data: () => mockTaskData
      })

      const task = await TaskDatabaseService.getTask('user-456', 'task-123')

      expect(task).not.toBeNull()
      expect(task?.id).toBe('task-123')
      expect(task?.title).toBe('Test Task')
      expect(mockDoc).toHaveBeenCalledWith('users/user-456/tasks/task-123')
    })

    it('should return null if task does not exist', async () => {
      mockGet.mockResolvedValue({
        exists: false
      })

      const task = await TaskDatabaseService.getTask('user-456', 'nonexistent')

      expect(task).toBeNull()
    })
  })

  describe('updateTaskStatus', () => {
    it('should update task status to in_progress and set started_at', async () => {
      mockUpdate.mockResolvedValue(undefined)

      await TaskDatabaseService.updateTaskStatus('user-456', 'task-123', 'in_progress')

      expect(mockDoc).toHaveBeenCalledWith('users/user-456/tasks/task-123')
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'in_progress',
          started_at: expect.any(String),
          updated_at: expect.any(String)
        })
      )
    })

    it('should update task status to completed and set completed_at', async () => {
      mockUpdate.mockResolvedValue(undefined)

      await TaskDatabaseService.updateTaskStatus('user-456', 'task-123', 'completed')

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
          completed_at: expect.any(String),
          updated_at: expect.any(String)
        })
      )
    })
  })

  describe('deleteTask', () => {
    it('should delete task and all its messages', async () => {
      const mockMessages = [
        { ref: { path: 'msg1' } },
        { ref: { path: 'msg2' } }
      ]

      mockGet.mockResolvedValue({
        docs: mockMessages
      })

      const mockBatchInstance = {
        delete: jest.fn().mockReturnThis(),
        commit: jest.fn<any>().mockResolvedValue(undefined)
      }

      mockBatch.mockReturnValue(mockBatchInstance)

      await TaskDatabaseService.deleteTask('user-456', 'task-123')

      expect(mockCollection).toHaveBeenCalledWith('users/user-456/tasks/task-123/messages')
      expect(mockBatchInstance.delete).toHaveBeenCalledTimes(3) // 2 messages + 1 task
      expect(mockBatchInstance.commit).toHaveBeenCalled()
    })
  })

  describe('listTasks', () => {
    it('should return list of tasks', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          data: () => ({
            user_id: 'user-456',
            title: 'Task 1',
            description: 'Description 1',
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
              model: 'test',
              system_prompt: '',
              auto_approve: true
            }
          })
        }
      ]

      mockGet.mockResolvedValue({
        docs: mockTasks
      })

      const tasks = await TaskDatabaseService.listTasks('user-456', 10)

      expect(tasks).toHaveLength(1)
      expect(tasks[0].id).toBe('task-1')
      expect(mockOrderBy).toHaveBeenCalledWith('created_at', 'desc')
      expect(mockLimit).toHaveBeenCalledWith(10)
    })
  })

  describe('addMessage', () => {
    it('should add a message to a task', async () => {
      const mockMessageId = 'msg-123'
      mockAdd.mockResolvedValue({ id: mockMessageId })

      const messageId = await TaskDatabaseService.addMessage(
        'user-456',
        'task-123',
        'assistant',
        'Test message'
      )

      expect(messageId).toBe(mockMessageId)
      expect(mockCollection).toHaveBeenCalledWith('users/user-456/tasks/task-123/messages')
      expect(mockAdd).toHaveBeenCalledWith(
        expect.objectContaining({
          task_id: 'task-123',
          role: 'assistant',
          content: 'Test message',
          timestamp: expect.any(String)
        })
      )
    })
  })

  describe('getMessages', () => {
    it('should return messages for a task', async () => {
      const mockMessages = [
        {
          id: 'msg-1',
          data: () => ({
            task_id: 'task-123',
            role: 'user',
            content: 'Hello',
            timestamp: '2026-02-16T00:00:00Z'
          })
        },
        {
          id: 'msg-2',
          data: () => ({
            task_id: 'task-123',
            role: 'assistant',
            content: 'Hi there',
            timestamp: '2026-02-16T00:01:00Z'
          })
        }
      ]

      mockGet.mockResolvedValue({
        docs: mockMessages
      })

      const messages = await TaskDatabaseService.getMessages('user-456', 'task-123')

      expect(messages).toHaveLength(2)
      expect(messages[0].role).toBe('user')
      expect(messages[1].role).toBe('assistant')
      expect(mockOrderBy).toHaveBeenCalledWith('timestamp', 'asc')
    })
  })

  describe('updateOverallProgress', () => {
    it('should update overall progress percentage', async () => {
      mockUpdate.mockResolvedValue(undefined)

      await TaskDatabaseService.updateOverallProgress('user-456', 'task-123', 75)

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          'progress.overall_percentage': 75,
          updated_at: expect.any(String)
        })
      )
    })

    it('should clamp progress to 0-100 range', async () => {
      mockUpdate.mockResolvedValue(undefined)

      await TaskDatabaseService.updateOverallProgress('user-456', 'task-123', 150)

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          'progress.overall_percentage': 100
        })
      )

      await TaskDatabaseService.updateOverallProgress('user-456', 'task-123', -10)

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          'progress.overall_percentage': 0
        })
      )
    })
  })

  describe('getTasksByStatus', () => {
    it('should return tasks filtered by status', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          data: () => ({
            user_id: 'user-456',
            title: 'Active Task',
            description: 'Description',
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
            execution: {
              api_messages: [],
              task_messages: [],
              tool_results: []
            },
            config: {
              model: 'test',
              system_prompt: '',
              auto_approve: true
            }
          })
        }
      ]

      mockGet.mockResolvedValue({
        docs: mockTasks
      })

      const tasks = await TaskDatabaseService.getTasksByStatus('user-456', 'in_progress')

      expect(tasks).toHaveLength(1)
      expect(tasks[0].status).toBe('in_progress')
      expect(mockWhere).toHaveBeenCalledWith('status', '==', 'in_progress')
    })
  })

  describe('searchTasksByTitle', () => {
    it('should search tasks by title and description', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          data: () => ({
            user_id: 'user-456',
            title: 'Build MCP Server',
            description: 'Create task-mcp server',
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
            execution: {
              api_messages: [],
              task_messages: [],
              tool_results: []
            },
            config: {
              model: 'test',
              system_prompt: '',
              auto_approve: true
            }
          })
        },
        {
          id: 'task-2',
          data: () => ({
            user_id: 'user-456',
            title: 'Write Documentation',
            description: 'Document the API',
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
              model: 'test',
              system_prompt: '',
              auto_approve: true
            }
          })
        }
      ]

      mockGet.mockResolvedValue({
        docs: mockTasks
      })

      const results = await TaskDatabaseService.searchTasksByTitle('user-456', 'mcp')

      expect(results).toHaveLength(1)
      expect(results[0].title).toBe('Build MCP Server')
    })
  })
})
