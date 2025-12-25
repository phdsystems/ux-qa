/**
 * MockNetworkInformation - Mock Network Information API and online/offline events
 *
 * Allows testing offline functionality and connection quality
 */

export interface NetworkInformation extends EventTarget {
  downlink?: number
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g'
  rtt?: number
  saveData?: boolean
  type?: 'bluetooth' | 'cellular' | 'ethernet' | 'none' | 'wifi' | 'wimax' | 'other' | 'unknown'
  onchange?: ((this: NetworkInformation, ev: Event) => any) | null
}

export interface MockNetworkInformationReturn {
  setOnline: (online: boolean) => void
  setConnectionType: (type: NetworkInformation['effectiveType']) => void
  setConnectionSpeed: (downlink: number, rtt: number) => void
  setSaveData: (enabled: boolean) => void
  triggerOnline: () => void
  triggerOffline: () => void
  triggerConnectionChange: () => void
  cleanup: () => void
}

/**
 * Sets up mock for Network Information API and online/offline events
 *
 * @example
 * ```typescript
 * import { setupMockNetworkInformation } from '@ux.qa/frontmock'
 *
 * const { setOnline, setConnectionType, cleanup } = setupMockNetworkInformation()
 *
 * render(<OfflineIndicator />)
 *
 * // Simulate going offline
 * setOnline(false)
 *
 * expect(screen.getByText(/offline/i)).toBeInTheDocument()
 *
 * // Simulate slow connection
 * setOnline(true)
 * setConnectionType('slow-2g')
 *
 * expect(screen.getByText(/slow connection/i)).toBeInTheDocument()
 *
 * cleanup()
 * ```
 */
export function setupMockNetworkInformation(): MockNetworkInformationReturn {
  let isOnline = true
  let connectionInfo: NetworkInformation = {
    downlink: 10,
    effectiveType: '4g',
    rtt: 50,
    saveData: false,
    type: 'wifi',
    onchange: null,
    addEventListener: () => {},
    removeEventListener: () => {},
    dispatchEvent: () => true,
  }

  const onlineListeners: ((event: Event) => void)[] = []
  const offlineListeners: ((event: Event) => void)[] = []
  const connectionChangeListeners: ((event: Event) => void)[] = []

  // Mock navigator.onLine
  Object.defineProperty(navigator, 'onLine', {
    get: () => isOnline,
    configurable: true,
  })

  // Mock navigator.connection
  Object.defineProperty(navigator, 'connection', {
    get: () => connectionInfo,
    configurable: true,
  })

  // Store original event listeners
  const originalAddEventListener = window.addEventListener
  const originalRemoveEventListener = window.removeEventListener

  // Override addEventListener to capture online/offline listeners
  window.addEventListener = function (
    type: string,
    listener: EventListenerOrEventListenerObject,
    options?: boolean | AddEventListenerOptions
  ) {
    if (type === 'online' && typeof listener === 'function') {
      onlineListeners.push(listener)
    } else if (type === 'offline' && typeof listener === 'function') {
      offlineListeners.push(listener)
    }
    return originalAddEventListener.call(this, type, listener, options)
  } as any

  const setOnline = (online: boolean) => {
    const wasOnline = isOnline
    isOnline = online

    if (online && !wasOnline) {
      triggerOnline()
    } else if (!online && wasOnline) {
      triggerOffline()
    }
  }

  const setConnectionType = (type: NetworkInformation['effectiveType']) => {
    connectionInfo.effectiveType = type

    // Adjust downlink and rtt based on type
    switch (type) {
      case 'slow-2g':
        connectionInfo.downlink = 0.05
        connectionInfo.rtt = 2000
        break
      case '2g':
        connectionInfo.downlink = 0.25
        connectionInfo.rtt = 1400
        break
      case '3g':
        connectionInfo.downlink = 0.7
        connectionInfo.rtt = 270
        break
      case '4g':
        connectionInfo.downlink = 10
        connectionInfo.rtt = 50
        break
    }

    triggerConnectionChange()
  }

  const setConnectionSpeed = (downlink: number, rtt: number) => {
    connectionInfo.downlink = downlink
    connectionInfo.rtt = rtt
    triggerConnectionChange()
  }

  const setSaveData = (enabled: boolean) => {
    connectionInfo.saveData = enabled
    triggerConnectionChange()
  }

  const triggerOnline = () => {
    const event = new Event('online')
    onlineListeners.forEach((listener) => listener(event))
  }

  const triggerOffline = () => {
    const event = new Event('offline')
    offlineListeners.forEach((listener) => listener(event))
  }

  const triggerConnectionChange = () => {
    const event = new Event('change')
    if (connectionInfo.onchange) {
      connectionInfo.onchange.call(connectionInfo, event)
    }
    connectionChangeListeners.forEach((listener) => listener(event))
  }

  const cleanup = () => {
    // Restore original
    window.addEventListener = originalAddEventListener
    window.removeEventListener = originalRemoveEventListener
    onlineListeners.length = 0
    offlineListeners.length = 0
    connectionChangeListeners.length = 0
  }

  return {
    setOnline,
    setConnectionType,
    setConnectionSpeed,
    setSaveData,
    triggerOnline,
    triggerOffline,
    triggerConnectionChange,
    cleanup,
  }
}

/**
 * Connection type presets
 */
export const ConnectionPresets = {
  offline: { online: false },
  slow2g: { online: true, effectiveType: 'slow-2g' as const, downlink: 0.05, rtt: 2000 },
  '2g': { online: true, effectiveType: '2g' as const, downlink: 0.25, rtt: 1400 },
  '3g': { online: true, effectiveType: '3g' as const, downlink: 0.7, rtt: 270 },
  '4g': { online: true, effectiveType: '4g' as const, downlink: 10, rtt: 50 },
  wifi: { online: true, effectiveType: '4g' as const, downlink: 10, rtt: 50, type: 'wifi' as const },
} as const
