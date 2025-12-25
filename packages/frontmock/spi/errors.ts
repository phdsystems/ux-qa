/**
 * L1 SPI: Provider Errors
 *
 * Error types that providers throw or handle internally.
 */

export class ProviderError extends Error {
  constructor(
    message: string,
    public readonly providerName: string,
    public readonly cause?: Error
  ) {
    super(message)
    this.name = 'ProviderError'
  }
}

export class ProviderNotFoundError extends ProviderError {
  constructor(providerName: string) {
    super(`Provider not found: ${providerName}`, providerName)
    this.name = 'ProviderNotFoundError'
  }
}

export class ProviderInitializationError extends ProviderError {
  constructor(providerName: string, cause?: Error) {
    super(`Failed to initialize provider: ${providerName}`, providerName, cause)
    this.name = 'ProviderInitializationError'
  }
}

export class MockSetupError extends ProviderError {
  constructor(
    message: string,
    providerName: string,
    public readonly mockTarget: string
  ) {
    super(message, providerName)
    this.name = 'MockSetupError'
  }
}
