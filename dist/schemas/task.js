import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/schemas/task.ts
import { z } from "zod";
var MilestoneSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(["not_started", "in_progress", "completed"]),
  progress: z.number().min(0).max(100),
  tasks_completed: z.number().min(0),
  tasks_total: z.number().min(0),
  started_at: z.string().optional(),
  completed_at: z.string().optional()
});
var TaskItemSchema = z.object({
  id: z.string(),
  name: z.string(),
  description: z.string(),
  status: z.enum(["not_started", "in_progress", "completed"]),
  estimated_hours: z.number().optional(),
  completed_at: z.string().optional(),
  notes: z.string().optional()
});
var TaskProgressSchema = z.object({
  current_milestone: z.string(),
  current_task: z.string(),
  overall_percentage: z.number().min(0).max(100),
  milestones: z.array(MilestoneSchema),
  tasks: z.record(z.string(), z.array(TaskItemSchema))
});
var TaskExecutionSchema = z.object({
  api_messages: z.array(z.any()),
  task_messages: z.array(z.any()),
  tool_results: z.array(z.any()),
  error: z.string().optional(),
  abort_reason: z.string().optional()
});
var TaskConfigSchema = z.object({
  system_prompt: z.string(),
  auto_approve: z.boolean(),
  max_iterations: z.number().optional()
});
var TaskMetadataSchema = z.object({
  conversation_id: z.string().optional(),
  parent_task_id: z.string().optional(),
  tags: z.array(z.string()).optional()
}).optional();
var TaskSchema = z.object({
  id: z.string(),
  user_id: z.string(),
  title: z.string(),
  description: z.string(),
  status: z.enum(["not_started", "in_progress", "paused", "completed", "failed"]),
  created_at: z.string(),
  updated_at: z.string(),
  started_at: z.string().optional(),
  completed_at: z.string().optional(),
  progress: TaskProgressSchema,
  execution: TaskExecutionSchema,
  config: TaskConfigSchema,
  metadata: TaskMetadataSchema
});
var TaskMessageSchema = z.object({
  id: z.string(),
  task_id: z.string(),
  role: z.enum(["user", "assistant", "system"]),
  content: z.string(),
  timestamp: z.string(),
  metadata: z.any().optional()
});
var TaskStatus = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  PAUSED: "paused",
  COMPLETED: "completed",
  FAILED: "failed"
};
var MilestoneStatus = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed"
};
var TaskItemStatus = {
  NOT_STARTED: "not_started",
  IN_PROGRESS: "in_progress",
  COMPLETED: "completed"
};
var MessageRole = {
  USER: "user",
  ASSISTANT: "assistant",
  SYSTEM: "system"
};
export {
  MessageRole,
  MilestoneSchema,
  MilestoneStatus,
  TaskConfigSchema,
  TaskExecutionSchema,
  TaskItemSchema,
  TaskItemStatus,
  TaskMessageSchema,
  TaskMetadataSchema,
  TaskProgressSchema,
  TaskSchema,
  TaskStatus
};
//# sourceMappingURL=task.js.map
