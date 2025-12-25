/**
 * L2 API: Consumer Errors
 *
 * Error types that consumers encounter when using FrontMock.
 */

import { ProviderError } from '../spi'

export class FrontMockError extends Error {
  constructor(message: string, public readonly cause?: Error) {
    super(message)
    this.name = 'FrontMockError'
  }
}

export class RenderError extends FrontMockError {
  constructor(message: string, public readonly component: string, cause?: Error) {
    super(message, cause)
    this.name = 'RenderError'
  }
}

export class MockError extends FrontMockError {
  constructor(message: string, public readonly mockName: string, cause?: Error) {
    super(message, cause)
    this.name = 'MockError'
  }
}

export class AssertionError extends FrontMockError {
  constructor(message: string, public readonly expected: unknown, public readonly actual: unknown) {
    super(message)
    this.name = 'AssertionError'
  }
}

export class TimeoutError extends FrontMockError {
  constructor(message: string, public readonly timeoutMs: number) {
    super(message)
    this.name = 'TimeoutError'
  }
}

export function wrapProviderError(error: ProviderError): FrontMockError {
  return new FrontMockError(`[${error.providerName}] ${error.message}`, error)
}
