/**
 * MCP Tools Index
 *
 * Exports all task management tools for the MCP server.
 */
import { taskGetStatusTool, handleTaskGetStatus } from './task-get-status.js';
import { taskGetNextStepTool, handleTaskGetNextStep } from './task-get-next-step.js';
import { taskUpdateProgressTool, handleTaskUpdateProgress } from './task-update-progress.js';
import { taskCompleteTaskItemTool, handleTaskCompleteTaskItem } from './task-complete-task-item.js';
import { taskCreateMilestoneTool, handleTaskCreateMilestone } from './task-create-milestone.js';
import { taskCreateTaskItemTool, handleTaskCreateTaskItem } from './task-create-task-item.js';
import { taskReportCompletionTool, handleTaskReportCompletion } from './task-report-completion.js';
import { taskAddMessageTool, handleTaskAddMessage } from './task-add-message.js';
/**
 * All tool definitions
 */
export declare const allTools: {
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
}[];
/**
 * Tool handlers mapped by tool name
 */
export declare const toolHandlers: {
    task_get_status: typeof handleTaskGetStatus;
    task_get_next_step: typeof handleTaskGetNextStep;
    task_update_progress: typeof handleTaskUpdateProgress;
    task_complete_task_item: typeof handleTaskCompleteTaskItem;
    task_create_milestone: typeof handleTaskCreateMilestone;
    task_create_task_item: typeof handleTaskCreateTaskItem;
    task_report_completion: typeof handleTaskReportCompletion;
    task_add_message: typeof handleTaskAddMessage;
};
/**
 * Get tool handler by name
 */
export declare function getToolHandler(toolName: string): typeof handleTaskCompleteTaskItem | typeof handleTaskGetNextStep | typeof handleTaskGetStatus | typeof handleTaskUpdateProgress | typeof handleTaskCreateMilestone | typeof handleTaskCreateTaskItem | typeof handleTaskReportCompletion | typeof handleTaskAddMessage;
export { taskGetStatusTool, handleTaskGetStatus, taskGetNextStepTool, handleTaskGetNextStep, taskUpdateProgressTool, handleTaskUpdateProgress, taskCompleteTaskItemTool, handleTaskCompleteTaskItem, taskCreateMilestoneTool, handleTaskCreateMilestone, taskCreateTaskItemTool, handleTaskCreateTaskItem, taskReportCompletionTool, handleTaskReportCompletion, taskAddMessageTool, handleTaskAddMessage };
//# sourceMappingURL=index.d.ts.map