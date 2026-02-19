/**
 * Tests for remaining MCP tools
 */

import { handleTaskUpdateProgress } from './task-update-progress.js'
import { handleTaskCreateMilestone } from './task-create-milestone.js'
import { handleTaskCreateTaskItem } from './task-create-task-item.js'
import { handleTaskAddMessage } from './task-add-message.js'
import { FirebaseClient } from '@prmichaelsen/task-core/client'
import type { Task } from '@prmichaelsen/task-core/schemas'

jest.mock('@prmichaelsen/task-core/client')

describe('MCP Tools', () => {
  let mockClient: jest.Mocked<FirebaseClient>
  
  beforeEach(() => {
    mockClient = {
      updateOverallProgress: jest.fn(),
      getTask: jest.fn(),
      updateMilestone: jest.fn(),
      createMilestone: jest.fn(),
      createTaskItem: jest.fn(),
      addMessage: jest.fn()
    } as any
  })
  
  describe('task_update_progress', () => {
    it('should update progress successfully', async () => {
      mockClient.updateOverallProgress.mockResolvedValue(undefined)
      
      const result = await handleTaskUpdateProgress(mockClient, {
        task_id: 'task-123',
        percentage: 75
      })
      
      const parsed = JSON.parse(result)
      expect(parsed.success).toBe(true)
      expect(parsed.progress).toBe(75)
      expect(mockClient.updateOverallProgress).toHaveBeenCalledWith('task-123', 75)
    })
    
    it('should clamp percentage to 0-100 range', async () => {
      mockClient.updateOverallProgress.mockResolvedValue(undefined)
      
      await handleTaskUpdateProgress(mockClient, {
        task_id: 'task-123',
        percentage: 150
      })
      
      expect(mockClient.updateOverallProgress).toHaveBeenCalledWith('task-123', 100)
    })
  })
  
  describe('task_create_milestone', () => {
    it('should create milestone successfully', async () => {
      mockClient.createMilestone.mockResolvedValue(undefined)
      
      const result = await handleTaskCreateMilestone(mockClient, {
        task_id: 'task-123',
        milestone_id: 'milestone-1',
        name: 'Milestone 1',
        description: 'Test milestone'
      })
      
      const parsed = JSON.parse(result)
      expect(parsed.success).toBe(true)
      expect(parsed.milestone.name).toBe('Milestone 1')
    })
  })
  
  describe('task_create_task_item', () => {
    it('should create task item successfully', async () => {
      const mockTask: Task = {
        id: 'task-123',
        user_id: 'user-456',
        title: 'Test',
        description: 'Test',
        status: 'in_progress',
        created_at: '2026-02-16T00:00:00Z',
        updated_at: '2026-02-16T00:00:00Z',
        machine_id: 'test-machine',
        working_directory: '/test/path',
        progress: {
          project: {
            name: 'Test',
            version: '1.0.0',
            started: '2026-02-19',
            status: 'in_progress' as const,
            current_milestone: 'milestone-1',
            description: 'Test'
          },
          milestones: [{
            id: 'milestone-1',
            name: 'Milestone 1',
            description: 'Test',
            status: 'in_progress' as const,
            progress: 0,
            tasks_completed: 0,
            tasks_total: 0
          }],
          tasks: {
            'milestone-1': [
              { id: 'task-1', name: 'Task 1', description: 'Test', status: 'not_started' as const }
            ]
          },
          documentation: {
            design_documents: 0,
            milestone_documents: 0,
            pattern_documents: 0,
            task_documents: 0,
            last_updated: '2026-02-19'
          },
          progress: {
            planning: 0,
            implementation: 0,
            testing: 0,
            documentation: 0,
            overall: 0
          },
          recent_work: [],
          next_steps: [],
          notes: [],
          current_blockers: []
        },
        execution: { api_messages: [], task_messages: [], tool_results: [] },
        config: { system_prompt: '', auto_approve: true },
        metadata: {}
      }
      
      mockClient.createTaskItem.mockResolvedValue(undefined)
      mockClient.getTask.mockResolvedValue(mockTask)
      mockClient.updateMilestone.mockResolvedValue(undefined)
      
      const result = await handleTaskCreateTaskItem(mockClient, {
        task_id: 'task-123',
        milestone_id: 'milestone-1',
        task_item_id: 'task-1',
        name: 'Task 1',
        description: 'Test task'
      })
      
      const parsed = JSON.parse(result)
      expect(parsed.success).toBe(true)
      expect(parsed.task_item.name).toBe('Task 1')
    })
  })
  
  describe('task_add_message', () => {
    it('should add message successfully', async () => {
      mockClient.addMessage.mockResolvedValue('message-123')
      
      const result = await handleTaskAddMessage(mockClient, {
        task_id: 'task-123',
        role: 'assistant',
        content: 'Test message'
      })
      
      const parsed = JSON.parse(result)
      expect(parsed.success).toBe(true)
      expect(parsed.message_id).toBe('message-123')
      expect(parsed.role).toBe('assistant')
    })
  })
})
