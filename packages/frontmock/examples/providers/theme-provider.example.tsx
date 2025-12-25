/**
 * ThemeProvider Example
 *
 * Demonstrates testing themed components
 * Run with: npx vitest run examples/providers/theme-provider.example.tsx
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { ThemeProvider, useTheme } from '../../core/components/providers/ThemeProvider'

// Test component that uses theme
function ThemedButton() {
  const { theme, setTheme } = useTheme()

  return (
    <button
      data-testid="themed-button"
      data-theme={theme}
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
    >
      Current theme: {theme}
    </button>
  )
}

describe('ThemeProvider Examples', () => {
  describe('1. Default theme', () => {
    it('provides light theme by default', () => {
      render(
        <ThemeProvider>
          <ThemedButton />
        </ThemeProvider>
      )

      expect(screen.getByTestId('themed-button')).toHaveAttribute('data-theme', 'light')
      expect(screen.getByText('Current theme: light')).toBeInTheDocument()
    })
  })

  describe('2. Custom initial theme', () => {
    it('starts with specified theme', () => {
      render(
        <ThemeProvider theme="dark">
          <ThemedButton />
        </ThemeProvider>
      )

      expect(screen.getByTestId('themed-button')).toHaveAttribute('data-theme', 'dark')
      expect(screen.getByText('Current theme: dark')).toBeInTheDocument()
    })
  })

  describe('3. Theme change callback', () => {
    it('calls onThemeChange when theme changes', () => {
      const handleThemeChange = vi.fn()

      render(
        <ThemeProvider theme="light" onThemeChange={handleThemeChange}>
          <ThemedButton />
        </ThemeProvider>
      )

      fireEvent.click(screen.getByTestId('themed-button'))

      expect(handleThemeChange).toHaveBeenCalledWith('dark')
    })
  })

  describe('4. Provider data attribute', () => {
    it('sets data-theme on wrapper', () => {
      render(
        <ThemeProvider theme="dark">
          <div>Content</div>
        </ThemeProvider>
      )

      expect(screen.getByTestId('theme-provider')).toHaveAttribute('data-theme', 'dark')
    })
  })

  describe('5. System theme', () => {
    it('supports system theme option', () => {
      render(
        <ThemeProvider theme="system">
          <ThemedButton />
        </ThemeProvider>
      )

      expect(screen.getByText('Current theme: system')).toBeInTheDocument()
    })
  })

  describe('6. Nested themed components', () => {
    it('provides theme to all nested components', () => {
      const DeepComponent = () => {
        const { theme } = useTheme()
        return <span data-testid="deep">{theme}</span>
      }

      render(
        <ThemeProvider theme="dark">
          <div>
            <div>
              <DeepComponent />
            </div>
          </div>
        </ThemeProvider>
      )

      expect(screen.getByTestId('deep')).toHaveTextContent('dark')
    })
  })

  describe('7. Error without provider', () => {
    it('throws error when useTheme is used outside provider', () => {
      // Suppress console error for this test
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<ThemedButton />)
      }).toThrow('useTheme must be used within ThemeProvider')

      consoleSpy.mockRestore()
    })
  })
})
