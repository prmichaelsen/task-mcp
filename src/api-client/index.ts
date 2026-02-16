/**
 * API Client Module Exports
 * 
 * Exports TaskApiClient and error classes for REST API integration.
 */

// Export client class
export { TaskApiClient } from './task-api-client.js'
export type { TaskApiClientConfig, GetTasksOptions } from './task-api-client.js'

// Export error classes
export {
  TaskApiError,
  TaskNotFoundError,
  UnauthorizedError,
  ValidationError,
  ServerError,
  TimeoutError,
  NetworkError
} from './errors.js'
