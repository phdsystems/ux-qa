/**
 * RouterProvider Example
 *
 * Demonstrates testing components with navigation
 * Run with: npx vitest run examples/providers/router-provider.example.tsx
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { RouterProvider, useRouter, Link } from '../../core/components/providers/RouterProvider'

// Test component that uses router
function Navigation() {
  const { pathname, navigate } = useRouter()

  return (
    <nav data-testid="nav" data-pathname={pathname}>
      <button onClick={() => navigate('/home')}>Home</button>
      <button onClick={() => navigate('/about')}>About</button>
      <button onClick={() => navigate('/contact')}>Contact</button>
      <span data-testid="current-path">{pathname}</span>
    </nav>
  )
}

describe('RouterProvider Examples', () => {
  describe('1. Default route', () => {
    it('starts at root path by default', () => {
      render(
        <RouterProvider>
          <Navigation />
        </RouterProvider>
      )

      expect(screen.getByTestId('current-path')).toHaveTextContent('/')
    })
  })

  describe('2. Initial route', () => {
    it('starts at specified route', () => {
      render(
        <RouterProvider initialRoute="/dashboard">
          <Navigation />
        </RouterProvider>
      )

      expect(screen.getByTestId('current-path')).toHaveTextContent('/dashboard')
    })
  })

  describe('3. Navigation', () => {
    it('navigates to different routes', () => {
      render(
        <RouterProvider>
          <Navigation />
        </RouterProvider>
      )

      fireEvent.click(screen.getByText('About'))
      expect(screen.getByTestId('current-path')).toHaveTextContent('/about')

      fireEvent.click(screen.getByText('Contact'))
      expect(screen.getByTestId('current-path')).toHaveTextContent('/contact')
    })
  })

  describe('4. onNavigate callback', () => {
    it('calls callback on navigation', () => {
      const handleNavigate = vi.fn()

      render(
        <RouterProvider onNavigate={handleNavigate}>
          <Navigation />
        </RouterProvider>
      )

      fireEvent.click(screen.getByText('Home'))

      expect(handleNavigate).toHaveBeenCalledWith('/home')
    })
  })

  describe('5. Route params', () => {
    it('provides route params', () => {
      const UserProfile = () => {
        const { params } = useRouter()
        return <span data-testid="user-id">{params.userId}</span>
      }

      render(
        <RouterProvider
          initialRoute="/users/123"
          initialParams={{ userId: '123' }}
        >
          <UserProfile />
        </RouterProvider>
      )

      expect(screen.getByTestId('user-id')).toHaveTextContent('123')
    })
  })

  describe('6. Link component', () => {
    it('navigates on click', () => {
      const handleNavigate = vi.fn()

      render(
        <RouterProvider onNavigate={handleNavigate}>
          <Link to="/products">Products</Link>
        </RouterProvider>
      )

      fireEvent.click(screen.getByText('Products'))

      expect(handleNavigate).toHaveBeenCalledWith('/products')
    })
  })

  describe('7. Link prevents default', () => {
    it('prevents page navigation', () => {
      render(
        <RouterProvider>
          <Link to="/test">Test Link</Link>
        </RouterProvider>
      )

      const link = screen.getByText('Test Link')
      const clickEvent = new MouseEvent('click', { bubbles: true })
      const preventDefaultSpy = vi.spyOn(clickEvent, 'preventDefault')

      link.dispatchEvent(clickEvent)

      expect(preventDefaultSpy).toHaveBeenCalled()
    })
  })

  describe('8. Provider data attribute', () => {
    it('sets data-pathname on wrapper', () => {
      render(
        <RouterProvider initialRoute="/settings">
          <div>Content</div>
        </RouterProvider>
      )

      expect(screen.getByTestId('router-provider')).toHaveAttribute('data-pathname', '/settings')
    })
  })

  describe('9. Error without provider', () => {
    it('throws error when useRouter is used outside provider', () => {
      const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {})

      expect(() => {
        render(<Navigation />)
      }).toThrow('useRouter must be used within RouterProvider')

      consoleSpy.mockRestore()
    })
  })
})
