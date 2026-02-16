/**
 * MCP Tool: task_add_message
 *
 * Add a message to the task conversation thread.
 */
import { FirebaseClient } from '@/client.js';
export declare const taskAddMessageTool: {
    name: string;
    description: string;
    inputSchema: {
        type: string;
        properties: {
            task_id: {
                type: string;
                description: string;
            };
            role: {
                type: string;
                enum: string[];
                description: string;
            };
            content: {
                type: string;
                description: string;
            };
            metadata: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handleTaskAddMessage(client: FirebaseClient, args: {
    task_id: string;
    role: 'user' | 'assistant' | 'system';
    content: string;
    metadata?: any;
}): Promise<string>;
//# sourceMappingURL=task-add-message.d.ts.map