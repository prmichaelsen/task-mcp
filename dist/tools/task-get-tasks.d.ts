/**
 * MCP Tool: task_get_tasks
 *
 * List all tasks for the current user. Supports filtering by status.
 */
import { FirebaseClient } from '@prmichaelsen/task-core/client';
import type { Task } from '@prmichaelsen/task-core/schemas';
export declare const taskGetTasksTool: {
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
};
export declare function handleTaskGetTasks(client: FirebaseClient, args: {
    status?: Task['status'];
    limit?: number;
}): Promise<string>;
//# sourceMappingURL=task-get-tasks.d.ts.map