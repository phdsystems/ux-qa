/**
 * MockPortal Example
 *
 * Demonstrates testing portal components without DOM manipulation
 * Run with: npx vitest run examples/components/mock-portal.example.tsx
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { MockPortal } from '../../core/components/mocks/MockPortal'

describe('MockPortal Examples', () => {
  describe('1. Basic portal rendering', () => {
    it('renders content inline instead of in document.body', () => {
      render(
        <div data-testid="parent">
          <MockPortal>
            <div data-testid="portal-content">Modal Content</div>
          </MockPortal>
        </div>
      )

      // Content is rendered inline, not in document.body
      const parent = screen.getByTestId('parent')
      const content = screen.getByTestId('portal-content')

      expect(parent).toContainElement(screen.getByTestId('mock-portal'))
      expect(content).toHaveTextContent('Modal Content')
    })
  })

  describe('2. Custom container ID', () => {
    it('tracks container ID in data attribute', () => {
      render(
        <MockPortal containerId="modal-root">
          <div>Content</div>
        </MockPortal>
      )

      const portal = screen.getByTestId('mock-portal')
      expect(portal).toHaveAttribute('data-container-id', 'modal-root')
    })
  })

  describe('3. Modal testing', () => {
    it('makes modal content easily testable', () => {
      const Modal = ({ isOpen, children }: { isOpen: boolean; children: React.ReactNode }) => {
        if (!isOpen) return null
        return (
          <MockPortal>
            <div role="dialog" aria-modal="true">
              {children}
            </div>
          </MockPortal>
        )
      }

      render(
        <Modal isOpen={true}>
          <h2>Confirm Action</h2>
          <button>Cancel</button>
          <button>Confirm</button>
        </Modal>
      )

      expect(screen.getByRole('dialog')).toBeInTheDocument()
      expect(screen.getByText('Confirm Action')).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Cancel' })).toBeInTheDocument()
      expect(screen.getByRole('button', { name: 'Confirm' })).toBeInTheDocument()
    })
  })

  describe('4. Dropdown testing', () => {
    it('tests dropdown menu without portal complexity', () => {
      const Dropdown = ({ items }: { items: string[] }) => (
        <MockPortal containerId="dropdown-root">
          <ul role="listbox">
            {items.map((item, i) => (
              <li key={i} role="option">{item}</li>
            ))}
          </ul>
        </MockPortal>
      )

      render(<Dropdown items={['Option 1', 'Option 2', 'Option 3']} />)

      expect(screen.getByRole('listbox')).toBeInTheDocument()
      expect(screen.getAllByRole('option')).toHaveLength(3)
    })
  })

  describe('5. Tooltip testing', () => {
    it('tests tooltip content', () => {
      const Tooltip = ({ text }: { text: string }) => (
        <MockPortal containerId="tooltip-root">
          <div role="tooltip">{text}</div>
        </MockPortal>
      )

      render(<Tooltip text="This is helpful information" />)

      expect(screen.getByRole('tooltip')).toHaveTextContent('This is helpful information')
    })
  })

  describe('6. Nested portals', () => {
    it('handles nested portal content', () => {
      render(
        <MockPortal containerId="outer">
          <div data-testid="outer-content">
            Outer
            <MockPortal containerId="inner">
              <div data-testid="inner-content">Inner</div>
            </MockPortal>
          </div>
        </MockPortal>
      )

      expect(screen.getByTestId('outer-content')).toBeInTheDocument()
      expect(screen.getByTestId('inner-content')).toBeInTheDocument()
    })
  })
})
