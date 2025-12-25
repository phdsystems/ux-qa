/**
 * MockNetworkInformation Example
 *
 * Demonstrates mocking Network Information API for connectivity testing
 * Follows SEA Pattern: Setup → Exercise → Assert
 * Run with: npx vitest run examples/mocks/network-information.example.ts
 */

import { describe, it, expect, vi } from 'vitest'
import { setupMockNetworkInformation, ConnectionPresets } from '../../core/components/mocks/MockNetworkInformation'

// Make vi available globally for the mock
;(globalThis as any).vi = vi
;(globalThis as any).jest = { fn: vi.fn }

describe('MockNetworkInformation Examples', () => {
  describe('1. Check online status', () => {
    it('controls navigator.onLine', () => {
      // Setup
      const { setOnline, cleanup } = setupMockNetworkInformation()

      // Exercise & Assert
      setOnline(false)
      expect(navigator.onLine).toBe(false)

      setOnline(true)
      expect(navigator.onLine).toBe(true)

      cleanup()
    })
  })

  describe('2. Connection type', () => {
    it('changes effective connection type', () => {
      // Setup
      const { setConnectionType, cleanup } = setupMockNetworkInformation()
      const connection = (navigator as any).connection

      // Exercise & Assert
      setConnectionType('slow-2g')
      expect(connection?.effectiveType).toBe('slow-2g')

      setConnectionType('4g')
      expect(connection?.effectiveType).toBe('4g')

      cleanup()
    })
  })

  describe('3. Online/offline events', () => {
    it('fires online and offline events', () => {
      // Setup
      const { setOnline, cleanup } = setupMockNetworkInformation()
      const events: string[] = []

      const onlineHandler = () => events.push('online')
      const offlineHandler = () => events.push('offline')
      window.addEventListener('online', onlineHandler)
      window.addEventListener('offline', offlineHandler)

      // Exercise
      setOnline(false)
      setOnline(true)
      setOnline(false)

      // Assert
      expect(events).toEqual(['offline', 'online', 'offline'])

      // Cleanup
      window.removeEventListener('online', onlineHandler)
      window.removeEventListener('offline', offlineHandler)
      cleanup()
    })
  })

  describe('4. Custom connection speed', () => {
    it('sets custom downlink and RTT', () => {
      // Setup
      const { setConnectionSpeed, cleanup } = setupMockNetworkInformation()
      const connection = (navigator as any).connection

      // Exercise - Simulate fiber
      setConnectionSpeed(100, 10)

      // Assert
      expect(connection?.downlink).toBe(100)
      expect(connection?.rtt).toBe(10)

      // Exercise - Simulate satellite
      setConnectionSpeed(25, 600)

      // Assert
      expect(connection?.downlink).toBe(25)
      expect(connection?.rtt).toBe(600)

      cleanup()
    })
  })

  describe('5. Save data mode', () => {
    it('toggles save data preference', () => {
      // Setup
      const { setSaveData, cleanup } = setupMockNetworkInformation()
      const connection = (navigator as any).connection

      // Exercise & Assert
      setSaveData(true)
      expect(connection?.saveData).toBe(true)

      setSaveData(false)
      expect(connection?.saveData).toBe(false)

      cleanup()
    })
  })

  describe('6. Connection presets', () => {
    it('provides common connection presets', () => {
      // Assert
      expect(ConnectionPresets).toHaveProperty('slow2g')
      expect(ConnectionPresets).toHaveProperty('2g')
      expect(ConnectionPresets).toHaveProperty('3g')
      expect(ConnectionPresets).toHaveProperty('4g')
    })
  })
})
