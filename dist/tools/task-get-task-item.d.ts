/**
 * MCP Tool: task_task_item_get
 *
 * Get a task item by ID from a milestone.
 */
import { FirebaseClient } from '@prmichaelsen/task-core/client';
export declare const taskGetTaskItemTool: {
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
export declare function handleTaskGetTaskItem(client: FirebaseClient, args: {
    task_id: string;
    milestone_id: string;
    task_item_id: string;
}): Promise<string>;
//# sourceMappingURL=task-get-task-item.d.ts.map