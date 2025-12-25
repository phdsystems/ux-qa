/**
 * MockStorage Example
 *
 * Demonstrates mocking localStorage and sessionStorage
 * Follows SEA Pattern: Setup → Exercise → Assert
 * Run with: npx vitest run examples/mocks/storage.example.ts
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setupMockLocalStorage, setupMockSessionStorage, mockStorageData } from '../../core/components/mocks/MockStorage'

describe('MockStorage Examples', () => {
  describe('1. Basic localStorage mock', () => {
    it('stores and retrieves values', () => {
      // Setup
      const { setItem, getItem, storage, cleanup } = setupMockLocalStorage()

      // Exercise
      setItem('theme', 'dark')
      setItem('locale', 'en-US')

      // Assert
      expect(getItem('theme')).toBe('dark')
      expect(storage.theme).toBe('dark')
      expect(storage.locale).toBe('en-US')

      cleanup()
    })
  })

  describe('2. Pre-populate storage', () => {
    it('loads initial data', () => {
      // Setup
      const { storage, getItem, cleanup } = setupMockLocalStorage()
      mockStorageData(storage, {
        user: { id: 1, name: 'John' },
        preferences: { notifications: true }
      })

      // Exercise
      const user = JSON.parse(getItem('user')!)
      const preferences = JSON.parse(getItem('preferences')!)

      // Assert
      expect(user).toEqual({ id: 1, name: 'John' })
      expect(preferences).toEqual({ notifications: true })

      cleanup()
    })
  })

  describe('3. sessionStorage mock', () => {
    it('works like localStorage', () => {
      // Setup
      const mock = setupMockSessionStorage()

      // Exercise
      mock.setItem('sessionId', 'abc123')
      mock.setItem('cart', JSON.stringify(['item1', 'item2']))

      // Assert
      expect(mock.getItem('sessionId')).toBe('abc123')
      expect(JSON.parse(mock.getItem('cart')!)).toEqual(['item1', 'item2'])
      expect(mock.length).toBe(2)

      // Exercise (clear)
      mock.clear()

      // Assert
      expect(mock.length).toBe(0)

      mock.cleanup()
    })
  })

  describe('4. Storage operations', () => {
    it('supports all storage methods', () => {
      // Setup
      const mock = setupMockLocalStorage()

      // Exercise
      mock.setItem('a', '1')
      mock.setItem('b', '2')
      mock.setItem('c', '3')

      // Assert
      expect(mock.length).toBe(3)
      expect(mock.key(0)).toBeDefined()

      // Exercise (remove)
      mock.removeItem('b')

      // Assert
      expect(mock.length).toBe(2)
      expect(mock.getItem('b')).toBeNull()

      mock.cleanup()
    })
  })
})
