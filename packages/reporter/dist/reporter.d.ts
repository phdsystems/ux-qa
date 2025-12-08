import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from '@playwright/test/reporter';
import type { UxQaReporterOptions } from './types';
/**
 * UX.QA Playwright Reporter
 *
 * Automatically publishes test results to your UX.QA dashboard.
 *
 * @example
 * ```typescript
 * // playwright.config.ts
 * import { defineConfig } from '@playwright/test';
 *
 * export default defineConfig({
 *   reporter: [
 *     ['html'],
 *     ['@ux.qa/reporter', {
 *       hubUrl: 'http://localhost:3000',
 *       appId: 'my-app',
 *       suite: 'e2e'
 *     }]
 *   ]
 * });
 * ```
 */
export declare class UxQaReporter implements Reporter {
    private options;
    private startTime;
    private testResults;
    private passed;
    private failed;
    private skipped;
    private flaky;
    constructor(options: UxQaReporterOptions);
    private detectEnvironment;
    private getGitInfo;
    private log;
    onBegin(config: FullConfig, suite: Suite): void;
    onTestEnd(test: TestCase, result: TestResult): void;
    onEnd(result: FullResult): Promise<void>;
    private publishResults;
}
export default UxQaReporter;
//# sourceMappingURL=reporter.d.ts.map