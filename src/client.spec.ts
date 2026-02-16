/**
 * Unit Tests for FirebaseClient
 */

import { describe, it, expect, jest, beforeEach, afterEach } from '@jest/globals'
import { FirebaseClient } from '@/client.js'
import * as firebaseApp from 'firebase-admin/app'
import * as firebaseFirestore from 'firebase-admin/firestore'
import { TaskDatabaseService } from '@/services/task-database.service.js'

// Mock Firebase Admin
jest.mock('firebase-admin/app')
jest.mock('firebase-admin/firestore')
jest.mock('@/services/task-database.service.js')

describe('FirebaseClient', () => {
  const mockUserId = 'test-user-123'
  const mockServiceAccountPath = './test-service-account.json'
  
  let client: FirebaseClient
  let mockApp: any
  let mockDb: any

  beforeEach(() => {
    // Setup mocks
    mockApp = { name: `task-mcp-${mockUserId}` }
    mockDb = {}
    
    ;(firebaseApp.getApps as jest.Mock<any>).mockReturnValue([])
    ;(firebaseApp.initializeApp as jest.Mock<any>).mockReturnValue(mockApp)
    ;(firebaseApp.cert as jest.Mock<any>).mockReturnValue({})
    ;(firebaseFirestore.getFirestore as jest.Mock<any>).mockReturnValue(mockDb)
    ;(TaskDatabaseService.initialize as jest.Mock<any>).mockReturnValue(undefined)
  })

  afterEach(() => {
    jest.clearAllMocks()
  })

  describe('Constructor', () => {
    it('should create client with userId', () => {
      client = new FirebaseClient({
        userId: mockUserId,
        serviceAccountPath: mockServiceAccountPath
      })
      
      expect(client).toBeDefined()
    })

    it('should throw error if userId is missing', () => {
      expect(() => {
        new FirebaseClient({
          userId: '',
          serviceAccountPath: mockServiceAccountPath
        })
      }).toThrow('userId is required')
    })
  })

  describe('connect', () => {
    it('should initialize Firebase with service account path', async () => {
      client = new FirebaseClient({
        userId: mockUserId,
        serviceAccountPath: mockServiceAccountPath
      })
      
      await client.connect()
      
      expect(firebaseApp.cert).toHaveBeenCalledWith(mockServiceAccountPath)
      expect(firebaseApp.initializeApp).toHaveBeenCalled()
      expect(firebaseFirestore.getFirestore).toHaveBeenCalledWith(mockApp)
      expect(TaskDatabaseService.initialize).toHaveBeenCalledWith(mockDb)
    })

    it('should initialize Firebase with service account JSON', async () => {
      const mockServiceAccount = { type: 'service_account', project_id: 'test' }
      
      client = new FirebaseClient({
        userId: mockUserId,
        serviceAccountJson: JSON.stringify(mockServiceAccount)
      })
      
      await client.connect()
      
      expect(firebaseApp.cert).toHaveBeenCalledWith(mockServiceAccount)
      expect(firebaseApp.initializeApp).toHaveBeenCalled()
    })

    it('should reuse existing app if already initialized', async () => {
      const existingApp = { name: `task-mcp-${mockUserId}` }
      ;(firebaseApp.getApps as jest.Mock<any>).mockReturnValue([existingApp])
      
      client = new FirebaseClient({
        userId: mockUserId,
        serviceAccountPath: mockServiceAccountPath
      })
      
      await client.connect()
      
      expect(firebaseApp.initializeApp).not.toHaveBeenCalled()
      expect(firebaseFirestore.getFirestore).toHaveBeenCalledWith(existingApp)
    })

    it('should not reconnect if already connected', async () => {
      client = new FirebaseClient({
        userId: mockUserId,
        serviceAccountPath: mockServiceAccountPath
      })
      
      await client.connect()
      await client.connect() // Second call
      
      expect(firebaseApp.initializeApp).toHaveBeenCalledTimes(1)
    })
  })

  describe('disconnect', () => {
    it('should delete app and cleanup', async () => {
      ;(firebaseApp.deleteApp as jest.Mock<any>).mockResolvedValue(undefined)
      
      client = new FirebaseClient({
        userId: mockUserId,
        serviceAccountPath: mockServiceAccountPath
      })
      
      await client.connect()
      await client.disconnect()
      
      expect(firebaseApp.deleteApp).toHaveBeenCalledWith(mockApp)
      expect(client.isConnected()).toBe(false)
    })
  })

  describe('Task Operations', () => {
    beforeEach(async () => {
      client = new FirebaseClient({
        userId: mockUserId,
        serviceAccountPath: mockServiceAccountPath
      })
      await client.connect()
    })

    it('should get task', async () => {
      const mockTask = { id: 'task-123', title: 'Test Task' } as any
      ;(TaskDatabaseService.getTask as jest.Mock<any>).mockResolvedValue(mockTask)
      
      const task = await client.getTask('task-123')
      
      expect(TaskDatabaseService.getTask).toHaveBeenCalledWith(mockUserId, 'task-123')
      expect(task).toEqual(mockTask)
    })

    it('should create task', async () => {
      const mockTask = { id: 'task-456', title: 'New Task' } as any
      ;(TaskDatabaseService.createTask as jest.Mock<any>).mockResolvedValue(mockTask)
      
      const task = await client.createTask('New Task', 'Description')
      
      expect(TaskDatabaseService.createTask).toHaveBeenCalledWith(
        mockUserId,
        'New Task',
        'Description',
        undefined,
        undefined
      )
      expect(task).toEqual(mockTask)
    })

    it('should update task status', async () => {
      ;(TaskDatabaseService.updateTaskStatus as jest.Mock<any>).mockResolvedValue(undefined)
      
      await client.updateTaskStatus('task-123', 'in_progress')
      
      expect(TaskDatabaseService.updateTaskStatus).toHaveBeenCalledWith(
        mockUserId,
        'task-123',
        'in_progress'
      )
    })
  })

  describe('Auto-connect', () => {
    it('should auto-connect when calling methods if not connected', async () => {
      client = new FirebaseClient({
        userId: mockUserId,
        serviceAccountPath: mockServiceAccountPath
      })
      
      ;(TaskDatabaseService.getTask as jest.Mock<any>).mockResolvedValue(null)
      
      // Don't call connect() manually
      await client.getTask('task-123')
      
      // Should have auto-connected
      expect(firebaseApp.initializeApp).toHaveBeenCalled()
      expect(client.isConnected()).toBe(true)
    })
  })
})
