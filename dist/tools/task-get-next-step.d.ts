/**
 * MCP Tool: task_get_next_step
 *
 * Get instructions for the next step in the current task.
 * Returns the current task item with steps and verification criteria.
 */
import { FirebaseClient } from '@prmichaelsen/task-core/client';
export declare const taskGetNextStepTool: {
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
export declare function handleTaskGetNextStep(client: FirebaseClient, args: {
    task_id: string;
}): Promise<string>;
//# sourceMappingURL=task-get-next-step.d.ts.map