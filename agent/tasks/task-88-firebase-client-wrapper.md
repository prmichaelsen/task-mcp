# Task 88: Firebase Client Wrapper & MCP Tools Foundation

**Milestone**: Milestone 2 - MCP Server Foundation
**Estimated Time**: 16 hours (revised from original scope)
**Dependencies**: Task 87 (Task Database Service)
**Status**: Not Started
**Last Updated**: 2026-02-16

---

## Objective

**REVISED**: Create Firebase Admin SDK client wrapper and foundational MCP tools for task-mcp server. This task was originally scoped for agentbase.me TaskExecutor but has been revised to match task-mcp's role as an MCP tool server that provides instructions to tenant platforms.

**Original Scope** (archived): TaskExecutor with Bedrock integration for agentbase.me
**Revised Scope**: Firebase client + core MCP tools for task-mcp server

---

## Steps

### 1. Create Firebase Client Wrapper

Create `src/client.ts`:
- Wrapper around TaskDatabaseService
- Service account authentication
- User-scoped operations
- Connection management
- Error handling

### 2. Create Core MCP Tool: task_get_status

Create `src/tools/task-get-status.ts`:
- Get current task status and progress
- Return milestone and task information
- Show overall progress percentage

### 3. Create Core MCP Tool: task_get_next_step

Create `src/tools/task-get-next-step.ts`:
- Find current task item from progress
- Return instructions for what to do next
- Include steps and verification criteria

### 4. Create Core MCP Tool: task_update_progress

Create `src/tools/task-update-progress.ts`:
- Update overall progress percentage
- Update milestone progress
- Recalculate completion metrics

### 5. Create Core MCP Tool: task_complete_task_item

Create `src/tools/task-complete-task-item.ts`:
- Mark a task item as complete
- Update milestone progress
- Move to next task if available

### 6. Create Core MCP Tool: task_create_milestone

Create `src/tools/task-create-milestone.ts`:
- Add a new milestone to task
- Initialize milestone with tasks
- Update progress tracking

### 7. Create Core MCP Tool: task_create_task_item

Create `src/tools/task-create-task-item.ts`:
- Add a task item to a milestone
- Update milestone task count
- Return confirmation

### 8. Create Core MCP Tool: task_report_completion

Create `src/tools/task-report-completion.ts`:
- Agent reports task item completion
- Update progress
- Get next instructions

### 9. Create Core MCP Tool: task_add_message

Create `src/tools/task-add-message.ts`:
- Add message to task thread
- Support user, assistant, system roles
- Return message ID

### 10. Create Tools Index

Create `src/tools/index.ts`:
- Export all tool definitions
- Export all tool handlers
- Create tool registry

### 11. Write Unit Tests

Create colocated test for each tool:
- Test tool definitions
- Test handlers with mocked client
- Test error handling
- Verify JSON responses

## Verification

- [ ] FirebaseClient wrapper created
- [ ] All 8 core tools implemented
- [ ] Each tool has definition and handler
- [ ] Tools return JSON strings
- [ ] Error handling works correctly
- [ ] Unit tests pass for all tools
- [ ] Tools follow MCP Bootstrap Pattern
- [ ] TypeScript compiles without errors

## Notes on Revision

**Why Revised**: Original task described TaskExecutor for agentbase.me with Bedrock integration. However, task-mcp is an MCP server that exposes tools, not an execution engine. The execution happens in the tenant platform (agentbase.me).

**Architecture Clarification**: 
- task-mcp provides **instructions** via MCP tools
- Tenant platform's agent **executes** those instructions
- Agent reports back to task-mcp via tools
- task-mcp tracks progress in Firestore

## Files to Create

- `src/client.ts` + `.spec.ts`
- `src/tools/task-get-status.ts` + `.spec.ts`
- `src/tools/task-get-next-step.ts` + `.spec.ts`
- `src/tools/task-update-progress.ts` + `.spec.ts`
- `src/tools/task-complete-task-item.ts` + `.spec.ts`
- `src/tools/task-create-milestone.ts` + `.spec.ts`
- `src/tools/task-create-task-item.ts` + `.spec.ts`
- `src/tools/task-report-completion.ts` + `.spec.ts`
- `src/tools/task-add-message.ts` + `.spec.ts`
- `src/tools/index.ts`
- `.env.example`

---

**Next Task**: [Task 89: MCP Server Implementation](task-89-mcp-server-implementation.md)
