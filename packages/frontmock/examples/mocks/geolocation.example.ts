/**
 * MockGeolocation Example
 *
 * Demonstrates mocking Geolocation API for location testing
 * Follows SEA Pattern: Setup → Exercise → Assert
 * Run with: npx vitest run examples/mocks/geolocation.example.ts
 */

import { describe, it, expect, vi } from 'vitest'
import { setupMockGeolocation, LocationPresets } from '../../core/components/mocks/MockGeolocation'

// Make vi available globally for the mock
;(globalThis as any).vi = vi
;(globalThis as any).jest = { fn: vi.fn }

describe('MockGeolocation Examples', () => {
  describe('1. Get current position', () => {
    it('returns mocked position', async () => {
      // Setup
      const { setPosition, mockGetCurrentPosition, cleanup } = setupMockGeolocation()
      setPosition(LocationPresets.sanFrancisco)

      // Exercise
      let position: GeolocationPosition | null = null
      navigator.geolocation.getCurrentPosition((pos) => {
        position = pos
      })

      await vi.waitFor(() => {
        expect(position).not.toBeNull()
      })

      // Assert
      expect(position!.coords.latitude).toBeCloseTo(37.7749, 2)
      expect(position!.coords.longitude).toBeCloseTo(-122.4194, 2)
      expect(mockGetCurrentPosition).toHaveBeenCalledTimes(1)

      cleanup()
    })
  })

  describe('2. Watch position changes', () => {
    it('receives position updates', async () => {
      // Setup
      const { setPosition, triggerPosition, mockWatchPosition, mockClearWatch, cleanup } = setupMockGeolocation()
      const positions: { lat: number; lng: number }[] = []

      // Exercise
      const watchId = navigator.geolocation.watchPosition((pos) => {
        positions.push({
          lat: pos.coords.latitude,
          lng: pos.coords.longitude
        })
      })

      await vi.waitFor(() => {
        expect(positions.length).toBeGreaterThan(0)
      })

      setPosition(LocationPresets.newYork)
      triggerPosition()

      await vi.waitFor(() => {
        expect(positions.length).toBe(2)
      })

      // Assert
      expect(mockWatchPosition).toHaveBeenCalledTimes(1)

      navigator.geolocation.clearWatch(watchId)
      expect(mockClearWatch).toHaveBeenCalledTimes(1)

      cleanup()
    })
  })

  describe('3. Location presets', () => {
    it('provides common location presets', () => {
      // Assert
      expect(LocationPresets.sanFrancisco).toBeDefined()
      expect(LocationPresets.newYork).toBeDefined()
      expect(LocationPresets.london).toBeDefined()
      expect(LocationPresets.tokyo).toBeDefined()
      expect(LocationPresets.sydney).toBeDefined()

      expect(LocationPresets.sanFrancisco.lat).toBeCloseTo(37.7749, 2)
    })
  })

  describe('4. Custom accuracy', () => {
    it('sets custom accuracy value', async () => {
      // Setup
      const { setPosition, cleanup } = setupMockGeolocation()

      // Exercise - High accuracy GPS
      setPosition({ lat: 37.7749, lng: -122.4194, accuracy: 5 })

      let accuracy: number | null = null
      navigator.geolocation.getCurrentPosition((pos) => {
        accuracy = pos.coords.accuracy
      })

      await vi.waitFor(() => {
        expect(accuracy).not.toBeNull()
      })

      // Assert
      expect(accuracy).toBe(5)

      cleanup()
    })
  })

  describe('5. Multiple watchers', () => {
    it('tracks multiple watch callbacks', async () => {
      // Setup
      const { getWatchCallbacks, cleanup } = setupMockGeolocation()

      // Exercise
      navigator.geolocation.watchPosition(() => {})
      navigator.geolocation.watchPosition(() => {})
      navigator.geolocation.watchPosition(() => {})

      await vi.waitFor(() => {
        expect(getWatchCallbacks().length).toBe(3)
      })

      // Assert
      expect(getWatchCallbacks()).toHaveLength(3)

      cleanup()
    })
  })
})
