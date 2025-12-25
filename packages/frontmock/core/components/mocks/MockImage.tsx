/**
 * MockImage - Mock image component for testing
 *
 * Prevents actual image loading in tests
 */

import React from 'react'

export interface MockImageProps {
  src: string
  alt: string
  width?: number | string
  height?: number | string
  loading?: 'lazy' | 'eager'
  srcSet?: string
  sizes?: string
  simulateError?: boolean
  onLoad?: () => void
  onError?: (error: Error) => void
  [key: string]: any
}

/**
 * Mock image component that simulates loading without actual HTTP requests
 *
 * @example
 * ```typescript
 * import { MockImage } from '@ux.qa/frontmock'
 *
 * const handleLoad = vi.fn()
 * render(<MockImage src="/test.jpg" alt="Test" onLoad={handleLoad} />)
 *
 * // Trigger load event
 * fireEvent.load(screen.getByRole('img'))
 * expect(handleLoad).toHaveBeenCalled()
 * ```
 */
export function MockImage({
  src,
  alt,
  width,
  height,
  loading,
  srcSet,
  sizes,
  simulateError = false,
  onLoad,
  onError,
  ...props
}: MockImageProps) {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      if (simulateError) {
        onError?.(new Error('Failed to load image'))
      } else {
        onLoad?.()
      }
    }, 0)

    return () => clearTimeout(timer)
  }, [onLoad, onError, simulateError])

  return (
    <div
      {...props}
      role="img"
      aria-label={alt}
      data-testid="mock-image"
      data-src={src}
      data-alt={alt}
      data-loading={loading}
      data-srcset={srcSet}
      data-sizes={sizes}
      style={{
        width: width || 'auto',
        height: height || 'auto',
        backgroundColor: '#f0f0f0',
        display: 'inline-block',
        ...props.style,
      }}
    />
  )
}
