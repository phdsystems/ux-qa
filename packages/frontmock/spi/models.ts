/**
 * L1 SPI: Shared Models
 *
 * Value types and DTOs used by both providers and consumers.
 * These form the vocabulary of the service provider interface.
 */

// ============================================================================
// Core Test Function Types
// ============================================================================

export type TestFn = (name: string, fn: () => void | Promise<void>) => void
export type SuiteFn = (name: string, fn: () => void) => void
export type HookFn = (fn: () => void | Promise<void>) => void

// ============================================================================
// Mock Metadata
// ============================================================================

export interface MockCallInfo<TArgs extends unknown[] = unknown[]> {
  calls: TArgs[]
  results: Array<{ type: 'return' | 'throw'; value: unknown }>
  instances: unknown[]
  lastCall?: TArgs
}

// ============================================================================
// Provider Metadata
// ============================================================================

export type ProviderName = 'vitest' | 'bun' | 'jest' | 'custom'

export interface ProviderInfo {
  readonly name: ProviderName
  readonly version: string
}
