/**
 * MCP Tool: task_get_status
 *
 * Get current task status and progress information.
 * Returns task title, status, current milestone, and overall progress.
 */
import { FirebaseClient } from '@/client.js';
export declare const taskGetStatusTool: {
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
export declare function handleTaskGetStatus(client: FirebaseClient, args: {
    task_id: string;
}): Promise<string>;
//# sourceMappingURL=task-get-status.d.ts.map