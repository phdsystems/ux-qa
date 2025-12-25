#!/usr/bin/env bun
/**
 * FrontMock Examples Runner
 *
 * Runs all example files to verify they work correctly.
 * Usage: bun run examples/run-examples.ts
 */

import { readdirSync, statSync } from 'fs'
import { join, relative } from 'path'

const EXAMPLES_DIR = import.meta.dir

// Colors for terminal output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
  dim: '\x1b[2m',
}

function log(message: string, color: string = colors.reset) {
  console.log(`${color}${message}${colors.reset}`)
}

// Find all example files recursively
function findExampleFiles(dir: string): string[] {
  const files: string[] = []

  try {
    const entries = readdirSync(dir)

    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)

      if (stat.isDirectory() && !entry.includes('node_modules')) {
        files.push(...findExampleFiles(fullPath))
      } else if (entry.endsWith('.example.ts')) {
        files.push(fullPath)
      }
    }
  } catch (e) {
    // Directory doesn't exist or can't be read
  }

  return files
}

async function runExample(filePath: string): Promise<{ success: boolean; error?: string }> {
  try {
    const module = await import(filePath)
    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
}

async function main() {
  log('\n╔════════════════════════════════════════════════════════╗', colors.cyan)
  log('║           FrontMock Examples Runner                    ║', colors.cyan)
  log('╚════════════════════════════════════════════════════════╝\n', colors.cyan)

  const exampleFiles = findExampleFiles(EXAMPLES_DIR)
    .filter(f => !f.endsWith('run-examples.ts'))

  if (exampleFiles.length === 0) {
    log('No example files found!', colors.yellow)
    process.exit(1)
  }

  log(`Found ${exampleFiles.length} example files\n`, colors.dim)

  const results: { file: string; success: boolean; error?: string }[] = []

  for (const file of exampleFiles) {
    const relativePath = relative(EXAMPLES_DIR, file)
    log(`\n${'─'.repeat(60)}`, colors.dim)
    log(`Running: ${relativePath}`, colors.blue)
    log(`${'─'.repeat(60)}`, colors.dim)

    const result = await runExample(file)
    results.push({ file: relativePath, ...result })

    if (!result.success) {
      log(`\n❌ FAILED: ${result.error}`, colors.red)
    }
  }

  // Summary
  log('\n╔════════════════════════════════════════════════════════╗', colors.cyan)
  log('║                    Summary                              ║', colors.cyan)
  log('╚════════════════════════════════════════════════════════╝\n', colors.cyan)

  const passed = results.filter(r => r.success)
  const failed = results.filter(r => !r.success)

  log(`Total:  ${results.length}`, colors.dim)
  log(`Passed: ${passed.length}`, colors.green)
  log(`Failed: ${failed.length}`, failed.length > 0 ? colors.red : colors.dim)

  if (failed.length > 0) {
    log('\nFailed examples:', colors.red)
    for (const f of failed) {
      log(`  - ${f.file}: ${f.error}`, colors.red)
    }
    process.exit(1)
  } else {
    log('\n✓ All examples passed!', colors.green)
    process.exit(0)
  }
}

main().catch(console.error)
