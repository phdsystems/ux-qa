/**
 * MockMutationObserver - Mock MutationObserver API for testing
 *
 * Allows testing components that watch DOM changes
 */

export interface MockMutationRecord {
  type: 'attributes' | 'characterData' | 'childList'
  target: Element
  addedNodes?: NodeList
  removedNodes?: NodeList
  previousSibling?: Node | null
  nextSibling?: Node | null
  attributeName?: string | null
  attributeNamespace?: string | null
  oldValue?: string | null
}

export interface MockMutationObserverReturn {
  mockObserve: ReturnType<typeof vi.fn>
  mockDisconnect: ReturnType<typeof vi.fn>
  mockTakeRecords: ReturnType<typeof vi.fn>
  triggerMutation: (record: Partial<MockMutationRecord>) => void
  triggerMutations: (records: Partial<MockMutationRecord>[]) => void
  getObservedTargets: () => Element[]
  cleanup: () => void
}

/**
 * Sets up mock for MutationObserver API
 *
 * @example
 * ```typescript
 * import { setupMockMutationObserver } from '@ux.qa/frontmock'
 *
 * const { mockObserve, triggerMutation, cleanup } = setupMockMutationObserver()
 *
 * render(<DOMWatcher />)
 *
 * const target = screen.getByTestId('watched-element')
 *
 * // Verify observer was set up
 * expect(mockObserve).toHaveBeenCalledWith(
 *   target,
 *   expect.objectContaining({ attributes: true })
 * )
 *
 * // Trigger attribute change
 * triggerMutation({
 *   type: 'attributes',
 *   target,
 *   attributeName: 'class',
 *   oldValue: 'old-class'
 * })
 *
 * // Verify component reacted to mutation
 * expect(screen.getByText(/attribute changed/i)).toBeInTheDocument()
 *
 * cleanup()
 * ```
 */
export function setupMockMutationObserver(): MockMutationObserverReturn {
  const observers = new Map<Element, MutationCallback>()
  const observedTargets = new Set<Element>()

  const mockObserve = vi.fn((target: Element, options?: MutationObserverInit) => {
    observedTargets.add(target)
  })

  const mockDisconnect = vi.fn(() => {
    observedTargets.clear()
    observers.clear()
  })

  const mockTakeRecords = vi.fn((): MutationRecord[] => {
    return []
  })

  class MockMutationObserverClass implements MutationObserver {
    private callback: MutationCallback

    constructor(callback: MutationCallback) {
      this.callback = callback
    }

    observe(target: Node, options?: MutationObserverInit) {
      mockObserve(target, options)
      observers.set(target as Element, this.callback)
      observedTargets.add(target as Element)
    }

    disconnect() {
      mockDisconnect()
      observers.clear()
      observedTargets.clear()
    }

    takeRecords(): MutationRecord[] {
      return mockTakeRecords()
    }
  }

  const originalMutationObserver = global.MutationObserver

  // Install mock
  global.MutationObserver = MockMutationObserverClass as any

  const triggerMutation = (record: Partial<MockMutationRecord>) => {
    const target = record.target
    if (!target) {
      throw new Error('Mutation record must have a target')
    }

    const callback = observers.get(target)
    if (!callback) {
      console.warn('No MutationObserver callback registered for target:', target)
      return
    }

    const fullRecord: MutationRecord = {
      type: record.type || 'attributes',
      target: target as Node,
      addedNodes: (record.addedNodes || []) as any,
      removedNodes: (record.removedNodes || []) as any,
      previousSibling: record.previousSibling || null,
      nextSibling: record.nextSibling || null,
      attributeName: record.attributeName || null,
      attributeNamespace: record.attributeNamespace || null,
      oldValue: record.oldValue || null,
    }

    callback([fullRecord], {} as MutationObserver)
  }

  const triggerMutations = (records: Partial<MockMutationRecord>[]) => {
    if (records.length === 0) return

    const target = records[0].target
    if (!target) {
      throw new Error('First mutation record must have a target')
    }

    const callback = observers.get(target)
    if (!callback) {
      console.warn('No MutationObserver callback registered for target:', target)
      return
    }

    const fullRecords: MutationRecord[] = records.map((record) => ({
      type: record.type || 'attributes',
      target: (record.target || target) as Node,
      addedNodes: (record.addedNodes || []) as any,
      removedNodes: (record.removedNodes || []) as any,
      previousSibling: record.previousSibling || null,
      nextSibling: record.nextSibling || null,
      attributeName: record.attributeName || null,
      attributeNamespace: record.attributeNamespace || null,
      oldValue: record.oldValue || null,
    }))

    callback(fullRecords, {} as MutationObserver)
  }

  const getObservedTargets = () => {
    return Array.from(observedTargets)
  }

  const cleanup = () => {
    // Restore original
    global.MutationObserver = originalMutationObserver
    observers.clear()
    observedTargets.clear()
    mockObserve.mockClear()
    mockDisconnect.mockClear()
    mockTakeRecords.mockClear()
  }

  return {
    mockObserve,
    mockDisconnect,
    mockTakeRecords,
    triggerMutation,
    triggerMutations,
    getObservedTargets,
    cleanup,
  }
}

/**
 * Helper to create common mutation types
 */
export const MutationHelpers = {
  attributeChange: (
    target: Element,
    attributeName: string,
    oldValue?: string
  ): Partial<MockMutationRecord> => ({
    type: 'attributes',
    target,
    attributeName,
    oldValue,
  }),

  classChange: (target: Element, oldValue?: string): Partial<MockMutationRecord> => ({
    type: 'attributes',
    target,
    attributeName: 'class',
    oldValue,
  }),

  childAdded: (
    target: Element,
    addedNodes: NodeList,
    nextSibling?: Node
  ): Partial<MockMutationRecord> => ({
    type: 'childList',
    target,
    addedNodes,
    nextSibling,
  }),

  childRemoved: (
    target: Element,
    removedNodes: NodeList,
    previousSibling?: Node
  ): Partial<MockMutationRecord> => ({
    type: 'childList',
    target,
    removedNodes,
    previousSibling,
  }),

  textChange: (target: Element, oldValue?: string): Partial<MockMutationRecord> => ({
    type: 'characterData',
    target,
    oldValue,
  }),
} as const
