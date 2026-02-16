/**
 * MCP Server Factory
 *
 * Creates isolated MCP server instances for multi-tenant usage.
 * Each server instance is scoped to a specific userId.
 */
import { Server } from '@modelcontextprotocol/sdk/server/index.js';
/**
 * Server configuration options
 */
export interface ServerOptions {
    name?: string;
    version?: string;
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
export declare function createServer(accessToken: string, userId: string, options?: ServerOptions): Promise<Server>;
//# sourceMappingURL=server-factory.d.ts.map