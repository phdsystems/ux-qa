/**
 * MockWebSocket Example
 *
 * Demonstrates mocking WebSocket API for real-time testing
 * Run with: npx vitest run examples/mocks/websocket.example.ts
 */

import { describe, it, expect, vi } from 'vitest'
import { setupMockWebSocket, WebSocketState, WebSocketCloseCode } from '../../core/components/mocks/MockWebSocket'

// Make vi available globally for the mock
;(globalThis as any).vi = vi

describe('MockWebSocket Examples', () => {
  describe('1. Basic WebSocket connection', () => {
    it('creates and opens connection', () => {
      const { getLastInstance, triggerOpen, cleanup } = setupMockWebSocket()

      const ws = new WebSocket('ws://localhost:3000/chat')
      expect(ws.url).toBe('ws://localhost:3000/chat')
      expect(ws.readyState).toBe(WebSocketState.CONNECTING)

      triggerOpen()
      expect(getLastInstance()?.readyState).toBe(WebSocketState.OPEN)

      cleanup()
    })
  })

  describe('2. Send and receive messages', () => {
    it('handles message flow', () => {
      const { triggerOpen, triggerMessage, getSentMessages, cleanup } = setupMockWebSocket()

      const receivedMessages: any[] = []

      const ws = new WebSocket('ws://localhost:3000/api')
      ws.onmessage = (event) => {
        receivedMessages.push(event.data)
      }

      triggerOpen()

      ws.send(JSON.stringify({ type: 'ping' }))
      ws.send(JSON.stringify({ type: 'subscribe' }))

      expect(getSentMessages()).toHaveLength(2)

      triggerMessage({ type: 'pong' })
      triggerMessage({ type: 'update', data: 'New data' })

      expect(receivedMessages).toHaveLength(2)

      cleanup()
    })
  })

  describe('3. Handle connection close', () => {
    it('triggers close event', () => {
      const { triggerOpen, triggerClose, cleanup } = setupMockWebSocket()

      let closeEvent: CloseEvent | null = null

      const ws = new WebSocket('ws://localhost:3000/stream')
      ws.onclose = (event) => {
        closeEvent = event
      }

      triggerOpen()
      triggerClose(WebSocketCloseCode.NORMAL, 'Server shutdown')

      expect(closeEvent?.code).toBe(1000)
      expect(closeEvent?.reason).toBe('Server shutdown')

      cleanup()
    })
  })

  describe('4. Handle errors', () => {
    it('triggers error event', () => {
      const { triggerOpen, triggerError, cleanup } = setupMockWebSocket()

      let errorOccurred = false

      const ws = new WebSocket('ws://localhost:3000/api')
      ws.onerror = () => {
        errorOccurred = true
      }

      triggerOpen()
      triggerError(new Error('Connection lost'))

      expect(errorOccurred).toBe(true)

      cleanup()
    })
  })

  describe('5. Multiple WebSocket instances', () => {
    it('tracks multiple connections', () => {
      const { instances, cleanup } = setupMockWebSocket()

      new WebSocket('ws://localhost:3000/chat')
      new WebSocket('ws://localhost:3000/notifications')
      new WebSocket('ws://localhost:3000/stream')

      expect(instances).toHaveLength(3)
      expect(instances.map(i => i.url)).toContain('ws://localhost:3000/chat')

      cleanup()
    })
  })
})
