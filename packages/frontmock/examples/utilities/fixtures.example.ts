/**
 * Fixtures Example
 *
 * Demonstrates test data generators and fixtures
 * Run with: npx vitest run examples/utilities/fixtures.example.ts
 */

import { describe, it, expect } from 'vitest'
import {
  generateId,
  generateEmail,
  generateUser,
  generateMany,
  waitForCondition,
  createDeferred
} from '../../core/utilities/fixtures'

describe('Fixtures Examples', () => {
  describe('1. Generate IDs', () => {
    it('generates unique IDs', () => {
      const id1 = generateId()
      const id2 = generateId()

      expect(id1).toMatch(/^test-/)
      expect(id2).toMatch(/^test-/)
      expect(id1).not.toBe(id2)
    })

    it('supports custom prefix', () => {
      const userId = generateId('user')
      const orderId = generateId('order')

      expect(userId).toMatch(/^user-/)
      expect(orderId).toMatch(/^order-/)
    })
  })

  describe('2. Generate emails', () => {
    it('generates random emails', () => {
      const email1 = generateEmail()
      const email2 = generateEmail()

      expect(email1).toMatch(/@test\.example\.com$/)
      expect(email2).toMatch(/@test\.example\.com$/)
    })

    it('uses provided name', () => {
      const email = generateEmail('john')
      expect(email).toBe('john@test.example.com')
    })
  })

  describe('3. Generate users', () => {
    it('generates default user', () => {
      const user = generateUser()

      expect(user.id).toBeDefined()
      expect(user.name).toBeDefined()
      expect(user.email).toMatch(/@test\.example\.com$/)
      expect(user.createdAt).toBeDefined()
    })

    it('accepts partial override', () => {
      const user = generateUser({ name: 'John Doe' })
      expect(user.name).toBe('John Doe')
    })

    it('accepts full override', () => {
      const user = generateUser({
        name: 'Jane Smith',
        email: 'jane@company.com',
        role: 'admin'
      })

      expect(user.name).toBe('Jane Smith')
      expect(user.email).toBe('jane@company.com')
      expect(user.role).toBe('admin')
    })
  })

  describe('4. Generate many', () => {
    it('generates array of items', () => {
      const users = generateMany(
        (i) => generateUser({ name: `User ${i + 1}` }),
        5
      )

      expect(users).toHaveLength(5)
      expect(users[0].name).toBe('User 1')
      expect(users[4].name).toBe('User 5')
    })

    it('works with simple generators', () => {
      const ids = generateMany(() => generateId(), 3)
      expect(ids).toHaveLength(3)
      expect(new Set(ids).size).toBe(3) // All unique

      const numbers = generateMany((i) => i * 10, 5)
      expect(numbers).toEqual([0, 10, 20, 30, 40])
    })
  })

  describe('5. Wait for condition', () => {
    it('waits until condition is true', async () => {
      let ready = false

      setTimeout(() => {
        ready = true
      }, 20)

      await waitForCondition(() => ready, 500, 5)
      expect(ready).toBe(true)
    })

    it('throws on timeout', async () => {
      await expect(
        waitForCondition(() => false, 50, 10)
      ).rejects.toThrow('Condition not met')
    })
  })

  describe('6. Deferred promise', () => {
    it('resolves when resolve is called', async () => {
      const deferred = createDeferred<string>()

      setTimeout(() => {
        deferred.resolve('Data loaded!')
      }, 10)

      const result = await deferred.promise
      expect(result).toBe('Data loaded!')
    })

    it('rejects when reject is called', async () => {
      const deferred = createDeferred<string>()

      setTimeout(() => {
        deferred.reject(new Error('Failed to load'))
      }, 10)

      await expect(deferred.promise).rejects.toThrow('Failed to load')
    })
  })

  describe('7. Combined usage', () => {
    it('simulates async data loading', async () => {
      const deferred = createDeferred<any[]>()

      setTimeout(() => {
        const users = generateMany(
          (i) => generateUser({ name: `API User ${i}` }),
          3
        )
        deferred.resolve(users)
      }, 10)

      const users = await deferred.promise

      expect(users).toHaveLength(3)
      expect(users[0].name).toBe('API User 0')
    })
  })
})
