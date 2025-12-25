/**
 * Wait Utilities Example
 *
 * Demonstrates async waiting utilities
 * Run with: npx vitest run examples/utilities/wait.example.ts
 */

import { describe, it, expect } from 'vitest'
import {
  wait,
  waitForNextTick,
  waitForAnimationFrame,
  retry,
  poll
} from '../../core/utilities/wait'

describe('Wait Utilities Examples', () => {
  describe('1. Basic wait', () => {
    it('waits for specified duration', async () => {
      const start = Date.now()
      await wait(50)
      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(45)
    })
  })

  describe('2. Wait for next tick', () => {
    it('waits for next tick', async () => {
      let executed = false
      await waitForNextTick()
      executed = true
      expect(executed).toBe(true)
    })
  })

  describe('3. Wait for animation frame', () => {
    it('waits for animation frame', async () => {
      const start = Date.now()
      await waitForAnimationFrame()
      const elapsed = Date.now() - start
      expect(elapsed).toBeGreaterThanOrEqual(0)
    })
  })

  describe('4. Retry utility', () => {
    it('retries until success', async () => {
      let attempts = 0

      const flakyFunction = async () => {
        attempts++
        if (attempts < 3) {
          throw new Error(`Attempt ${attempts} failed`)
        }
        return 'success'
      }

      const result = await retry(flakyFunction, {
        retries: 5,
        delay: 10
      })

      expect(result).toBe('success')
      expect(attempts).toBe(3)
    })

    it('calls onRetry callback', async () => {
      let retryCount = 0

      const alwaysFailsTwice = async () => {
        retryCount++
        if (retryCount < 3) throw new Error('fail')
        return 'ok'
      }

      await retry(alwaysFailsTwice, {
        retries: 5,
        delay: 5,
        onRetry: (error, attempt) => {
          expect(error.message).toBe('fail')
          expect(attempt).toBe(retryCount)
        }
      })
    })

    it('throws after exhausting retries', async () => {
      const alwaysFails = async () => {
        throw new Error('Always fails')
      }

      await expect(retry(alwaysFails, { retries: 3, delay: 5 }))
        .rejects.toThrow('Failed after 3 retries')
    })
  })

  describe('5. Poll utility', () => {
    it('polls until condition is true', async () => {
      let counter = 0
      const interval = setInterval(() => counter++, 10)

      await poll(
        () => counter >= 3,
        { timeout: 1000, interval: 5 }
      )

      clearInterval(interval)
      expect(counter).toBeGreaterThanOrEqual(3)
    })

    it('throws on timeout', async () => {
      await expect(
        poll(() => false, { timeout: 50, interval: 10 })
      ).rejects.toThrow('Polling timed out')
    })

    it('calls onTimeout callback', async () => {
      let timeoutCalled = false

      try {
        await poll(() => false, {
          timeout: 30,
          interval: 10,
          onTimeout: () => {
            timeoutCalled = true
          }
        })
      } catch {
        // Expected
      }

      expect(timeoutCalled).toBe(true)
    })

    it('works with async conditions', async () => {
      let dataReady = false

      setTimeout(() => {
        dataReady = true
      }, 20)

      await poll(
        async () => dataReady,
        { timeout: 500, interval: 5 }
      )

      expect(dataReady).toBe(true)
    })
  })
})
