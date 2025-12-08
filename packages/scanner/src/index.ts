// Main entry point for @ux.qa/scanner

export { Scanner, createScanner } from './scanner';
export { analyzeReactFile } from './analyzers/react';
export { generateTestFile } from './generators/test-template';
export { calculateCoverage, printCoverageReport, generateJsonReport } from './reporters/coverage';

export type {
  ScannerConfig,
  ComponentInfo,
  ElementInfo,
  ElementType,
  PropInfo,
  ScanResult,
  RouteInfo,
  CoverageStats,
  GeneratedTest,
  TestGeneratorOptions,
} from './types';
