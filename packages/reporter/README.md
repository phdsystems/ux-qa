# @ux.qa/reporter

Playwright reporter for UX.QA dashboard - automatically publish test results to your UX.QA instance.

## Installation

```bash
npm install @ux.qa/reporter
# or
bun add @ux.qa/reporter
# or
pnpm add @ux.qa/reporter
```

## Usage

Add the reporter to your `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['html'],
    ['@ux.qa/reporter', {
      hubUrl: 'https://your-uxqa-instance.com',
      appId: 'my-app',
      suite: 'e2e'
    }]
  ]
});
```

## Configuration Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `appId` | `string` | Yes | - | Your application identifier |
| `hubUrl` | `string` | No | `http://localhost:3000` | URL of your UX.QA instance |
| `suite` | `string` | No | `'e2e'` | Test suite name |
| `environment` | `string` | No | auto-detected | Environment name (ci, github, gitlab, jenkins, circleci, local) |
| `apiKey` | `string` | No | - | API key for authentication |
| `verbose` | `boolean` | No | `false` | Enable verbose logging |
| `tags` | `string[]` | No | - | Custom tags to attach to the run |
| `timeout` | `number` | No | `10000` | Request timeout in milliseconds |

## Environment Variables

You can configure the reporter using environment variables:

- `UXQA_URL` - UX.QA hub URL (alternative to `hubUrl` option)
- `UXQA_API_KEY` - API key for authentication (alternative to `apiKey` option)

## CI/CD Integration

The reporter automatically detects common CI environments and sets the `environment` field accordingly:

- GitHub Actions (`GITHUB_ACTIONS`)
- GitLab CI (`GITLAB_CI`)
- Jenkins (`JENKINS_URL`)
- CircleCI (`CIRCLECI`)
- Generic CI (`CI`)

Git information (commit SHA, branch name) is also automatically extracted from CI environment variables or the local git repository.

## Example Output

```
[ux.qa] Results published successfully: 42/45 passed (32456ms)
```

With verbose mode enabled:

```
[ux.qa] Starting test run for my-app/e2e
[ux.qa] Test "homepage loads" passed (1234ms)
[ux.qa] Test "login flow" passed (2345ms)
[ux.qa] Publishing results to https://your-uxqa-instance.com/api/runs
[ux.qa] Payload: {
  "appId": "my-app",
  "suite": "e2e",
  "environment": "github",
  "status": "passed",
  "total": 45,
  "passed": 42,
  "failed": 0,
  "skipped": 3,
  "flaky": 0,
  "durationMs": 32456,
  "commit": "abc1234",
  "branch": "main",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
[ux.qa] Results published successfully: 42/45 passed (32456ms)
[ux.qa] Run ID: run_abc123
```

## API Payload

The reporter sends the following payload to `POST /api/runs`:

```typescript
interface RunPayload {
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
  commit?: string;
  branch?: string;
  tags?: string[];
  timestamp: string;
}
```

## License

MIT
