/**
 * MockMatchMedia Example
 *
 * Demonstrates mocking window.matchMedia for responsive testing
 * Run with: npx vitest run examples/mocks/match-media.example.ts
 */

import { describe, it, expect } from 'vitest'
import { setupMockMatchMedia, mediaQueries } from '../../core/components/mocks/MockMatchMedia'

describe('MockMatchMedia Examples', () => {
  describe('1. Basic media query matching', () => {
    it('matches media queries', () => {
      const { setMatches, cleanup } = setupMockMatchMedia()

      setMatches('(max-width: 768px)', true)
      expect(window.matchMedia('(max-width: 768px)').matches).toBe(true)

      setMatches('(min-width: 1024px)', true)
      expect(window.matchMedia('(min-width: 1024px)').matches).toBe(true)

      cleanup()
    })
  })

  describe('2. Dark mode preference', () => {
    it('simulates color scheme preference', () => {
      const { setMatches, cleanup } = setupMockMatchMedia()

      setMatches(mediaQueries.darkMode, true)
      expect(window.matchMedia(mediaQueries.darkMode).matches).toBe(true)

      setMatches(mediaQueries.lightMode, true)
      setMatches(mediaQueries.darkMode, false)
      expect(window.matchMedia(mediaQueries.lightMode).matches).toBe(true)
      expect(window.matchMedia(mediaQueries.darkMode).matches).toBe(false)

      cleanup()
    })
  })

  describe('3. Reduced motion preference', () => {
    it('simulates reduced motion', () => {
      const { setMatches, cleanup } = setupMockMatchMedia()

      setMatches(mediaQueries.reducedMotion, true)
      expect(window.matchMedia(mediaQueries.reducedMotion).matches).toBe(true)

      cleanup()
    })
  })

  describe('4. Media query change listener', () => {
    it('triggers change events', () => {
      const { setMatches, cleanup } = setupMockMatchMedia()

      const query = '(max-width: 600px)'
      const states: boolean[] = []

      const mq = window.matchMedia(query)
      mq.addEventListener('change', (e) => {
        states.push(e.matches)
      })

      setMatches(query, true)
      setMatches(query, false)

      expect(states).toEqual([true, false])

      cleanup()
    })
  })

  describe('5. Media query presets', () => {
    it('provides common media queries', () => {
      expect(mediaQueries.mobile).toBe('(max-width: 767px)')
      expect(mediaQueries.tablet).toBe('(min-width: 768px) and (max-width: 1023px)')
      expect(mediaQueries.desktop).toBe('(min-width: 1024px)')
      expect(mediaQueries.darkMode).toBe('(prefers-color-scheme: dark)')
    })
  })
})
