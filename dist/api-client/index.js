import { createRequire } from 'module'; const require = createRequire(import.meta.url);

// src/api-client/errors.ts
var TaskApiError = class _TaskApiError extends Error {
  constructor(message, statusCode, response) {
    super(message);
    this.statusCode = statusCode;
    this.response = response;
    this.name = "TaskApiError";
    Object.setPrototypeOf(this, _TaskApiError.prototype);
  }
};
var TaskNotFoundError = class _TaskNotFoundError extends TaskApiError {
  constructor(taskId, response) {
    super(`Task not found: ${taskId}`, 404, response);
    this.taskId = taskId;
    this.name = "TaskNotFoundError";
    Object.setPrototypeOf(this, _TaskNotFoundError.prototype);
  }
};
var UnauthorizedError = class _UnauthorizedError extends TaskApiError {
  constructor(message = "Unauthorized: Invalid or missing service token", response) {
    super(message, 401, response);
    this.name = "UnauthorizedError";
    Object.setPrototypeOf(this, _UnauthorizedError.prototype);
  }
};
var ValidationError = class _ValidationError extends TaskApiError {
  constructor(message, errors, response) {
    super(message, 400, response);
    this.errors = errors;
    this.name = "ValidationError";
    Object.setPrototypeOf(this, _ValidationError.prototype);
  }
};
var ServerError = class _ServerError extends TaskApiError {
  constructor(message = "Internal server error", response) {
    super(message, 500, response);
    this.name = "ServerError";
    Object.setPrototypeOf(this, _ServerError.prototype);
  }
};
var TimeoutError = class _TimeoutError extends TaskApiError {
  constructor(message = "Request timeout", timeoutMs) {
    super(message, void 0, void 0);
    this.timeoutMs = timeoutMs;
    this.name = "TimeoutError";
    Object.setPrototypeOf(this, _TimeoutError.prototype);
  }
};
var NetworkError = class _NetworkError extends TaskApiError {
  constructor(message, cause) {
    super(message, void 0, void 0);
    this.cause = cause;
    this.name = "NetworkError";
    Object.setPrototypeOf(this, _NetworkError.prototype);
  }
};

