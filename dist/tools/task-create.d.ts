/**
 * MCP Tool: task_create
 *
 * Create a new task with title, description, and optional configuration.
 * Returns the created task ID and initial status.
 */
import { FirebaseClient } from '@prmichaelsen/task-core/client';
export declare const taskCreateTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            title: {
                type: string;
                description: string;
            };
            description: {
                type: string;
                description: string;
            };
            auto_approve: {
                type: string;
                description: string;
                default: boolean;
            };
        };
        required: string[];
    };
};
export declare function handleTaskCreate(client: FirebaseClient, args: {
    title: string;
    description: string;
    auto_approve?: boolean;
}): Promise<string>;
//# sourceMappingURL=task-create.d.ts.map