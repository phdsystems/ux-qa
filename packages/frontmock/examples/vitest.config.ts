import { defineConfig } from 'vitest/config'
import { resolve } from 'path'

export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['**/*.example.ts', '**/*.example.tsx'],
    testTimeout: 30000,
    setupFiles: [resolve(__dirname, 'setup.ts')],
    root: __dirname,
  },
})
