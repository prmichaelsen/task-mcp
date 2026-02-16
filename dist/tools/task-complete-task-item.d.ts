/**
 * MCP Tool: task_complete_task_item
 *
 * Mark a task item as complete and update milestone progress.
 */
import { FirebaseClient } from '@/client.js';
export declare const taskCompleteTaskItemTool: {
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
        };
        required: string[];
    };
};
export declare function handleTaskCompleteTaskItem(client: FirebaseClient, args: {
    task_id: string;
    milestone_id: string;
    task_item_id: string;
}): Promise<string>;
//# sourceMappingURL=task-complete-task-item.d.ts.map