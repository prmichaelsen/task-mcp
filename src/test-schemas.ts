/**
 * Schema Validation Tests
 * 
 * Test file to verify Zod schemas work correctly with valid and invalid data
 */

import {
  TaskSchema,
  MilestoneSchema,
  TaskItemSchema,
  TaskMessageSchema,
  type Task,
  type Milestone,
  type TaskItem,
  type TaskMessage
} from './schemas/task.js'

// Test valid milestone
const validMilestone: Milestone = {
  id: 'M1',
  name: 'Foundation',
  description: 'Build core infrastructure',
  status: 'in_progress',
  progress: 50,
  tasks_completed: 2,
  tasks_total: 4,
  started: '2026-02-16',
  completed: undefined
}

console.log('Testing valid milestone...')
try {
  const result = MilestoneSchema.parse(validMilestone)
  console.log('✅ Valid milestone passed:', result.name)
} catch (error) {
  console.error('❌ Valid milestone failed:', error)
}

// Test valid task item
const validTaskItem: TaskItem = {
  id: 'task-1',
  name: 'Setup project',
  description: 'Initialize Node.js project',
  status: 'completed',
  estimated_hours: 2,
  completed_date: '2026-02-16',
  notes: 'Completed successfully'
}

console.log('\nTesting valid task item...')
try {
  const result = TaskItemSchema.parse(validTaskItem)
  console.log('✅ Valid task item passed:', result.name)
} catch (error) {
  console.error('❌ Valid task item failed:', error)
}

// Test valid task
const validTask: Task = {
  id: 'task-123',
  user_id: 'user-456',
  title: 'Build MCP Server',
  description: 'Create task-mcp server with core tools',
  status: 'in_progress',
  created_at: '2026-02-16T00:00:00Z',
  updated_at: '2026-02-16T12:00:00Z',
  started_at: '2026-02-16T01:00:00Z',
  
  progress: {
    current_milestone: 'M1',
    current_task: 'task-1',
    overall_percentage: 25,
    milestones: [validMilestone],
    tasks: {
      'M1': [validTaskItem]
    }
  },
  
  execution: {
    api_messages: [],
    task_messages: [],
    tool_results: []
  },
  
  config: {
    model: 'us.anthropic.claude-sonnet-4-5-20250929-v1:0',
    system_prompt: 'You are a helpful assistant',
    auto_approve: true,
    max_iterations: 100,
    timeout_minutes: 120
  },
  
  metadata: {
    conversation_id: 'conv-789',
    tags: ['mcp', 'server']
  }
}

console.log('\nTesting valid task...')
try {
  const result = TaskSchema.parse(validTask)
  console.log('✅ Valid task passed:', result.title)
} catch (error) {
  console.error('❌ Valid task failed:', error)
}

// Test valid task message
const validMessage: TaskMessage = {
  id: 'msg-001',
  task_id: 'task-123',
  role: 'assistant',
  content: 'Task started successfully',
  timestamp: '2026-02-16T12:00:00Z'
}

console.log('\nTesting valid task message...')
try {
  const result = TaskMessageSchema.parse(validMessage)
  console.log('✅ Valid message passed:', result.content)
} catch (error) {
  console.error('❌ Valid message failed:', error)
}

// Test invalid data (should fail)
console.log('\n--- Testing Invalid Data (should fail) ---')

// Invalid milestone (progress > 100)
console.log('\nTesting invalid milestone (progress > 100)...')
try {
  MilestoneSchema.parse({
    ...validMilestone,
    progress: 150
  })
  console.error('❌ Should have failed but passed')
} catch (error) {
  console.log('✅ Correctly rejected invalid milestone')
}

// Invalid task (wrong status)
console.log('\nTesting invalid task (wrong status)...')
try {
  TaskSchema.parse({
    ...validTask,
    status: 'invalid_status'
  })
  console.error('❌ Should have failed but passed')
} catch (error) {
  console.log('✅ Correctly rejected invalid task status')
}

// Invalid message (wrong role)
console.log('\nTesting invalid message (wrong role)...')
try {
  TaskMessageSchema.parse({
    ...validMessage,
    role: 'invalid_role'
  })
  console.error('❌ Should have failed but passed')
} catch (error) {
  console.log('✅ Correctly rejected invalid message role')
}

console.log('\n✅ All schema validation tests completed!')
