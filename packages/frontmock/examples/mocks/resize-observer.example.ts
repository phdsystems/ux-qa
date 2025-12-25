/**
 * MockResizeObserver Example
 *
 * Demonstrates mocking ResizeObserver for responsive component tests
 * Run with: npx vitest run examples/mocks/resize-observer.example.ts
 */

import { describe, it, expect, vi } from 'vitest'
import { setupMockResizeObserver, viewportSizes } from '../../core/components/mocks/MockResizeObserver'

// Make vi available globally for the mock
;(globalThis as any).vi = vi

describe('MockResizeObserver Examples', () => {
  describe('1. Basic ResizeObserver mock', () => {
    it('tracks observe and unobserve calls', () => {
      const { mockObserve, mockUnobserve, cleanup } = setupMockResizeObserver()

      const element = document.createElement('div')

      const observer = new ResizeObserver(() => {})

      observer.observe(element)
      expect(mockObserve).toHaveBeenCalledTimes(1)

      observer.unobserve(element)
      expect(mockUnobserve).toHaveBeenCalledTimes(1)

      cleanup()
    })
  })

  describe('2. Trigger resize', () => {
    it('simulates resize events', () => {
      const { triggerResize, cleanup } = setupMockResizeObserver()

      const element = document.createElement('div')
      let lastSize = { width: 0, height: 0 }

      const observer = new ResizeObserver((entries) => {
        entries.forEach(entry => {
          lastSize = {
            width: entry.contentRect.width,
            height: entry.contentRect.height
          }
        })
      })

      observer.observe(element)

      triggerResize(element, { width: 800, height: 600 })
      expect(lastSize).toEqual({ width: 800, height: 600 })

      triggerResize(element, { width: 1024, height: 768 })
      expect(lastSize).toEqual({ width: 1024, height: 768 })

      cleanup()
    })
  })

  describe('3. Multiple elements', () => {
    it('handles multiple observed elements', () => {
      const { triggerResize, cleanup } = setupMockResizeObserver()

      const sidebar = document.createElement('div')
      const content = document.createElement('div')

      const sizes: Record<string, { width: number; height: number }> = {}

      const observer = new ResizeObserver((entries) => {
        entries.forEach(entry => {
          sizes[entry.target.id] = {
            width: entry.contentRect.width,
            height: entry.contentRect.height
          }
        })
      })

      sidebar.id = 'sidebar'
      content.id = 'content'

      observer.observe(sidebar)
      observer.observe(content)

      triggerResize(sidebar, { width: 250, height: 800 })
      triggerResize(content, { width: 1000, height: 800 })

      expect(sizes.sidebar).toEqual({ width: 250, height: 800 })
      expect(sizes.content).toEqual({ width: 1000, height: 800 })

      cleanup()
    })
  })

  describe('4. Viewport size presets', () => {
    it('provides common viewport sizes', () => {
      expect(viewportSizes.mobile).toEqual({ width: 375, height: 667 })
      expect(viewportSizes.tablet).toEqual({ width: 768, height: 1024 })
      expect(viewportSizes.desktop).toEqual({ width: 1920, height: 1080 })
    })
  })
})
