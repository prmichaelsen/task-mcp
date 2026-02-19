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
export declare const TASK_ITEM_TEMPLATE = "# Task {N}: {Descriptive Task Name}\n\n**Milestone**: M{N} - Milestone Name\n**Estimated Time**: [e.g., \"2 hours\", \"4 hours\", \"1 day\"]\n**Dependencies**: [List prerequisite tasks, or \"None\"]\n**Status**: Not Started | In Progress | Completed\n\n---\n\n## Objective\n\n[Clearly state what this task accomplishes. Be specific and focused on a single, achievable goal.]\n\n---\n\n## Context\n\n[Provide background information that helps understand why this task is necessary and how it fits into the larger milestone.]\n\n---\n\n## Steps\n\n### 1. [Step Category or Action]\n[Detailed description of what to do]\n\n### 2. [Next Step]\n[Detailed description]\n\n### 3. [Next Step]\n[Detailed description]\n\n---\n\n## Verification\n\n- [ ] Verification item 1: [Specific condition to check]\n- [ ] Verification item 2: [Specific condition to check]\n- [ ] Verification item 3: [Specific condition to check]\n\n---\n\n## Expected Output\n\n[Describe what should exist after this task is complete]\n\n**File Structure**:\n```\nproject-root/\n\u251C\u2500\u2500 file1\n\u251C\u2500\u2500 file2\n\u2514\u2500\u2500 directory/\n    \u2514\u2500\u2500 file3\n```\n\n**Key Files Created**:\n- file1: [Purpose]\n- file2: [Purpose]\n\n---\n\n## Common Issues and Solutions\n\n### Issue 1: [Problem description]\n**Symptom**: [What the user will see]\n**Solution**: [How to fix it]\n\n### Issue 2: [Problem description]\n**Symptom**: [What the user will see]\n**Solution**: [How to fix it]\n\n---\n\n## Resources\n\n- [Resource 1 Name](URL): Description\n- [Resource 2 Name](URL): Description\n\n---\n\n## Notes\n\n- Note 1: [Important information]\n- Note 2: [Important information]\n\n---\n\n**Next Task**: task-{N+1}-{name}.md\n**Related Design Docs**: [Links to relevant design documents]\n**Estimated Completion Date**: [YYYY-MM-DD or \"TBD\"]\n";
/**
 * Template for ACP Milestone
 */
export declare const MILESTONE_TEMPLATE = "# Milestone {N}: {Descriptive Name}\n\n**Goal**: [One-line objective that clearly states what this milestone achieves]\n**Duration**: [Estimated time: e.g., \"1-2 weeks\", \"3-5 days\"]\n**Dependencies**: [List prerequisite milestones or \"None\"]\n**Status**: Not Started | In Progress | Completed\n\n---\n\n## Overview\n\n[Comprehensive description of what this milestone accomplishes and why it's important]\n\n---\n\n## Deliverables\n\n### 1. [Deliverable Category 1]\n- Specific item 1\n- Specific item 2\n\n### 2. [Deliverable Category 2]\n- Specific item 1\n- Specific item 2\n\n### 3. [Deliverable Category 3]\n- Specific item 1\n- Specific item 2\n\n---\n\n## Success Criteria\n\n- [ ] Criterion 1: [Specific, measurable condition]\n- [ ] Criterion 2: [Specific, measurable condition]\n- [ ] Criterion 3: [Specific, measurable condition]\n- [ ] Criterion 4: [Specific, measurable condition]\n- [ ] Criterion 5: [Specific, measurable condition]\n\n---\n\n## Key Files to Create\n\n```\nproject-root/\n\u251C\u2500\u2500 file1.ext\n\u251C\u2500\u2500 file2.ext\n\u251C\u2500\u2500 directory1/\n\u2502   \u251C\u2500\u2500 file3.ext\n\u2502   \u2514\u2500\u2500 file4.ext\n\u2514\u2500\u2500 directory2/\n    \u251C\u2500\u2500 subdirectory/\n    \u2502   \u2514\u2500\u2500 file5.ext\n    \u2514\u2500\u2500 file6.ext\n```\n\n---\n\n## Tasks\n\n1. Task 1: task-N-{name}.md - [Brief description]\n2. Task 2: task-N-{name}.md - [Brief description]\n3. Task 3: task-N-{name}.md - [Brief description]\n4. Task 4: task-N-{name}.md - [Brief description]\n\n---\n\n## Environment Variables\n\n[If this milestone requires environment configuration:]\n\n```env\n# Category 1\nVAR_NAME_1=example_value\nVAR_NAME_2=example_value\n\n# Category 2\nVAR_NAME_3=example_value\n```\n\n---\n\n## Testing Requirements\n\n- [ ] Test category 1: [Description]\n- [ ] Test category 2: [Description]\n- [ ] Test category 3: [Description]\n\n---\n\n## Documentation Requirements\n\n- [ ] Document 1: [Description]\n- [ ] Document 2: [Description]\n- [ ] Document 3: [Description]\n\n---\n\n## Risks and Mitigation\n\n| Risk | Impact | Probability | Mitigation Strategy |\n|------|--------|-------------|---------------------|\n| [Risk 1] | High/Medium/Low | High/Medium/Low | [How to mitigate] |\n| [Risk 2] | High/Medium/Low | High/Medium/Low | [How to mitigate] |\n\n---\n\n**Next Milestone**: milestone-{N+1}-{name}.md\n**Blockers**: [List any current blockers, or \"None\"]\n**Notes**: [Any additional context or considerations]\n";
/**
 * Get template guidance for task item creation
 */
export declare function getTaskItemTemplateGuidance(): string;
/**
 * Get template guidance for milestone creation
 */
export declare function getMilestoneTemplateGuidance(): string;
//# sourceMappingURL=templates.d.ts.map