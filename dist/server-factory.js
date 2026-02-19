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

// src/tools/task-create-task.ts
var taskCreateTaskTool = {
  name: "task_create_task",
  description: `Create a new task with title and description.

NOTE: Tasks in this system correspond to ACP Projects. The task's progress structure follows the ACP progress.yaml format with:
- Milestones (major phases)
- Task Items (granular work items within milestones)
- Progress tracking (percentages, status, completion dates)

After creating a task, use:
- task_create_milestone to add milestones
- task_create_task_item to add task items to milestones
- task_update_progress to track overall completion

The progress structure matches agent/progress.yaml format but stored as Firestore objects.`,
  inputSchema: {
    type: "object",
    properties: {
      title: {
        type: "string",
        description: "Task title (1-200 characters)"
      },
      description: {
        type: "string",
        description: "Task description (1-5000 characters)"
      },
      auto_approve: {
        type: "boolean",
        description: "Whether to auto-approve task steps (optional)",
        default: false
      }
    },
    required: ["title", "description"]
  }
};
async function handleTaskCreateTask(client, args) {
  try {
    if (!args.title || args.title.trim().length === 0) {
      throw new Error("Task title is required");
    }
    if (!args.description || args.description.trim().length === 0) {
      throw new Error("Task description is required");
    }
    if (args.title.length > 200) {
      throw new Error("Task title must be 200 characters or less");
    }
    if (args.description.length > 5e3) {
      throw new Error("Task description must be 5000 characters or less");
    }
    const config = {
      system_prompt: "You are an AI assistant helping to complete tasks using the Agent Context Protocol (ACP).",
      auto_approve: args.auto_approve ?? false
    };
    const createdTask = await client.createTask(
      args.title.trim(),
      args.description.trim(),
      config,
      {}
      // metadata
    );
    return JSON.stringify({
      success: true,
      task_id: createdTask.id,
      task: {
        id: createdTask.id,
        title: createdTask.title,
        description: createdTask.description,
        status: createdTask.status,
        created_at: createdTask.created_at
      },
      message: `Task "${createdTask.title}" created successfully`,
      next_steps: [
        "Use task_create_milestone to add milestones",
        "Use task_create_task_item to add tasks to milestones",
        "Use task_get_status to check task progress",
        "Use task_get_next_step to begin work"
      ]
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to create task: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/task-get-tasks.ts
var taskGetTasksTool = {
  name: "task_get_tasks",
  description: "List all tasks for the current user, optionally filtered by status",
  inputSchema: {
    type: "object",
    properties: {
      status: {
        type: "string",
        enum: ["not_started", "in_progress", "paused", "completed", "failed"],
        description: "Filter by task status (optional)"
      },
      limit: {
        type: "number",
        minimum: 1,
        maximum: 100,
        default: 50,
        description: "Maximum number of tasks to return (optional, default: 50)"
      }
    },
    required: []
  }
};
async function handleTaskGetTasks(client, args) {
  try {
    let tasks;
    if (args.status) {
      tasks = await client.getTasksByStatus(args.status, args.limit || 50);
    } else {
      tasks = await client.listTasks(args.limit || 50);
    }
    return JSON.stringify({
      tasks: tasks.map((t) => ({
        id: t.id,
        title: t.title,
        status: t.status,
        created_at: t.created_at,
        updated_at: t.updated_at,
        overall_progress: t.progress.overall_percentage,
        current_milestone: t.progress.current_milestone,
        milestones_count: t.progress.milestones.length
      })),
      count: tasks.length,
      message: `Found ${tasks.length} task(s)`
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to get tasks: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/task-get-task.ts
var taskGetTaskTool = {
  name: "task_get_task",
  description: "Get a task by ID",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "Task ID to retrieve"
      }
    },
    required: ["task_id"]
  }
};
async function handleTaskGetTask(client, args) {
  try {
    const task = await client.getTask(args.task_id);
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`);
    }
    return JSON.stringify(task, null, 2);
  } catch (error) {
    throw new Error(`Failed to get task: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/task-update-task.ts
var taskUpdateTaskTool = {
  name: "task_update_task",
  description: "Update task properties (status, title, description, config)",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "Task ID to update"
      },
      status: {
        type: "string",
        enum: ["not_started", "in_progress", "paused", "completed", "failed"],
        description: "New task status (optional)"
      }
    },
    required: ["task_id"]
  }
};
async function handleTaskUpdateTask(client, args) {
  try {
    const task = await client.getTask(args.task_id);
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`);
    }
    const updates = [];
    if (args.status) {
      await client.updateTaskStatus(args.task_id, args.status);
      updates.push(`status: ${task.status} \u2192 ${args.status}`);
    }
    if (updates.length === 0) {
      return JSON.stringify({
        success: false,
        message: "No updates specified. Provide at least one field to update."
      }, null, 2);
    }
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      updates,
      message: `Task updated successfully`
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to update task: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/task-delete-task.ts
var taskDeleteTaskTool = {
  name: "task_delete_task",
  description: "Delete a task permanently (cannot be undone)",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "Task ID to delete"
      },
      confirm: {
        type: "boolean",
        description: "Confirmation flag - must be true to delete",
        default: false
      }
    },
    required: ["task_id", "confirm"]
  }
};
async function handleTaskDeleteTask(client, args) {
  try {
    if (!args.confirm) {
      return JSON.stringify({
        success: false,
        message: "Deletion requires confirmation. Set confirm=true to proceed.",
        warning: "This action cannot be undone"
      }, null, 2);
    }
    const task = await client.getTask(args.task_id);
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`);
    }
    const taskTitle = task.title;
    await client.deleteTask(args.task_id);
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      task_title: taskTitle,
      message: `Task "${taskTitle}" deleted successfully`
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to delete task: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/templates.ts
var TASK_ITEM_TEMPLATE = `# Task {N}: {Descriptive Task Name}

**Milestone**: M{N} - Milestone Name
**Estimated Time**: [e.g., "2 hours", "4 hours", "1 day"]
**Dependencies**: [List prerequisite tasks, or "None"]
**Status**: Not Started | In Progress | Completed

---

## Objective

[Clearly state what this task accomplishes. Be specific and focused on a single, achievable goal.]

---

## Context

[Provide background information that helps understand why this task is necessary and how it fits into the larger milestone.]

---

## Steps

### 1. [Step Category or Action]
[Detailed description of what to do]

### 2. [Next Step]
[Detailed description]

### 3. [Next Step]
[Detailed description]

---

## Verification

- [ ] Verification item 1: [Specific condition to check]
- [ ] Verification item 2: [Specific condition to check]
- [ ] Verification item 3: [Specific condition to check]

---

## Expected Output

[Describe what should exist after this task is complete]

**File Structure**:
\`\`\`
project-root/
\u251C\u2500\u2500 file1
\u251C\u2500\u2500 file2
\u2514\u2500\u2500 directory/
    \u2514\u2500\u2500 file3
\`\`\`

**Key Files Created**:
- file1: [Purpose]
- file2: [Purpose]

---

## Common Issues and Solutions

### Issue 1: [Problem description]
**Symptom**: [What the user will see]
**Solution**: [How to fix it]

### Issue 2: [Problem description]
**Symptom**: [What the user will see]
**Solution**: [How to fix it]

---

## Resources

- [Resource 1 Name](URL): Description
- [Resource 2 Name](URL): Description

---

## Notes

- Note 1: [Important information]
- Note 2: [Important information]

---

**Next Task**: task-{N+1}-{name}.md
**Related Design Docs**: [Links to relevant design documents]
**Estimated Completion Date**: [YYYY-MM-DD or "TBD"]
`;
var MILESTONE_TEMPLATE = `# Milestone {N}: {Descriptive Name}

**Goal**: [One-line objective that clearly states what this milestone achieves]
**Duration**: [Estimated time: e.g., "1-2 weeks", "3-5 days"]
**Dependencies**: [List prerequisite milestones or "None"]
**Status**: Not Started | In Progress | Completed

---

## Overview

[Comprehensive description of what this milestone accomplishes and why it's important]

---

## Deliverables

### 1. [Deliverable Category 1]
- Specific item 1
- Specific item 2

### 2. [Deliverable Category 2]
- Specific item 1
- Specific item 2

### 3. [Deliverable Category 3]
- Specific item 1
- Specific item 2

---

## Success Criteria

- [ ] Criterion 1: [Specific, measurable condition]
- [ ] Criterion 2: [Specific, measurable condition]
- [ ] Criterion 3: [Specific, measurable condition]
- [ ] Criterion 4: [Specific, measurable condition]
- [ ] Criterion 5: [Specific, measurable condition]

---

## Key Files to Create

\`\`\`
project-root/
\u251C\u2500\u2500 file1.ext
\u251C\u2500\u2500 file2.ext
\u251C\u2500\u2500 directory1/
\u2502   \u251C\u2500\u2500 file3.ext
\u2502   \u2514\u2500\u2500 file4.ext
\u2514\u2500\u2500 directory2/
    \u251C\u2500\u2500 subdirectory/
    \u2502   \u2514\u2500\u2500 file5.ext
    \u2514\u2500\u2500 file6.ext
\`\`\`

---

## Tasks

1. Task 1: task-N-{name}.md - [Brief description]
2. Task 2: task-N-{name}.md - [Brief description]
3. Task 3: task-N-{name}.md - [Brief description]
4. Task 4: task-N-{name}.md - [Brief description]

---

## Environment Variables

[If this milestone requires environment configuration:]

\`\`\`env
# Category 1
VAR_NAME_1=example_value
VAR_NAME_2=example_value

# Category 2
VAR_NAME_3=example_value
\`\`\`

---

## Testing Requirements

- [ ] Test category 1: [Description]
- [ ] Test category 2: [Description]
- [ ] Test category 3: [Description]

---

## Documentation Requirements

- [ ] Document 1: [Description]
- [ ] Document 2: [Description]
- [ ] Document 3: [Description]

---

## Risks and Mitigation

| Risk | Impact | Probability | Mitigation Strategy |
|------|--------|-------------|---------------------|
| [Risk 1] | High/Medium/Low | High/Medium/Low | [How to mitigate] |
| [Risk 2] | High/Medium/Low | High/Medium/Low | [How to mitigate] |

---

**Next Milestone**: milestone-{N+1}-{name}.md
**Blockers**: [List any current blockers, or "None"]
**Notes**: [Any additional context or considerations]
`;

// src/tools/task-create-milestone.ts
var taskCreateMilestoneTool = {
  name: "task_create_milestone",
  description: `Create a new milestone in a task.

NOTE: Milestones correspond to ACP Milestones and should follow this structure:

${MILESTONE_TEMPLATE}

Use the 'description' parameter to provide the full milestone content following this structure.`,
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

// src/tools/task-get-milestone.ts
var taskGetMilestoneTool = {
  name: "task_get_milestone",
  description: "Get a milestone by ID",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "Task ID"
      },
      milestone_id: {
        type: "string",
        description: "Milestone ID to retrieve"
      }
    },
    required: ["task_id", "milestone_id"]
  }
};
async function handleTaskGetMilestone(client, args) {
  try {
    const task = await client.getTask(args.task_id);
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`);
    }
    const milestone = task.progress.milestones.find((m) => m.id === args.milestone_id);
    if (!milestone) {
      throw new Error(`Milestone not found: ${args.milestone_id}`);
    }
    return JSON.stringify(milestone, null, 2);
  } catch (error) {
    throw new Error(`Failed to get milestone: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/task-update-milestone.ts
var taskUpdateMilestoneTool = {
  name: "task_update_milestone",
  description: "Update milestone properties (status, progress, description, etc.)",
  inputSchema: {
    type: "object",
    properties: {
      task_id: {
        type: "string",
        description: "Task ID"
      },
      milestone_id: {
        type: "string",
        description: "Milestone ID to update"
      },
      status: {
        type: "string",
        enum: ["not_started", "in_progress", "completed"],
        description: "New milestone status (optional)"
      },
      progress: {
        type: "number",
        minimum: 0,
        maximum: 100,
        description: "Progress percentage 0-100 (optional)"
      },
      description: {
        type: "string",
        description: "Updated description (optional)"
      }
    },
    required: ["task_id", "milestone_id"]
  }
};
async function handleTaskUpdateMilestone(client, args) {
  try {
    const task = await client.getTask(args.task_id);
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`);
    }
    const milestone = task.progress.milestones.find((m) => m.id === args.milestone_id);
    if (!milestone) {
      throw new Error(`Milestone not found: ${args.milestone_id}`);
    }
    const updates = {};
    const changes = [];
    if (args.status) {
      updates.status = args.status;
      changes.push(`status: ${milestone.status} \u2192 ${args.status}`);
    }
    if (args.progress !== void 0) {
      updates.progress = args.progress;
      changes.push(`progress: ${milestone.progress}% \u2192 ${args.progress}%`);
    }
    if (args.description) {
      updates.description = args.description;
      changes.push(`description updated`);
    }
    if (changes.length === 0) {
      return JSON.stringify({
        success: false,
        message: "No updates specified. Provide at least one field to update."
      }, null, 2);
    }
    await client.updateMilestone(args.task_id, args.milestone_id, updates);
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      milestone_id: args.milestone_id,
      milestone_name: milestone.name,
      updates: changes,
      message: `Milestone "${milestone.name}" updated successfully`
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to update milestone: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/task-create-task-item.ts
var taskCreateTaskItemTool = {
  name: "task_create_task_item",
  description: `Create a new task item within a milestone.

NOTE: Task items correspond to ACP Tasks and should follow this structure:

${TASK_ITEM_TEMPLATE}

Use the 'description' parameter to provide the full task content following this structure.`,
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

// src/tools/task-get-task-item.ts
var taskGetTaskItemTool = {
  name: "task_get_task_item",
  description: "Get a task item by ID",
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
        description: "Task item ID to retrieve"
      }
    },
    required: ["task_id", "milestone_id", "task_item_id"]
  }
};
async function handleTaskGetTaskItem(client, args) {
  try {
    const task = await client.getTask(args.task_id);
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`);
    }
    const milestone = task.progress.milestones.find((m) => m.id === args.milestone_id);
    if (!milestone) {
      throw new Error(`Milestone not found: ${args.milestone_id}`);
    }
    const milestoneItems = task.progress.tasks[args.milestone_id] || [];
    const taskItem = milestoneItems.find((item) => item.id === args.task_item_id);
    if (!taskItem) {
      throw new Error(`Task item not found: ${args.task_item_id}`);
    }
    return JSON.stringify(taskItem, null, 2);
  } catch (error) {
    throw new Error(`Failed to get task item: ${error instanceof Error ? error.message : String(error)}`);
  }
}

// src/tools/task-update-task-item.ts
var taskUpdateTaskItemTool = {
  name: "task_update_task_item",
  description: "Update task item properties (status, description, estimated_hours)",
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
        description: "Task item ID to update"
      },
      status: {
        type: "string",
        enum: ["not_started", "in_progress", "completed"],
        description: "New task item status (optional)"
      },
      description: {
        type: "string",
        description: "Updated description (optional)"
      },
      estimated_hours: {
        type: "number",
        minimum: 0,
        description: "Estimated hours to complete (optional)"
      }
    },
    required: ["task_id", "milestone_id", "task_item_id"]
  }
};
async function handleTaskUpdateTaskItem(client, args) {
  try {
    const task = await client.getTask(args.task_id);
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`);
    }
    const milestone = task.progress.milestones.find((m) => m.id === args.milestone_id);
    if (!milestone) {
      throw new Error(`Milestone not found: ${args.milestone_id}`);
    }
    const milestoneItems = task.progress.tasks[args.milestone_id] || [];
    const taskItem = milestoneItems.find((item) => item.id === args.task_item_id);
    if (!taskItem) {
      throw new Error(`Task item not found: ${args.task_item_id}`);
    }
    const updates = {};
    const changes = [];
    if (args.status) {
      updates.status = args.status;
      changes.push(`status: ${taskItem.status} \u2192 ${args.status}`);
    }
    if (args.description) {
      updates.description = args.description;
      changes.push(`description updated`);
    }
    if (args.estimated_hours !== void 0) {
      updates.estimated_hours = args.estimated_hours;
      changes.push(`estimated_hours: ${taskItem.estimated_hours || "none"} \u2192 ${args.estimated_hours}`);
    }
    if (changes.length === 0) {
      return JSON.stringify({
        success: false,
        message: "No updates specified. Provide at least one field to update."
      }, null, 2);
    }
    await client.updateTaskItem(args.task_id, args.milestone_id, args.task_item_id, updates);
    let milestoneProgressUpdate = null;
    if (args.status) {
      const updatedTask = await client.getTask(args.task_id);
      if (updatedTask) {
        const updatedItems = updatedTask.progress.tasks[args.milestone_id] || [];
        const completedCount = updatedItems.filter((item) => item.status === "completed").length;
        const totalCount = updatedItems.length;
        const newProgress = totalCount > 0 ? Math.round(completedCount / totalCount * 100) : 0;
        await client.updateMilestone(args.task_id, args.milestone_id, {
          progress: newProgress,
          tasks_completed: completedCount,
          status: completedCount === totalCount ? "completed" : completedCount > 0 ? "in_progress" : "not_started"
        });
        milestoneProgressUpdate = {
          completed: completedCount,
          total: totalCount,
          progress: newProgress
        };
      }
    }
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      milestone_id: args.milestone_id,
      task_item_id: args.task_item_id,
      task_item_name: taskItem.name,
      updates: changes,
      milestone_progress: milestoneProgressUpdate,
      message: `Task item "${taskItem.name}" updated successfully`
    }, null, 2);
  } catch (error) {
    throw new Error(`Failed to update task item: ${error instanceof Error ? error.message : String(error)}`);
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
  // Task CRUD (5 tools)
  taskCreateTaskTool,
  taskGetTasksTool,
  taskGetTaskTool,
  taskUpdateTaskTool,
  taskDeleteTaskTool,
  // Milestone CRU (3 tools - no delete, milestones are part of task)
  taskCreateMilestoneTool,
  taskGetMilestoneTool,
  taskUpdateMilestoneTool,
  // Task Item CRU (3 tools - no delete, task items are part of milestone)
  taskCreateTaskItemTool,
  taskGetTaskItemTool,
  taskUpdateTaskItemTool,
  // Progress & Communication (2 tools)
  taskUpdateProgressTool,
  taskAddMessageTool
];
var toolHandlers = {
  // Task CRUD
  "task_create_task": handleTaskCreateTask,
  "task_get_tasks": handleTaskGetTasks,
  "task_get_task": handleTaskGetTask,
  "task_update_task": handleTaskUpdateTask,
  "task_delete_task": handleTaskDeleteTask,
  // Milestone CRU
  "task_create_milestone": handleTaskCreateMilestone,
  "task_get_milestone": handleTaskGetMilestone,
  "task_update_milestone": handleTaskUpdateMilestone,
  // Task Item CRU
  "task_create_task_item": handleTaskCreateTaskItem,
  "task_get_task_item": handleTaskGetTaskItem,
  "task_update_task_item": handleTaskUpdateTaskItem,
  // Progress & Communication
  "task_update_progress": handleTaskUpdateProgress,
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
