# Milestone 4: ACP Workflow Tools

**Goal**: Implement advanced ACP workflow tools in task-mcp server
**Duration**: 2 weeks
**Dependencies**: Milestone 3 (agentbase.me Integration)
**Status**: Not Started

---

## Overview

This milestone adds 5 advanced ACP workflow tools to the task-mcp server. These tools enable agents to initialize task context, get detailed status, synchronize documentation, generate reports, and validate task structure.

## Deliverables

1. **task_init Tool**
   - Load all task documentation from Firestore
   - Review completed work
   - Identify current position
   - Prepare for execution
   - Return initialization summary

2. **task_get_detailed_status Tool**
   - Comprehensive status check
   - Include all milestones and tasks
   - Recent work history
   - Next steps identification
   - Blocker detection

3. **task_sync Tool**
   - Compare documented state with actual state
   - Identify documentation drift
   - Update documentation to match reality
   - Log all changes
   - Return sync report

4. **task_generate_report Tool**
   - Generate markdown or JSON report
   - Include progress charts
   - List accomplishments
   - Identify next steps
   - Suitable for sharing

5. **task_validate Tool**
   - Validate task schema
   - Check milestone/task references
   - Verify progress calculations
   - Identify missing fields
   - Suggest improvements

6. **Tool Testing**
   - Unit tests for each workflow tool
   - E2E tests with real scenarios
   - Integration tests with agent
   - Performance tests

7. **Documentation**
   - Tool usage examples
   - Best practices guide
   - Troubleshooting guide
   - API reference

## Success Criteria

- [ ] All 5 workflow tools implemented
- [ ] Tools follow bootstrap pattern
- [ ] Agent can use workflow tools
- [ ] task_init prepares context correctly
- [ ] task_sync detects drift accurately
- [ ] task_generate_report creates valid reports
- [ ] task_validate catches errors
- [ ] Unit tests pass (>80% coverage)
- [ ] E2E tests pass
- [ ] Documentation complete

## Key Files to Create

```
task-mcp/

src/tools/
├── task-init.ts
├── task-get-detailed-status.ts
├── task-sync.ts
├── task-generate-report.ts
└── task-validate.ts

src/tools/__tests__/
├── task-init.spec.ts
├── task-init.e2e.ts
├── task-get-detailed-status.spec.ts
├── task-sync.spec.ts
├── task-generate-report.spec.ts
└── task-validate.spec.ts

src/utils/
├── report-generator.ts          # Report formatting
├── validation-rules.ts           # Validation logic
└── drift-detector.ts             # Drift detection

docs/
├── workflow-tools.md             # Tool documentation
├── examples.md                   # Usage examples
└── troubleshooting.md            # Common issues
```

## Tool Implementation Examples

### task_init Tool

```typescript
// src/tools/task-init.ts
export const taskInitTool = {
  name: 'task_init',
  description: 'Initialize task context by loading all documentation and reviewing state',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID to initialize'
      }
    },
    required: ['task_id']
  }
}

export async function handleTaskInit(
  client: FirebaseClient,
  args: { task_id: string }
): Promise<string> {
  const task = await client.getTask(args.task_id)
  if (!task) throw new Error('Task not found')
  
  // Load all milestones and tasks
  const milestones = task.progress.milestones
  const tasks = task.progress.tasks
  
  // Identify current position
  const currentMilestone = milestones.find(m => m.id === task.progress.current_milestone)
  const currentTask = tasks[task.progress.current_milestone]?.find(
    t => t.id === task.progress.current_task
  )
  
  // Prepare next steps
  const nextSteps = determineNextSteps(task, currentMilestone, currentTask)
  
  return JSON.stringify({
    status: 'initialized',
    milestones_loaded: milestones.length,
    tasks_loaded: Object.values(tasks).flat().length,
    current_milestone: currentMilestone?.name,
    current_task: currentTask?.name,
    next_steps: nextSteps
  }, null, 2)
}
```

### task_generate_report Tool

```typescript
// src/tools/task-generate-report.ts
export const taskGenerateReportTool = {
  name: 'task_generate_report',
  description: 'Generate comprehensive status report in markdown or JSON format',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: { type: 'string' },
      format: { 
        type: 'string', 
        enum: ['markdown', 'json'],
        default: 'markdown'
      },
      include_details: { 
        type: 'boolean',
        default: true
      }
    },
    required: ['task_id']
  }
}

export async function handleTaskGenerateReport(
  client: FirebaseClient,
  args: { task_id: string; format?: string; include_details?: boolean }
): Promise<string> {
  const task = await client.getTask(args.task_id)
  if (!task) throw new Error('Task not found')
  
  const format = args.format || 'markdown'
  const includeDetails = args.include_details ?? true
  
  if (format === 'markdown') {
    return generateMarkdownReport(task, includeDetails)
  } else {
    return JSON.stringify(generateJSONReport(task, includeDetails), null, 2)
  }
}
```

## Technical Decisions

1. **Report Format**: Support both markdown and JSON
2. **Drift Detection**: Compare Firestore state with expected state
3. **Validation Rules**: Extensible rule system
4. **Performance**: Cache frequently accessed data

## Risks and Mitigation

**Risk**: Complex validation logic
- **Mitigation**: Start with simple rules, add complexity incrementally

**Risk**: Report generation performance
- **Mitigation**: Lazy loading, pagination for large tasks

**Risk**: Drift detection accuracy
- **Mitigation**: Comprehensive test cases, manual verification

## Dependencies

- Milestone 3 (agentbase.me Integration)
- Core task tools working
- Agent can call MCP tools

## Next Milestone

[Milestone 5: Autonomous Execution & UI Polish](milestone-5-autonomous-execution-ui.md)

---

**Status**: Not Started
**Estimated Effort**: 80 hours
**Priority**: Medium
**Owner**: Development Team
