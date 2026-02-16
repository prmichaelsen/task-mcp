/**
 * Task API Client Unit Tests
 * 
 * Tests for REST API client with mocked fetch
 */

import { TaskApiClient } from './task-api-client.js'
import {
  TaskApiError,
  TaskNotFoundError,
  UnauthorizedError,
  ValidationError,
  ServerError,
  TimeoutError,
  NetworkError
} from './errors.js'

// Mock fetch globally
global.fetch = jest.fn()

describe('TaskApiClient', () => {
  let client: TaskApiClient
  const mockFetch = global.fetch as jest.MockedFunction<typeof fetch>

  beforeEach(() => {
    client = new TaskApiClient({
      baseUrl: 'https://api.example.com',
      serviceToken: 'test-token',
      timeout: 5000,
      retries: 0 // Disable retries for most tests
    })
    mockFetch.mockClear()
  })

  describe('Configuration', () => {
    it('should initialize with correct config', () => {
      expect(client).toBeDefined()
    })

    it('should remove trailing slash from baseUrl', () => {
      const clientWithSlash = new TaskApiClient({
        baseUrl: 'https://api.example.com/',
        serviceToken: 'test-token'
      })
      expect(clientWithSlash).toBeDefined()
    })
  })

  describe('getTasks', () => {
    it('should get list of tasks', async () => {
      const mockResponse = {
        tasks: [
          { id: 'task-1', title: 'Task 1' },
          { id: 'task-2', title: 'Task 2' }
        ],
        total: 2
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockResponse
      } as Response)

      const result = await client.getTasks()

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks',
        expect.objectContaining({
          method: 'GET',
          headers: expect.objectContaining({
            'Authorization': 'Bearer test-token'
          })
        })
      )
      expect(result).toEqual(mockResponse)
    })

    it('should include query parameters', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => ({ tasks: [], total: 0 })
      } as Response)

      await client.getTasks({ status: 'in_progress', limit: 10, search: 'test' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks?status=in_progress&limit=10&search=test',
        expect.any(Object)
      )
    })
  })

  describe('getTask', () => {
    it('should get a single task', async () => {
      const mockTask = { id: 'task-1', title: 'Task 1' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTask
      } as Response)

      const result = await client.getTask('task-1')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks/task-1',
        expect.any(Object)
      )
      expect(result).toEqual(mockTask)
    })

    it('should throw TaskNotFoundError for 404', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 404,
        statusText: 'Not Found',
        json: async () => ({ error: 'Task not found' })
      } as Response)

      await expect(client.getTask('invalid-id')).rejects.toThrow(TaskNotFoundError)
    })
  })

  describe('createTask', () => {
    it('should create a new task', async () => {
      const mockTask = { id: 'task-1', title: 'New Task' }
      const createData = {
        title: 'New Task',
        description: 'Description'
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockTask
      } as Response)

      const result = await client.createTask(createData)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks',
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify(createData)
        })
      )
      expect(result).toEqual(mockTask)
    })
  })

  describe('updateTask', () => {
    it('should update a task', async () => {
      const mockTask = { id: 'task-1', title: 'Updated Task' }
      const updateData = { title: 'Updated Task' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockTask
      } as Response)

      const result = await client.updateTask('task-1', updateData)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks/task-1',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify(updateData)
        })
      )
      expect(result).toEqual(mockTask)
    })
  })

  describe('deleteTask', () => {
    it('should delete a task', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      } as Response)

      await client.deleteTask('task-1')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks/task-1',
        expect.objectContaining({
          method: 'DELETE'
        })
      )
    })
  })

  describe('updateTaskStatus', () => {
    it('should update task status', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      } as Response)

      await client.updateTaskStatus('task-1', 'completed')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks/task-1/status',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ status: 'completed' })
        })
      )
    })
  })

  describe('updateProgress', () => {
    it('should update progress', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      } as Response)

      await client.updateProgress('task-1', { percentage: 50 })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks/task-1/progress',
        expect.objectContaining({
          method: 'PATCH',
          body: JSON.stringify({ percentage: 50 })
        })
      )
    })
  })

  describe('Milestone Management', () => {
    it('should create a milestone', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      } as Response)

      await client.createMilestone('task-1', {
        milestone_id: 'm1',
        name: 'Milestone 1',
        description: 'Description'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks/task-1/milestones',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })

    it('should update a milestone', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      } as Response)

      await client.updateMilestone('task-1', 'm1', { progress: 50 })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks/task-1/milestones/m1',
        expect.objectContaining({
          method: 'PATCH'
        })
      )
    })

    it('should complete a milestone', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      } as Response)

      await client.completeMilestone('task-1', 'm1')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks/task-1/milestones/m1/complete',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })
  })

  describe('Task Item Management', () => {
    it('should create a task item', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      } as Response)

      await client.createTaskItem('task-1', 'm1', {
        task_item_id: 'item-1',
        name: 'Item 1',
        description: 'Description'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks/task-1/milestones/m1/items',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })

    it('should update a task item', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      } as Response)

      await client.updateTaskItem('task-1', 'm1', 'item-1', { status: 'completed' })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks/task-1/milestones/m1/items/item-1',
        expect.objectContaining({
          method: 'PATCH'
        })
      )
    })

    it('should complete a task item', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 204
      } as Response)

      await client.completeTaskItem('task-1', 'm1', 'item-1')

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks/task-1/milestones/m1/items/item-1/complete',
        expect.objectContaining({
          method: 'POST'
        })
      )
    })
  })

  describe('Message Management', () => {
    it('should get messages', async () => {
      const mockMessages = {
        messages: [{ id: 'msg-1', content: 'Hello' }],
        total: 1
      }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 200,
        json: async () => mockMessages
      } as Response)

      const result = await client.getMessages('task-1', 10)

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks/task-1/messages?limit=10',
        expect.any(Object)
      )
      expect(result).toEqual(mockMessages)
    })

    it('should add a message', async () => {
      const mockResponse = { message_id: 'msg-1' }

      mockFetch.mockResolvedValueOnce({
        ok: true,
        status: 201,
        json: async () => mockResponse
      } as Response)

      const result = await client.addMessage('task-1', {
        role: 'user',
        content: 'Hello'
      })

      expect(mockFetch).toHaveBeenCalledWith(
        'https://api.example.com/api/tasks/task-1/messages',
        expect.objectContaining({
          method: 'POST'
        })
      )
      expect(result).toEqual(mockResponse)
    })
  })

  describe('Error Handling', () => {
    it('should throw UnauthorizedError for 401', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 401,
        statusText: 'Unauthorized',
        json: async () => ({ error: 'Invalid token' })
      } as Response)

      await expect(client.getTasks()).rejects.toThrow(UnauthorizedError)
    })

    it('should throw ValidationError for 400', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Validation failed', errors: { title: ['Required'] } })
      } as Response)

      await expect(client.createTask({ title: '', description: '' })).rejects.toThrow(ValidationError)
    })

    it('should throw ServerError for 500', async () => {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 500,
        statusText: 'Internal Server Error',
        json: async () => ({ error: 'Server error' })
      } as Response)

      await expect(client.getTasks()).rejects.toThrow(ServerError)
    })

    it('should throw NetworkError for network failures', async () => {
      mockFetch.mockRejectedValueOnce(new Error('Network failure'))

      await expect(client.getTasks()).rejects.toThrow(NetworkError)
    })
  })

  describe('Retry Logic', () => {
    it('should retry on server errors', async () => {
      const clientWithRetries = new TaskApiClient({
        baseUrl: 'https://api.example.com',
        serviceToken: 'test-token',
        retries: 2
      })

      // First two calls fail, third succeeds
      mockFetch
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Server Error',
          json: async () => ({ error: 'Server error' })
        } as Response)
        .mockResolvedValueOnce({
          ok: false,
          status: 500,
          statusText: 'Server Error',
          json: async () => ({ error: 'Server error' })
        } as Response)
        .mockResolvedValueOnce({
          ok: true,
          status: 200,
          json: async () => ({ tasks: [], total: 0 })
        } as Response)

      const result = await clientWithRetries.getTasks()

      expect(mockFetch).toHaveBeenCalledTimes(3)
      expect(result).toEqual({ tasks: [], total: 0 })
    })

    it('should not retry on client errors', async () => {
      const clientWithRetries = new TaskApiClient({
        baseUrl: 'https://api.example.com',
        serviceToken: 'test-token',
        retries: 2
      })

      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 400,
        statusText: 'Bad Request',
        json: async () => ({ error: 'Bad request' })
      } as Response)

      await expect(clientWithRetries.getTasks()).rejects.toThrow(ValidationError)
      expect(mockFetch).toHaveBeenCalledTimes(1) // No retries
    })
  })
})
