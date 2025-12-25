/**
 * L2 API - Consumer Contracts
 *
 * Consumer-facing layer containing:
 * - Service traits (interfaces consumers call)
 * - Consumer-facing DTOs and models
 * - Consumer-facing errors
 *
 * Re-exports shared types from SPI for consumer convenience.
 */

export * from './models'
export * from './errors'
export * from './traits'

// Re-export SPI types that consumers also need
export type {
  TestFn,
  SuiteFn,
  HookFn,
  MockCallInfo,
  ProviderName,
  ProviderInfo,
} from '../spi'
