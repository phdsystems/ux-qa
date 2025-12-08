import type {
  FullConfig,
  FullResult,
  Reporter,
  Suite,
  TestCase,
  TestResult,
} from '@playwright/test/reporter';
import type { UxQaReporterOptions, RunPayload, TestResultInfo } from './types';

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
export class UxQaReporter implements Reporter {
  private options: Required<Omit<UxQaReporterOptions, 'apiKey' | 'tags'>> & Pick<UxQaReporterOptions, 'apiKey' | 'tags'>;
  private startTime: number = 0;
  private testResults: TestResultInfo[] = [];
  private passed = 0;
  private failed = 0;
  private skipped = 0;
  private flaky = 0;

  constructor(options: UxQaReporterOptions) {
    this.options = {
      hubUrl: options.hubUrl || process.env.UXQA_URL || 'http://localhost:3000',
      appId: options.appId,
      suite: options.suite || 'e2e',
      environment: options.environment || this.detectEnvironment(),
      apiKey: options.apiKey || process.env.UXQA_API_KEY,
      verbose: options.verbose || false,
      tags: options.tags,
      timeout: options.timeout || 10000,
    };

    if (!this.options.appId) {
      throw new Error('@ux.qa/reporter: appId is required');
    }
  }

  private detectEnvironment(): string {
    if (process.env.CI) return 'ci';
    if (process.env.GITHUB_ACTIONS) return 'github';
    if (process.env.GITLAB_CI) return 'gitlab';
    if (process.env.JENKINS_URL) return 'jenkins';
    if (process.env.CIRCLECI) return 'circleci';
    return 'local';
  }

  private getGitInfo(): { commit?: string; branch?: string } {
    try {
      const { execSync } = require('child_process');
      const commit = process.env.GITHUB_SHA
        || process.env.CI_COMMIT_SHA
        || execSync('git rev-parse --short HEAD', { encoding: 'utf-8' }).trim();
      const branch = process.env.GITHUB_REF_NAME
        || process.env.CI_COMMIT_REF_NAME
        || execSync('git branch --show-current', { encoding: 'utf-8' }).trim();
      return { commit, branch };
    } catch {
      return {};
    }
  }

  private log(message: string): void {
    if (this.options.verbose) {
      console.log(`[ux.qa] ${message}`);
    }
  }

  onBegin(config: FullConfig, suite: Suite): void {
    this.startTime = Date.now();
    this.testResults = [];
    this.passed = 0;
    this.failed = 0;
    this.skipped = 0;
    this.flaky = 0;
    this.log(`Starting test run for ${this.options.appId}/${this.options.suite}`);
  }

  onTestEnd(test: TestCase, result: TestResult): void {
    const testInfo: TestResultInfo = {
      title: test.title,
      status: result.status,
      duration: result.duration,
      retry: result.retry,
      errors: result.errors.map(e => e.message || String(e)),
    };

    this.testResults.push(testInfo);

    // Count results - handle flaky tests (passed after retry)
    if (result.status === 'passed') {
      if (result.retry > 0) {
        this.flaky++;
      } else {
        this.passed++;
      }
    } else if (result.status === 'failed' || result.status === 'timedOut' || result.status === 'interrupted') {
      this.failed++;
    } else if (result.status === 'skipped') {
      this.skipped++;
    }

    this.log(`Test "${test.title}" ${result.status} (${result.duration}ms)`);
  }

  async onEnd(result: FullResult): Promise<void> {
    const duration = Date.now() - this.startTime;
    const gitInfo = this.getGitInfo();

    // Determine overall status
    let status: RunPayload['status'];
    if (this.failed > 0) {
      status = 'failed';
    } else if (this.flaky > 0) {
      status = 'flaky';
    } else if (this.passed === 0 && this.skipped > 0) {
      status = 'skipped';
    } else {
      status = 'passed';
    }

    const payload: RunPayload = {
      appId: this.options.appId,
      suite: this.options.suite,
      environment: this.options.environment,
      status,
      total: this.testResults.length,
      passed: this.passed,
      failed: this.failed,
      skipped: this.skipped,
      flaky: this.flaky,
      durationMs: duration,
      commit: gitInfo.commit,
      branch: gitInfo.branch,
      tags: this.options.tags,
      timestamp: new Date().toISOString(),
    };

    await this.publishResults(payload);
  }

  private async publishResults(payload: RunPayload): Promise<void> {
    const url = `${this.options.hubUrl}/api/runs`;

    this.log(`Publishing results to ${url}`);
    this.log(`Payload: ${JSON.stringify(payload, null, 2)}`);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };

      if (this.options.apiKey) {
        headers['x-uxqa-key'] = this.options.apiKey;
      }

      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.options.timeout);

      const response = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify(payload),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[ux.qa] Failed to publish results: ${response.status} ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log(`[ux.qa] Results published successfully: ${payload.passed}/${payload.total} passed (${payload.durationMs}ms)`);

      if (this.options.verbose && data.id) {
        console.log(`[ux.qa] Run ID: ${data.id}`);
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.error(`[ux.qa] Request timed out after ${this.options.timeout}ms`);
      } else {
        console.error(`[ux.qa] Failed to publish results:`, error);
      }
    }
  }
}

export default UxQaReporter;
