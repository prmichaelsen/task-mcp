/**
 * MCP Tool: task_report_completion
 *
 * Agent reports completion of a task item and gets next instructions.
 * This is a convenience tool that combines completing a task item and getting the next step.
 */
import { FirebaseClient } from '@prmichaelsen/task-core/client';
export declare const taskReportCompletionTool: {
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
            notes: {
                type: string;
                description: string;
            };
        };
        required: string[];
    };
};
export declare function handleTaskReportCompletion(client: FirebaseClient, args: {
    task_id: string;
    milestone_id: string;
    task_item_id: string;
    notes?: string;
}): Promise<string>;
//# sourceMappingURL=task-report-completion.d.ts.map