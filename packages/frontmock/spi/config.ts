/**
 * L1 SPI: Provider Configurations
 *
 * Configuration types that providers use to customize their behavior.
 */

export interface ProviderConfig {
  debug?: boolean
  timeout?: number
}

export interface VitestProviderConfig extends ProviderConfig {
  configPath?: string
  globals?: boolean
}

export interface JestProviderConfig extends ProviderConfig {
  configPath?: string
  testEnvironment?: 'jsdom' | 'node'
}

export interface BunProviderConfig extends ProviderConfig {
  preload?: string[]
}

export interface MockConfig {
  autoCleanup?: boolean
  autoRestore?: boolean
}
