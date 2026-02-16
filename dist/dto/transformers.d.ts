/**
 * DTO Transformers
 *
 * Functions to transform internal schemas to API response DTOs.
 * These transformers exclude internal fields and ensure API responses
 * match the expected structure for agentbase.me.
 */
import type { Task, TaskMessage, Milestone, TaskItem } from '../schemas/task.js';
import type { TaskApiResponse, TaskMessageApiResponse, MilestoneApiResponse, TaskItemApiResponse, TaskProgressApiResponse, TaskConfigApiResponse, TaskMetadataApiResponse } from './task-api.dto.js';
/**
 * Transform Task Item schema to API response DTO
 */
export declare function toTaskItemApiResponse(item: TaskItem): TaskItemApiResponse;
/**
 * Transform Milestone schema to API response DTO
 */
export declare function toMilestoneApiResponse(milestone: Milestone): MilestoneApiResponse;
/**
 * Transform Task Progress schema to API response DTO
 */
export declare function toTaskProgressApiResponse(progress: Task['progress']): TaskProgressApiResponse;
/**
 * Transform Task Config schema to API response DTO
 */
export declare function toTaskConfigApiResponse(config: Task['config']): TaskConfigApiResponse;
/**
 * Transform Task Metadata schema to API response DTO
 */
export declare function toTaskMetadataApiResponse(metadata: Task['metadata']): TaskMetadataApiResponse | undefined;
/**
 * Transform internal Task schema to API response DTO
 * Excludes internal execution details (api_messages, tool_results)
 */
export declare function toTaskApiResponse(task: Task): TaskApiResponse;
/**
 * Transform internal TaskMessage schema to API response DTO
 */
export declare function toTaskMessageApiResponse(message: TaskMessage): TaskMessageApiResponse;
/**
 * Transform array of tasks to list response DTO
 */
export declare function toTaskListApiResponse(tasks: Task[]): {
    tasks: TaskApiResponse[];
    total: number;
};
/**
 * Transform array of messages to list response DTO
 */
export declare function toTaskMessageListApiResponse(messages: TaskMessage[]): {
    messages: TaskMessageApiResponse[];
    total: number;
};
//# sourceMappingURL=transformers.d.ts.map