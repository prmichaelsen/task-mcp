/**
 * Mock for @prmichaelsen/task-core package
 * Used in Jest tests
 */

// Mock FirebaseClient
export class FirebaseClient {
  constructor(config: any) {
    // Mock constructor
  }
  
  connect = jest.fn().mockResolvedValue(undefined)
  disconnect = jest.fn().mockResolvedValue(undefined)
  getTask = jest.fn().mockResolvedValue(null)
  updateTask = jest.fn().mockResolvedValue(undefined)
  createTask = jest.fn().mockResolvedValue({})
  deleteTask = jest.fn().mockResolvedValue(undefined)
  addMessage = jest.fn().mockResolvedValue(undefined)
  getMessages = jest.fn().mockResolvedValue([])
}

// Mock TaskDatabaseService
export class TaskDatabaseService {
  static initialize = jest.fn()
  static getTask = jest.fn().mockResolvedValue(null)
  static createTask = jest.fn().mockResolvedValue({})
  static updateTask = jest.fn().mockResolvedValue(undefined)
  static deleteTask = jest.fn().mockResolvedValue(undefined)
  static addMessage = jest.fn().mockResolvedValue(undefined)
  static getMessages = jest.fn().mockResolvedValue([])
}

// Export mock types (these will be imported but not used in mocks)
export const TaskSchema = {}
export const MilestoneSchema = {}
export const TaskItemSchema = {}
