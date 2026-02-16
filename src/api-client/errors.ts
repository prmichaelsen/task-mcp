/**
 * API Client Error Classes
 * 
 * Structured error classes for REST API client error handling.
 */

/**
 * Base error class for all Task API errors
 */
export class TaskApiError extends Error {
  constructor(
    message: string,
    public statusCode?: number,
    public response?: any
  ) {
    super(message)
    this.name = 'TaskApiError'
    Object.setPrototypeOf(this, TaskApiError.prototype)
  }
}

/**
 * Error thrown when a task is not found (404)
 */
export class TaskNotFoundError extends TaskApiError {
  constructor(
    public taskId: string,
    response?: any
  ) {
    super(`Task not found: ${taskId}`, 404, response)
    this.name = 'TaskNotFoundError'
    Object.setPrototypeOf(this, TaskNotFoundError.prototype)
  }
}

/**
 * Error thrown when authentication fails (401)
 */
export class UnauthorizedError extends TaskApiError {
  constructor(message: string = 'Unauthorized: Invalid or missing service token', response?: any) {
    super(message, 401, response)
    this.name = 'UnauthorizedError'
    Object.setPrototypeOf(this, UnauthorizedError.prototype)
  }
}

/**
 * Error thrown when request validation fails (400)
 */
export class ValidationError extends TaskApiError {
  constructor(
    message: string,
    public errors?: Record<string, string[]>,
    response?: any
  ) {
    super(message, 400, response)
    this.name = 'ValidationError'
    Object.setPrototypeOf(this, ValidationError.prototype)
  }
}

/**
 * Error thrown when server encounters an error (500)
 */
export class ServerError extends TaskApiError {
  constructor(message: string = 'Internal server error', response?: any) {
    super(message, 500, response)
    this.name = 'ServerError'
    Object.setPrototypeOf(this, ServerError.prototype)
  }
}

/**
 * Error thrown when request times out
 */
export class TimeoutError extends TaskApiError {
  constructor(message: string = 'Request timeout', public timeoutMs: number) {
    super(message, undefined, undefined)
    this.name = 'TimeoutError'
    Object.setPrototypeOf(this, TimeoutError.prototype)
  }
}

/**
 * Error thrown when network request fails
 */
export class NetworkError extends TaskApiError {
  constructor(message: string, public cause?: Error) {
    super(message, undefined, undefined)
    this.name = 'NetworkError'
    Object.setPrototypeOf(this, NetworkError.prototype)
  }
}
