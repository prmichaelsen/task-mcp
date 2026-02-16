/**
 * MCP Tool: task_add_message
 * 
 * Add a message to the task conversation thread.
 */

import { FirebaseClient } from '@/client.js'

export const taskAddMessageTool = {
  name: 'task_add_message',
  description: 'Add a message to the task conversation thread',
  inputSchema: {
    type: 'object',
    properties: {
      task_id: {
        type: 'string',
        description: 'Task ID'
      },
      role: {
        type: 'string',
        enum: ['user', 'assistant', 'system'],
        description: 'Message role'
      },
      content: {
        type: 'string',
        description: 'Message content'
      },
      metadata: {
        type: 'object',
        description: 'Optional metadata (JSON object)'
      }
    },
    required: ['task_id', 'role', 'content']
  }
}

export async function handleTaskAddMessage(
  client: FirebaseClient,
  args: { 
    task_id: string
    role: 'user' | 'assistant' | 'system'
    content: string
    metadata?: any
  }
): Promise<string> {
  try {
    const messageId = await client.addMessage(
      args.task_id,
      args.role,
      args.content,
      args.metadata
    )
    
    return JSON.stringify({
      success: true,
      task_id: args.task_id,
      message_id: messageId,
      role: args.role,
      message: 'Message added to task thread'
    }, null, 2)
  } catch (error) {
    throw new Error(`Failed to add message: ${error instanceof Error ? error.message : String(error)}`)
  }
}
