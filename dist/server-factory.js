import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/server-factory.ts
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from "@modelcontextprotocol/sdk/types.js";
import { FirebaseClient } from "@prmichaelsen/task-core/client";

// src/tools/task-get-status.ts
var taskGetStatusTool = {
  name: "task_get_status",
  description: "Get current task status and progress",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "Task ID to get status for"
      }
    },
    required: ["task_id"]
  }
};
async function handleTaskGetStatus(client, args) {
  try {
    const task = await client.getTask(args.task_id);
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`);
    }
    const currentMilestone = task.progress.milestones.find(
      (m) => m.id === task.progress.current_milestone
    );
    let currentTaskItem = null;
    if (task.progress.current_task && task.progress.current_milestone) {
      const milestoneItems = task.progress.tasks[task.progress.current_milestone] || [];
      currentTaskItem = milestoneItems.find(
        (item) => item.id === task.progress.current_task
      );
    }
    return JSON.stringify({
      task_id: task.id,
      task_title: task.title,
      status: task.status,
      overall_progress: task.progress.overall_percentage,
      current_milestone: currentMilestone ? {
        id: currentMilestone.id,
        name: currentMilestone.name,
        status: currentMilestone.status,
        progress: currentMilestone.progress,
        tasks_completed: currentMilestone.tasks_completed,
        tasks_total: currentMilestone.tasks_total
      } : null,
      current_task: currentTaskItem ? {
        id: currentTaskItem.id,
        name: currentTaskItem.name,
        status: currentTaskItem.status
      } : null,
      milestones_summary: {
        total: task.progress.milestones.length,
        completed: task.progress.milestones.filter((m) => m.status === "completed").length,
        in_progress: task.progress.milestones.filter((m) => m.status === "in_progress").length
      }
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to get task status: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/task-get-next-step.ts
var taskGetNextStepTool = {
  name: "task_get_next_step",
  description: "Get instructions for the next step in the current task",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "Task ID"
      }
    },
    required: ["task_id"]
  }
};
async function handleTaskGetNextStep(client, args) {
  try {
    const task = await client.getTask(args.task_id);
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`);
    }
    if (task.status === "paused") {
      return JSON.stringify({
        status: "paused",
        message: "Task is paused. Resume the task to continue.",
        instructions: null
      }, null, 2);
    }
    if (task.status === "completed") {
      return JSON.stringify({
        status: "completed",
        message: "Task is already completed.",
        instructions: null
      }, null, 2);
    }
    const currentMilestone = task.progress.milestones.find(
      (m) => m.id === task.progress.current_milestone
    );
    if (!currentMilestone) {
      return JSON.stringify({
        status: "no_milestone",
        message: "No current milestone. Create milestones to begin work.",
        instructions: "Use task_create_milestone to add milestones to this task."
      }, null, 2);
    }
    const milestoneItems = task.progress.tasks[task.progress.current_milestone] || [];
    const currentTaskItem = milestoneItems.find(
      (item) => item.id === task.progress.current_task
    );
    if (!currentTaskItem) {
      const nextTask = milestoneItems.find(
        (item) => item.status === "not_started" || item.status === "in_progress"
      );
      if (!nextTask) {
        return JSON.stringify({
          status: "milestone_complete",
          message: `Milestone "${currentMilestone.name}" is complete.`,
          instructions: "Move to the next milestone or complete the task.",
          current_milestone: currentMilestone.name
        }, null, 2);
      }
      return JSON.stringify({
        status: "ready",
        current_milestone: {
          id: currentMilestone.id,
          name: currentMilestone.name
        },
        next_task: {
          id: nextTask.id,
          name: nextTask.name,
          description: nextTask.description,
          status: nextTask.status,
          estimated_hours: nextTask.estimated_hours
        },
        instructions: `Begin work on: ${nextTask.name}

Description: ${nextTask.description}`
      }, null, 2);
    }
    return JSON.stringify({
      status: "in_progress",
      current_milestone: {
        id: currentMilestone.id,
        name: currentMilestone.name,
        progress: currentMilestone.progress
      },
      current_task: {
        id: currentTaskItem.id,
        name: currentTaskItem.name,
        description: currentTaskItem.description,
        status: currentTaskItem.status,
        estimated_hours: currentTaskItem.estimated_hours,
        notes: currentTaskItem.notes
      },
      instructions: `Continue work on: ${currentTaskItem.name}

Description: ${currentTaskItem.description}${currentTaskItem.notes ? `

Notes: ${currentTaskItem.notes}` : ""}`
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to get next step: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/task-update-progress.ts
var taskUpdateProgressTool = {
  name: "task_update_progress",
  description: "Update the overall progress percentage for a task",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "Task ID"
      },
      percentage: {
        type: "number",
        description: "Progress percentage (0-100)",
        minimum: 0,
        maximum: 100
      }
    },
    required: ["task_id", "percentage"]
  }
};
async function handleTaskUpdateProgress(client, args) {
  try {
    const percentage = Math.min(100, Math.max(0, args.percentage));
    await client.updateOverallProgress(args.task_id, percentage);
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      progress: percentage,
      message: `Progress updated to ${percentage}%`
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to update progress: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/task-complete-task-item.ts
var taskCompleteTaskItemTool = {
  name: "task_complete_task_item",
  description: "Mark a task item as complete",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "Task ID"
      },
      milestone_id: {
        type: "string",
        description: "Milestone ID"
      },
      task_item_id: {
        type: "string",
        description: "Task item ID to complete"
      }
    },
    required: ["task_id", "milestone_id", "task_item_id"]
  }
};
async function handleTaskCompleteTaskItem(client, args) {
  try {
    await client.completeTaskItem(args.task_id, args.milestone_id, args.task_item_id);
    const task = await client.getTask(args.task_id);
    if (!task) {
      throw new Error("Task not found after update");
    }
    const milestone = task.progress.milestones.find((m) => m.id === args.milestone_id);
    const milestoneItems = task.progress.tasks[args.milestone_id] || [];
    const completedCount = milestoneItems.filter((item) => item.status === "completed").length;
    const milestoneProgress = milestone ? Math.round(completedCount / milestoneItems.length * 100) : 0;
    if (milestone && milestone.progress !== milestoneProgress) {
      await client.updateMilestone(args.task_id, args.milestone_id, {
        progress: milestoneProgress,
        tasks_completed: completedCount,
        tasks_total: milestoneItems.length
      });
    }
    const nextTask = milestoneItems.find(
      (item) => item.status === "not_started" || item.status === "in_progress"
    );
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      completed_task: args.task_item_id,
      milestone_progress: milestoneProgress,
      milestone_tasks_completed: completedCount,
      milestone_tasks_total: milestoneItems.length,
      next_task: nextTask ? {
        id: nextTask.id,
        name: nextTask.name
      } : null,
      message: nextTask ? `Task item completed. Next: ${nextTask.name}` : "Task item completed. Milestone complete!"
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to complete task item: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/task-create-milestone.ts
var taskCreateMilestoneTool = {
  name: "task_create_milestone",
  description: "Create a new milestone in a task",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "Task ID"
      },
      milestone_id: {
        type: "string",
        description: 'Unique milestone ID (e.g., "milestone-1")'
      },
      name: {
        type: "string",
        description: "Milestone name"
      },
      description: {
        type: "string",
        description: "Milestone description"
      }
    },
    required: ["task_id", "milestone_id", "name", "description"]
  }
};
async function handleTaskCreateMilestone(client, args) {
  try {
    const milestone = {
      id: args.milestone_id,
      name: args.name,
      description: args.description,
      status: "not_started",
      progress: 0,
      tasks_completed: 0,
      tasks_total: 0
    };
    await client.createMilestone(args.task_id, milestone);
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      milestone: {
        id: milestone.id,
        name: milestone.name,
        description: milestone.description
      },
      message: `Milestone "${milestone.name}" created successfully`
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to create milestone: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/task-create-task-item.ts
var taskCreateTaskItemTool = {
  name: "task_create_task_item",
  description: "Create a new task item within a milestone",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "Task ID"
      },
      milestone_id: {
        type: "string",
        description: "Milestone ID"
      },
      task_item_id: {
        type: "string",
        description: 'Unique task item ID (e.g., "task-1")'
      },
      name: {
        type: "string",
        description: "Task item name"
      },
      description: {
        type: "string",
        description: "Task item description"
      },
      estimated_hours: {
        type: "number",
        description: "Estimated hours to complete (optional)"
      }
    },
    required: ["task_id", "milestone_id", "task_item_id", "name", "description"]
  }
};
async function handleTaskCreateTaskItem(client, args) {
  try {
    const taskItem = {
      id: args.task_item_id,
      name: args.name,
      description: args.description,
      status: "not_started",
      estimated_hours: args.estimated_hours
    };
    await client.createTaskItem(args.task_id, args.milestone_id, taskItem);
    const task = await client.getTask(args.task_id);
    if (task) {
      const milestoneItems = task.progress.tasks[args.milestone_id] || [];
      await client.updateMilestone(args.task_id, args.milestone_id, {
        tasks_total: milestoneItems.length
      });
    }
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      milestone_id: args.milestone_id,
      task_item: {
        id: taskItem.id,
        name: taskItem.name,
        description: taskItem.description,
        estimated_hours: taskItem.estimated_hours
      },
      message: `Task item "${taskItem.name}" created in milestone`
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to create task item: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/task-report-completion.ts
var taskReportCompletionTool = {
  name: "task_report_completion",
  description: "Report completion of a task item and get next instructions",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "Task ID"
      },
      milestone_id: {
        type: "string",
        description: "Milestone ID"
      },
      task_item_id: {
        type: "string",
        description: "Task item ID that was completed"
      },
      notes: {
        type: "string",
        description: "Optional notes about the completion"
      }
    },
    required: ["task_id", "milestone_id", "task_item_id"]
  }
};
async function handleTaskReportCompletion(client, args) {
  try {
    if (args.notes) {
      await client.updateTaskItem(
        args.task_id,
        args.milestone_id,
        args.task_item_id,
        { notes: args.notes }
      );
    }
    const completionResult = await handleTaskCompleteTaskItem(client, {
      task_id: args.task_id,
      milestone_id: args.milestone_id,
      task_item_id: args.task_item_id
    });
    const nextStepResult = await handleTaskGetNextStep(client, {
      task_id: args.task_id
    });
    const completion = JSON.parse(completionResult);
    const nextStep = JSON.parse(nextStepResult);
    return JSON.stringify({
      completion: {
        success: completion.success,
        completed_task: completion.completed_task,
        milestone_progress: completion.milestone_progress
      },
      next_step: nextStep,
      message: completion.message
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to report completion: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/task-add-message.ts
var taskAddMessageTool = {
  name: "task_add_message",
  description: "Add a message to the task conversation thread",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "Task ID"
      },
      role: {
        type: "string",
        enum: ["user", "assistant", "system"],
        description: "Message role"
      },
      content: {
        type: "string",
        description: "Message content"
      },
      metadata: {
        type: "object",
        description: "Optional metadata (JSON object)"
      }
    },
    required: ["task_id", "role", "content"]
  }
};
async function handleTaskAddMessage(client, args) {
  try {
    const messageId = await client.addMessage(
      args.task_id,
      args.role,
      args.content,
      args.metadata
    );
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      message_id: messageId,
      role: args.role,
      message: "Message added to task thread"
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to add message: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/index.ts
var allTools = [
  taskGetStatusTool,
  taskGetNextStepTool,
  taskUpdateProgressTool,
  taskCompleteTaskItemTool,
  taskCreateMilestoneTool,
  taskCreateTaskItemTool,
  taskReportCompletionTool,
  taskAddMessageTool
];
var toolHandlers = {
  "task_get_status": handleTaskGetStatus,
  "task_get_next_step": handleTaskGetNextStep,
  "task_update_progress": handleTaskUpdateProgress,
  "task_complete_task_item": handleTaskCompleteTaskItem,
  "task_create_milestone": handleTaskCreateMilestone,
  "task_create_task_item": handleTaskCreateTaskItem,
  "task_report_completion": handleTaskReportCompletion,
  "task_add_message": handleTaskAddMessage
};
function getToolHandler(toolName) {
  return toolHandlers[toolName];
}

// src/server-factory.ts
async function createServer(accessToken, userId, options = {}) {
  if (!userId) {
    throw new Error("userId is required");
  }
  const client = new FirebaseClient({ userId });
  await client.connect();
  const server = new Server(
    {
      name: options.name || "task-mcp",
      version: options.version || "0.1.0"
    },
    {
      capabilities: {
        tools: {}
      }
    }
  );
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools
    };
  });
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params;
    try {
      const handler = getToolHandler(name);
      if (!handler) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        );
      }
      const result = await handler(client, args || {});
      return {
        content: [
          {
            type: "text",
            text: result
          }
        ]
      };
    } catch (error) {
      if (error instanceof McpError) {
        throw error;
      }
      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
      );
    }
  });
  return server;
}
export {
  createServer
};
//# sourceMappingURL=server-factory.js.map
