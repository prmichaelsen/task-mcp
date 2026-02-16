/**
 * API Client Error Classes
 *
 * Structured error classes for REST API client error handling.
 */
/**
 * Base error class for all Task API errors
 */
export declare class TaskApiError extends Error {
    statusCode?: number | undefined;
    response?: any | undefined;
    constructor(message: string, statusCode?: number | undefined, response?: any | undefined);
}
/**
 * Error thrown when a task is not found (404)
 */
export declare class TaskNotFoundError extends TaskApiError {
    taskId: string;
    constructor(taskId: string, response?: any);
}
/**
 * Error thrown when authentication fails (401)
 */
export declare class UnauthorizedError extends TaskApiError {
    constructor(message?: string, response?: any);
}
/**
 * Error thrown when request validation fails (400)
 */
export declare class ValidationError extends TaskApiError {
    errors?: Record<string, string[]> | undefined;
    constructor(message: string, errors?: Record<string, string[]> | undefined, response?: any);
}
/**
 * Error thrown when server encounters an error (500)
 */
export declare class ServerError extends TaskApiError {
    constructor(message?: string, response?: any);
}
/**
 * Error thrown when request times out
 */
export declare class TimeoutError extends TaskApiError {
    timeoutMs: number;
    constructor(message: string | undefined, timeoutMs: number);
}
/**
 * Error thrown when network request fails
 */
export declare class NetworkError extends TaskApiError {
    cause?: Error | undefined;
    constructor(message: string, cause?: Error | undefined);
}
//# sourceMappingURL=errors.d.ts.map