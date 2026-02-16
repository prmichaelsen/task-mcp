# ACP Task Execution System for agentbase.me (MCP Server Architecture)

**Concept**: Port ACP-style autonomous task execution from Roo Code to agentbase.me using MCP server architecture
**Created**: 2026-02-16
**Last Updated**: 2026-02-16
**Status**: Design Specification

---

## Overview

This design document specifies the requirements for porting the Agent Context Protocol (ACP) task execution system from Roo Code to agentbase.me using an **MCP server-first architecture**. The goal is to enable long-running, autonomous task execution where agents work through structured milestones and tasks independently in the background, separate from conversational threads.

**Core Principle**: Unlike Roo Code's optimistic completion model (where agents ask for approval before proceeding), agentbase.me will use a **pessimistic execution model** where agents continuously work through all milestones and tasks until explicitly paused or all work is complete.

**Architecture Principle**: Task management tools are exposed via a **separate MCP server** following the [MCP Server Bootstrap Pattern](https://github.com/prmichaelsen/remember-mcp/blob/main/agent/patterns/bootstrap.md), not embedded in agentbase.me codebase.

---

## Problem Statement

Currently, agentbase.me supports only conversational chat interactions. Users cannot:

1. **Create long-running tasks** that execute independently of the main conversation
2. **Track structured progress** through milestones and sub-tasks
3. **Resume work** on tasks across sessions
4. **Monitor background execution** while continuing other conversations
5. **Leverage ACP methodology** for systematic project development

This limits agentbase.me to short, interactive conversations rather than complex, multi-step project work.

---

## Solution

Implement a **Task Execution System** with **MCP Server Architecture** that:

1. **Creates separate "task" conversation types** alongside regular chat conversations
2. **Exposes task management tools via MCP server** (separate project)
3. **Executes tasks autonomously** in the background using ACP methodology
4. **Persists task state** in Firestore for resumability
5. **Sends progress updates** to the task thread as work proceeds
6. **Respects user control** via pause/resume/stop controls
7. **Provides UI operations** via REST API (not MCP tools)

---

## Architecture: MCP Server-First Approach

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                      agentbase.me                           │
│                                                             │
│  ┌──────────────┐         ┌─────────────────┐             │
│  │   Web UI     │────────▶│   API Routes    │             │
│  │              │         │  (UI Operations)│             │
│  └──────────────┘         └─────────────────┘             │
│         │                          │                       │
│         │                          ▼                       │
│         │                   ┌─────────────┐               │
│         │                   │  Firestore  │               │
│         │                   │  (Tasks DB) │               │
│         │                   └─────────────┘               │
│         │                          ▲                       │
│         │                          │                       │
│         ▼                          │                       │
│  ┌──────────────┐                 │                       │
│  │  WebSocket   │                 │                       │
│  │  (Updates)   │                 │                       │
│  └──────────────┘                 │                       │
│         ▲                          │                       │
│         │                          │                       │
│         │                          │                       │
│  ┌──────────────────────────────────────┐                │
│  │         Agent (Chat)                  │                │
│  │                                       │                │
│  │  ┌────────────────────────────────┐  │                │
│  │  │   MCP Client                   │  │                │
│  │  │   (connects to task-mcp)       │  │                │
│  │  └────────────────────────────────┘  │                │
│  └──────────────────────────────────────┘                │
│         │                                                  │
└─────────┼──────────────────────────────────────────────────┘
          │
          │ MCP Protocol
          │
          ▼
┌─────────────────────────────────────────────────────────────┐
│              task-mcp (Separate MCP Server)                 │
│                                                             │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  MCP Server (stdio/SSE transport)                    │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Task Management Tools                               │  │
│  │  - task_get_status                                   │  │
│  │  - task_create_milestone                             │  │
│  │  - task_create_task                                  │  │
│  │  - task_complete_task                                │  │
│  │  - task_update_progress                              │  │
│  │  - task_init                                         │  │
│  │  - task_sync                                         │  │
│  │  - task_generate_report                              │  │
│  │  - task_validate                                     │  │
│  │  - ... (13 tools total)                              │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                                                   │
│         ▼                                                   │
│  ┌──────────────────────────────────────────────────────┐  │
│  │  Firebase Admin SDK                                  │  │
│  │  (Direct Firestore access with service account)     │  │
│  └──────────────────────────────────────────────────────┘  │
│         │                                                   │
└─────────┼───────────────────────────────────────────────────┘
          │
          ▼
    ┌─────────────┐
    │  Firestore  │
    │  (Tasks DB) │
    └─────────────┘
```

### Key Architectural Decisions

1. **Separate MCP Server Project**: `task-mcp` is a standalone Node.js project
2. **MCP Protocol**: Agent connects to MCP server via stdio or SSE transport
3. **Direct Database Access**: MCP server uses Firebase Admin SDK with service account
4. **Tool-Based Operations**: All agent task operations go through MCP tools
5. **API for UI**: Web UI uses REST API for user-initiated operations
6. **WebSocket for Updates**: Real-time progress updates stream via WebSocket

### Why MCP Server-First?

**Pros**:
- ✅ **Modularity**: Task tools are completely separate from agentbase.me
- ✅ **Reusability**: Other platforms can use the same MCP server
- ✅ **Independent Updates**: Update task tools without deploying agentbase.me
- ✅ **Standard Protocol**: Follows MCP architecture patterns
- ✅ **Scalability**: MCP server can scale independently
- ✅ **Testing**: Easier to test tools in isolation
- ✅ **Multi-tenant**: MCP server handles per-user authentication

**Cons**:
- ❌ **Network Latency**: Tool calls go over network (mitigated by local deployment)
- ❌ **Additional Infrastructure**: Need to deploy and manage MCP server
- ❌ **Authentication Complexity**: Need to pass user credentials to MCP server

**Decision**: The benefits of modularity and reusability outweigh the complexity.

---

## MCP Server Project Structure

Following the [MCP Server Bootstrap Pattern](https://github.com/prmichaelsen/remember-mcp/blob/main/agent/patterns/bootstrap.md):

```
task-mcp/
├── src/
│   ├── index.ts                      # CLI entry point (stdio)
│   ├── server.ts                     # Standalone server
│   ├── server-factory.ts             # Factory for multi-tenant
│   ├── client.ts                     # Firebase Admin SDK wrapper
│   ├── types.ts                      # Shared types
│   │
│   ├── tools/                        # Task management tools
│   │   ├── index.ts                  # Tool exports
│   │   ├── task-get-status.ts
│   │   ├── task-update-progress.ts
│   │   ├── task-pause.ts
│   │   ├── task-resume.ts
│   │   ├── task-create-milestone.ts
│   │   ├── task-create-task.ts
│   │   ├── task-complete-task.ts
│   │   ├── task-complete-milestone.ts
│   │   ├── task-init.ts
│   │   ├── task-get-detailed-status.ts
│   │   ├── task-sync.ts
│   │   ├── task-generate-report.ts
│   │   └── task-validate.ts
│   │
│   └── utils/
│       ├── logger.ts                 # Stdio-safe logging
│       └── error-serializer.ts       # Error handling
│
├── agent/                            # ACP documentation
│   ├── design/
│   ├── milestones/
│   ├── tasks/
│   └── progress.yaml
│
├── package.json
├── tsconfig.json
├── esbuild.build.js
├── firestore-service-account.json    # Service account key (gitignored)
└── README.md
```

### Tool Structure (per Bootstrap Pattern)

```typescript
// src/tools/task-get-status.ts
import { FirebaseClient } from '../client.js'

export const taskGetStatusTool = {
  name: 'task_get_status',
  description: 'Get current task status and progress',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID to get status for'
      }
    },
    required: ['task_id']
  }
}

