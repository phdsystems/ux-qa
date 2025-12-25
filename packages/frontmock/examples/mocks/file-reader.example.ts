/**
 * MockFileReader Example
 *
 * Demonstrates mocking FileReader API for file upload testing
 * Follows SEA Pattern: Setup → Exercise → Assert
 * Run with: npx vitest run examples/mocks/file-reader.example.ts
 */

import { describe, it, expect, vi } from 'vitest'
import { setupMockFileReader, createMockFile, mockFileTypes } from '../../core/components/mocks/MockFileReader'

// Make vi available globally for the mock
;(globalThis as any).vi = vi
;(globalThis as any).jest = { fn: vi.fn }

describe('MockFileReader Examples', () => {
  describe('1. Basic file reading', () => {
    it('reads file as data URL', () => {
      // Setup
      const { triggerLoad, cleanup } = setupMockFileReader()
      const file = createMockFile('test.txt', mockFileTypes.document.txt, 1024, 'Hello, World!')

      let loadCalled = false
      const reader = new FileReader()
      reader.onload = () => {
        loadCalled = true
      }

      // Exercise
      reader.readAsDataURL(file)
      triggerLoad(file, 'data:text/plain;base64,SGVsbG8sIFdvcmxkIQ==')

      // Assert
      expect(loadCalled).toBe(true)
      expect(reader.result).toContain('data:text/plain')

      cleanup()
    })
  })

  describe('2. Read as text', () => {
    it('reads file as text content', () => {
      // Setup
      const { triggerLoad, cleanup } = setupMockFileReader()
      const file = createMockFile('data.json', 'application/json', 256, '{"name": "test"}')

      let loadCalled = false
      const reader = new FileReader()
      reader.onload = () => {
        loadCalled = true
      }

      // Exercise
      reader.readAsText(file, 'UTF-8')
      triggerLoad(file, '{"name": "test"}')

      // Assert
      expect(loadCalled).toBe(true)
      expect(reader.result).toBe('{"name": "test"}')

      cleanup()
    })
  })

  describe('3. Track progress', () => {
    it('fires progress events', () => {
      // Setup
      const { triggerProgress, triggerLoad, cleanup } = setupMockFileReader()
      const file = createMockFile('large.bin', 'application/octet-stream', 10000)

      const progressEvents: number[] = []
      const reader = new FileReader()
      reader.onprogress = (e) => {
        progressEvents.push(Math.round((e.loaded / e.total) * 100))
      }

      // Exercise
      reader.readAsArrayBuffer(file)
      triggerProgress(2500, 10000)
      triggerProgress(5000, 10000)
      triggerProgress(7500, 10000)
      triggerLoad(file, new ArrayBuffer(10000))

      // Assert
      expect(progressEvents).toEqual([25, 50, 75])

      cleanup()
    })
  })

  describe('4. Handle errors', () => {
    it('triggers error callback', () => {
      // Setup
      const { triggerError, cleanup } = setupMockFileReader()
      const file = createMockFile('corrupted.bin', 'application/octet-stream', 100)

      let errorMessage = ''
      const reader = new FileReader()
      reader.onerror = () => {
        errorMessage = reader.error?.message || 'Unknown error'
      }

      // Exercise
      reader.readAsArrayBuffer(file)
      triggerError(new Error('File corrupted'))

      // Assert
      expect(errorMessage).toBe('File corrupted')

      cleanup()
    })
  })

  describe('5. Create various file types', () => {
    it('creates files with correct MIME types', () => {
      // Setup
      const { cleanup } = setupMockFileReader()

      // Exercise
      const imageFile = createMockFile('photo.png', mockFileTypes.image.png, 50000)
      const pdfFile = createMockFile('document.pdf', mockFileTypes.document.pdf, 100000)
      const videoFile = createMockFile('video.mp4', mockFileTypes.video.mp4, 5000000)
      const audioFile = createMockFile('song.mp3', mockFileTypes.audio.mp3, 3000000)

      // Assert
      expect(imageFile.type).toBe('image/png')
      expect(pdfFile.type).toBe('application/pdf')
      expect(videoFile.type).toBe('video/mp4')
      expect(audioFile.type).toBe('audio/mpeg')

      cleanup()
    })
  })
})
