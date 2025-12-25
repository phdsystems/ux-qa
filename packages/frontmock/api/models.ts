/**
 * L2 API: Consumer Models
 *
 * DTOs and value types that consumers interact with directly.
 */

import type React from 'react'

export interface RenderResult {
  container: HTMLElement
  baseElement: HTMLElement
  debug: (element?: HTMLElement) => void
  rerender: (ui: React.ReactElement) => void
  unmount: () => void
  asFragment: () => DocumentFragment
}

export interface Screen {
  getByText(text: string | RegExp): HTMLElement
  getAllByText(text: string | RegExp): HTMLElement[]
  queryByText(text: string | RegExp): HTMLElement | null
  queryAllByText(text: string | RegExp): HTMLElement[]
  findByText(text: string | RegExp): Promise<HTMLElement>
  findAllByText(text: string | RegExp): Promise<HTMLElement[]>
  getByRole(role: string, options?: { name?: string | RegExp }): HTMLElement
  getAllByRole(role: string, options?: { name?: string | RegExp }): HTMLElement[]
  queryByRole(role: string, options?: { name?: string | RegExp }): HTMLElement | null
  queryAllByRole(role: string, options?: { name?: string | RegExp }): HTMLElement[]
  findByRole(role: string, options?: { name?: string | RegExp }): Promise<HTMLElement>
  getByPlaceholderText(text: string | RegExp): HTMLElement
  queryByPlaceholderText(text: string | RegExp): HTMLElement | null
  getByTestId(testId: string): HTMLElement
  queryByTestId(testId: string): HTMLElement | null
  getByLabelText(text: string | RegExp): HTMLElement
  queryByLabelText(text: string | RegExp): HTMLElement | null
  getByDisplayValue(value: string | RegExp): HTMLElement
  queryByDisplayValue(value: string | RegExp): HTMLElement | null
  debug: (element?: HTMLElement) => void
}

export interface UserEventInstance {
  click(element: HTMLElement): Promise<void>
  dblClick(element: HTMLElement): Promise<void>
  type(element: HTMLElement, text: string): Promise<void>
  clear(element: HTMLElement): Promise<void>
  selectOptions(element: HTMLElement, values: string | string[]): Promise<void>
  hover(element: HTMLElement): Promise<void>
  unhover(element: HTMLElement): Promise<void>
  tab(options?: { shift?: boolean }): Promise<void>
  keyboard(text: string): Promise<void>
  upload(element: HTMLElement, files: File | File[]): Promise<void>
  paste(text: string): Promise<void>
}

export interface TestHarnessOptions {
  suspense?: boolean
  errorBoundary?: boolean
  loading?: React.ReactNode
  fallback?: React.ReactNode
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void
}

export interface RenderOptions {
  theme?: 'light' | 'dark' | string
  initialRoute?: string
  wrappers?: React.ComponentType<{ children: React.ReactNode }>[]
}
