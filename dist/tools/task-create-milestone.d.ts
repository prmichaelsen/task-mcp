/**
 * MCP Tool: task_create_milestone
 *
 * Create a new milestone in a task.
 */
import { FirebaseClient } from '@/client.js';
export declare const taskCreateMilestoneTool: {
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
            name: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handleTaskCreateMilestone(client: FirebaseClient, args: {
    task_id: string;
    milestone_id: string;
    name: string;
    description: string;
}): Promise<string>;
//# sourceMappingURL=task-create-milestone.d.ts.map