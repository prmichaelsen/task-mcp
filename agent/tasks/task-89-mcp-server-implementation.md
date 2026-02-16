# Task 90: MCP Server Implementation

**Milestone**: Milestone 2 - MCP Server Foundation
**Estimated Time**: 8 hours
**Dependencies**: Task 89 (Core MCP Tools)
**Status**: Not Started

---

## Objective

Create the MCP server implementation that exposes task management tools via MCP protocol. Implement both standalone server (stdio transport) and server factory (multi-tenant) following the MCP Server Bootstrap Pattern.

## Steps

### 1. Install MCP SDK

Install dependencies:
```bash
npm install @modelcontextprotocol/sdk
```

### 2. Create Server Factory

Create `src/server-factory.ts`:
- Export `createServer(userId, options)` function
- Initialize FirebaseClient with userId
- Create MCP Server instance
- Register all tools from `src/tools/`
- Handle `list_tools` requests
- Handle `call_tool` requests
- Return configured Server instance

### 3. Create Standalone Server

Create `src/server.ts`:
- CLI entry point for stdio transport
- Load userId from environment or args
- Use server factory to create instance
- Connect with StdioServerTransport
- Handle graceful shutdown

### 4. Create CLI Entry Point

Create `src/index.ts`:
- Parse command line arguments
- Load environment variables
- Start standalone server
- Handle errors

### 5. Create Types

Create `src/types.ts`:
- MCP-specific type definitions
- Server options interface
- Tool handler types
- Export shared types

### 6. Write Unit Tests

Create tests:
- `src/server-factory.spec.ts` - Test factory function
- `src/server.spec.ts` - Test server initialization
- Test tool registration
- Test request handling

## Verification

- [ ] Server factory creates isolated instances
- [ ] Standalone server starts with stdio
- [ ] All tools registered correctly
- [ ] list_tools returns all 8 tools
- [ ] call_tool executes tools correctly
- [ ] Error handling works
- [ ] Unit tests pass
- [ ] TypeScript compiles without errors

## Example Server Factory

```typescript
// src/server-factory.ts
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
  ErrorCode,
  McpError
} from '@modelcontextprotocol/sdk/types.js'
import { FirebaseClient } from './client.js'
import {
  taskGetStatusTool,
  handleTaskGetStatus,
  taskGetNextStepTool,
  handleTaskGetNextStep,
  // ... import all tools
} from './tools/index.js'

export interface ServerOptions {
  name?: string
  version?: string
}

export function createServer(
  userId: string,
  options: ServerOptions = {}
): Server {
  if (!userId) {
    throw new Error('userId is required')
  }
  
  // Initialize Firebase client for this user
  const client = new FirebaseClient(userId)
  
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
      tools: [
        taskGetStatusTool,
        taskGetNextStepTool,
        // ... all tool definitions
      ]
    }
  })
  
  // Register call_tool handler
  server.setRequestHandler(CallToolRequestSchema, async (request) => {
    const { name, arguments: args } = request.params
    
    try {
      let result: string
      
      switch (name) {
        case 'task_get_status':
          result = await handleTaskGetStatus(client, args)
          break
        
        case 'task_get_next_step':
          result = await handleTaskGetNextStep(client, args)
          break
        
        // ... all tool handlers
        
        default:
          throw new McpError(
            ErrorCode.MethodNotFound,
            `Unknown tool: ${name}`
          )
      }
      
      return {
        content: [
          {
            type: 'text',
            text: result
          }
        ]
      }
    } catch (error) {
      if (error instanceof McpError) {
        throw error
      }
      
      throw new McpError(
        ErrorCode.InternalError,
        `Tool execution failed: ${error instanceof Error ? error.message : String(error)}`
      )
    }
  })
  
  return server
}
```

## Files to Create

- `src/server-factory.ts`
- `src/server-factory.spec.ts`
- `src/server.ts`
- `src/index.ts`
- `src/types.ts`

---

**Next Task**: [Task 91: Build Configuration](task-91-build-configuration.md)
