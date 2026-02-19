/**
 * MCP Tool: task_delete_task
 *
 * Delete a task permanently. This action cannot be undone.
 */
import { FirebaseClient } from '@prmichaelsen/task-core/client';
export declare const taskDeleteTaskTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            task_id: {
                type: string;
                description: string;
            };
            confirm: {
                type: string;
                description: string;
                default: boolean;
            };
        };
        required: string[];
    };
};
export declare function handleTaskDeleteTask(client: FirebaseClient, args: {
    task_id: string;
    confirm: boolean;
}): Promise<string>;
//# sourceMappingURL=task-delete-task.d.ts.map