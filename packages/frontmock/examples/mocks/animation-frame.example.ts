/**
 * MockAnimationFrame Example
 *
 * Demonstrates mocking requestAnimationFrame for animation testing
 * Follows SEA Pattern: Setup → Exercise → Assert
 * Run with: npx vitest run examples/mocks/animation-frame.example.ts
 */

import { describe, it, expect, vi } from 'vitest'
import { setupMockAnimationFrame, setupMockPerformanceNow, FrameRate } from '../../core/components/mocks/MockAnimationFrame'

// Make vi available globally for the mock
;(globalThis as any).vi = vi
;(globalThis as any).jest = { fn: vi.fn }

describe('MockAnimationFrame Examples', () => {
  describe('1. Basic animation frame', () => {
    it('triggers animation frame callbacks', () => {
      // Setup
      const { triggerNextFrame, cleanup } = setupMockAnimationFrame()
      let frameCount = 0

      function animate(timestamp: number) {
        frameCount++
        if (frameCount < 3) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)

      // Exercise
      triggerNextFrame()
      triggerNextFrame()
      triggerNextFrame()

      // Assert
      expect(frameCount).toBe(3)

      cleanup()
    })
  })

  describe('2. Trigger multiple frames', () => {
    it('advances animation by frame count', () => {
      // Setup
      const { triggerFrames, cleanup } = setupMockAnimationFrame()
      let position = 0
      const speed = 5

      function moveElement(timestamp: number) {
        position += speed
        requestAnimationFrame(moveElement)
      }
      requestAnimationFrame(moveElement)

      // Exercise
      triggerFrames(10)

      // Assert
      expect(position).toBe(50)

      cleanup()
    })
  })

  describe('3. Cancel animation', () => {
    it('removes callback on cancel', () => {
      // Setup
      const { mockCancelAnimationFrame, getScheduledCallbacks, cleanup } = setupMockAnimationFrame()

      // Exercise
      const id1 = requestAnimationFrame(() => {})
      const id2 = requestAnimationFrame(() => {})
      requestAnimationFrame(() => {})

      // Assert before cancel
      expect(getScheduledCallbacks()).toHaveLength(3)

      // Exercise - cancel middle one
      cancelAnimationFrame(id2)

      // Assert after cancel
      expect(getScheduledCallbacks()).toHaveLength(2)
      expect(mockCancelAnimationFrame).toHaveBeenCalledTimes(1)

      cleanup()
    })
  })

  describe('4. Custom frame rate', () => {
    it('respects frame rate timing', () => {
      // Setup
      const { triggerFrames, cleanup } = setupMockAnimationFrame()
      const timestamps: number[] = []

      function recordTimestamp(timestamp: number) {
        timestamps.push(timestamp)
        if (timestamps.length < 5) {
          requestAnimationFrame(recordTimestamp)
        }
      }
      requestAnimationFrame(recordTimestamp)

      // Exercise - 30 FPS = ~33ms per frame
      triggerFrames(5, FrameRate.FPS_30)

      // Assert - timestamps should be ~33ms apart
      expect(timestamps).toHaveLength(5)
      expect(timestamps[1] - timestamps[0]).toBeCloseTo(33.33, 0)

      cleanup()
    })
  })

  describe('5. Mock performance.now()', () => {
    it('controls performance timing', () => {
      // Setup
      const { setTime, advanceTime, getTime, cleanup } = setupMockPerformanceNow()

      // Exercise & Assert
      setTime(0)
      expect(getTime()).toBe(0)

      advanceTime(1000)
      expect(performance.now()).toBe(1000)

      advanceTime(500)
      expect(performance.now()).toBe(1500)

      cleanup()
    })
  })

  describe('6. Animation with precise timing', () => {
    it('tracks animation elapsed time', () => {
      // Setup
      const animFrameMock = setupMockAnimationFrame()

      let frameCount = 0

      function animate(timestamp: number) {
        frameCount++
        if (frameCount < 60) {
          requestAnimationFrame(animate)
        }
      }
      requestAnimationFrame(animate)

      // Exercise - run 60 frames
      animFrameMock.triggerFrames(60, FrameRate.FPS_60)

      // Assert - should have run 60 frames
      expect(frameCount).toBe(60)

      animFrameMock.cleanup()
    })
  })
})
