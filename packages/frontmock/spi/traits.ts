/**
 * L1 SPI: Provider Traits
 *
 * Interfaces that providers implement. These define the extension points
 * for test framework adapters (Vitest, Jest, Bun).
 */

import type { TestFn, SuiteFn, HookFn, MockCallInfo, ProviderName } from './models'

export interface MockInstance<T = unknown, TArgs extends unknown[] = unknown[]> {
  (...args: TArgs): T
  mock: MockCallInfo<TArgs>
  mockImplementation(fn: (...args: TArgs) => T): this
  mockImplementationOnce(fn: (...args: TArgs) => T): this
  mockReturnValue(value: T): this
  mockReturnValueOnce(value: T): this
  mockResolvedValue(value: Awaited<T>): this
  mockResolvedValueOnce(value: Awaited<T>): this
  mockRejectedValue(value: unknown): this
  mockRejectedValueOnce(value: unknown): this
  mockClear(): this
  mockReset(): this
  mockRestore(): void
  toHaveBeenCalled(): void
  toHaveBeenCalledTimes(times: number): void
  toHaveBeenCalledWith(...args: TArgs): void
  toHaveBeenLastCalledWith(...args: TArgs): void
  toHaveBeenNthCalledWith(n: number, ...args: TArgs): void
}

export interface MockFunctions {
  fn<T = unknown, TArgs extends unknown[] = unknown[]>(
    implementation?: (...args: TArgs) => T
  ): MockInstance<T, TArgs>
  spyOn<T extends object, K extends keyof T>(object: T, method: K): MockInstance<T[K]>
  stubGlobal(name: string, value: unknown): void
  unstubAllGlobals(): void
  clearAllMocks(): void
  resetAllMocks(): void
  restoreAllMocks(): void
}

export interface TestProvider {
  readonly name: ProviderName
  readonly version: string
  describe: SuiteFn & {
    skip: SuiteFn
    only: SuiteFn
    todo: (name: string) => void
    each: <T>(cases: T[]) => (name: string, fn: (arg: T) => void) => void
  }
  it: TestFn & {
    skip: TestFn
    only: TestFn
    todo: (name: string) => void
    each: <T>(cases: T[]) => (name: string, fn: (arg: T) => void) => void
    concurrent: TestFn
  }
  test: TestProvider['it']
  beforeAll: HookFn
  afterAll: HookFn
  beforeEach: HookFn
  afterEach: HookFn
  vi: MockFunctions
  mock: MockFunctions
  skip: () => void
  only: () => void
}

export interface ProviderFactory<T = TestProvider> {
  (): T | Promise<T>
}

export interface ProviderLifecycle {
  onRegister?(): void | Promise<void>
  onInitialize?(): void | Promise<void>
  onShutdown?(): void | Promise<void>
}
