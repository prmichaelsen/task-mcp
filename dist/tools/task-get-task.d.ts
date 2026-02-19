/**
 * MCP Tool: task_task_get
 *
 * Get a task by ID. Returns the complete task object.
 */
import { FirebaseClient } from '@prmichaelsen/task-core/client';
export declare const taskGetTaskTool: {
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
};
export declare function handleTaskGetTask(client: FirebaseClient, args: {
    task_id: string;
}): Promise<string>;
//# sourceMappingURL=task-get-task.d.ts.map