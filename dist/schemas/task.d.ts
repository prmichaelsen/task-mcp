/**
 * Task Data Model and Schemas
 *
 * Zod schemas and TypeScript interfaces for the task execution system.
 * These schemas define the structure of Task documents in Firestore.
 */
import { z } from 'zod';
/**
 * Milestone Schema
 * Represents a major phase in task execution with multiple sub-tasks
 */
export declare const MilestoneSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    status: z.ZodEnum<{
        not_started: "not_started";
        in_progress: "in_progress";
        completed: "completed";
    }>;
    progress: z.ZodNumber;
    tasks_completed: z.ZodNumber;
    tasks_total: z.ZodNumber;
    started_at: z.ZodOptional<z.ZodString>;
    completed_at: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Task Item Schema
 * Represents a granular work item within a milestone
 */
export declare const TaskItemSchema: z.ZodObject<{
    id: z.ZodString;
    name: z.ZodString;
    description: z.ZodString;
    status: z.ZodEnum<{
        not_started: "not_started";
        in_progress: "in_progress";
        completed: "completed";
    }>;
    estimated_hours: z.ZodOptional<z.ZodNumber>;
    completed_at: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Task Progress Schema
 * Tracks overall progress and milestone/task completion
 */
export declare const TaskProgressSchema: z.ZodObject<{
    current_milestone: z.ZodString;
    current_task: z.ZodString;
    overall_percentage: z.ZodNumber;
    milestones: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        status: z.ZodEnum<{
            not_started: "not_started";
            in_progress: "in_progress";
            completed: "completed";
        }>;
        progress: z.ZodNumber;
        tasks_completed: z.ZodNumber;
        tasks_total: z.ZodNumber;
        started_at: z.ZodOptional<z.ZodString>;
        completed_at: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>;
    tasks: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodString;
        status: z.ZodEnum<{
            not_started: "not_started";
            in_progress: "in_progress";
            completed: "completed";
        }>;
        estimated_hours: z.ZodOptional<z.ZodNumber>;
        completed_at: z.ZodOptional<z.ZodString>;
        notes: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>>>;
}, z.core.$strip>;
/**
 * Task Execution Schema
 * Stores execution state including messages and tool results
 */
export declare const TaskExecutionSchema: z.ZodObject<{
    api_messages: z.ZodArray<z.ZodAny>;
    task_messages: z.ZodArray<z.ZodAny>;
    tool_results: z.ZodArray<z.ZodAny>;
    error: z.ZodOptional<z.ZodString>;
    abort_reason: z.ZodOptional<z.ZodString>;
}, z.core.$strip>;
/**
 * Task Configuration Schema
 * Configuration for task execution behavior
 * Note: Model is configured globally by the tenant platform, not per-task
 */
export declare const TaskConfigSchema: z.ZodObject<{
    system_prompt: z.ZodString;
    auto_approve: z.ZodBoolean;
    max_iterations: z.ZodOptional<z.ZodNumber>;
}, z.core.$strip>;
/**
 * Task Metadata Schema
 * Optional metadata for task organization and tracking
 */
export declare const TaskMetadataSchema: z.ZodOptional<z.ZodObject<{
    conversation_id: z.ZodOptional<z.ZodString>;
    parent_task_id: z.ZodOptional<z.ZodString>;
    tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
}, z.core.$strip>>;
/**
 * Task Schema
 * Complete task document structure
 */
export declare const TaskSchema: z.ZodObject<{
    id: z.ZodString;
    user_id: z.ZodString;
    title: z.ZodString;
    description: z.ZodString;
    status: z.ZodEnum<{
        not_started: "not_started";
        in_progress: "in_progress";
        completed: "completed";
        paused: "paused";
        failed: "failed";
    }>;
    created_at: z.ZodString;
    updated_at: z.ZodString;
    started_at: z.ZodOptional<z.ZodString>;
    completed_at: z.ZodOptional<z.ZodString>;
    progress: z.ZodObject<{
        current_milestone: z.ZodString;
        current_task: z.ZodString;
        overall_percentage: z.ZodNumber;
        milestones: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodString;
            status: z.ZodEnum<{
                not_started: "not_started";
                in_progress: "in_progress";
                completed: "completed";
            }>;
            progress: z.ZodNumber;
            tasks_completed: z.ZodNumber;
            tasks_total: z.ZodNumber;
            started_at: z.ZodOptional<z.ZodString>;
            completed_at: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>;
        tasks: z.ZodRecord<z.ZodString, z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodString;
            status: z.ZodEnum<{
                not_started: "not_started";
                in_progress: "in_progress";
                completed: "completed";
            }>;
            estimated_hours: z.ZodOptional<z.ZodNumber>;
            completed_at: z.ZodOptional<z.ZodString>;
            notes: z.ZodOptional<z.ZodString>;
        }, z.core.$strip>>>;
    }, z.core.$strip>;
    execution: z.ZodObject<{
        api_messages: z.ZodArray<z.ZodAny>;
        task_messages: z.ZodArray<z.ZodAny>;
        tool_results: z.ZodArray<z.ZodAny>;
        error: z.ZodOptional<z.ZodString>;
        abort_reason: z.ZodOptional<z.ZodString>;
    }, z.core.$strip>;
    config: z.ZodObject<{
        system_prompt: z.ZodString;
        auto_approve: z.ZodBoolean;
        max_iterations: z.ZodOptional<z.ZodNumber>;
    }, z.core.$strip>;
    metadata: z.ZodOptional<z.ZodObject<{
        conversation_id: z.ZodOptional<z.ZodString>;
        parent_task_id: z.ZodOptional<z.ZodString>;
        tags: z.ZodOptional<z.ZodArray<z.ZodString>>;
    }, z.core.$strip>>;
}, z.core.$strip>;
/**
 * Task Message Schema
 * Messages in the task conversation thread
 */
export declare const TaskMessageSchema: z.ZodObject<{
    id: z.ZodString;
    task_id: z.ZodString;
    role: z.ZodEnum<{
        user: "user";
        assistant: "assistant";
        system: "system";
    }>;
    content: z.ZodString;
    timestamp: z.ZodString;
    metadata: z.ZodOptional<z.ZodAny>;
}, z.core.$strip>;
export type Milestone = z.infer<typeof MilestoneSchema>;
export type TaskItem = z.infer<typeof TaskItemSchema>;
export type TaskProgress = z.infer<typeof TaskProgressSchema>;
export type TaskExecution = z.infer<typeof TaskExecutionSchema>;
export type TaskConfig = z.infer<typeof TaskConfigSchema>;
export type TaskMetadata = z.infer<typeof TaskMetadataSchema>;
export type Task = z.infer<typeof TaskSchema>;
export type TaskMessage = z.infer<typeof TaskMessageSchema>;
export declare const TaskStatus: {
    readonly NOT_STARTED: "not_started";
    readonly IN_PROGRESS: "in_progress";
    readonly PAUSED: "paused";
    readonly COMPLETED: "completed";
    readonly FAILED: "failed";
};
export declare const MilestoneStatus: {
    readonly NOT_STARTED: "not_started";
    readonly IN_PROGRESS: "in_progress";
    readonly COMPLETED: "completed";
};
export declare const TaskItemStatus: {
    readonly NOT_STARTED: "not_started";
    readonly IN_PROGRESS: "in_progress";
    readonly COMPLETED: "completed";
};
export declare const MessageRole: {
    readonly USER: "user";
    readonly ASSISTANT: "assistant";
    readonly SYSTEM: "system";
};
//# sourceMappingURL=task.d.ts.map