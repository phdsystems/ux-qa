/**
 * L2 API: Consumer Traits
 *
 * Service interfaces that consumers call. These define the contracts
 * for using FrontMock's testing capabilities.
 */

import type React from 'react'
import type { TestProvider } from '../spi'
import type { RenderResult, Screen, UserEventInstance } from './models'

export interface Matchers<T = unknown> {
  toBe(expected: T): void
  toEqual(expected: T): void
  toStrictEqual(expected: T): void
  toBeTruthy(): void
  toBeFalsy(): void
  toBeNull(): void
  toBeUndefined(): void
  toBeDefined(): void
  toBeNaN(): void
  toBeGreaterThan(expected: number): void
  toBeGreaterThanOrEqual(expected: number): void
  toBeLessThan(expected: number): void
  toBeLessThanOrEqual(expected: number): void
  toBeCloseTo(expected: number, precision?: number): void
  toMatch(expected: string | RegExp): void
  toContain(expected: unknown): void
  toHaveLength(expected: number): void
  toHaveProperty(key: string, value?: unknown): void
  toMatchObject(expected: object): void
  toContainEqual(expected: unknown): void
  toThrow(expected?: string | RegExp | Error): void
  toThrowError(expected?: string | RegExp | Error): void
  resolves: Matchers<Awaited<T>>
  rejects: Matchers<unknown>
  not: Matchers<T>
  // DOM Matchers
  toBeInTheDocument(): void
  toBeVisible(): void
  toBeDisabled(): void
  toBeEnabled(): void
  toHaveAttribute(attr: string, value?: string): void
  toHaveClass(...classes: string[]): void
  toHaveValue(value: string | number | string[]): void
  toHaveTextContent(text: string | RegExp): void
  toBeChecked(): void
  toHaveFocus(): void
  toBeEmpty(): void
  toBeEmptyDOMElement(): void
  toBeRequired(): void
  toBeValid(): void
  toBeInvalid(): void
  toHaveStyle(css: string | Record<string, unknown>): void
}

export interface ExpectFn {
  <T>(actual: T): Matchers<T>
  extend(matchers: Record<string, unknown>): void
  any(constructor: unknown): unknown
  anything(): unknown
  arrayContaining(array: unknown[]): unknown
  objectContaining(obj: object): unknown
  stringContaining(str: string): unknown
  stringMatching(str: string | RegExp): unknown
}

export interface DOMTestingProvider {
  render(ui: React.ReactElement): RenderResult
  screen: Screen
  userEvent: { setup(): UserEventInstance }
  cleanup(): void
  waitFor<T>(callback: () => T | Promise<T>, options?: { timeout?: number }): Promise<T>
  act(callback: () => void | Promise<void>): Promise<void>
}

export interface TestingProvider extends TestProvider, DOMTestingProvider {
  expect: ExpectFn
}

export interface ProviderRegistry {
  register(name: string, factory: () => TestingProvider | Promise<TestingProvider>): void
  get(name?: string): Promise<TestingProvider>
  getSync(name?: string): TestingProvider
  setDefault(name: string): void
}
