/**
 * MCP Tool: task_delete_milestone
 *
 * Delete a milestone and all its task items from a task.
 * This action cannot be undone.
 */
import { FirebaseClient } from '@prmichaelsen/task-core/client';
export declare const taskDeleteMilestoneTool: {
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
            confirm: {
                type: string;
                description: string;
                default: boolean;
            };
        };
        required: string[];
    };
};
export declare function handleTaskDeleteMilestone(client: FirebaseClient, args: {
    task_id: string;
    milestone_id: string;
    confirm: boolean;
}): Promise<string>;
//# sourceMappingURL=task-delete-milestone.d.ts.map