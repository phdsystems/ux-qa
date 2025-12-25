/**
 * Mock Utilities Example
 *
 * Demonstrates core mock utilities for custom objects
 * Run with: npx vitest run examples/utilities/mocks.example.ts
 */

import { describe, it, expect } from 'vitest'
import {
  createMock,
  createMockObject,
  mockFetch,
  mockConsole
} from '../../core/utilities/mocks'

describe('Mock Utilities Examples', () => {
  describe('1. createMock - basic usage', () => {
    it('tracks calls', () => {
      const mockFn = createMock()

      mockFn('arg1', 'arg2')
      mockFn('arg3')
      mockFn(123, { foo: 'bar' })

      expect(mockFn.calls).toHaveLength(3)
      expect(mockFn.calls[0]).toEqual(['arg1', 'arg2'])
      expect(mockFn.calls[2]).toEqual([123, { foo: 'bar' }])
    })

    it('clears call history', () => {
      const mockFn = createMock()
      mockFn('test')
      mockFn.clear()
      expect(mockFn.calls).toHaveLength(0)
    })
  })

  describe('2. createMock - with implementation', () => {
    it('executes implementation and tracks results', () => {
      const add = createMock((a: number, b: number) => a + b)

      add(2, 3)
      add(10, 20)
      add(100, 200)

      expect(add.results).toEqual([5, 30, 300])
    })
  })

  describe('3. createMock - async function', () => {
    it('works with async implementations', async () => {
      const fetchUser = createMock(async (id: string) => ({
        id,
        name: `User ${id}`
      }))

      const user = await fetchUser('123')

      expect(user.name).toBe('User 123')
      expect(fetchUser.calls).toHaveLength(1)
    })
  })

  describe('4. createMockObject - auto-mock methods', () => {
    it('auto-creates mock methods', () => {
      interface ApiService {
        getUser(id: string): Promise<any>
        saveUser(user: any): Promise<void>
      }

      const api = createMockObject<ApiService>()

      api.getUser('123')
      api.saveUser({ id: '456' })

      expect(api.getUser.calls).toHaveLength(1)
      expect(api.saveUser.calls).toHaveLength(1)
    })
  })

  describe('5. createMockObject - partial implementation', () => {
    it('uses provided implementations', () => {
      interface Calculator {
        add(a: number, b: number): number
        multiply(a: number, b: number): number
        subtract(a: number, b: number): number
      }

      const calc = createMockObject<Calculator>({
        add: (a, b) => a + b,
        multiply: (a, b) => a * b
      })

      expect(calc.add(5, 3)).toBe(8)
      expect(calc.multiply(4, 7)).toBe(28)
      expect(calc.subtract(10, 3)).toBeUndefined() // auto-mocked
    })
  })

  describe('6. mockFetch', () => {
    it('mocks fetch responses', async () => {
      const originalFetch = globalThis.fetch

      globalThis.fetch = mockFetch({
        '/api/users': {
          status: 200,
          body: [{ id: 1, name: 'John' }]
        },
        '/api/error': {
          status: 500,
          statusText: 'Internal Server Error'
        }
      })

      const usersRes = await fetch('/api/users')
      const users = await usersRes.json()

      expect(usersRes.ok).toBe(true)
      expect(users).toHaveLength(1)

      const errorRes = await fetch('/api/error')
      expect(errorRes.ok).toBe(false)
      expect(errorRes.status).toBe(500)

      const notFoundRes = await fetch('/api/unknown')
      expect(notFoundRes.status).toBe(404)

      globalThis.fetch = originalFetch
    })
  })

  describe('7. mockConsole', () => {
    it('captures console output', () => {
      const { logs, errors, warns, infos, restore } = mockConsole()

      console.log('Debug message')
      console.error('Error occurred!')
      console.warn('Warning message')
      console.info('Info message')

      restore()

      expect(logs).toContain('Debug message')
      expect(errors).toContain('Error occurred!')
      expect(warns).toContain('Warning message')
      expect(infos).toContain('Info message')
    })
  })

  describe('8. Complex mock scenario', () => {
    it('mocks entire service layer', async () => {
      interface UserService {
        find(id: string): Promise<any>
        create(data: any): Promise<any>
        delete(id: string): Promise<boolean>
      }

      const users = new Map<string, any>()

      const userService = createMockObject<UserService>({
        find: async (id) => users.get(id) || null,
        create: async (data) => {
          const id = `user-${Date.now()}`
          const user = { id, ...data }
          users.set(id, user)
          return user
        },
        delete: async (id) => users.delete(id)
      })

      const created = await userService.create({ name: 'John' })
      expect(created.name).toBe('John')

      const found = await userService.find(created.id)
      expect(found.name).toBe('John')

      await userService.delete(created.id)
      const notFound = await userService.find(created.id)
      expect(notFound).toBeNull()
    })
  })
})
