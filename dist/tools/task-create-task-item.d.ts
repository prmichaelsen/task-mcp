/**
 * MCP Tool: task_create_task_item
 *
 * Create a new task item within a milestone.
 */
import { FirebaseClient } from '@/client.js';
export declare const taskCreateTaskItemTool: {
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
            name: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            estimated_hours: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handleTaskCreateTaskItem(client: FirebaseClient, args: {
    task_id: string;
    milestone_id: string;
    task_item_id: string;
    name: string;
    description: string;
    estimated_hours?: number;
}): Promise<string>;
//# sourceMappingURL=task-create-task-item.d.ts.map