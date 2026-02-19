# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [1.1.0] - 2026-02-19

### Added
- **`task_create` tool** - Agents can now create new tasks programmatically through MCP interface
  - Accepts title (1-200 chars) and description (1-5000 chars)
  - Optional `auto_approve` configuration
  - Input validation with clear error messages
  - Returns task ID and next steps guidance
  - Enables fully autonomous task workflows
- Comprehensive test suite for `task_create` tool (14 tests, 100% coverage)

### Changed
- Updated tools registry to include `task_create` (now 9 tools total)
- Improved overall test coverage from 77.37% to 78.63%

### Fixed
- Critical gap: Agents previously could not create tasks through MCP, only work with existing tasks

## [1.0.0] - 2026-02-19

### Changed
- **BREAKING**: Migrated to `@prmichaelsen/task-core` package for core business logic
  - Core functionality (schemas, DTOs, services, Firebase client) now provided by external package
  - Reduced package size by removing ~2000+ lines of duplicated code
  - Enables code reuse between MCP server and REST API service

### Removed
- **BREAKING**: Local core files moved to `@prmichaelsen/task-core`
  - Removed `src/schemas/` - Use `@prmichaelsen/task-core/schemas`
  - Removed `src/dto/` - Use `@prmichaelsen/task-core/dto`
  - Removed `src/services/` - Use `@prmichaelsen/task-core/services`
  - Removed `src/client.ts` - Use `@prmichaelsen/task-core/client`
  - Removed `src/constant/` - Use `@prmichaelsen/task-core/constants`
- **BREAKING**: Package exports for core modules
  - Removed `./schemas`, `./dto`, `./services`, `./client`, `./constants` exports
  - Only MCP-specific exports remain: `./` (server), `./factory`, `./api-client`
- Dependencies now provided by task-core
  - Removed `firebase-admin` from direct dependencies
  - Removed `zod` from direct dependencies

### Added
- Dependency on `@prmichaelsen/task-core@^1.0.1`
- Jest mocks for external task-core package

### Migration Guide
To migrate from v0.4.0 to v1.0.0:

1. **Install task-core**: Already included as dependency
2. **Update imports**:
   - `@prmichaelsen/task-mcp/schemas` → `@prmichaelsen/task-core/schemas`
   - `@prmichaelsen/task-mcp/dto` → `@prmichaelsen/task-core/dto`
   - `@prmichaelsen/task-mcp/services` → `@prmichaelsen/task-core/services`
   - `@prmichaelsen/task-mcp/client` → `@prmichaelsen/task-core/client`
3. **MCP server usage unchanged**: The MCP server exports remain the same

## [0.4.0] - 2026-02-16

### Added
- Build configuration with esbuild
  - `esbuild.build.js` - Production build script
  - `esbuild.watch.js` - Development watch mode
  - Bundles all entry points (server, factory, client, services, schemas, dto, api-client)
  - Generates TypeScript declarations and source maps
  - External dependencies properly configured
  - Shebang added to server.js for CLI usage
- Package scripts for building and development
  - `npm run build` - Build all bundles and declarations
  - `npm run build:watch` - Watch mode for development
  - `npm run clean` - Clean dist/ directory
  - `npm run dev` - Alias for watch mode
  - `npm run prepublishOnly` - Pre-publish validation

### Changed
- Build process now uses esbuild instead of tsc only
- Faster build times with bundling
- Smaller bundle sizes with tree-shaking

## [0.3.0] - 2026-02-16

### Added
- REST API Client for consuming task-mcp REST API
  - `TaskApiClient` class with type-safe methods
  - Authentication with service token
  - Automatic retry logic with exponential backoff
  - Comprehensive error handling with structured error classes
  - Support for all task management operations (CRUD, status, progress)
  - Support for milestone management (create, update, complete)
  - Support for task item management (create, update, complete)
  - Support for message management (get, add)
  - Request timeout and abort controller support
  - Optional logger for debugging
- Error classes for API client
  - `TaskApiError` - Base error class
  - `TaskNotFoundError` - 404 errors
  - `UnauthorizedError` - 401 errors
  - `ValidationError` - 400 errors
  - `ServerError` - 500 errors
  - `TimeoutError` - Request timeout errors
  - `NetworkError` - Network failure errors
- Package export for API client via `@prmichaelsen/task-mcp/api-client`
- 25 comprehensive unit tests for API client (91% coverage)

## [0.2.0] - 2026-02-16

### Added
- API Response DTOs for REST API integration
  - `TaskApiResponse` - Complete task representation without internal execution fields
  - `TaskListApiResponse` - List response with total count
  - `TaskMessageApiResponse` - Task message representation
  - `TaskMessageListApiResponse` - Message list response
  - Input DTOs: `CreateTaskDto`, `UpdateTaskDto`, `CreateMessageDto`, etc.
- DTO transformer functions for schema-to-API conversion
  - 9 transformer functions with 100% test coverage
  - Automatic exclusion of internal fields (api_messages, tool_results)
- Package export for DTOs via `task-mcp/dto`
- 18 comprehensive unit tests for DTO transformers

### Changed
- Updated package.json with `./dto` export

## [0.1.0] - 2026-02-16

### Added
- Initial project setup with TypeScript and ESM
- Task data model with Zod schemas
  - Task, Milestone, TaskItem, TaskProgress, TaskConfig, TaskMetadata schemas
  - Standardized timestamp fields with `_at` suffix
- TaskDatabaseService for Firestore operations
  - CRUD operations for tasks
  - Task message operations
  - Progress tracking (milestones, task items)
  - Query methods (by status, search by title)
- FirebaseClient wrapper for multi-tenant Firebase Admin SDK access
- 8 core MCP tools for task management
  - `task_get_status` - Get current task status
  - `task_get_next_step` - Get next step instructions
  - `task_update_progress` - Update progress percentage
  - `task_complete_task_item` - Mark task item complete
  - `task_create_milestone` - Create new milestone
  - `task_create_task_item` - Create task item in milestone
  - `task_report_completion` - Report completion and get next step
  - `task_add_message` - Add message to task thread
- MCP server implementation
  - Server factory for multi-tenant usage (mcp-auth compatible)
  - Standalone server with stdio transport
  - Tool registration and request handling
- Comprehensive test suite
  - 51 unit tests (14 database + 11 client + 18 tools + 8 server)
  - Jest configuration with ESM + TypeScript support
  - Mocked Firebase client for testing
- Firestore security rules with user-scoped access
- Collection path helpers for consistent Firestore paths
- Agent Context Protocol (ACP) documentation
  - Design documents for architecture and requirements
  - Milestone and task planning documents
  - Progress tracking with progress.yaml

### Security
- User-scoped data access enforced at service layer
- Internal execution fields excluded from API responses
- Service account authentication for Firebase Admin SDK

[Unreleased]: https://github.com/yourusername/task-mcp/compare/v0.4.0...HEAD
[0.4.0]: https://github.com/yourusername/task-mcp/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/yourusername/task-mcp/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/yourusername/task-mcp/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/yourusername/task-mcp/releases/tag/v0.1.0
