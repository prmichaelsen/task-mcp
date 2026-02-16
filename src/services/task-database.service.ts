/**
 * Task Database Service
 * 
 * Service layer for all Firestore operations related to tasks.
 * Handles CRUD operations, task messages, and progress tracking.
 */

import { getFirestore, Firestore, FieldValue } from 'firebase-admin/firestore'
import { getUserTasks, getUserTaskMessages, getUserTask, getUserTaskMessage } from '../constant/collections.js'
import { TaskSchema, type Task, type Milestone, type TaskItem, type TaskMessage } from '../schemas/task.js'

export class TaskDatabaseService {
  private static db: Firestore | null = null

  /**
   * Initialize the database connection
   */
  static initialize(db?: Firestore): void {
    this.db = db || getFirestore()
  }

  /**
   * Get the Firestore instance
   */
  private static getDb(): Firestore {
    if (!this.db) {
      this.db = getFirestore()
    }
    return this.db
  }

  // ==================== CRUD Operations ====================

  /**
   * Create a new task
   */
  static async createTask(
    userId: string,
    title: string,
    description: string,
    config?: Partial<Task['config']>,
    metadata?: Task['metadata']
  ): Promise<Task> {
    const db = this.getDb()
    const now = new Date().toISOString()
    
    const taskData: Omit<Task, 'id'> = {
      user_id: userId,
      title,
      description,
      status: 'not_started',
      created_at: now,
      updated_at: now,
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
        system_prompt: config?.system_prompt || '',
        auto_approve: config?.auto_approve ?? true,
        max_iterations: config?.max_iterations || 500
      },
      metadata: metadata
    }
    
    const tasksPath = getUserTasks(userId)
    const docRef = await db.collection(tasksPath).add(taskData)
    
