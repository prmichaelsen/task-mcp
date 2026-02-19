/**
 * MCP Tools Index
 *
 * Exports all task management tools for the MCP server.
 *
 * Tool Naming Convention:
 * - task_<verb>_<entity> (e.g., task_create_task, task_get_milestone)
 * - Consistent CRUD operations for all entities
 */
import { taskCreateTaskTool, handleTaskCreateTask } from './task-create-task.js';
import { taskGetTasksTool, handleTaskGetTasks } from './task-get-tasks.js';
import { taskGetTaskTool, handleTaskGetTask } from './task-get-task.js';
import { taskUpdateTaskTool, handleTaskUpdateTask } from './task-update-task.js';
import { taskDeleteTaskTool, handleTaskDeleteTask } from './task-delete-task.js';
import { taskCreateMilestoneTool, handleTaskCreateMilestone } from './task-create-milestone.js';
import { taskGetMilestoneTool, handleTaskGetMilestone } from './task-get-milestone.js';
import { taskUpdateMilestoneTool, handleTaskUpdateMilestone } from './task-update-milestone.js';
import { taskCreateTaskItemTool, handleTaskCreateTaskItem } from './task-create-task-item.js';
import { taskGetTaskItemTool, handleTaskGetTaskItem } from './task-get-task-item.js';
import { taskUpdateTaskItemTool, handleTaskUpdateTaskItem } from './task-update-task-item.js';
import { taskUpdateProgressTool, handleTaskUpdateProgress } from './task-update-progress.js';
import { taskAddMessageTool, handleTaskAddMessage } from './task-add-message.js';
/**
 * All tool definitions organized by entity
 */
export declare const allTools: ({
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            title: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            auto_approve: {
                type: string;
                description: string;
                default: boolean;
            };
        };
        required: string[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            limit: {
                type: string;
                minimum: number;
                maximum: number;
                default: number;
                description: string;
            };
        };
        required: never[];
    };
} | {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            task_id: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
})[];
/**
 * Tool handlers mapped by tool name
 */
export declare const toolHandlers: {
    task_create_task: typeof handleTaskCreateTask;
    task_get_tasks: typeof handleTaskGetTasks;
    task_get_task: typeof handleTaskGetTask;
    task_update_task: typeof handleTaskUpdateTask;
    task_delete_task: typeof handleTaskDeleteTask;
    task_create_milestone: typeof handleTaskCreateMilestone;
    task_get_milestone: typeof handleTaskGetMilestone;
    task_update_milestone: typeof handleTaskUpdateMilestone;
    task_create_task_item: typeof handleTaskCreateTaskItem;
    task_get_task_item: typeof handleTaskGetTaskItem;
    task_update_task_item: typeof handleTaskUpdateTaskItem;
    task_update_progress: typeof handleTaskUpdateProgress;
    task_add_message: typeof handleTaskAddMessage;
};
/**
 * Get tool handler by name
 */
export declare function getToolHandler(toolName: string): typeof handleTaskCreateTask | typeof handleTaskGetTasks | typeof handleTaskGetTask | typeof handleTaskUpdateTask | typeof handleTaskDeleteTask | typeof handleTaskCreateMilestone | typeof handleTaskGetMilestone | typeof handleTaskUpdateMilestone | typeof handleTaskCreateTaskItem | typeof handleTaskGetTaskItem | typeof handleTaskUpdateTaskItem | typeof handleTaskUpdateProgress | typeof handleTaskAddMessage;
export { taskCreateTaskTool, handleTaskCreateTask, taskGetTasksTool, handleTaskGetTasks, taskGetTaskTool, handleTaskGetTask, taskUpdateTaskTool, handleTaskUpdateTask, taskDeleteTaskTool, handleTaskDeleteTask, taskCreateMilestoneTool, handleTaskCreateMilestone, taskGetMilestoneTool, handleTaskGetMilestone, taskUpdateMilestoneTool, handleTaskUpdateMilestone, taskCreateTaskItemTool, handleTaskCreateTaskItem, taskGetTaskItemTool, handleTaskGetTaskItem, taskUpdateTaskItemTool, handleTaskUpdateTaskItem, taskUpdateProgressTool, handleTaskUpdateProgress, taskAddMessageTool, handleTaskAddMessage };
//# sourceMappingURL=index.d.ts.map