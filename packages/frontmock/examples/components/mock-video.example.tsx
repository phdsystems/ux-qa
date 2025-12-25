/**
 * MockVideo Example
 *
 * Demonstrates testing video components without actual video loading
 * Run with: npx vitest run examples/components/mock-video.example.tsx
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MockVideo } from '../../core/components/mocks/MockVideo'

describe('MockVideo Examples', () => {
  describe('1. Basic video rendering', () => {
    it('renders video placeholder', () => {
      render(<MockVideo src="/video.mp4" />)

      const video = screen.getByTestId('mock-video')
      expect(video).toBeInTheDocument()
      expect(video).toHaveAttribute('data-src', '/video.mp4')
    })
  })

  describe('2. Video with controls', () => {
    it('shows play/pause controls', () => {
      render(<MockVideo src="/video.mp4" controls />)

      expect(screen.getByTestId('video-controls')).toBeInTheDocument()
      expect(screen.getByLabelText('Play')).toBeInTheDocument()
    })
  })

  describe('3. Play and pause', () => {
    it('toggles play state', async () => {
      const handlePlay = vi.fn()
      const handlePause = vi.fn()

      render(
        <MockVideo
          src="/video.mp4"
          controls
          onPlay={handlePlay}
          onPause={handlePause}
        />
      )

      // Click play
      fireEvent.click(screen.getByLabelText('Play'))
      expect(handlePlay).toHaveBeenCalled()

      // Click pause
      fireEvent.click(screen.getByLabelText('Pause'))
      expect(handlePause).toHaveBeenCalled()
    })
  })

  describe('4. Autoplay', () => {
    it('triggers onPlay for autoplay videos', async () => {
      const handlePlay = vi.fn()

      render(<MockVideo src="/video.mp4" autoPlay onPlay={handlePlay} />)

      await vi.waitFor(() => {
        expect(handlePlay).toHaveBeenCalled()
      })
    })
  })

  describe('5. Video dimensions', () => {
    it('respects width and height', () => {
      render(<MockVideo src="/video.mp4" width={640} height={360} />)

      const video = screen.getByTestId('mock-video')
      expect(video).toHaveStyle({ width: '640px' })
    })
  })

  describe('6. Poster image', () => {
    it('shows poster before play', () => {
      render(<MockVideo src="/video.mp4" poster="/poster.jpg" />)

      const video = screen.getByTestId('mock-video')
      expect(video).toHaveAttribute('data-poster', '/poster.jpg')
    })
  })

  describe('7. Loop and muted', () => {
    it('handles loop and muted attributes', () => {
      render(<MockVideo src="/video.mp4" loop muted />)

      const video = screen.getByTestId('mock-video')
      expect(video).toHaveAttribute('data-loop', 'true')
      expect(video).toHaveAttribute('data-muted', 'true')
    })
  })

  describe('8. Time update', () => {
    it('tracks current time', async () => {
      const handleTimeUpdate = vi.fn()

      render(
        <MockVideo
          src="/video.mp4"
          controls
          autoPlay
          onTimeUpdate={handleTimeUpdate}
        />
      )

      // Wait for time updates (mock video simulates playback)
      await vi.waitFor(() => {
        expect(handleTimeUpdate).toHaveBeenCalled()
      }, { timeout: 500 })
    })
  })

  describe('9. Video ended', () => {
    it('triggers onEnded callback', async () => {
      const handleEnded = vi.fn()

      // MockVideo has a short duration for testing
      render(
        <MockVideo
          src="/video.mp4"
          autoPlay
          onEnded={handleEnded}
          duration={0.1} // Very short for testing
        />
      )

      await vi.waitFor(() => {
        expect(handleEnded).toHaveBeenCalled()
      }, { timeout: 1000 })
    })
  })
})