    return {
      id: docRef.id,
      ...taskData
    }
  }

  /**
   * Get a task by ID
   */
  static async getTask(userId: string, taskId: string): Promise<Task | null> {
    const db = this.getDb()
    const taskPath = getUserTask(userId, taskId)
    const doc = await db.doc(taskPath).get()
    
    if (!doc.exists) {
      return null
    }
    
    const data = doc.data()
    const result = TaskSchema.safeParse({ id: doc.id, ...data })
    
    if (!result.success) {
      console.error('Task validation failed:', result.error)
      return null
    }
    
    return result.data
  }

  /**
   * Update a task
   */
  static async updateTask(
    userId: string,
    taskId: string,
    updates: Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>
  ): Promise<void> {
    const db = this.getDb()
    const taskPath = getUserTask(userId, taskId)
    
    await db.doc(taskPath).update({
      ...updates,
      updated_at: new Date().toISOString()
    })
  }

  /**
   * Update task status
   */
  static async updateTaskStatus(
    userId: string,
    taskId: string,
    status: Task['status']
  ): Promise<void> {
    const db = this.getDb()
    const taskPath = getUserTask(userId, taskId)
    const updates: any = {
      status,
      updated_at: new Date().toISOString()
    }
    
    // Set timestamps based on status
    if (status === 'in_progress') {
      updates.started_at = new Date().toISOString()
    } else if (status === 'completed' || status === 'failed') {
      updates.completed_at = new Date().toISOString()
    }
    
    await db.doc(taskPath).update(updates)
  }

  /**
   * Delete a task
   */
  static async deleteTask(userId: string, taskId: string): Promise<void> {
    const db = this.getDb()
    const taskPath = getUserTask(userId, taskId)
    
    // Delete all messages first
    const messagesPath = getUserTaskMessages(userId, taskId)
    const messagesSnapshot = await db.collection(messagesPath).get()
    
    const batch = db.batch()
    messagesSnapshot.docs.forEach(doc => {
      batch.delete(doc.ref)
    })
    
    // Delete the task
    batch.delete(db.doc(taskPath))
    
    await batch.commit()
  }

  /**
   * List all tasks for a user
   */
  static async listTasks(userId: string, limit = 50): Promise<Task[]> {
    const db = this.getDb()
    const tasksPath = getUserTasks(userId)
    
    const snapshot = await db.collection(tasksPath)
      .orderBy('created_at', 'desc')
      .limit(limit)
      .get()
    
    const tasks: Task[] = []
    snapshot.docs.forEach(doc => {
      const result = TaskSchema.safeParse({ id: doc.id, ...doc.data() })
      if (result.success) {
        tasks.push(result.data)
      }
    })
    
    return tasks
  }

  // ==================== Task Message Operations ====================

  /**
   * Add a message to a task
   */
  static async addMessage(
    userId: string,
    taskId: string,
    role: 'user' | 'assistant' | 'system',
    content: string,
    metadata?: any
  ): Promise<string> {
    const db = this.getDb()
    const messagesPath = getUserTaskMessages(userId, taskId)
    
    const message = {
      task_id: taskId,
      role,
      content,
      timestamp: new Date().toISOString(),
      metadata: metadata || null
    }
    
    const docRef = await db.collection(messagesPath).add(message)
    return docRef.id
  }

  /**
   * Get messages for a task
   */
  static async getMessages(
    userId: string,
    taskId: string,
    limit = 100
  ): Promise<TaskMessage[]> {
    const db = this.getDb()
    const messagesPath = getUserTaskMessages(userId, taskId)
    
    const snapshot = await db.collection(messagesPath)
      .orderBy('timestamp', 'asc')
      .limit(limit)
      .get()
    
    return snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as TaskMessage))
  }

  /**
   * Delete a message
   */
  static async deleteMessage(
    userId: string,
    taskId: string,
    messageId: string
  ): Promise<void> {
    const db = this.getDb()
    const messagePath = getUserTaskMessage(userId, taskId, messageId)
    await db.doc(messagePath).delete()
  }

  // ==================== Progress Operations ====================

  /**
   * Update overall progress percentage
   */
  static async updateOverallProgress(
    userId: string,
    taskId: string,
    percentage: number
  ): Promise<void> {
    const db = this.getDb()
    const taskPath = getUserTask(userId, taskId)
    
    await db.doc(taskPath).update({
      'progress.overall_percentage': Math.min(100, Math.max(0, percentage)),
      updated_at: new Date().toISOString()
    })
  }

  /**
   * Create a milestone
   */
  static async createMilestone(
    userId: string,
    taskId: string,
    milestone: Milestone
  ): Promise<void> {
    const db = this.getDb()
    const taskPath = getUserTask(userId, taskId)
    
    await db.doc(taskPath).update({
      'progress.milestones': FieldValue.arrayUnion(milestone),
      updated_at: new Date().toISOString()
    })
  }

  /**
   * Update a milestone
   */
  static async updateMilestone(
    userId: string,
    taskId: string,
    milestoneId: string,
    updates: Partial<Milestone>
  ): Promise<void> {
    const task = await this.getTask(userId, taskId)
    if (!task) throw new Error('Task not found')
    
    const milestoneIndex = task.progress.milestones.findIndex(m => m.id === milestoneId)
    if (milestoneIndex === -1) throw new Error('Milestone not found')
    
    task.progress.milestones[milestoneIndex] = {
      ...task.progress.milestones[milestoneIndex],
      ...updates
    }
    
    const db = this.getDb()
    const taskPath = getUserTask(userId, taskId)
    
    await db.doc(taskPath).update({
      'progress.milestones': task.progress.milestones,
      updated_at: new Date().toISOString()
    })
  }

  /**
   * Complete a milestone
   */
  static async completeMilestone(
    userId: string,
    taskId: string,
    milestoneId: string
  ): Promise<void> {
    await this.updateMilestone(userId, taskId, milestoneId, {
      status: 'completed',
      progress: 100,
      completed_at: new Date().toISOString()
    })
  }

  /**
   * Create a task item
   */
  static async createTaskItem(
    userId: string,
    taskId: string,
    milestoneId: string,
    taskItem: TaskItem
  ): Promise<void> {
    const task = await this.getTask(userId, taskId)
    if (!task) throw new Error('Task not found')
    
    if (!task.progress.tasks[milestoneId]) {
      task.progress.tasks[milestoneId] = []
    }
    
    task.progress.tasks[milestoneId].push(taskItem)
    
    const db = this.getDb()
    const taskPath = getUserTask(userId, taskId)
    
    await db.doc(taskPath).update({
      'progress.tasks': task.progress.tasks,
      updated_at: new Date().toISOString()
    })
  }

  /**
   * Update a task item
   */
  static async updateTaskItem(
    userId: string,
    taskId: string,
    milestoneId: string,
    taskItemId: string,
    updates: Partial<TaskItem>
  ): Promise<void> {
    const task = await this.getTask(userId, taskId)
    if (!task) throw new Error('Task not found')
    
    const items = task.progress.tasks[milestoneId]
    if (!items) throw new Error('Milestone not found')
    
    const itemIndex = items.findIndex(item => item.id === taskItemId)
    if (itemIndex === -1) throw new Error('Task item not found')
    
    items[itemIndex] = {
      ...items[itemIndex],
      ...updates
    }
    
    const db = this.getDb()
    const taskPath = getUserTask(userId, taskId)
    
    await db.doc(taskPath).update({
      [`progress.tasks.${milestoneId}`]: items,
      updated_at: new Date().toISOString()
    })
  }

  /**
   * Complete a task item
   */
  static async completeTaskItem(
    userId: string,
    taskId: string,
    milestoneId: string,
    taskItemId: string
  ): Promise<void> {
    await this.updateTaskItem(userId, taskId, milestoneId, taskItemId, {
      status: 'completed',
      completed_at: new Date().toISOString()
    })
  }

  // ==================== Query Methods ====================

  /**
   * Get tasks by status
   */
  static async getTasksByStatus(
    userId: string,
    status: Task['status'],
    limit = 50
  ): Promise<Task[]> {
    const db = this.getDb()
    const tasksPath = getUserTasks(userId)
    
    const snapshot = await db.collection(tasksPath)
      .where('status', '==', status)
      .orderBy('updated_at', 'desc')
      .limit(limit)
      .get()
    
    const tasks: Task[] = []
    snapshot.docs.forEach(doc => {
      const result = TaskSchema.safeParse({ id: doc.id, ...doc.data() })
      if (result.success) {
        tasks.push(result.data)
      }
    })
    
    return tasks
  }

  /**
   * Get active tasks (in_progress status)
   */
  static async getActiveTasks(userId: string, limit = 50): Promise<Task[]> {
    return this.getTasksByStatus(userId, 'in_progress', limit)
  }

  /**
   * Get completed tasks
   */
  static async getCompletedTasks(userId: string, limit = 50): Promise<Task[]> {
    return this.getTasksByStatus(userId, 'completed', limit)
  }

  /**
   * Search tasks by title
   */
  static async searchTasksByTitle(
    userId: string,
    searchTerm: string,
    limit = 50
  ): Promise<Task[]> {
    const allTasks = await this.listTasks(userId, limit)
    
    const searchLower = searchTerm.toLowerCase()
    return allTasks.filter(task => 
      task.title.toLowerCase().includes(searchLower) ||
      task.description.toLowerCase().includes(searchLower)
    )
  }
}
