/**
 * MCP Tool: task_update_task
 *
 * Update task properties including status, title, description, and configuration.
 * Allows partial updates - only specified fields will be changed.
 */
import { FirebaseClient } from '@prmichaelsen/task-core/client';
import type { Task } from '@prmichaelsen/task-core/schemas';
export declare const taskUpdateTaskTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            task_id: {
                type: string;
                description: string;
            };
            status: {
                type: string;
                enum: string[];
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handleTaskUpdateTask(client: FirebaseClient, args: {
    task_id: string;
    status?: Task['status'];
}): Promise<string>;
//# sourceMappingURL=task-update-task.d.ts.map