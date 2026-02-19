/**
 * MCP Tool: task_update_milestone
 *
 * Update milestone properties including status, progress, and task counts.
 * Allows partial updates - only specified fields will be changed.
 */
import { FirebaseClient } from '@prmichaelsen/task-core/client';
import type { Milestone } from '@prmichaelsen/task-core/schemas';
export declare const taskUpdateMilestoneTool: {
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
            status: {
                type: string;
                enum: string[];
                description: string;
            };
            progress: {
                type: string;
                minimum: number;
                maximum: number;
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
export declare function handleTaskUpdateMilestone(client: FirebaseClient, args: {
    task_id: string;
    milestone_id: string;
    status?: Milestone['status'];
    progress?: number;
    description?: string;
}): Promise<string>;
//# sourceMappingURL=task-update-milestone.d.ts.map