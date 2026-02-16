/**
 * DTO Transformers Unit Tests
 * 
 * Tests for schema-to-DTO transformation functions
 */

import type { Task, TaskMessage, Milestone, TaskItem } from '../schemas/task.js'
import {
  toTaskItemApiResponse,
  toMilestoneApiResponse,
  toTaskProgressApiResponse,
  toTaskConfigApiResponse,
  toTaskMetadataApiResponse,
  toTaskApiResponse,
  toTaskMessageApiResponse,
  toTaskListApiResponse,
  toTaskMessageListApiResponse
} from './transformers.js'

describe('DTO Transformers', () => {
  describe('toTaskItemApiResponse', () => {
    it('should transform task item with all fields', () => {
      const item: TaskItem = {
        id: 'item-1',
        name: 'Task Item 1',
        description: 'Description 1',
        status: 'completed',
        estimated_hours: 4,
        completed_at: '2026-02-16T12:00:00Z',
        notes: 'Some notes'
      }

      const result = toTaskItemApiResponse(item)

      expect(result).toEqual({
        id: 'item-1',
        name: 'Task Item 1',
        description: 'Description 1',
        status: 'completed',
        estimated_hours: 4,
        completed_at: '2026-02-16T12:00:00Z',
        notes: 'Some notes'
      })
    })

    it('should transform task item with optional fields undefined', () => {
      const item: TaskItem = {
        id: 'item-2',
        name: 'Task Item 2',
        description: 'Description 2',
        status: 'not_started'
      }

      const result = toTaskItemApiResponse(item)

      expect(result).toEqual({
        id: 'item-2',
        name: 'Task Item 2',
        description: 'Description 2',
        status: 'not_started',
        estimated_hours: undefined,
        completed_at: undefined,
        notes: undefined
      })
    })
  })

  describe('toMilestoneApiResponse', () => {
    it('should transform milestone with all fields', () => {
      const milestone: Milestone = {
        id: 'milestone-1',
        name: 'Milestone 1',
        description: 'Description 1',
        status: 'completed',
        progress: 100,
        tasks_completed: 5,
        tasks_total: 5,
        started_at: '2026-02-15T10:00:00Z',
        completed_at: '2026-02-16T12:00:00Z'
      }

      const result = toMilestoneApiResponse(milestone)

      expect(result).toEqual({
        id: 'milestone-1',
        name: 'Milestone 1',
        description: 'Description 1',
        status: 'completed',
        progress: 100,
        tasks_completed: 5,
        tasks_total: 5,
        started_at: '2026-02-15T10:00:00Z',
        completed_at: '2026-02-16T12:00:00Z'
      })
    })

    it('should transform milestone with optional fields undefined', () => {
      const milestone: Milestone = {
        id: 'milestone-2',
        name: 'Milestone 2',
        description: 'Description 2',
        status: 'not_started',
        progress: 0,
        tasks_completed: 0,
        tasks_total: 3
      }

      const result = toMilestoneApiResponse(milestone)

      expect(result.started_at).toBeUndefined()
      expect(result.completed_at).toBeUndefined()
    })
  })

  describe('toTaskProgressApiResponse', () => {
    it('should transform task progress with milestones and tasks', () => {
      const progress: Task['progress'] = {
        current_milestone: 'milestone-1',
        current_task: 'task-1',
        overall_percentage: 50,
        milestones: [
          {
            id: 'milestone-1',
            name: 'Milestone 1',
            description: 'Description 1',
            status: 'in_progress',
            progress: 50,
            tasks_completed: 2,
            tasks_total: 4
          }
        ],
        tasks: {
          'milestone-1': [
            {
              id: 'task-1',
              name: 'Task 1',
              description: 'Description 1',
              status: 'completed',
              completed_at: '2026-02-16T12:00:00Z'
            },
            {
              id: 'task-2',
              name: 'Task 2',
              description: 'Description 2',
              status: 'in_progress'
            }
          ]
        }
      }

      const result = toTaskProgressApiResponse(progress)

      expect(result.current_milestone).toBe('milestone-1')
      expect(result.current_task).toBe('task-1')
      expect(result.overall_percentage).toBe(50)
      expect(result.milestones).toHaveLength(1)
      expect(result.milestones[0].id).toBe('milestone-1')
      expect(result.tasks['milestone-1']).toHaveLength(2)
      expect(result.tasks['milestone-1'][0].id).toBe('task-1')
    })
  })

  describe('toTaskConfigApiResponse', () => {
    it('should transform task config with all fields', () => {
      const config: Task['config'] = {
        system_prompt: 'Custom prompt',
        auto_approve: false,
        max_iterations: 100
      }

      const result = toTaskConfigApiResponse(config)

      expect(result).toEqual({
        system_prompt: 'Custom prompt',
        auto_approve: false,
        max_iterations: 100
      })
    })

    it('should transform task config with optional fields undefined', () => {
      const config: Task['config'] = {
        system_prompt: '',
        auto_approve: true
      }

      const result = toTaskConfigApiResponse(config)

      expect(result.system_prompt).toBe('')
      expect(result.auto_approve).toBe(true)
      expect(result.max_iterations).toBeUndefined()
    })
  })

  describe('toTaskMetadataApiResponse', () => {
    it('should transform metadata with all fields', () => {
      const metadata: Task['metadata'] = {
        conversation_id: 'conv-123',
        parent_task_id: 'task-parent',
        tags: ['urgent', 'backend']
      }

      const result = toTaskMetadataApiResponse(metadata)

      expect(result).toEqual({
        conversation_id: 'conv-123',
        parent_task_id: 'task-parent',
        tags: ['urgent', 'backend']
      })
    })

    it('should return undefined for undefined metadata', () => {
      const result = toTaskMetadataApiResponse(undefined)
      expect(result).toBeUndefined()
    })

    it('should transform metadata with optional fields undefined', () => {
      const metadata: Task['metadata'] = {}

      const result = toTaskMetadataApiResponse(metadata)

      expect(result).toEqual({
        conversation_id: undefined,
        parent_task_id: undefined,
        tags: undefined
      })
    })
  })

  describe('toTaskApiResponse', () => {
    it('should transform complete task and exclude execution field', () => {
      const task: Task = {
        id: 'task-123',
        user_id: 'user-456',
        title: 'Test Task',
        description: 'Test Description',
        status: 'in_progress',
        created_at: '2026-02-16T10:00:00Z',
        updated_at: '2026-02-16T12:00:00Z',
        started_at: '2026-02-16T10:30:00Z',
        progress: {
          current_milestone: 'milestone-1',
          current_task: 'task-1',
          overall_percentage: 25,
          milestones: [],
          tasks: {}
        },
        execution: {
          api_messages: [{ role: 'user', content: 'secret' }],
          task_messages: [],
          tool_results: [{ tool: 'secret_tool', result: 'secret' }]
        },
        config: {
          system_prompt: 'Test prompt',
          auto_approve: true,
          max_iterations: 500
        },
        metadata: {
          conversation_id: 'conv-123'
        }
      }

      const result = toTaskApiResponse(task)

      // Verify all expected fields are present
      expect(result.id).toBe('task-123')
      expect(result.user_id).toBe('user-456')
      expect(result.title).toBe('Test Task')
      expect(result.description).toBe('Test Description')
      expect(result.status).toBe('in_progress')
      expect(result.created_at).toBe('2026-02-16T10:00:00Z')
      expect(result.updated_at).toBe('2026-02-16T12:00:00Z')
      expect(result.started_at).toBe('2026-02-16T10:30:00Z')
      expect(result.progress).toBeDefined()
      expect(result.config).toBeDefined()
      expect(result.metadata).toBeDefined()

      // Verify execution field is NOT present
      expect((result as any).execution).toBeUndefined()
    })

    it('should transform task without optional fields', () => {
      const task: Task = {
        id: 'task-456',
        user_id: 'user-789',
        title: 'Simple Task',
        description: 'Simple Description',
        status: 'not_started',
        created_at: '2026-02-16T10:00:00Z',
        updated_at: '2026-02-16T10:00:00Z',
        progress: {
          current_milestone: '',
          current_task: '',
          overall_percentage: 0,
          milestones: [],
          tasks: {}
        },
        execution: {
          api_messages: [],
          task_messages: [],
          tool_results: []
        },
        config: {
          system_prompt: '',
          auto_approve: true
        }
      }

      const result = toTaskApiResponse(task)

      expect(result.started_at).toBeUndefined()
      expect(result.completed_at).toBeUndefined()
      expect(result.metadata).toBeUndefined()
      expect((result as any).execution).toBeUndefined()
    })
  })

  describe('toTaskMessageApiResponse', () => {
    it('should transform task message with all fields', () => {
      const message: TaskMessage = {
        id: 'msg-123',
        task_id: 'task-456',
        role: 'assistant',
        content: 'Test message content',
        timestamp: '2026-02-16T12:00:00Z',
        metadata: { source: 'agent' }
      }

      const result = toTaskMessageApiResponse(message)

      expect(result).toEqual({
        id: 'msg-123',
        task_id: 'task-456',
        role: 'assistant',
        content: 'Test message content',
        timestamp: '2026-02-16T12:00:00Z',
        metadata: { source: 'agent' }
      })
    })

    it('should transform task message without metadata', () => {
      const message: TaskMessage = {
        id: 'msg-456',
        task_id: 'task-789',
        role: 'user',
        content: 'User message',
        timestamp: '2026-02-16T11:00:00Z'
      }

      const result = toTaskMessageApiResponse(message)

      expect(result.metadata).toBeUndefined()
    })
  })

  describe('toTaskListApiResponse', () => {
    it('should transform array of tasks to list response', () => {
      const tasks: Task[] = [
        {
          id: 'task-1',
          user_id: 'user-1',
          title: 'Task 1',
          description: 'Description 1',
          status: 'completed',
          created_at: '2026-02-16T10:00:00Z',
          updated_at: '2026-02-16T12:00:00Z',
          progress: {
            current_milestone: '',
            current_task: '',
            overall_percentage: 100,
            milestones: [],
            tasks: {}
          },
          execution: {
            api_messages: [],
            task_messages: [],
            tool_results: []
          },
          config: {
            system_prompt: '',
            auto_approve: true
          }
        },
        {
          id: 'task-2',
          user_id: 'user-1',
          title: 'Task 2',
          description: 'Description 2',
          status: 'in_progress',
          created_at: '2026-02-16T11:00:00Z',
          updated_at: '2026-02-16T12:00:00Z',
          progress: {
            current_milestone: '',
            current_task: '',
            overall_percentage: 50,
            milestones: [],
            tasks: {}
          },
          execution: {
            api_messages: [],
            task_messages: [],
            tool_results: []
          },
          config: {
            system_prompt: '',
            auto_approve: true
          }
        }
      ]

      const result = toTaskListApiResponse(tasks)

      expect(result.tasks).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.tasks[0].id).toBe('task-1')
      expect(result.tasks[1].id).toBe('task-2')
      expect((result.tasks[0] as any).execution).toBeUndefined()
      expect((result.tasks[1] as any).execution).toBeUndefined()
    })

    it('should handle empty task array', () => {
      const result = toTaskListApiResponse([])

      expect(result.tasks).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })

  describe('toTaskMessageListApiResponse', () => {
    it('should transform array of messages to list response', () => {
      const messages: TaskMessage[] = [
        {
          id: 'msg-1',
          task_id: 'task-1',
          role: 'user',
          content: 'Message 1',
          timestamp: '2026-02-16T10:00:00Z'
        },
        {
          id: 'msg-2',
          task_id: 'task-1',
          role: 'assistant',
          content: 'Message 2',
          timestamp: '2026-02-16T10:01:00Z'
        }
      ]

      const result = toTaskMessageListApiResponse(messages)

      expect(result.messages).toHaveLength(2)
      expect(result.total).toBe(2)
      expect(result.messages[0].id).toBe('msg-1')
      expect(result.messages[1].id).toBe('msg-2')
    })

    it('should handle empty message array', () => {
      const result = toTaskMessageListApiResponse([])

      expect(result.messages).toHaveLength(0)
      expect(result.total).toBe(0)
    })
  })
})
