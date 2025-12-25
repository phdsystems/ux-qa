/**
 * FrontMock - Modern frontend testing framework
 *
 * L4 Facade: Consumer entry point (ONLY externally visible)
 *
 * Follows SEA 4-Layer Architecture:
 * - L1 SPI: Provider traits and shared types (./spi)
 * - L2 API: Consumer contracts and types (./api)
 * - L3 Core: Implementations (./core)
 * - L4 Facade: This file - re-exports and entry point
 *
 * @example
 * ```typescript
 * import { t } from '@ux.qa/frontmock'
 *
 * const { describe, it, expect, render, screen } = t
 *
 * describe('MyComponent', () => {
 *   it('renders correctly', () => {
 *     render(<MyComponent />)
 *     expect(screen.getByText('Hello')).toBeInTheDocument()
 *   })
 * })
 * ```
 */

// L1 SPI: Provider types (for those implementing custom providers)
export * from './spi'

// L2 API: Consumer-facing types and contracts
export * from './api'

// L3 Core: Implementations
export * from './core'
