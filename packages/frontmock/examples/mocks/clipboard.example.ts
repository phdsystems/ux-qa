/**
 * MockClipboard Example
 *
 * Demonstrates mocking Clipboard API for copy/paste testing
 * Run with: npx vitest run examples/mocks/clipboard.example.ts
 */

import { describe, it, expect, vi } from 'vitest'
import { setupMockClipboard, setupMockExecCommand } from '../../core/components/mocks/MockClipboard'

// Make vi available globally for the mock
;(globalThis as any).vi = vi

describe('MockClipboard Examples', () => {
  describe('1. Basic clipboard operations', () => {
    it('writes and reads text', async () => {
      const { writeText, readText, getClipboard, cleanup } = setupMockClipboard()

      await writeText('Hello, clipboard!')
      expect(getClipboard()).toBe('Hello, clipboard!')

      const text = await readText()
      expect(text).toBe('Hello, clipboard!')

      cleanup()
    })
  })

  describe('2. Pre-set clipboard', () => {
    it('can set clipboard content directly', async () => {
      const { setClipboard, readText, cleanup } = setupMockClipboard()

      setClipboard('Pre-set content')
      const text = await readText()
      expect(text).toBe('Pre-set content')

      cleanup()
    })
  })

  describe('3. Clear clipboard', () => {
    it('clears clipboard content', async () => {
      const { writeText, clearClipboard, getClipboard, cleanup } = setupMockClipboard()

      await writeText('Content to clear')
      expect(getClipboard()).toBe('Content to clear')

      clearClipboard()
      expect(getClipboard()).toBe('')

      cleanup()
    })
  })

  describe('4. Legacy execCommand', () => {
    it('tracks execCommand calls', () => {
      const { getLastCommand, getAllCommands, cleanup } = setupMockExecCommand()

      document.execCommand('copy')
      document.execCommand('paste')
      document.execCommand('cut')

      expect(getLastCommand()?.command).toBe('cut')
      expect(getAllCommands().map(c => c.command)).toEqual(['copy', 'paste', 'cut'])

      cleanup()
    })
  })
})
