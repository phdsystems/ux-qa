/**
 * MockImage Example
 *
 * Demonstrates testing image loading without actual images
 * Run with: npx vitest run examples/components/mock-image.example.tsx
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MockImage } from '../../core/components/mocks/MockImage'

describe('MockImage Examples', () => {
  describe('1. Basic image rendering', () => {
    it('renders without loading actual image', () => {
      render(<MockImage src="/photos/hero.jpg" alt="Hero image" />)

      const img = screen.getByTestId('mock-image')
      expect(img).toBeInTheDocument()
      expect(img).toHaveAttribute('data-src', '/photos/hero.jpg')
      expect(img).toHaveAttribute('data-alt', 'Hero image')
    })
  })

  describe('2. Image with dimensions', () => {
    it('respects width and height props', () => {
      render(<MockImage src="/logo.png" width={200} height={100} />)

      const img = screen.getByTestId('mock-image')
      expect(img).toHaveStyle({ width: '200px', height: '100px' })
    })
  })

  describe('3. Lazy loading simulation', () => {
    it('handles lazy loading attribute', () => {
      render(<MockImage src="/large-image.jpg" loading="lazy" />)

      const img = screen.getByTestId('mock-image')
      expect(img).toHaveAttribute('data-loading', 'lazy')
    })
  })

  describe('4. onLoad callback', () => {
    it('triggers onLoad when simulated', async () => {
      const handleLoad = vi.fn()

      render(<MockImage src="/image.jpg" onLoad={handleLoad} />)

      // MockImage should trigger onLoad after mount
      await vi.waitFor(() => {
        expect(handleLoad).toHaveBeenCalled()
      })
    })
  })

  describe('5. onError callback', () => {
    it('triggers onError for failed images', async () => {
      const handleError = vi.fn()

      render(<MockImage src="/broken.jpg" onError={handleError} simulateError />)

      await vi.waitFor(() => {
        expect(handleError).toHaveBeenCalled()
      })
    })
  })

  describe('6. Multiple images', () => {
    it('renders gallery without network requests', () => {
      const images = [
        { src: '/photo1.jpg', alt: 'Photo 1' },
        { src: '/photo2.jpg', alt: 'Photo 2' },
        { src: '/photo3.jpg', alt: 'Photo 3' },
      ]

      render(
        <div data-testid="gallery">
          {images.map((img, i) => (
            <MockImage key={i} src={img.src} alt={img.alt} />
          ))}
        </div>
      )

      const gallery = screen.getByTestId('gallery')
      expect(gallery.querySelectorAll('[data-testid="mock-image"]')).toHaveLength(3)
    })
  })

  describe('7. Responsive image', () => {
    it('handles srcset and sizes', () => {
      render(
        <MockImage
          src="/image.jpg"
          srcSet="/image-320.jpg 320w, /image-640.jpg 640w"
          sizes="(max-width: 600px) 320px, 640px"
        />
      )

      const img = screen.getByTestId('mock-image')
      expect(img).toHaveAttribute('data-srcset')
    })
  })
})
