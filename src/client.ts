/**
 * Firebase Client Wrapper
 * 
 * Provides a clean interface for MCP tools to interact with Firestore.
 * Handles service account authentication and user-scoped operations.
 */

import { initializeApp, cert, App, getApps, deleteApp } from 'firebase-admin/app'
import { getFirestore, Firestore } from 'firebase-admin/firestore'
import { TaskDatabaseService } from '@/services/task-database.service.js'
import type { Task, Milestone, TaskItem } from '@/schemas/task.js'

export interface FirebaseClientConfig {
  userId: string
  serviceAccountPath?: string
  serviceAccountJson?: string
  projectId?: string
}

export class FirebaseClient {
  private app: App | null = null
  private db: Firestore | null = null
  private userId: string
  private config: FirebaseClientConfig

  constructor(config: FirebaseClientConfig) {
    if (!config.userId) {
      throw new Error('userId is required')
    }
    
    this.userId = config.userId
    this.config = config
  }

  /**
   * Initialize Firebase connection
   */
  async connect(): Promise<void> {
    if (this.app) {
      return // Already connected
    }

    try {
      // Check if already initialized
      const existingApps = getApps()
      const appName = `task-mcp-${this.userId}`
      const existingApp = existingApps.find(app => app.name === appName)
      
      if (existingApp) {
        this.app = existingApp
        this.db = getFirestore(this.app)
        TaskDatabaseService.initialize(this.db)
        return
      }

      // Get service account credentials
      let credential
      
      if (this.config.serviceAccountJson) {
        // Use JSON string
        const serviceAccount = JSON.parse(this.config.serviceAccountJson)
        credential = cert(serviceAccount)
      } else if (this.config.serviceAccountPath) {
        // Use file path
        credential = cert(this.config.serviceAccountPath)
      } else if (process.env.FIREBASE_SERVICE_ACCOUNT_JSON) {
        // From environment variable (JSON)
        const serviceAccount = JSON.parse(process.env.FIREBASE_SERVICE_ACCOUNT_JSON)
        credential = cert(serviceAccount)
      } else if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
        // From environment variable (path)
        credential = cert(process.env.FIREBASE_SERVICE_ACCOUNT_PATH)
      } else {
        throw new Error('Firebase service account credentials required')
      }

      // Initialize app
      this.app = initializeApp(
        {
          credential,
          projectId: this.config.projectId || process.env.FIREBASE_PROJECT_ID
        },
        appName
      )

      this.db = getFirestore(this.app)
      TaskDatabaseService.initialize(this.db)
    } catch (error) {
      throw new Error(`Failed to initialize Firebase: ${error instanceof Error ? error.message : String(error)}`)
    }
  }

  /**
   * Disconnect and cleanup
   */
  async disconnect(): Promise<void> {
    if (this.app) {
      await deleteApp(this.app)
      this.app = null
      this.db = null
    }
  }

  /**
   * Check if connected
   */
  isConnected(): boolean {
    return this.app !== null && this.db !== null
  }

  // ==================== Task Operations ====================

  /**
   * Get a task (user-scoped)
   */
  async getTask(taskId: string): Promise<Task | null> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.getTask(this.userId, taskId)
  }

  /**
   * Create a task (user-scoped)
   */
  async createTask(
    title: string,
    description: string,
    config?: Partial<Task['config']>,
    metadata?: Task['metadata']
  ): Promise<Task> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.createTask(this.userId, title, description, config, metadata)
  }

  /**
   * Update task status (user-scoped)
   */
  async updateTaskStatus(taskId: string, status: Task['status']): Promise<void> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.updateTaskStatus(this.userId, taskId, status)
  }

  /**
   * Delete a task (user-scoped)
   */
  async deleteTask(taskId: string): Promise<void> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.deleteTask(this.userId, taskId)
  }

  /**
   * List tasks (user-scoped)
   */
  async listTasks(limit = 50): Promise<Task[]> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.listTasks(this.userId, limit)
  }

  // ==================== Progress Operations ====================

  /**
   * Update overall progress (user-scoped)
   */
  async updateOverallProgress(taskId: string, percentage: number): Promise<void> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.updateOverallProgress(this.userId, taskId, percentage)
  }

  /**
   * Create a milestone (user-scoped)
   */
  async createMilestone(taskId: string, milestone: Milestone): Promise<void> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.createMilestone(this.userId, taskId, milestone)
  }

  /**
   * Update a milestone (user-scoped)
   */
  async updateMilestone(
    taskId: string,
    milestoneId: string,
    updates: Partial<Milestone>
  ): Promise<void> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.updateMilestone(this.userId, taskId, milestoneId, updates)
  }

  /**
   * Complete a milestone (user-scoped)
   */
  async completeMilestone(taskId: string, milestoneId: string): Promise<void> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.completeMilestone(this.userId, taskId, milestoneId)
  }

  /**
   * Create a task item (user-scoped)
   */
  async createTaskItem(
    taskId: string,
    milestoneId: string,
    taskItem: TaskItem
  ): Promise<void> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.createTaskItem(this.userId, taskId, milestoneId, taskItem)
  }

  /**
   * Update a task item (user-scoped)
   */
  async updateTaskItem(
    taskId: string,
    milestoneId: string,
    taskItemId: string,
    updates: Partial<TaskItem>
  ): Promise<void> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.updateTaskItem(this.userId, taskId, milestoneId, taskItemId, updates)
  }

  /**
   * Complete a task item (user-scoped)
   */
  async completeTaskItem(
    taskId: string,
    milestoneId: string,
    taskItemId: string
  ): Promise<void> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.completeTaskItem(this.userId, taskId, milestoneId, taskItemId)
  }

  // ==================== Message Operations ====================

  /**
   * Add a message (user-scoped)
   */
  async addMessage(
    taskId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: any
  ): Promise<string> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.addMessage(this.userId, taskId, role, content, metadata)
  }

  /**
   * Get messages (user-scoped)
   */
  async getMessages(taskId: string, limit = 100): Promise<any[]> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.getMessages(this.userId, taskId, limit)
  }

  // ==================== Query Operations ====================

  /**
   * Get tasks by status (user-scoped)
   */
  async getTasksByStatus(status: Task['status'], limit = 50): Promise<Task[]> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.getTasksByStatus(this.userId, status, limit)
  }

  /**
   * Get active tasks (user-scoped)
   */
  async getActiveTasks(limit = 50): Promise<Task[]> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.getActiveTasks(this.userId, limit)
  }

  /**
   * Search tasks by title (user-scoped)
   */
  async searchTasksByTitle(searchTerm: string, limit = 50): Promise<Task[]> {
    if (!this.isConnected()) {
      await this.connect()
    }
    return TaskDatabaseService.searchTasksByTitle(this.userId, searchTerm, limit)
  }
}
