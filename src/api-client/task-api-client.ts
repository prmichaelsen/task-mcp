/**
 * Task API Client
 * 
 * REST API client for consuming task-mcp REST API.
 * Provides type-safe methods, authentication, error handling, and retry logic.
 */

import type {
  TaskApiResponse,
  TaskListApiResponse,
  TaskMessageApiResponse,
  TaskMessageListApiResponse,
  CreateTaskDto,
  UpdateTaskDto,
  CreateMessageDto,
  UpdateProgressDto,
  CreateMilestoneDto,
  CreateTaskItemDto,
  TaskStatus,
  MilestoneApiResponse,
  TaskItemApiResponse
} from '@prmichaelsen/task-core/dto'

import {
  TaskApiError,
  TaskNotFoundError,
  UnauthorizedError,
  ValidationError,
  ServerError,
  TimeoutError,
  NetworkError
} from './errors.js'

/**
 * Configuration options for TaskApiClient
 */
export interface TaskApiClientConfig {
  /** Base URL of the task-mcp REST API */
  baseUrl: string
  
  /** Service token for authentication */
  serviceToken: string
  
  /** Request timeout in milliseconds (default: 30000) */
  timeout?: number
  
  /** Number of retry attempts for transient failures (default: 3) */
  retries?: number
  
  /** Optional logger for debugging */
  logger?: {
    debug: (message: string, ...args: any[]) => void
    error: (message: string, ...args: any[]) => void
  }
}

/**
 * Options for listing tasks
 */
export interface GetTasksOptions {
  status?: TaskStatus
  limit?: number
  search?: string
}

/**
 * REST API client for task-mcp
 */
export class TaskApiClient {
  private readonly baseUrl: string
  private readonly serviceToken: string
  private readonly timeout: number
  private readonly retries: number
  private readonly logger?: TaskApiClientConfig['logger']

  constructor(config: TaskApiClientConfig) {
    this.baseUrl = config.baseUrl.replace(/\/$/, '') // Remove trailing slash
    this.serviceToken = config.serviceToken
    this.timeout = config.timeout || 30000
    this.retries = config.retries ?? 3
    this.logger = config.logger
  }

  // ==================== Task Management ====================

  /**
   * Get list of tasks
   */
  async getTasks(options?: GetTasksOptions): Promise<TaskListApiResponse> {
    const params = new URLSearchParams()
    if (options?.status) params.append('status', options.status)
    if (options?.limit) params.append('limit', options.limit.toString())
    if (options?.search) params.append('search', options.search)

    const query = params.toString()
    const path = `/api/tasks${query ? `?${query}` : ''}`

    return this.request<TaskListApiResponse>('GET', path)
  }

  /**
   * Get a single task by ID
   */
  async getTask(taskId: string): Promise<TaskApiResponse> {
    try {
      return await this.request<TaskApiResponse>('GET', `/api/tasks/${taskId}`)
    } catch (error) {
      if (error instanceof TaskApiError && error.statusCode === 404) {
        throw new TaskNotFoundError(taskId, error.response)
      }
      throw error
    }
  }

  /**
   * Create a new task
   */
  async createTask(data: CreateTaskDto): Promise<TaskApiResponse> {
    return this.request<TaskApiResponse>('POST', '/api/tasks', data)
  }

  /**
   * Update a task
   */
  async updateTask(taskId: string, data: UpdateTaskDto): Promise<TaskApiResponse> {
    return this.request<TaskApiResponse>('PATCH', `/api/tasks/${taskId}`, data)
  }

