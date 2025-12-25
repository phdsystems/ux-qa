/**
 * Assertions Example
 *
 * Demonstrates custom assertion utilities
 * Run with: npx vitest run examples/utilities/assertions.example.ts
 */

import { describe, it, expect } from 'vitest'
import {
  assertDefined,
  assertThrows,
  assertArrayEquals,
  assertObjectContains
} from '../../core/utilities/assertions'

describe('Assertions Examples', () => {
  describe('1. assertDefined', () => {
    it('passes for defined values', () => {
      assertDefined('hello')
      assertDefined({ name: 'test' })
      assertDefined(0)
      assertDefined(false)
      assertDefined('')
    })

    it('throws for null', () => {
      expect(() => assertDefined(null, 'Value should not be null'))
        .toThrow('Value should not be null')
    })

    it('throws for undefined', () => {
      expect(() => assertDefined(undefined))
        .toThrow('Expected value to be defined')
    })
  })

  describe('2. assertThrows', () => {
    it('passes when function throws', async () => {
      const throwingFn = () => {
        throw new Error('Something went wrong')
      }
      await assertThrows(throwingFn)
    })

    it('matches error message string', async () => {
      const throwingFn = () => {
        throw new Error('Something went wrong')
      }
      await assertThrows(throwingFn, 'went wrong')
    })

    it('matches error message regex', async () => {
      const throwingFn = () => {
        throw new Error('Something went wrong')
      }
      await assertThrows(throwingFn, /something/i)
    })

    it('works with async functions', async () => {
      const asyncThrowingFn = async () => {
        throw new Error('Async error')
      }
      await assertThrows(asyncThrowingFn, 'Async')
    })

    it('fails when function does not throw', async () => {
      try {
        await assertThrows(() => 'no error')
        expect.fail('Should have thrown')
      } catch (e) {
        expect((e as Error).message).toContain('Expected function to throw')
      }
    })
  })

  describe('3. assertArrayEquals', () => {
    it('passes for equal arrays', () => {
      assertArrayEquals([1, 2, 3], [1, 2, 3])
      assertArrayEquals(['a', 'b'], ['a', 'b'])
      assertArrayEquals([{ id: 1 }, { id: 2 }], [{ id: 1 }, { id: 2 }])
    })

    it('throws for length mismatch', () => {
      expect(() => assertArrayEquals([1, 2], [1, 2, 3]))
        .toThrow('Array lengths differ')
    })

    it('throws for value mismatch', () => {
      expect(() => assertArrayEquals([1, 2, 3], [1, 2, 4]))
        .toThrow('Arrays differ at index 2')
    })
  })

  describe('4. assertObjectContains', () => {
    const user = {
      id: '123',
      name: 'John',
      email: 'john@example.com',
      role: 'admin',
      createdAt: '2024-01-01'
    }

    it('passes for matching subset', () => {
      assertObjectContains(user, { name: 'John' })
      assertObjectContains(user, { id: '123', role: 'admin' })
      assertObjectContains(user, { email: 'john@example.com' })
    })

    it('throws for mismatched value', () => {
      expect(() => assertObjectContains(user, { name: 'Jane' }))
        .toThrow('Object differs at key "name"')
    })
  })
})
