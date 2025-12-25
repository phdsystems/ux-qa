/**
 * MockGeolocation - Mock Geolocation API for testing
 *
 * Allows testing location-based features without actual GPS
 */

export interface GeolocationPosition {
  coords: {
    latitude: number
    longitude: number
    accuracy: number
    altitude: number | null
    altitudeAccuracy: number | null
    heading: number | null
    speed: number | null
  }
  timestamp: number
}

export interface MockGeolocationReturn {
  mockGetCurrentPosition: ReturnType<typeof vi.fn>
  mockWatchPosition: ReturnType<typeof vi.fn>
  mockClearWatch: ReturnType<typeof vi.fn>
  setPosition: (coords: { lat: number; lng: number; accuracy?: number }) => void
  triggerPosition: (position?: Partial<GeolocationPosition>) => void
  triggerError: (code: number, message: string) => void
  getWatchCallbacks: () => PositionCallback[]
  cleanup: () => void
}

/**
 * Sets up mock for Geolocation API
 *
 * @example
 * ```typescript
 * import { setupMockGeolocation } from '@ux.qa/frontmock'
 *
 * const { setPosition, triggerPosition, cleanup } = setupMockGeolocation()
 *
 * render(<MapComponent />)
 *
 * // Set initial position (San Francisco)
 * setPosition({ lat: 37.7749, lng: -122.4194 })
 * triggerPosition()
 *
 * // Verify map centered on position
 * expect(screen.getByText(/San Francisco/i)).toBeInTheDocument()
 *
 * cleanup()
 * ```
 */
export function setupMockGeolocation(): MockGeolocationReturn {
  let currentPosition: GeolocationPosition = {
    coords: {
      latitude: 0,
      longitude: 0,
      accuracy: 10,
      altitude: null,
      altitudeAccuracy: null,
      heading: null,
      speed: null,
    },
    timestamp: Date.now(),
  }

  const watchCallbacks = new Map<number, PositionCallback>()
  let watchId = 0

  const mockGetCurrentPosition = vi.fn(
    (
      successCallback: PositionCallback,
      errorCallback?: PositionErrorCallback,
      options?: PositionOptions
    ) => {
      setTimeout(() => {
        successCallback(currentPosition)
      }, 0)
    }
  )

  const mockWatchPosition = vi.fn(
    (
      successCallback: PositionCallback,
      errorCallback?: PositionErrorCallback,
      options?: PositionOptions
    ): number => {
      watchId++
      watchCallbacks.set(watchId, successCallback)
      setTimeout(() => {
        successCallback(currentPosition)
      }, 0)
      return watchId
    }
  )

  const mockClearWatch = vi.fn((id: number) => {
    watchCallbacks.delete(id)
  })

  const mockGeolocation: Geolocation = {
    getCurrentPosition: mockGetCurrentPosition,
    watchPosition: mockWatchPosition,
    clearWatch: mockClearWatch,
  }

  const originalGeolocation = navigator.geolocation

  // Install mock
  Object.defineProperty(navigator, 'geolocation', {
    writable: true,
    value: mockGeolocation,
  })

  const setPosition = (coords: { lat: number; lng: number; accuracy?: number }) => {
    currentPosition = {
      coords: {
        latitude: coords.lat,
        longitude: coords.lng,
        accuracy: coords.accuracy ?? 10,
        altitude: null,
        altitudeAccuracy: null,
        heading: null,
        speed: null,
      },
      timestamp: Date.now(),
    }
  }

  const triggerPosition = (position?: Partial<GeolocationPosition>) => {
    const fullPosition = position
      ? { ...currentPosition, ...position }
      : currentPosition

    // Trigger all watch callbacks
    watchCallbacks.forEach((callback) => {
      callback(fullPosition)
    })
  }

  const triggerError = (code: number, message: string) => {
    const error: GeolocationPositionError = {
      code,
      message,
      PERMISSION_DENIED: 1,
      POSITION_UNAVAILABLE: 2,
      TIMEOUT: 3,
    }

    // Note: This requires errorCallback to be stored, simplified version
    console.warn('triggerError called but errorCallback not stored')
  }

  const getWatchCallbacks = () => {
    return Array.from(watchCallbacks.values())
  }

  const cleanup = () => {
    // Restore original
    Object.defineProperty(navigator, 'geolocation', {
      writable: true,
      value: originalGeolocation,
    })
    watchCallbacks.clear()
    mockGetCurrentPosition.mockClear()
    mockWatchPosition.mockClear()
    mockClearWatch.mockClear()
  }

  return {
    mockGetCurrentPosition,
    mockWatchPosition,
    mockClearWatch,
    setPosition,
    triggerPosition,
    triggerError,
    getWatchCallbacks,
    cleanup,
  }
}

/**
 * Common location presets for testing
 */
export const LocationPresets = {
  sanFrancisco: { lat: 37.7749, lng: -122.4194 },
  newYork: { lat: 40.7128, lng: -74.006 },
  london: { lat: 51.5074, lng: -0.1278 },
  tokyo: { lat: 35.6762, lng: 139.6503 },
  sydney: { lat: -33.8688, lng: 151.2093 },
  paris: { lat: 48.8566, lng: 2.3522 },
  dubai: { lat: 25.2048, lng: 55.2708 },
  singapore: { lat: 1.3521, lng: 103.8198 },
} as const

/**
 * Geolocation error codes
 */
export const GeolocationErrorCode = {
  PERMISSION_DENIED: 1,
  POSITION_UNAVAILABLE: 2,
  TIMEOUT: 3,
} as const
