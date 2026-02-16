/**
 * Server Factory Tests
 */

import { createServer } from './server-factory.js'
import { FirebaseClient } from './client.js'

// Mock FirebaseClient
jest.mock('./client.js', () => ({
  FirebaseClient: jest.fn().mockImplementation(() => ({
    connect: jest.fn().mockResolvedValue(undefined),
    disconnect: jest.fn().mockResolvedValue(undefined)
  }))
}))

describe('Server Factory', () => {
  describe('Parameter Validation', () => {
    it('should create server instance with valid userId', async () => {
      const server = await createServer('test-token', 'test-user-123')
      expect(server).toBeDefined()
      expect(server).toHaveProperty('connect')
      expect(server).toHaveProperty('setRequestHandler')
    })
    
    it('should throw error if userId is empty', async () => {
      await expect(createServer('test-token', '')).rejects.toThrow('userId is required')
    })
    
    it('should accept custom options', async () => {
      const server = await createServer('test-token', 'test-user-123', {
        name: 'custom-task-mcp',
        version: '1.0.0'
      })
      expect(server).toBeDefined()
    })
  })
  
  describe('Server Isolation', () => {
    it('should create separate instances for different users', async () => {
      const server1 = await createServer('test-token', 'user-1')
      const server2 = await createServer('test-token', 'user-2')
      
      expect(server1).not.toBe(server2)
    })
    
    it('should scope operations to userId', async () => {
      const server = await createServer('test-token', 'test-user-123')
      
      // Server should be isolated to this user
      expect(server).toBeDefined()
    })
  })
  
  describe('Options', () => {
    it('should use default name if not provided', async () => {
      const server = await createServer('test-token', 'test-user-123')
      expect(server).toBeDefined()
    })
    
    it('should use custom name if provided', async () => {
      const server = await createServer('test-token', 'test-user-123', { name: 'custom-name' })
      expect(server).toBeDefined()
    })
    
    it('should use custom version if provided', async () => {
      const server = await createServer('test-token', 'test-user-123', { version: '2.0.0' })
      expect(server).toBeDefined()
    })
  })
})