// src/api-client/task-api-client.ts
var TaskApiClient = class {
  baseUrl;
  serviceToken;
  timeout;
  retries;
  logger;
  constructor(config) {
    this.baseUrl = config.baseUrl.replace(/\/$/, "");
    this.serviceToken = config.serviceToken;
    this.timeout = config.timeout || 3e4;
    this.retries = config.retries ?? 3;
    this.logger = config.logger;
  }
  // ==================== Task Management ====================
  /**
   * Get list of tasks
   */
  async getTasks(options) {
    const params = new URLSearchParams();
    if (options?.status) params.append("status", options.status);
    if (options?.limit) params.append("limit", options.limit.toString());
    if (options?.search) params.append("search", options.search);
    const query = params.toString();
    const path = `/api/tasks${query ? `?${query}` : ""}`;
    return this.request("GET", path);
  }
  /**
   * Get a single task by ID
   */
  async getTask(taskId) {
    try {
      return await this.request("GET", `/api/tasks/${taskId}`);
    } catch (error) {
      if (error instanceof TaskApiError && error.statusCode === 404) {
        throw new TaskNotFoundError(taskId, error.response);
      }
      throw error;
    }
  }
  /**
   * Create a new task
   */
  async createTask(data) {
    return this.request("POST", "/api/tasks", data);
  }
  /**
   * Update a task
   */
  async updateTask(taskId, data) {
    return this.request("PATCH", `/api/tasks/${taskId}`, data);
  }
  /**
   * Delete a task
   */
  async deleteTask(taskId) {
    await this.request("DELETE", `/api/tasks/${taskId}`);
  }
  /**
   * Update task status
   */
  async updateTaskStatus(taskId, status) {
    await this.request("PATCH", `/api/tasks/${taskId}/status`, { status });
  }
  // ==================== Progress Management ====================
  /**
   * Update overall progress percentage
   */
  async updateProgress(taskId, data) {
    await this.request("PATCH", `/api/tasks/${taskId}/progress`, data);
  }
  // ==================== Milestone Management ====================
  /**
   * Create a milestone
   */
  async createMilestone(taskId, data) {
    await this.request("POST", `/api/tasks/${taskId}/milestones`, data);
  }
  /**
   * Update a milestone
   */
  async updateMilestone(taskId, milestoneId, data) {
    await this.request("PATCH", `/api/tasks/${taskId}/milestones/${milestoneId}`, data);
  }
  /**
   * Complete a milestone
   */
  async completeMilestone(taskId, milestoneId) {
    await this.request("POST", `/api/tasks/${taskId}/milestones/${milestoneId}/complete`);
  }
  // ==================== Task Item Management ====================
  /**
   * Create a task item
   */
  async createTaskItem(taskId, milestoneId, data) {
    await this.request("POST", `/api/tasks/${taskId}/milestones/${milestoneId}/items`, data);
  }
  /**
   * Update a task item
   */
  async updateTaskItem(taskId, milestoneId, taskItemId, data) {
    await this.request(
      "PATCH",
      `/api/tasks/${taskId}/milestones/${milestoneId}/items/${taskItemId}`,
      data
    );
  }
  /**
   * Complete a task item
   */
  async completeTaskItem(taskId, milestoneId, taskItemId) {
    await this.request(
      "POST",
      `/api/tasks/${taskId}/milestones/${milestoneId}/items/${taskItemId}/complete`
    );
  }
  // ==================== Message Management ====================
  /**
   * Get messages for a task
   */
  async getMessages(taskId, limit) {
    const params = new URLSearchParams();
    if (limit) params.append("limit", limit.toString());
    const query = params.toString();
    const path = `/api/tasks/${taskId}/messages${query ? `?${query}` : ""}`;
    return this.request("GET", path);
  }
  /**
   * Add a message to a task
   */
  async addMessage(taskId, data) {
    return this.request("POST", `/api/tasks/${taskId}/messages`, data);
  }
  // ==================== Private Methods ====================
  /**
   * Make an HTTP request with retry logic
   */
  async request(method, path, body) {
    return this.retryRequest(() => this.makeRequest(method, path, body));
  }
  /**
   * Make a single HTTP request
   */
  async makeRequest(method, path, body) {
    const url = `${this.baseUrl}${path}`;
    this.logger?.debug(`${method} ${url}`, body ? { body } : {});
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);
    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${this.serviceToken}`
        },
        body: body ? JSON.stringify(body) : void 0,
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (!response.ok) {
        throw await this.handleErrorResponse(response);
      }
      if (response.status === 204 || method === "DELETE") {
        return void 0;
      }
      const data = await response.json();
      this.logger?.debug(`${method} ${url} - Success`, { data });
      return data;
    } catch (error) {
      clearTimeout(timeoutId);
      if (error instanceof TaskApiError) {
        throw error;
      }
      if (error.name === "AbortError") {
        throw new TimeoutError(`Request timeout after ${this.timeout}ms`, this.timeout);
      }
      throw new NetworkError(
        `Network request failed: ${error instanceof Error ? error.message : String(error)}`,
        error instanceof Error ? error : void 0
      );
    }
  }
  /**
   * Handle error responses
   */
  async handleErrorResponse(response) {
    let errorData;
    try {
      errorData = await response.json();
    } catch {
      errorData = { error: response.statusText };
    }
    const message = errorData.error || errorData.message || response.statusText;
    this.logger?.error(`HTTP ${response.status}: ${message}`, errorData);
    switch (response.status) {
      case 400:
        return new ValidationError(message, errorData.errors, errorData);
      case 401:
        return new UnauthorizedError(message, errorData);
      case 404:
        return new TaskApiError(message, 404, errorData);
      case 500:
      case 502:
      case 503:
      case 504:
        return new ServerError(message, errorData);
      default:
        return new TaskApiError(message, response.status, errorData);
    }
  }
  /**
   * Retry a request with exponential backoff
   */
  async retryRequest(fn, attempt = 0) {
    try {
      return await fn();
    } catch (error) {
      if (attempt < this.retries && this.isRetryable(error)) {
        const delay = Math.pow(2, attempt) * 1e3;
        this.logger?.debug(`Retrying request after ${delay}ms (attempt ${attempt + 1}/${this.retries})`);
        await this.delay(delay);
        return this.retryRequest(fn, attempt + 1);
      }
      throw error;
    }
  }
  /**
   * Check if an error is retryable
   */
  isRetryable(error) {
    if (error instanceof ServerError) return true;
    if (error instanceof TimeoutError) return true;
    if (error instanceof NetworkError) return true;
    return false;
  }
  /**
   * Delay for a specified number of milliseconds
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
};
export {
  NetworkError,
  ServerError,
  TaskApiClient,
  TaskApiError,
  TaskNotFoundError,
  TimeoutError,
  UnauthorizedError,
  ValidationError
};
//# sourceMappingURL=index.js.map
