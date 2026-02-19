/**
 * MCP Tool: task_milestone_get
 *
 * Get a milestone by ID from a task.
 */
import { FirebaseClient } from '@prmichaelsen/task-core/client';
export declare const taskGetMilestoneTool: {
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
        };
        required: string[];
    };
};
export declare function handleTaskGetMilestone(client: FirebaseClient, args: {
    task_id: string;
    milestone_id: string;
}): Promise<string>;
//# sourceMappingURL=task-get-milestone.d.ts.map