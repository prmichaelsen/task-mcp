/**
 * MCP Tool: task_update_task_item
 *
 * Update task item properties including status, description, and estimated hours.
 * Allows partial updates - only specified fields will be changed.
 * Automatically updates milestone progress when task item status changes.
 */
import { FirebaseClient } from '@prmichaelsen/task-core/client';
import type { TaskItem } from '@prmichaelsen/task-core/schemas';
export declare const taskUpdateTaskItemTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            task_id: {
                type: string;
                description: string;
            };
            milestone_id: {
                type: string;
                description: string;
            };
            task_item_id: {
                type: string;
                description: string;
            };
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            estimated_hours: {
                type: string;
                minimum: number;
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handleTaskUpdateTaskItem(client: FirebaseClient, args: {
    task_id: string;
    milestone_id: string;
    task_item_id: string;
    status?: TaskItem['status'];
    description?: string;
    estimated_hours?: number;
}): Promise<string>;
//# sourceMappingURL=task-update-task-item.d.ts.map