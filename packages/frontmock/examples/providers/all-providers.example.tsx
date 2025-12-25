/**
 * AllProviders Example
 *
 * Demonstrates using combined providers for testing
 * Run with: npx vitest run examples/providers/all-providers.example.tsx
 */

import React from 'react'
import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import { AllProviders } from '../../core/components/providers/AllProviders'

describe('AllProviders Examples', () => {
  describe('1. Default configuration', () => {
    it('provides default values', () => {
      render(
        <AllProviders>
          <div data-testid="content">Content</div>
        </AllProviders>
      )

      const provider = screen.getByTestId('test-providers')
      expect(provider).toHaveAttribute('data-theme', 'light')
      expect(provider).toHaveAttribute('data-route', '/')
    })
  })

  describe('2. Custom theme', () => {
    it('sets custom theme', () => {
      render(
        <AllProviders theme="dark">
          <div>Content</div>
        </AllProviders>
      )

      expect(screen.getByTestId('test-providers')).toHaveAttribute('data-theme', 'dark')
    })
  })

  describe('3. Custom initial route', () => {
    it('sets custom route', () => {
      render(
        <AllProviders initialRoute="/dashboard">
          <div>Content</div>
        </AllProviders>
      )

      expect(screen.getByTestId('test-providers')).toHaveAttribute('data-route', '/dashboard')
    })
  })

  describe('4. Combined options', () => {
    it('supports multiple options together', () => {
      render(
        <AllProviders
          theme="dark"
          initialRoute="/settings"
          mockAuth={{ isAuthenticated: true, user: { id: '1', name: 'John' } }}
        >
          <div>Content</div>
        </AllProviders>
      )

      const provider = screen.getByTestId('test-providers')
      expect(provider).toHaveAttribute('data-theme', 'dark')
      expect(provider).toHaveAttribute('data-route', '/settings')
    })
  })

  describe('5. Nested components', () => {
    it('wraps deeply nested content', () => {
      render(
        <AllProviders>
          <div>
            <div>
              <div data-testid="deep">Deep content</div>
            </div>
          </div>
        </AllProviders>
      )

      expect(screen.getByTestId('deep')).toHaveTextContent('Deep content')
    })
  })

  describe('6. Multiple children', () => {
    it('renders multiple child components', () => {
      render(
        <AllProviders>
          <header data-testid="header">Header</header>
          <main data-testid="main">Main</main>
          <footer data-testid="footer">Footer</footer>
        </AllProviders>
      )

      expect(screen.getByTestId('header')).toBeInTheDocument()
      expect(screen.getByTestId('main')).toBeInTheDocument()
      expect(screen.getByTestId('footer')).toBeInTheDocument()
    })
  })

  describe('7. Component testing pattern', () => {
    it('simplifies component testing setup', () => {
      // This pattern wraps any component with all necessary providers
      const MyComponent = () => (
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to the dashboard</p>
        </div>
      )

      render(
        <AllProviders theme="dark" initialRoute="/dashboard">
          <MyComponent />
        </AllProviders>
      )

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Welcome to the dashboard')).toBeInTheDocument()
    })
  })
})
