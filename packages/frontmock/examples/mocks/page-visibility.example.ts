/**
 * MockPageVisibility Example
 *
 * Demonstrates mocking Page Visibility API for tab switching tests
 * Follows SEA Pattern: Setup → Exercise → Assert
 * Run with: npx vitest run examples/mocks/page-visibility.example.ts
 */

import { describe, it, expect, vi } from 'vitest'
import { setupMockPageVisibility } from '../../core/components/mocks/MockPageVisibility'

// Make vi available globally for the mock
;(globalThis as any).vi = vi
;(globalThis as any).jest = { fn: vi.fn }

describe('MockPageVisibility Examples', () => {
  describe('1. Check visibility state', () => {
    it('controls document.hidden and visibilityState', () => {
      // Setup
      const { setVisible, getVisibilityState, cleanup } = setupMockPageVisibility()

      // Exercise & Assert - visible
      setVisible(true)
      expect(document.hidden).toBe(false)
      expect(getVisibilityState()).toBe('visible')

      // Exercise & Assert - hidden
      setVisible(false)
      expect(document.hidden).toBe(true)
      expect(getVisibilityState()).toBe('hidden')

      cleanup()
    })
  })

  describe('2. Visibility change events', () => {
    it('fires visibilitychange events', () => {
      // Setup
      const { setVisible, cleanup } = setupMockPageVisibility()
      const events: string[] = []
      const handler = () => events.push(document.visibilityState)
      document.addEventListener('visibilitychange', handler)

      // Exercise
      setVisible(false)
      setVisible(true)
      setVisible(false)

      // Assert
      expect(events).toEqual(['hidden', 'visible', 'hidden'])

      // Cleanup
      document.removeEventListener('visibilitychange', handler)
      cleanup()
    })
  })

  describe('3. Video pause simulation', () => {
    it('pauses video when tab is hidden', () => {
      // Setup
      const { setVisible, cleanup } = setupMockPageVisibility()
      let isPlaying = true
      const handler = () => {
        if (document.hidden) {
          isPlaying = false
        } else {
          isPlaying = true
        }
      }
      document.addEventListener('visibilitychange', handler)

      // Assert initial state
      expect(isPlaying).toBe(true)

      // Exercise - hide tab
      setVisible(false)
      expect(isPlaying).toBe(false)

      // Exercise - show tab
      setVisible(true)
      expect(isPlaying).toBe(true)

      // Cleanup
      document.removeEventListener('visibilitychange', handler)
      cleanup()
    })
  })

  describe('4. Direct trigger', () => {
    it('triggers visibility change event', () => {
      // Setup
      const { triggerVisibilityChange, cleanup } = setupMockPageVisibility()
      let eventCount = 0
      const handler = () => eventCount++
      document.addEventListener('visibilitychange', handler)

      // Exercise
      triggerVisibilityChange(true)
      triggerVisibilityChange(false)

      // Assert
      expect(eventCount).toBe(2)

      // Cleanup
      document.removeEventListener('visibilitychange', handler)
      cleanup()
    })
  })
})
