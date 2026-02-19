/**
 * MCP Server Factory
 * 
 * Creates isolated MCP server instances for multi-tenant usage.
 * Each server instance is scoped to a specific userId.
 */

import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js'
import { FirebaseClient } from '@prmichaelsen/task-core/client'
import { allTools, getToolHandler } from './tools/index.js'

/**
 * Server configuration options
 */
export interface ServerOptions {
  name?: string
  version?: string
}

/**
 * Create an MCP server instance for a specific user
 *
 * This function is compatible with mcp-auth wrapper which calls it with:
 * createServer(accessToken, userId)
 *
 * @param accessToken - Access token (not used by task-mcp, but required by mcp-auth)
 * @param userId - User ID to scope operations to
 * @param options - Optional server configuration
 * @returns Configured MCP Server instance
 */
export async function createServer(
  accessToken: string,
  userId: string,
  options: ServerOptions = {}
): Promise<Server> {
  if (!userId) {
    throw new Error('userId is required')
  }
  
  // Initialize Firebase client for this user
  const client = new FirebaseClient({ userId })
  await client.connect()
  
  // Create MCP server
  const server = new Server(
    {
      name: options.name || 'task-mcp',
      version: options.version || '0.1.0'
    },
    {
      capabilities: {
        tools: {}
      }
    }
  )
  
  // Register list_tools handler
  server.setRequestHandler(ListToolsRequestSchema, async () => {
    return {
      tools: allTools
    }
  })
  
  // Register call_tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params
    
    try {
      // Get handler for this tool
      const handler = getToolHandler(name)
      
      if (!handler) {
        throw new McpError(
          ErrorCode.MethodNotFound,
          `Unknown tool: ${name}`
        )
      }
      
      // Execute tool handler
      const result = await handler(client, args as any || {})
      
      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      }
    } catch (error) {
      // Re-throw MCP errors as-is
      if (error instanceof McpError) {
        throw error
      }
      
      // Wrap other errors in MCP error
      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  })
  
  return server
}
