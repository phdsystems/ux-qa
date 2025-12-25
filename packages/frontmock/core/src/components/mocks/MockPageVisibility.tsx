/**
 * MockPageVisibility - Mock Page Visibility API for testing
 *
 * Allows testing tab switching, page visibility changes
 */

export interface MockPageVisibilityReturn {
  setVisible: (visible: boolean) => void
  triggerVisibilityChange: (hidden?: boolean) => void
  getVisibilityState: () => DocumentVisibilityState
  cleanup: () => void
}

/**
 * Sets up mock for Page Visibility API
 *
 * @example
 * ```typescript
 * import { setupMockPageVisibility } from '@ux.qa/frontmock'
 *
 * const { setVisible, triggerVisibilityChange, cleanup } = setupMockPageVisibility()
 *
 * render(<VideoPlayer />)
 *
 * // Start video
 * await user.click(screen.getByRole('button', { name: /play/i }))
 * expect(screen.getByTestId('video')).toHaveAttribute('data-playing', 'true')
 *
 * // Simulate tab hidden (should pause video)
 * setVisible(false)
 *
 * expect(screen.getByTestId('video')).toHaveAttribute('data-playing', 'false')
 *
 * // Simulate tab visible again
 * setVisible(true)
 *
 * cleanup()
 * ```
 */
export function setupMockPageVisibility(): MockPageVisibilityReturn {
  let isHidden = false
  let visibilityState: DocumentVisibilityState = 'visible'
  const listeners: ((event: Event) => void)[] = []

  // Store original properties
  const originalHidden = Object.getOwnPropertyDescriptor(Document.prototype, 'hidden')
  const originalVisibilityState = Object.getOwnPropertyDescriptor(
    Document.prototype,
    'visibilityState'
  )
  const originalAddEventListener = document.addEventListener

  // Mock document.hidden
  Object.defineProperty(document, 'hidden', {
    get: () => isHidden,
    configurable: true,
  })

  // Mock document.visibilityState
  Object.defineProperty(document, 'visibilityState', {
    get: () => visibilityState,
    configurable: true,
  })

  // Override addEventListener to capture visibilitychange listeners
  document.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    if (type === 'visibilitychange' && typeof listener === 'function') {
      listeners.push(listener)
    }
    return originalAddEventListener.call(this, type, listener, options)
  } as any

  const setVisible = (visible: boolean) => {
    isHidden = !visible
    visibilityState = visible ? 'visible' : 'hidden'
    triggerVisibilityChange(!visible)
  }

  const triggerVisibilityChange = (hidden?: boolean) => {
    if (hidden !== undefined) {
      isHidden = hidden
      visibilityState = hidden ? 'hidden' : 'visible'
    }

    const event = new Event('visibilitychange')
    listeners.forEach((listener) => listener(event))
  }

  const getVisibilityState = () => visibilityState

  const cleanup = () => {
    // Restore originals
    if (originalHidden) {
      Object.defineProperty(document, 'hidden', originalHidden)
    }
    if (originalVisibilityState) {
      Object.defineProperty(document, 'visibilityState', originalVisibilityState)
    }
    document.addEventListener = originalAddEventListener
    listeners.length = 0
  }

  return {
    setVisible,
    triggerVisibilityChange,
    getVisibilityState,
    cleanup,
  }
}
