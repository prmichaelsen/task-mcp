/**
 * API Response DTOs
 *
 * These DTOs define the structure of REST API responses.
 * They exclude internal fields and match agentbase.me expectations.
 *
 * Based on design document: agent/design/api-dto-design.md
 */
export type TaskStatus = 'not_started' | 'in_progress' | 'paused' | 'completed' | 'failed';
export type MilestoneStatus = 'not_started' | 'in_progress' | 'completed';
export type TaskItemStatus = 'not_started' | 'in_progress' | 'completed';
export type MessageRole = 'user' | 'assistant' | 'system';
/**
 * Task Item API Response
 * Represents a granular work item within a milestone
 */
export interface TaskItemApiResponse {
    id: string;
    name: string;
    description: string;
    status: TaskItemStatus;
    estimated_hours?: number;
    completed_at?: string;
    notes?: string;
}
/**
 * Milestone API Response
 * Represents a major phase in task execution
 */
export interface MilestoneApiResponse {
    id: string;
    name: string;
    description: string;
    status: MilestoneStatus;
    progress: number;
    tasks_completed: number;
    tasks_total: number;
    started_at?: string;
    completed_at?: string;
}
/**
 * Task Progress API Response
 * Tracks overall progress and milestone/task completion
 */
export interface TaskProgressApiResponse {
    current_milestone: string;
    current_task: string;
    overall_percentage: number;
    milestones: MilestoneApiResponse[];
    tasks: Record<string, TaskItemApiResponse[]>;
}
/**
 * Task Configuration API Response
 * Configuration for task execution behavior
 * Note: Model is configured globally by the tenant platform, not per-task
 */
export interface TaskConfigApiResponse {
    system_prompt: string;
    auto_approve: boolean;
    max_iterations?: number;
}
/**
 * Task Metadata API Response
 * Optional metadata for task organization and tracking
 */
export interface TaskMetadataApiResponse {
    conversation_id?: string;
    parent_task_id?: string;
    tags?: string[];
}
/**
 * Task API Response
 * Complete task representation for REST API responses
 *
 * Note: execution field is EXCLUDED from API responses
 * Internal fields (api_messages, tool_results) are not exposed
 */
export interface TaskApiResponse {
    id: string;
    user_id: string;
    title: string;
    description: string;
    status: TaskStatus;
    created_at: string;
    updated_at: string;
    started_at?: string;
    completed_at?: string;
    progress: TaskProgressApiResponse;
    config: TaskConfigApiResponse;
    metadata?: TaskMetadataApiResponse;
}
/**
 * Task List API Response
 * Response for listing multiple tasks
 */
export interface TaskListApiResponse {
    tasks: TaskApiResponse[];
    total: number;
}
/**
 * Task Message API Response
 * Represents a message in the task conversation thread
 */
export interface TaskMessageApiResponse {
    id: string;
    task_id: string;
    role: MessageRole;
    content: string;
    timestamp: string;
    metadata?: any;
}
/**
 * Task Message List API Response
 * Response for listing task messages
 */
export interface TaskMessageListApiResponse {
    messages: TaskMessageApiResponse[];
    total: number;
}
/**
 * Create Task Input DTO
 * Request body for creating a new task
 */
export interface CreateTaskDto {
    title: string;
    description: string;
    config?: Partial<TaskConfigApiResponse>;
    metadata?: TaskMetadataApiResponse;
}
/**
 * Update Task Input DTO
 * Request body for updating a task
 */
export interface UpdateTaskDto {
    title?: string;
    description?: string;
    status?: TaskStatus;
    config?: Partial<TaskConfigApiResponse>;
    metadata?: TaskMetadataApiResponse;
}
/**
 * Create Message Input DTO
 * Request body for adding a message to a task
 */
export interface CreateMessageDto {
    role: MessageRole;
    content: string;
    metadata?: any;
}
/**
 * Update Progress Input DTO
 * Request body for updating task progress
 */
export interface UpdateProgressDto {
    percentage: number;
}
/**
 * Create Milestone Input DTO
 * Request body for creating a milestone
 */
export interface CreateMilestoneDto {
    milestone_id: string;
    name: string;
    description: string;
}
/**
 * Create Task Item Input DTO
 * Request body for creating a task item
 */
export interface CreateTaskItemDto {
    task_item_id: string;
    name: string;
    description: string;
    estimated_hours?: number;
}
//# sourceMappingURL=task-api.dto.d.ts.map