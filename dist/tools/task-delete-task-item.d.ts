/**
 * MCP Tool: task_delete_task_item
 *
 * Delete a task item from a milestone.
 * This action cannot be undone.
 */
import { FirebaseClient } from '@prmichaelsen/task-core/client';
export declare const taskDeleteTaskItemTool: {
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
            confirm: {
                type: string;
                description: string;
                default: boolean;
            };
        };
        required: string[];
    };
};
export declare function handleTaskDeleteTaskItem(client: FirebaseClient, args: {
    task_id: string;
    milestone_id: string;
    task_item_id: string;
    confirm: boolean;
}): Promise<string>;
//# sourceMappingURL=task-delete-task-item.d.ts.map