  /**
   * Delete a task
   */
  async deleteTask(taskId: string): Promise<void> {
    await this.request<void>('DELETE', `/api/tasks/${taskId}`)
  }

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: TaskStatus): Promise<void> {
    await this.request<void>('PATCH', `/api/tasks/${taskId}/status`, { status })
  }

  // ==================== Progress Management ====================

  /**
   * Update overall progress percentage
   */
  async updateProgress(taskId: string, data: UpdateProgressDto): Promise<void> {
    await this.request<void>('PATCH', `/api/tasks/${taskId}/progress`, data)
  }

  // ==================== Milestone Management ====================

  /**
   * Create a milestone
   */
  async createMilestone(taskId: string, data: CreateMilestoneDto): Promise<void> {
    await this.request<void>('POST', `/api/tasks/${taskId}/milestones`, data)
  }

  /**
   * Update a milestone
   */
  async updateMilestone(
    taskId: string,
    milestoneId: string,
    data: Partial<MilestoneApiResponse>
  ): Promise<void> {
    await this.request<void>('PATCH', `/api/tasks/${taskId}/milestones/${milestoneId}`, data)
  }

  /**
   * Complete a milestone
   */
  async completeMilestone(taskId: string, milestoneId: string): Promise<void> {
    await this.request<void>('POST', `/api/tasks/${taskId}/milestones/${milestoneId}/complete`)
  }

  // ==================== Task Item Management ====================

  /**
   * Create a task item
   */
  async createTaskItem(
    taskId: string,
    milestoneId: string,
    data: CreateTaskItemDto
  ): Promise<void> {
    await this.request<void>('POST', `/api/tasks/${taskId}/milestones/${milestoneId}/items`, data)
  }

  /**
   * Update a task item
   */
  async updateTaskItem(
    taskId: string,
    milestoneId: string,
    taskItemId: string,
    data: Partial<TaskItemApiResponse>
  ): Promise<void> {
    await this.request<void>(
      'PATCH',
      `/api/tasks/${taskId}/milestones/${milestoneId}/items/${taskItemId}`,
      data
    )
  }

  /**
   * Complete a task item
   */
  async completeTaskItem(
    taskId: string,
    milestoneId: string,
    taskItemId: string
  ): Promise<void> {
    await this.request<void>(
      'POST',
      `/api/tasks/${taskId}/milestones/${milestoneId}/items/${taskItemId}/complete`
    )
  }

  // ==================== Message Management ====================

  /**
   * Get messages for a task
   */
  async getMessages(taskId: string, limit?: number): Promise<TaskMessageListApiResponse> {
    const params = new URLSearchParams()
    if (limit) params.append('limit', limit.toString())

    const query = params.toString()
    const path = `/api/tasks/${taskId}/messages${query ? `?${query}` : ''}`

    return this.request<TaskMessageListApiResponse>('GET', path)
  }

  /**
   * Add a message to a task
   */
  async addMessage(taskId: string, data: CreateMessageDto): Promise<{ message_id: string }> {
    return this.request<{ message_id: string }>('POST', `/api/tasks/${taskId}/messages`, data)
  }

  // ==================== Private Methods ====================

  /**
   * Make an HTTP request with retry logic
   */
  private async request<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    return this.retryRequest(() => this.makeRequest<T>(method, path, body))
  }

  /**
   * Make a single HTTP request
   */
  private async makeRequest<T>(
    method: string,
    path: string,
    body?: any
  ): Promise<T> {
    const url = `${this.baseUrl}${path}`
    
    this.logger?.debug(`${method} ${url}`, body ? { body } : {})

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), this.timeout)

    try {
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.serviceToken}`
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal
      })

      clearTimeout(timeoutId)

      if (!response.ok) {
        throw await this.handleErrorResponse(response)
      }

      // Handle empty responses (204 No Content, DELETE, etc.)
      if (response.status === 204 || method === 'DELETE') {
        return undefined as T
      }

      const data = await response.json()
      this.logger?.debug(`${method} ${url} - Success`, { data })
      return data as T
    } catch (error) {
      clearTimeout(timeoutId)

      if (error instanceof TaskApiError) {
        throw error
      }

      if ((error as any).name === 'AbortError') {
        throw new TimeoutError(`Request timeout after ${this.timeout}ms`, this.timeout)
      }

      throw new NetworkError(
        `Network request failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : undefined
      )
    }
  }

  /**
   * Handle error responses
   */
  private async handleErrorResponse(response: Response): Promise<TaskApiError> {
    let errorData: any
    try {
      errorData = await response.json()
    } catch {
      errorData = { error: response.statusText }
    }

    const message = errorData.error || errorData.message || response.statusText

    this.logger?.error(`HTTP ${response.status}: ${message}`, errorData)

    switch (response.status) {
      case 400:
        return new ValidationError(message, errorData.errors, errorData)
      case 401:
        return new UnauthorizedError(message, errorData)
      case 404:
        return new TaskApiError(message, 404, errorData)
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message, errorData)
      default:
        return new TaskApiError(message, response.status, errorData)
    }
  }

  /**
   * Retry a request with exponential backoff
   */
  private async retryRequest<T>(
    fn: () => Promise<T>,
    attempt: number = 0
  ): Promise<T> {
    try {
      return await fn()
    } catch (error) {
      if (attempt < this.retries && this.isRetryable(error)) {
        const delay = Math.pow(2, attempt) * 1000 // Exponential backoff: 1s, 2s, 4s
        this.logger?.debug(`Retrying request after ${delay}ms (attempt ${attempt + 1}/${this.retries})`)
        await this.delay(delay)
        return this.retryRequest(fn, attempt + 1)
      }
      throw error
    }
  }

  /**
   * Check if an error is retryable
   */
  private isRetryable(error: unknown): boolean {
    if (error instanceof ServerError) return true
    if (error instanceof TimeoutError) return true
    if (error instanceof NetworkError) return true
    return false
  }

  /**
   * Delay for a specified number of milliseconds
   */
  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms))
  }
}
