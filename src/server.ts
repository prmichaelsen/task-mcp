#!/usr/bin/env node

/**
 * MCP Server - Standalone Entry Point
 * 
 * Starts an MCP server with stdio transport for a single user.
 * This is the main entry point for running task-mcp as a standalone server.
 */

import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'
import { createServer } from './server-factory.js'

/**
 * Initialize and start the MCP server
 */
async function main(): Promise<void> {
  // Get userId from environment variable (set by mcp-auth wrapper)
  const userId = process.env.TASK_MCP_USER_ID
  
  if (!userId) {
    console.error('Error: TASK_MCP_USER_ID environment variable is required')
    console.error('This server should be run through mcp-auth wrapper')
    process.exit(1)
  }
  
  try {
    // Create server instance
    // Note: accessToken is not used by task-mcp but required by mcp-auth signature
    const server = await createServer('', userId, {
      name: 'task-mcp',
      version: '0.1.0'
    })
    
    // Create stdio transport
    const transport = new StdioServerTransport()
    
    // Connect server to transport
    await server.connect(transport)
    
    // Log startup (to stderr to not interfere with stdio protocol)
    console.error(`task-mcp server started for user: ${userId}`)
  } catch (error) {
    console.error('Failed to start server:', error)
    process.exit(1)
  }
}

/**
 * Setup graceful shutdown handlers
 */
function setupShutdownHandlers(): void {
  const shutdown = async (signal: string) => {
    console.error(`\nReceived ${signal}, shutting down gracefully...`)
    process.exit(0)
  }
  
  process.on('SIGINT', () => shutdown('SIGINT'))
  process.on('SIGTERM', () => shutdown('SIGTERM'))
}

// Setup shutdown handlers
setupShutdownHandlers()

// Start server
main().catch((error) => {
  console.error('Fatal error:', error)
  process.exit(1)
})
