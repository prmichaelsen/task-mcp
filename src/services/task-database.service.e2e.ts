/**
 * E2E Tests for TaskDatabaseService
 * 
 * Tests with real Firestore emulator for integration testing.
 * 
 * To run these tests:
 * 1. Start Firestore emulator: firebase emulators:start --only firestore
 * 2. Run tests: npm run test:e2e
 */

import { describe, it, expect, beforeAll, afterAll } from '@jest/globals'
import { initializeApp, cert, deleteApp } from 'firebase-admin/app'
import { getFirestore } from 'firebase-admin/firestore'
import { TaskDatabaseService } from '../../src/services/task-database.service.js'
import type { Task } from '../../src/schemas/task.js'

describe('TaskDatabaseService E2E', () => {
  let app: any

  beforeAll(async () => {
    // Initialize Firebase Admin with emulator
    process.env.FIRESTORE_EMULATOR_HOST = 'localhost:8080'
    
    app = initializeApp({
      projectId: 'test-project'
    }, 'task-mcp-e2e-test')
    
    const db = getFirestore(app)
    TaskDatabaseService.initialize(db)
  })

  afterAll(async () => {
    if (app) {
      await deleteApp(app)
    }
  })

  describe('Full Task Lifecycle', () => {
    it('should create, read, update, and delete a task', async () => {
      const userId = 'test-user-' + Date.now()
      
      // Create
      const task = await TaskDatabaseService.createTask(
        userId,
        'E2E Test Task',
        'Testing full lifecycle'
      )
      
      expect(task.id).toBeDefined()
      expect(task.title).toBe('E2E Test Task')
      
      // Read
      const retrieved = await TaskDatabaseService.getTask(userId, task.id)
      expect(retrieved).not.toBeNull()
      expect(retrieved?.title).toBe('E2E Test Task')
      
      // Update status
      await TaskDatabaseService.updateTaskStatus(userId, task.id, 'in_progress')
      const updated = await TaskDatabaseService.getTask(userId, task.id)
      expect(updated?.status).toBe('in_progress')
      expect(updated?.started_at).toBeDefined()
      
      // Delete
      await TaskDatabaseService.deleteTask(userId, task.id)
      const deleted = await TaskDatabaseService.getTask(userId, task.id)
      expect(deleted).toBeNull()
    })

    it('should handle task messages', async () => {
      const userId = 'test-user-' + Date.now()
      
      const task = await TaskDatabaseService.createTask(
        userId,
        'Message Test',
        'Testing messages'
      )
      
      // Add messages
      const msg1 = await TaskDatabaseService.addMessage(userId, task.id, 'user', 'Hello')
      const msg2 = await TaskDatabaseService.addMessage(userId, task.id, 'assistant', 'Hi there')
      
      expect(msg1).toBeDefined()
      expect(msg2).toBeDefined()
      
      // Get messages
      const messages = await TaskDatabaseService.getMessages(userId, task.id)
      expect(messages).toHaveLength(2)
      expect(messages[0].role).toBe('user')
      expect(messages[1].role).toBe('assistant')
      
      // Cleanup
      await TaskDatabaseService.deleteTask(userId, task.id)
    })
  })

  describe('Query Operations', () => {
    it('should filter tasks by status', async () => {
      const userId = 'test-user-' + Date.now()
      
      // Create tasks with different statuses
      const task1 = await TaskDatabaseService.createTask(userId, 'Task 1', 'Active')
      await TaskDatabaseService.updateTaskStatus(userId, task1.id, 'in_progress')
      
      const task2 = await TaskDatabaseService.createTask(userId, 'Task 2', 'Pending')
      
      // Query active tasks
      const activeTasks = await TaskDatabaseService.getActiveTasks(userId)
      expect(activeTasks.length).toBeGreaterThanOrEqual(1)
      expect(activeTasks.some(t => t.id === task1.id)).toBe(true)
      
      // Cleanup
      await TaskDatabaseService.deleteTask(userId, task1.id)
      await TaskDatabaseService.deleteTask(userId, task2.id)
    })
  })
})
