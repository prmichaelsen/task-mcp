/**
 * Task Database Service
 *
 * Service layer for all Firestore operations related to tasks.
 * Handles CRUD operations, task messages, and progress tracking.
 */
import { Firestore } from 'firebase-admin/firestore';
import { type Task, type Milestone, type TaskItem, type TaskMessage } from '../schemas/task.js';
export declare class TaskDatabaseService {
    private static db;
    /**
     * Initialize the database connection
     */
    static initialize(db?: Firestore): void;
    /**
     * Get the Firestore instance
     */
    private static getDb;
    /**
     * Create a new task
     */
    static createTask(userId: string, title: string, description: string, config?: Partial<Task['config']>, metadata?: Task['metadata']): Promise<Task>;
    /**
     * Get a task by ID
     */
    static getTask(userId: string, taskId: string): Promise<Task | null>;
    /**
     * Update a task
     */
    static updateTask(userId: string, taskId: string, updates: Partial<Omit<Task, 'id' | 'user_id' | 'created_at'>>): Promise<void>;
    /**
     * Update task status
     */
    static updateTaskStatus(userId: string, taskId: string, status: Task['status']): Promise<void>;
    /**
     * Delete a task
     */
    static deleteTask(userId: string, taskId: string): Promise<void>;
    /**
     * List all tasks for a user
     */
    static listTasks(userId: string, limit?: number): Promise<Task[]>;
    /**
     * Add a message to a task
     */
    static addMessage(userId: string, taskId: string, role: 'user' | 'assistant' | 'system', content: string, metadata?: any): Promise<string>;
    /**
     * Get messages for a task
     */
    static getMessages(userId: string, taskId: string, limit?: number): Promise<TaskMessage[]>;
    /**
     * Delete a message
     */
    static deleteMessage(userId: string, taskId: string, messageId: string): Promise<void>;
    /**
     * Update overall progress percentage
     */
    static updateOverallProgress(userId: string, taskId: string, percentage: number): Promise<void>;
    /**
     * Create a milestone
     */
    static createMilestone(userId: string, taskId: string, milestone: Milestone): Promise<void>;
    /**
     * Update a milestone
     */
    static updateMilestone(userId: string, taskId: string, milestoneId: string, updates: Partial<Milestone>): Promise<void>;
    /**
     * Complete a milestone
     */
    static completeMilestone(userId: string, taskId: string, milestoneId: string): Promise<void>;
    /**
     * Create a task item
     */
    static createTaskItem(userId: string, taskId: string, milestoneId: string, taskItem: TaskItem): Promise<void>;
    /**
     * Update a task item
     */
    static updateTaskItem(userId: string, taskId: string, milestoneId: string, taskItemId: string, updates: Partial<TaskItem>): Promise<void>;
    /**
     * Complete a task item
     */
    static completeTaskItem(userId: string, taskId: string, milestoneId: string, taskItemId: string): Promise<void>;
    /**
     * Get tasks by status
     */
    static getTasksByStatus(userId: string, status: Task['status'], limit?: number): Promise<Task[]>;
    /**
     * Get active tasks (in_progress status)
     */
    static getActiveTasks(userId: string, limit?: number): Promise<Task[]>;
    /**
     * Get completed tasks
     */
    static getCompletedTasks(userId: string, limit?: number): Promise<Task[]>;
    /**
     * Search tasks by title
     */
    static searchTasksByTitle(userId: string, searchTerm: string, limit?: number): Promise<Task[]>;
}
//# sourceMappingURL=task-database.service.d.ts.map