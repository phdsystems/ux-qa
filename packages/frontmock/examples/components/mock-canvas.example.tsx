/**
 * MockCanvas Example
 *
 * Demonstrates testing canvas drawing without actual rendering
 * Run with: npx vitest run examples/components/mock-canvas.example.tsx
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen } from '@testing-library/react'
import { setupMockCanvas, MockCanvas } from '../../core/components/mocks/MockCanvas'

// Make vi available globally
;(globalThis as any).vi = vi

describe('MockCanvas Examples', () => {
  describe('1. Setup mock canvas', () => {
    it('creates canvas with mock context', () => {
      const { canvas, context, cleanup } = setupMockCanvas(800, 600)

      expect(canvas.width).toBe(800)
      expect(canvas.height).toBe(600)
      expect(context).toBeDefined()
      expect(canvas.getContext('2d')).toBe(context)

      cleanup()
    })
  })

  describe('2. Track drawing operations', () => {
    it('records fillRect calls', () => {
      const { context, getOperations, cleanup } = setupMockCanvas()

      context.fillStyle = '#ff0000'
      context.fillRect(0, 0, 100, 50)
      context.fillRect(100, 0, 100, 50)

      const fillRects = getOperations('fillRect')
      expect(fillRects).toHaveLength(2)
      expect(fillRects[0].args).toEqual([0, 0, 100, 50])
      expect(fillRects[1].args).toEqual([100, 0, 100, 50])

      cleanup()
    })
  })

  describe('3. Track path operations', () => {
    it('records path drawing', () => {
      const { context, getOperations, cleanup } = setupMockCanvas()

      context.beginPath()
      context.moveTo(10, 10)
      context.lineTo(100, 10)
      context.lineTo(100, 100)
      context.closePath()
      context.stroke()

      expect(getOperations('beginPath')).toHaveLength(1)
      expect(getOperations('moveTo')).toHaveLength(1)
      expect(getOperations('lineTo')).toHaveLength(2)
      expect(getOperations('closePath')).toHaveLength(1)
      expect(getOperations('stroke')).toHaveLength(1)

      cleanup()
    })
  })

  describe('4. Track text drawing', () => {
    it('records text operations', () => {
      const { context, getOperations, cleanup } = setupMockCanvas()

      context.font = '16px Arial'
      context.fillText('Hello', 50, 50)
      context.strokeText('World', 50, 80)

      const textOps = getOperations('fillText')
      expect(textOps).toHaveLength(1)
      expect(textOps[0].args).toEqual(['Hello', 50, 50])

      expect(getOperations('strokeText')[0].args).toEqual(['World', 50, 80])

      cleanup()
    })
  })

  describe('5. Track image drawing', () => {
    it('records drawImage calls', () => {
      const { context, getOperations, cleanup } = setupMockCanvas()

      const mockImage = { width: 100, height: 100 }
      context.drawImage(mockImage as any, 0, 0)
      context.drawImage(mockImage as any, 10, 10, 50, 50)

      const drawImageOps = getOperations('drawImage')
      expect(drawImageOps).toHaveLength(2)

      cleanup()
    })
  })

  describe('6. Track transformations', () => {
    it('records transform operations', () => {
      const { context, getOperations, cleanup } = setupMockCanvas()

      context.save()
      context.translate(100, 100)
      context.rotate(Math.PI / 4)
      context.scale(2, 2)
      context.restore()

      expect(getOperations('save')).toHaveLength(1)
      expect(getOperations('translate')[0].args).toEqual([100, 100])
      expect(getOperations('rotate')).toHaveLength(1)
      expect(getOperations('scale')[0].args).toEqual([2, 2])
      expect(getOperations('restore')).toHaveLength(1)

      cleanup()
    })
  })

  describe('7. Gradients and patterns', () => {
    it('creates gradient objects', () => {
      const { context, getOperations, cleanup } = setupMockCanvas()

      const gradient = context.createLinearGradient(0, 0, 100, 0)
      gradient.addColorStop(0, 'red')
      gradient.addColorStop(1, 'blue')

      expect(getOperations('createLinearGradient')).toHaveLength(1)
      expect(gradient).toBeDefined()

      cleanup()
    })
  })

  describe('8. Clear operations', () => {
    it('clears recorded operations', () => {
      const { context, getOperations, clearOperations, cleanup } = setupMockCanvas()

      context.fillRect(0, 0, 100, 100)
      context.strokeRect(10, 10, 50, 50)

      expect(getOperations()).toHaveLength(2)

      clearOperations()
      expect(getOperations()).toHaveLength(0)

      cleanup()
    })
  })

  describe('9. toDataURL mock', () => {
    it('returns mock data URL', () => {
      const { canvas, getOperations, cleanup } = setupMockCanvas()

      const dataUrl = canvas.toDataURL('image/png')

      expect(dataUrl).toMatch(/^data:image\/png;base64,/)
      expect(getOperations('toDataURL')).toHaveLength(1)

      cleanup()
    })
  })

  describe('10. React component', () => {
    it('renders MockCanvas component', () => {
      render(<MockCanvas width={400} height={300} />)

      const canvas = screen.getByTestId('mock-canvas')
      expect(canvas).toBeInTheDocument()
      expect(canvas).toHaveStyle({ width: '400px', height: '300px' })
    })
  })
})
