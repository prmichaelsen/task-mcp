/**
 * ACP Document Templates
 *
 * Templates for creating properly structured ACP documents.
 * These guide agents in creating milestones and task items that follow ACP conventions.
 *
 * Note: In this system:
 * - "Task" = ACP Project/Design
 * - "Milestone" = ACP Milestone
 * - "Task Item" = ACP Task
 */

/**
 * Template for ACP Task Item (corresponds to ACP Task document)
 */
export const TASK_ITEM_TEMPLATE = `# Task {N}: {Descriptive Task Name}

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
├── file1
├── file2
└── directory/
    └── file3
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
`

/**
 * Template for ACP Milestone
 */
export const MILESTONE_TEMPLATE = `# Milestone {N}: {Descriptive Name}

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
├── file1.ext
├── file2.ext
├── directory1/
│   ├── file3.ext
│   └── file4.ext
└── directory2/
    ├── subdirectory/
    │   └── file5.ext
    └── file6.ext
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
`

/**
 * Get template guidance for task item creation
 */
export function getTaskItemTemplateGuidance(): string {
  return `
When creating task items, follow the ACP Task document structure:

${TASK_ITEM_TEMPLATE}

Key sections to include:
- Objective: Clear, single goal
- Context: Why this task matters
- Steps: Detailed, sequential actions
- Verification: Objective completion criteria
- Expected Output: What will exist after completion
`
}

/**
 * Get template guidance for milestone creation
 */
export function getMilestoneTemplateGuidance(): string {
  return `
When creating milestones, follow the ACP Milestone document structure:

${MILESTONE_TEMPLATE}

Key sections to include:
- Overview: What this milestone accomplishes
- Deliverables: Concrete outputs
- Success Criteria: Measurable completion conditions
- Key Files: What will be created
- Tasks: List of task items in this milestone
`
}