export async function handleTaskGetStatus(
  client: FirebaseClient,
  args: { task_id: string }
): Promise<string> {
  try {
    const task = await client.getTask(args.task_id)
    if (!task) {
      throw new Error(`Task not found: ${args.task_id}`)
    }
    
    return JSON.stringify({
      task_title: task.title,
      status: task.status,
      current_milestone: task.progress.current_milestone,
      overall_progress: task.progress.overall_percentage
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to get status: ${error instanceof Error ? error.message : String(error)}`)
  }
}
```

---

## agentbase.me Changes

### What Stays in agentbase.me

1. **Task Data Model** (`src/schemas/task.ts`)
   - Zod schemas for Task, Milestone, TaskItem
   - TypeScript interfaces
   - Shared between agentbase.me and task-mcp

2. **API Routes** (for UI operations only)
   - `POST /api/tasks` - Create task (from UI)
   - `GET /api/tasks` - List tasks (for UI)
   - `GET /api/tasks/:id` - Get task details (for UI)
   - `DELETE /api/tasks/:id` - Delete task (from UI)
   - `GET /api/tasks/:id/messages` - Get task messages (for UI)

3. **UI Components**
   - Task list view
   - Task detail view
   - Task thread view
   - Progress visualization

4. **WebSocket Handler**
   - Stream progress updates to UI
   - Handle real-time task status changes

5. **MCP Client Integration**
   - Connect agent to task-mcp server
   - Pass user credentials to MCP server
   - Handle MCP tool calls from agent

### What Moves to task-mcp

1. **All Task Management Tools** (13 tools)
2. **Firebase Admin SDK Integration**
3. **Direct Firestore Operations**
4. **Tool Execution Logic**
5. **Progress Calculation Logic**

---

## Data Model

### Task Document (Firestore)

```typescript
interface Task {
  id: string
  user_id: string
  title: string
  description: string
  status: 'not_started' | 'in_progress' | 'paused' | 'completed' | 'failed'
  created_at: string
  updated_at: string
  started_at?: string
  completed_at?: string
  
  // ACP Structure
  progress: {
    current_milestone: string
    current_task: string
    overall_percentage: number
    milestones: Milestone[]
    tasks: Record<string, TaskItem[]>
  }
  
  // Execution State
  execution: {
    api_messages: ApiMessage[]
    task_messages: TaskMessage[]
    tool_results: ToolResult[]
    error?: string
    abort_reason?: string
  }
  
  // Configuration
  config: {
    model: string
    system_prompt: string
    auto_approve: boolean
    max_iterations?: number
    timeout_minutes?: number
  }
  
  metadata?: {
    conversation_id?: string
    parent_task_id?: string
    tags?: string[]
  }
}
```

---

## Implementation Phases

### Phase 1: MCP Server Foundation (Week 1-2)

**Deliverables**:
- [ ] Create task-mcp project structure
- [ ] Implement Firebase Admin SDK client
- [ ] Create 8 core task management tools
- [ ] Implement MCP server with stdio transport
- [ ] Write unit tests for tools
- [ ] Deploy MCP server

**Success Criteria**:
- MCP server starts successfully
- Tools can be called via MCP protocol
- Firebase operations work correctly
- Tests pass

### Phase 2: agentbase.me Integration (Week 3-4)

**Deliverables**:
- [ ] Task data model in agentbase.me
- [ ] API routes for UI operations
- [ ] MCP client integration in agent
- [ ] Task conversation type
- [ ] Basic UI components
- [ ] WebSocket progress updates

**Success Criteria**:
- Can create task from UI
- Agent can connect to MCP server
- Agent can call task tools
- UI displays task progress
- Real-time updates work

### Phase 3: ACP Workflow Tools (Week 5-6)

**Deliverables**:
- [ ] 5 ACP workflow tools in task-mcp
- [ ] task_init - Initialize context
- [ ] task_get_detailed_status - Detailed status
- [ ] task_sync - Sync documentation
- [ ] task_generate_report - Generate report
- [ ] task_validate - Validate structure

**Success Criteria**:
- All 13 tools implemented
- Agent can use workflow tools
- Reports generate correctly
- Validation works

### Phase 4: Autonomous Execution (Week 7-8)

**Deliverables**:
- [ ] Pessimistic execution loop
- [ ] Message queue system
- [ ] Auto-approval system
- [ ] Safety limits
- [ ] Error recovery
- [ ] UI polish

**Success Criteria**:
- Agent works through all milestones
- Safety limits prevent runaway execution
- Errors handled gracefully
- UI is polished and intuitive

---

## MCP Server Authentication

### Multi-Tenant Authentication

The MCP server needs to know which user is making requests. Options:

**Option A: JWT in Tool Arguments**
```typescript
// Every tool call includes user_id
{
  "tool": "task_get_status",
  "arguments": {
    "user_id": "user_abc123",  // Passed by agent
    "task_id": "task_xyz789"
  }
}
```

**Option B: MCP Server Factory (Recommended)**
```typescript
// Agent creates per-user MCP server instance
const mcpServer = createTaskMCPServer(userId, firebaseToken)
```

**Decision**: Use Option B (server factory) for better security and isolation.

---

## Deployment

### task-mcp Deployment Options

**Option 1: Cloud Run (Recommended)**
- Deploy as Cloud Run service
- Use SSE transport for HTTP connections
- Auto-scaling based on load
- Easy to update independently

**Option 2: Cloud Functions**
- Deploy as Cloud Function
- Triggered by agent requests
- Serverless, pay-per-use
- Cold start latency

**Option 3: Compute Engine**
- Deploy on VM
- Always-on, low latency
- More control, more cost
- Good for high-volume usage

**Recommendation**: Start with Cloud Run for balance of cost, performance, and ease of deployment.

---

## Security Considerations

### MCP Server Security

**Requirements**:
- MCP server validates user identity
- Tools enforce user-scoped data access
- Service account has minimal permissions
- Audit logging for all operations

**Implementation**:
- Use Firebase Admin SDK with service account
- Validate user_id in every tool call
- Firestore security rules as backup
- Log all tool executions

### API Security

**Requirements**:
- API routes require authentication
- Users can only access their own tasks
- Rate limiting per user
- Input validation

**Implementation**:
- Firebase Auth tokens
- User ID from auth token
- Firestore security rules
- Zod schema validation

---

## Success Metrics

### Functional Metrics

- [ ] MCP server deploys successfully
- [ ] Agent can connect to MCP server
- [ ] All 13 tools work correctly
- [ ] Tasks execute autonomously
- [ ] Progress tracked accurately
- [ ] UI displays real-time updates

### Performance Metrics

- [ ] Tool call latency < 200ms
- [ ] MCP server uptime > 99.9%
- [ ] Task creation < 1 second
- [ ] Progress updates < 500ms latency

### User Experience Metrics

- [ ] Intuitive task creation
- [ ] Clear progress indicators
- [ ] Responsive UI
- [ ] Graceful error handling

---

## References

- [Roo Code Repository](https://github.com/RooVetGit/Roo-Code)
- [Agent Context Protocol (ACP)](../../../AGENT.md)
- [MCP Server Bootstrap Pattern](https://github.com/prmichaelsen/remember-mcp/blob/main/agent/patterns/bootstrap.md)
- [Model Context Protocol](https://modelcontextprotocol.io/)
- [Firebase Admin SDK](https://firebase.google.com/docs/admin/setup)

---

**Status**: Design Specification
**Architecture**: MCP Server-First
**Next Action**: Begin Phase 1 - Create task-mcp project
**Owner**: Development Team
**Created**: 2026-02-16
**Last Updated**: 2026-02-16
