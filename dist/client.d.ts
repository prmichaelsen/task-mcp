/**
 * Firebase Client Wrapper
 *
 * Provides a clean interface for MCP tools to interact with Firestore.
 * Handles service account authentication and user-scoped operations.
 */
import type { Task, Milestone, TaskItem } from '@/schemas/task.js';
export interface FirebaseClientConfig {
    userId: string;
    serviceAccountPath?: string;
    serviceAccountJson?: string;
    projectId?: string;
}
export declare class FirebaseClient {
    private app;
    private db;
    private userId;
    private config;
    constructor(config: FirebaseClientConfig);
    /**
     * Initialize Firebase connection
     */
    connect(): Promise<void>;
    /**
     * Disconnect and cleanup
     */
    disconnect(): Promise<void>;
    /**
     * Check if connected
     */
    isConnected(): boolean;
    /**
     * Get a task (user-scoped)
     */
    getTask(taskId: string): Promise<Task | null>;
    /**
     * Create a task (user-scoped)
     */
    createTask(title: string, description: string, config?: Partial<Task['config']>, metadata?: Task['metadata']): Promise<Task>;
    /**
     * Update task status (user-scoped)
     */
    updateTaskStatus(taskId: string, status: Task['status']): Promise<void>;
    /**
     * Delete a task (user-scoped)
     */
    deleteTask(taskId: string): Promise<void>;
    /**
     * List tasks (user-scoped)
     */
    listTasks(limit?: number): Promise<Task[]>;
    /**
     * Update overall progress (user-scoped)
     */
    updateOverallProgress(taskId: string, percentage: number): Promise<void>;
    /**
     * Create a milestone (user-scoped)
     */
    createMilestone(taskId: string, milestone: Milestone): Promise<void>;
    /**
     * Update a milestone (user-scoped)
     */
    updateMilestone(taskId: string, milestoneId: string, updates: Partial<Milestone>): Promise<void>;
    /**
     * Complete a milestone (user-scoped)
     */
    completeMilestone(taskId: string, milestoneId: string): Promise<void>;
    /**
     * Create a task item (user-scoped)
     */
    createTaskItem(taskId: string, milestoneId: string, taskItem: TaskItem): Promise<void>;
    /**
     * Update a task item (user-scoped)
     */
    updateTaskItem(taskId: string, milestoneId: string, taskItemId: string, updates: Partial<TaskItem>): Promise<void>;
    /**
     * Complete a task item (user-scoped)
     */
    completeTaskItem(taskId: string, milestoneId: string, taskItemId: string): Promise<void>;
    /**
     * Add a message (user-scoped)
     */
    addMessage(taskId: string, role: 'user' | 'assistant' | 'system', content: string, metadata?: any): Promise<string>;
    /**
     * Get messages (user-scoped)
     */
    getMessages(taskId: string, limit?: number): Promise<any[]>;
    /**
     * Get tasks by status (user-scoped)
     */
    getTasksByStatus(status: Task['status'], limit?: number): Promise<Task[]>;
    /**
     * Get active tasks (user-scoped)
     */
    getActiveTasks(limit?: number): Promise<Task[]>;
    /**
     * Search tasks by title (user-scoped)
     */
    searchTasksByTitle(searchTerm: string, limit?: number): Promise<Task[]>;
}
//# sourceMappingURL=client.d.ts.map