import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/dto/transformers.ts
function toTaskItemApiResponse(item) {
  return {
    id: item.id,
    name: item.name,
    description: item.description,
    status: item.status,
    estimated_hours: item.estimated_hours,
    completed_at: item.completed_at,
    notes: item.notes
  };
}
function toMilestoneApiResponse(milestone) {
  return {
    id: milestone.id,
    name: milestone.name,
    description: milestone.description,
    status: milestone.status,
    progress: milestone.progress,
    tasks_completed: milestone.tasks_completed,
    tasks_total: milestone.tasks_total,
    started_at: milestone.started_at,
    completed_at: milestone.completed_at
  };
}
function toTaskProgressApiResponse(progress) {
  return {
    current_milestone: progress.current_milestone,
    current_task: progress.current_task,
    overall_percentage: progress.overall_percentage,
    milestones: progress.milestones.map(toMilestoneApiResponse),
    tasks: Object.fromEntries(
      Object.entries(progress.tasks).map(([milestoneId, items]) => [
        milestoneId,
        items.map(toTaskItemApiResponse)
      ])
    )
  };
}
function toTaskConfigApiResponse(config) {
  return {
    system_prompt: config.system_prompt,
    auto_approve: config.auto_approve,
    max_iterations: config.max_iterations
  };
}
function toTaskMetadataApiResponse(metadata) {
  if (!metadata) {
    return void 0;
  }
  return {
    conversation_id: metadata.conversation_id,
    parent_task_id: metadata.parent_task_id,
    tags: metadata.tags
  };
}
function toTaskApiResponse(task) {
  return {
    id: task.id,
    user_id: task.user_id,
    title: task.title,
    description: task.description,
    status: task.status,
    created_at: task.created_at,
    updated_at: task.updated_at,
    started_at: task.started_at,
    completed_at: task.completed_at,
    progress: toTaskProgressApiResponse(task.progress),
    config: toTaskConfigApiResponse(task.config),
    metadata: toTaskMetadataApiResponse(task.metadata)
    // execution field is intentionally excluded
    // Internal fields (api_messages, tool_results) are not exposed
  };
}
function toTaskMessageApiResponse(message) {
  return {
    id: message.id,
    task_id: message.task_id,
    role: message.role,
    content: message.content,
    timestamp: message.timestamp,
    metadata: message.metadata
  };
}
function toTaskListApiResponse(tasks) {
  return {
    tasks: tasks.map(toTaskApiResponse),
    total: tasks.length
  };
}
function toTaskMessageListApiResponse(messages) {
  return {
    messages: messages.map(toTaskMessageApiResponse),
    total: messages.length
  };
}
export {
  toMilestoneApiResponse,
  toTaskApiResponse,
  toTaskConfigApiResponse,
  toTaskItemApiResponse,
  toTaskListApiResponse,
  toTaskMessageApiResponse,
  toTaskMessageListApiResponse,
  toTaskMetadataApiResponse,
  toTaskProgressApiResponse
};
//# sourceMappingURL=index.js.map
