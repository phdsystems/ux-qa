/**
 * MockAudio Example
 *
 * Demonstrates testing audio components without actual audio loading
 * Run with: npx vitest run examples/components/mock-audio.example.tsx
 */

import React from 'react'
import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import { MockAudio } from '../../core/components/mocks/MockAudio'

describe('MockAudio Examples', () => {
  describe('1. Basic audio rendering', () => {
    it('renders audio placeholder', () => {
      render(<MockAudio src="/audio.mp3" />)

      const audio = screen.getByTestId('mock-audio')
      expect(audio).toBeInTheDocument()
      expect(audio).toHaveAttribute('data-src', '/audio.mp3')
    })
  })

  describe('2. Audio with controls', () => {
    it('shows play/pause controls', () => {
      render(<MockAudio src="/audio.mp3" controls />)

      expect(screen.getByTestId('audio-controls')).toBeInTheDocument()
      expect(screen.getByLabelText('Play')).toBeInTheDocument()
    })
  })

  describe('3. Play and pause', () => {
    it('toggles play state', () => {
      const handlePlay = vi.fn()
      const handlePause = vi.fn()

      render(
        <MockAudio
          src="/audio.mp3"
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

  describe('4. Volume control', () => {
    it('adjusts volume', () => {
      const handleVolumeChange = vi.fn()

      render(
        <MockAudio
          src="/audio.mp3"
          controls
          onVolumeChange={handleVolumeChange}
        />
      )

      const volumeSlider = screen.getByLabelText('Volume')
      fireEvent.change(volumeSlider, { target: { value: '0.5' } })

      expect(handleVolumeChange).toHaveBeenCalledWith(0.5)
    })
  })

  describe('5. Autoplay', () => {
    it('triggers onPlay for autoplay', async () => {
      const handlePlay = vi.fn()

      render(<MockAudio src="/audio.mp3" autoPlay onPlay={handlePlay} />)

      await vi.waitFor(() => {
        expect(handlePlay).toHaveBeenCalled()
      })
    })
  })

  describe('6. Loop audio', () => {
    it('handles loop attribute', () => {
      render(<MockAudio src="/audio.mp3" loop />)

      const audio = screen.getByTestId('mock-audio')
      expect(audio).toHaveAttribute('data-playing', 'false')
    })
  })

  describe('7. Time display', () => {
    it('shows current time and duration', () => {
      render(<MockAudio src="/audio.mp3" controls />)

      expect(screen.getByTestId('time-display')).toBeInTheDocument()
    })
  })

  describe('8. Progress bar', () => {
    it('shows playback progress', () => {
      render(<MockAudio src="/audio.mp3" controls />)

      expect(screen.getByTestId('progress-bar')).toBeInTheDocument()
    })
  })
})
