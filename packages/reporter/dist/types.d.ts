/**
 * Configuration options for UX.QA Reporter
 */
export interface UxQaReporterOptions {
    /** URL of the UX.QA hub (default: http://localhost:3000) */
    hubUrl?: string;
    /** Application identifier */
    appId: string;
    /** Test suite name (default: 'e2e') */
    suite?: string;
    /** Environment name (default: auto-detected from CI or 'local') */
    environment?: string;
    /** API key for authentication (can also use UXQA_API_KEY env var) */
    apiKey?: string;
    /** Whether to log verbose output (default: false) */
    verbose?: boolean;
    /** Custom tags to attach to the run */
    tags?: string[];
    /** Timeout for API requests in ms (default: 10000) */
    timeout?: number;
}
/**
 * Payload sent to UX.QA API
 */
export interface RunPayload {
    appId: string;
    suite: string;
    environment: string;
    status: 'passed' | 'failed' | 'flaky' | 'skipped';
    total: number;
    passed: number;
    failed: number;
    skipped: number;
    flaky: number;
    durationMs: number;
    coverage?: number;
    commit?: string;
    branch?: string;
    artifactUrl?: string;
    tags?: string[];
    timestamp: string;
}
/**
 * Test result from Playwright
 */
export interface TestResultInfo {
    title: string;
    status: 'passed' | 'failed' | 'timedOut' | 'skipped' | 'interrupted';
    duration: number;
    retry: number;
    errors: string[];
}
//# sourceMappingURL=types.d.ts.map