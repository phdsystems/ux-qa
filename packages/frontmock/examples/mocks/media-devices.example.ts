/**
 * MockMediaDevices Example
 *
 * Demonstrates mocking MediaDevices API for camera/microphone testing
 * Follows SEA Pattern: Setup → Exercise → Assert
 * Run with: npx vitest run examples/mocks/media-devices.example.ts
 */

import { describe, it, expect, vi } from 'vitest'
import { setupMockMediaDevices, MediaConstraintPresets } from '../../core/components/mocks/MockMediaDevices'

// Make vi available globally for the mock
;(globalThis as any).vi = vi
;(globalThis as any).jest = { fn: vi.fn }

describe('MockMediaDevices Examples', () => {
  describe('1. Get user media', () => {
    it('returns mock stream with tracks', async () => {
      // Setup
      const { mockGetUserMedia, cleanup } = setupMockMediaDevices()

      // Exercise
      const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })

      // Assert
      expect(stream.id).toBeDefined()
      expect(stream.getVideoTracks().length).toBeGreaterThanOrEqual(1)
      expect(stream.getAudioTracks().length).toBeGreaterThanOrEqual(1)
      expect(mockGetUserMedia).toHaveBeenCalledTimes(1)

      cleanup()
    })
  })

  describe('2. Enumerate devices', () => {
    it('returns list of mock devices', async () => {
      // Setup
      const { mockEnumerateDevices, cleanup } = setupMockMediaDevices()

      // Exercise
      const devices = await navigator.mediaDevices.enumerateDevices()

      // Assert
      expect(devices.length).toBeGreaterThan(0)
      expect(devices.some(d => d.kind === 'videoinput')).toBe(true)
      expect(devices.some(d => d.kind === 'audioinput')).toBe(true)
      expect(mockEnumerateDevices).toHaveBeenCalled()

      cleanup()
    })
  })

  describe('3. Screen sharing', () => {
    it('returns mock screen share stream', async () => {
      // Setup
      const { mockGetDisplayMedia, cleanup } = setupMockMediaDevices()

      // Exercise
      const stream = await navigator.mediaDevices.getDisplayMedia({ video: true })

      // Assert
      expect(stream.id).toBeDefined()
      expect(stream.getVideoTracks().length).toBeGreaterThanOrEqual(1)
      expect(mockGetDisplayMedia).toHaveBeenCalledTimes(1)

      cleanup()
    })
  })

  describe('4. Custom mock stream', () => {
    it('creates streams with specific tracks', () => {
      // Setup
      const { createMockStream, cleanup } = setupMockMediaDevices()

      // Exercise
      const videoOnlyStream = createMockStream(false, true)
      const audioOnlyStream = createMockStream(true, false)
      const fullStream = createMockStream(true, true)

      // Assert
      expect(videoOnlyStream.getVideoTracks().length).toBe(1)
      expect(videoOnlyStream.getAudioTracks().length).toBe(0)

      expect(audioOnlyStream.getVideoTracks().length).toBe(0)
      expect(audioOnlyStream.getAudioTracks().length).toBe(1)

      expect(fullStream.getVideoTracks().length).toBe(1)
      expect(fullStream.getAudioTracks().length).toBe(1)

      cleanup()
    })
  })

  describe('5. Stream track control', () => {
    it('controls track enabled state', () => {
      // Setup
      const { createMockStream, cleanup } = setupMockMediaDevices()
      const stream = createMockStream(true, true)

      // Assert initial state
      expect(stream.active).toBe(true)

      // Exercise - disable video
      const videoTrack = stream.getVideoTracks()[0]
      videoTrack.enabled = false

      // Assert - enabled state changed
      expect(videoTrack.enabled).toBe(false)

      // Exercise - re-enable
      videoTrack.enabled = true
      expect(videoTrack.enabled).toBe(true)

      cleanup()
    })
  })

  describe('6. Device change events', () => {
    it('fires devicechange events', () => {
      // Setup
      const { triggerDeviceChange, cleanup } = setupMockMediaDevices()
      let eventCount = 0
      const handler = () => eventCount++
      navigator.mediaDevices.addEventListener('devicechange', handler)

      // Exercise
      triggerDeviceChange()
      triggerDeviceChange()

      // Assert
      expect(eventCount).toBe(2)

      // Cleanup
      navigator.mediaDevices.removeEventListener('devicechange', handler)
      cleanup()
    })
  })

  describe('7. Constraint presets', () => {
    it('provides media constraint presets', async () => {
      // Setup
      const { mockGetUserMedia, cleanup } = setupMockMediaDevices()

      // Assert - presets exist
      expect(MediaConstraintPresets.hd).toBeDefined()

      // Exercise
      await navigator.mediaDevices.getUserMedia(MediaConstraintPresets.hd)

      // Assert
      expect(mockGetUserMedia).toHaveBeenCalledWith(MediaConstraintPresets.hd)

      cleanup()
    })
  })
})
