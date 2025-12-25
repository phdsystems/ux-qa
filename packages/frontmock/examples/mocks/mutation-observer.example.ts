/**
 * MockMutationObserver Example
 *
 * Demonstrates mocking MutationObserver for DOM change testing
 * Follows SEA Pattern: Setup → Exercise → Assert
 * Run with: npx vitest run examples/mocks/mutation-observer.example.ts
 */

import { describe, it, expect, vi } from 'vitest'
import { setupMockMutationObserver, MutationHelpers } from '../../core/components/mocks/MockMutationObserver'

// Make vi available globally for the mock
;(globalThis as any).vi = vi
;(globalThis as any).jest = { fn: vi.fn }

describe('MockMutationObserver Examples', () => {
  describe('1. Attribute change', () => {
    it('observes and triggers attribute mutations', () => {
      // Setup
      const { mockObserve, triggerMutation, cleanup } = setupMockMutationObserver()
      const mutations: string[] = []
      const target = { id: 'my-element' } as unknown as Element
      const observer = new MutationObserver((mutationList) => {
        mutationList.forEach(mutation => {
          mutations.push(`${mutation.type}: ${mutation.attributeName}`)
        })
      })

      // Exercise
      observer.observe(target, { attributes: true })
      triggerMutation(MutationHelpers.attributeChange(target, 'class', 'old-class'))
      triggerMutation(MutationHelpers.attributeChange(target, 'data-value', '10'))

      // Assert
      expect(mockObserve).toHaveBeenCalledTimes(1)
      expect(mutations).toHaveLength(2)

      cleanup()
    })
  })

  describe('2. Child list changes', () => {
    it('observes child additions and removals', () => {
      // Setup
      const { triggerMutation, cleanup } = setupMockMutationObserver()
      const parent = { id: 'container' } as unknown as Element
      const mutations: string[] = []
      const observer = new MutationObserver((mutationList) => {
        mutationList.forEach(mutation => {
          if (mutation.type === 'childList') {
            mutations.push(`added: ${mutation.addedNodes.length}, removed: ${mutation.removedNodes.length}`)
          }
        })
      })
      observer.observe(parent, { childList: true })

      // Exercise
      triggerMutation({
        type: 'childList',
        target: parent,
        addedNodes: { length: 2 } as NodeList,
        removedNodes: { length: 0 } as NodeList,
      })
      triggerMutation({
        type: 'childList',
        target: parent,
        addedNodes: { length: 0 } as NodeList,
        removedNodes: { length: 1 } as NodeList,
      })

      // Assert
      expect(mutations).toEqual(['added: 2, removed: 0', 'added: 0, removed: 1'])

      cleanup()
    })
  })

  describe('3. Multiple mutations at once', () => {
    it('handles batch mutations', () => {
      // Setup
      const { triggerMutations, cleanup } = setupMockMutationObserver()
      const target = { id: 'dynamic-element' } as unknown as Element
      let batchCount = 0
      const observer = new MutationObserver((mutationList) => {
        batchCount++
      })
      observer.observe(target, { attributes: true, characterData: true })

      // Exercise
      triggerMutations([
        { type: 'attributes', target, attributeName: 'class' },
        { type: 'attributes', target, attributeName: 'style' },
        { type: 'attributes', target, attributeName: 'data-state' },
        { type: 'characterData', target, oldValue: 'old text' },
      ])

      // Assert
      expect(batchCount).toBe(1)

      cleanup()
    })
  })

  describe('4. Track observed targets', () => {
    it('returns list of observed targets', () => {
      // Setup
      const { getObservedTargets, cleanup } = setupMockMutationObserver()
      const el1 = { id: 'element-1' } as unknown as Element
      const el2 = { id: 'element-2' } as unknown as Element
      const el3 = { id: 'element-3' } as unknown as Element
      const observer = new MutationObserver(() => {})

      // Exercise
      observer.observe(el1, { attributes: true })
      observer.observe(el2, { childList: true })
      observer.observe(el3, { characterData: true })

      // Assert
      const targets = getObservedTargets()
      expect(targets).toHaveLength(3)

      cleanup()
    })
  })

  describe('5. Disconnect observer', () => {
    it('clears observed targets on disconnect', () => {
      // Setup
      const { mockDisconnect, getObservedTargets, cleanup } = setupMockMutationObserver()
      const target = { id: 'watched' } as unknown as Element
      const observer = new MutationObserver(() => {})
      observer.observe(target, { attributes: true })

      // Assert before
      expect(getObservedTargets()).toHaveLength(1)

      // Exercise
      observer.disconnect()

      // Assert after
      expect(getObservedTargets()).toHaveLength(0)
      expect(mockDisconnect).toHaveBeenCalledTimes(1)

      cleanup()
    })
  })

  describe('6. Mutation helpers', () => {
    it('provides convenient helper functions', () => {
      // Setup
      const { triggerMutation, cleanup } = setupMockMutationObserver()
      const target = { id: 'test' } as unknown as Element
      const mutations: MutationRecord[] = []
      const observer = new MutationObserver((list) => {
        mutations.push(...list)
      })
      observer.observe(target, { attributes: true, characterData: true })

      // Exercise
      triggerMutation(MutationHelpers.classChange(target, 'btn btn-primary'))
      triggerMutation(MutationHelpers.textChange(target, 'Previous content'))
      triggerMutation(MutationHelpers.attributeChange(target, 'aria-label', 'old label'))

      // Assert
      expect(mutations).toHaveLength(3)
      expect(mutations[0].attributeName).toBe('class')
      expect(mutations[1].type).toBe('characterData')
      expect(mutations[2].attributeName).toBe('aria-label')

      cleanup()
    })
  })
})
