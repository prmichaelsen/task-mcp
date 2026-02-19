/**
 * Task API Client
 *
 * REST API client for consuming task-mcp REST API.
 * Provides type-safe methods, authentication, error handling, and retry logic.
 */
import type { TaskApiResponse, TaskListApiResponse, TaskMessageListApiResponse, CreateTaskDto, UpdateTaskDto, CreateMessageDto, UpdateProgressDto, CreateMilestoneDto, CreateTaskItemDto, TaskStatus, MilestoneApiResponse, TaskItemApiResponse } from '@prmichaelsen/task-core/dto';
/**
 * Configuration options for TaskApiClient
 */
export interface TaskApiClientConfig {
    /** Base URL of the task-mcp REST API */
    baseUrl: string;
    /** Service token for authentication */
    serviceToken: string;
    /** Request timeout in milliseconds (default: 30000) */
    timeout?: number;
    /** Number of retry attempts for transient failures (default: 3) */
    retries?: number;
    /** Optional logger for debugging */
    logger?: {
        debug: (message: string, ...args: any[]) => void;
        error: (message: string, ...args: any[]) => void;
    };
}
/**
 * Options for listing tasks
 */
export interface GetTasksOptions {
    status?: TaskStatus;
    limit?: number;
    search?: string;
}
/**
 * REST API client for task-mcp
 */
export declare class TaskApiClient {
    private readonly baseUrl;
    private readonly serviceToken;
    private readonly timeout;
    private readonly retries;
    private readonly logger?;
    constructor(config: TaskApiClientConfig);
    /**
     * Get list of tasks
     */
    getTasks(options?: GetTasksOptions): Promise<TaskListApiResponse>;
    /**
     * Get a single task by ID
     */
    getTask(taskId: string): Promise<TaskApiResponse>;
    /**
     * Create a new task
     */
    createTask(data: CreateTaskDto): Promise<TaskApiResponse>;
    /**
     * Update a task
     */
    updateTask(taskId: string, data: UpdateTaskDto): Promise<TaskApiResponse>;
    /**
     * Delete a task
     */
    deleteTask(taskId: string): Promise<void>;
    /**
     * Update task status
     */
    updateTaskStatus(taskId: string, status: TaskStatus): Promise<void>;
    /**
     * Update overall progress percentage
     */
    updateProgress(taskId: string, data: UpdateProgressDto): Promise<void>;
    /**
     * Create a milestone
     */
    createMilestone(taskId: string, data: CreateMilestoneDto): Promise<void>;
    /**
     * Update a milestone
     */
    updateMilestone(taskId: string, milestoneId: string, data: Partial<MilestoneApiResponse>): Promise<void>;
    /**
     * Complete a milestone
     */
    completeMilestone(taskId: string, milestoneId: string): Promise<void>;
    /**
     * Create a task item
     */
    createTaskItem(taskId: string, milestoneId: string, data: CreateTaskItemDto): Promise<void>;
    /**
     * Update a task item
     */
    updateTaskItem(taskId: string, milestoneId: string, taskItemId: string, data: Partial<TaskItemApiResponse>): Promise<void>;
    /**
     * Complete a task item
     */
    completeTaskItem(taskId: string, milestoneId: string, taskItemId: string): Promise<void>;
    /**
     * Get messages for a task
     */
    getMessages(taskId: string, limit?: number): Promise<TaskMessageListApiResponse>;
    /**
     * Add a message to a task
     */
    addMessage(taskId: string, data: CreateMessageDto): Promise<{
        message_id: string;
    }>;
    /**
     * Make an HTTP request with retry logic
     */
    private request;
    /**
     * Make a single HTTP request
     */
    private makeRequest;
    /**
     * Handle error responses
     */
    private handleErrorResponse;
    /**
     * Retry a request with exponential backoff
     */
    private retryRequest;
    /**
     * Check if an error is retryable
     */
    private isRetryable;
    /**
     * Delay for a specified number of milliseconds
     */
    private delay;
}
//# sourceMappingURL=task-api-client.d.ts.map