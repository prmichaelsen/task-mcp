/**
 * MCP Tool: task_update_progress
 *
 * Update the overall progress percentage for a task.
 */
import { FirebaseClient } from '@prmichaelsen/task-core/client';
export declare const taskUpdateProgressTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            task_id: {
                type: string;
                description: string;
            };
            percentage: {
                type: string;
                description: string;
                minimum: number;
                maximum: number;
            };
        };
        required: string[];
    };
};
export declare function handleTaskUpdateProgress(client: FirebaseClient, args: {
    task_id: string;
    percentage: number;
}): Promise<string>;
//# sourceMappingURL=task-update-progress.d.ts.map