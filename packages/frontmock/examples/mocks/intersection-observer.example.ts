/**
 * MockIntersectionObserver Example
 *
 * Demonstrates mocking IntersectionObserver for lazy loading tests
 * Follows SEA Pattern: Setup → Exercise → Assert
 * Run with: npx vitest run examples/mocks/intersection-observer.example.ts
 */

import { describe, it, expect, vi } from 'vitest'
import { setupMockIntersectionObserver } from '../../core/components/mocks/MockIntersectionObserver'

// Make vi available globally for the mock
;(globalThis as any).vi = vi
;(globalThis as any).jest = { fn: vi.fn }

describe('MockIntersectionObserver Examples', () => {
  describe('1. Basic IntersectionObserver mock', () => {
    it('tracks observe and disconnect calls', () => {
      // Setup
      const { mockObserve, mockDisconnect, cleanup } = setupMockIntersectionObserver()
      const element = document.createElement('div')
      const observer = new IntersectionObserver(() => {})

      // Exercise
      observer.observe(element)

      // Assert
      expect(mockObserve).toHaveBeenCalledTimes(1)

      // Exercise
      observer.disconnect()

      // Assert
      expect(mockDisconnect).toHaveBeenCalledTimes(1)

      cleanup()
    })
  })

  describe('2. Trigger intersection', () => {
    it('simulates element visibility', () => {
      // Setup
      const { triggerIntersection, cleanup } = setupMockIntersectionObserver()
      const element = document.createElement('div')
      let wasIntersecting = false
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          wasIntersecting = entry.isIntersecting
        })
      })
      observer.observe(element)

      // Exercise
      triggerIntersection(element, true)

      // Assert
      expect(wasIntersecting).toBe(true)

      // Exercise
      triggerIntersection(element, false)

      // Assert
      expect(wasIntersecting).toBe(false)

      cleanup()
    })
  })

  describe('3. Multiple observed elements', () => {
    it('handles multiple elements', () => {
      // Setup
      const { triggerIntersection, mockObserve, cleanup } = setupMockIntersectionObserver()
      const elements = [
        document.createElement('div'),
        document.createElement('div'),
        document.createElement('div'),
      ]
      const visible: Element[] = []
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            visible.push(entry.target)
          }
        })
      })

      // Exercise
      elements.forEach(el => observer.observe(el))

      // Assert
      expect(mockObserve).toHaveBeenCalledTimes(3)

      // Exercise
      triggerIntersection(elements[0], true)
      triggerIntersection(elements[2], true)

      // Assert
      expect(visible).toHaveLength(2)

      cleanup()
    })
  })

  describe('4. Custom intersection ratio', () => {
    it('supports intersection ratio', () => {
      // Setup
      const { triggerIntersection, cleanup } = setupMockIntersectionObserver()
      const element = document.createElement('div')
      const ratios: number[] = []
      const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
          ratios.push(entry.intersectionRatio)
        })
      }, { threshold: [0, 0.5, 1] })
      observer.observe(element)

      // Exercise
      triggerIntersection(element, true, 0.5)
      triggerIntersection(element, true, 1.0)
      triggerIntersection(element, false, 0)

      // Assert
      expect(ratios).toEqual([0.5, 1.0, 0])

      cleanup()
    })
  })
})
