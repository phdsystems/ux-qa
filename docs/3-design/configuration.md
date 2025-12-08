# Configuration

## TLDR

- Dashboard configured via environment variables
- Reporter configured via `playwright.config.ts` options
- Scanner configured via CLI flags or `.uxqarc` file
- All components support sensible defaults for zero-config usage

## Table of Contents

1. [Dashboard Configuration](#dashboard-configuration)
2. [Reporter Configuration](#reporter-configuration)
3. [Scanner Configuration](#scanner-configuration)
4. [Configuration Files](#configuration-files)

## Dashboard Configuration

Environment variables for the Next.js dashboard.

### Server

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3200` | HTTP server port |
| `UXQA_PORT` | `3200` | Alternative port variable |
| `NODE_ENV` | `development` | Environment mode |

### Authentication

| Variable | Default | Description |
|----------|---------|-------------|
| `UXQA_API_KEY` | - | API key for authentication (optional) |

When set, all API requests must include `x-uxqa-key` header.

### Storage

| Variable | Default | Description |
|----------|---------|-------------|
| `UXQA_STORAGE` | `memory` | Storage driver: `memory`, `file` |
| `UXQA_STORAGE_PATH` | `./data/runs.json` | File storage path |

### Telemetry

| Variable | Default | Description |
|----------|---------|-------------|
| `UXQA_TELEMETRY` | - | Telemetry driver: `prometheus`, `influx`, `datadog` |
| `UXQA_INFLUX_URL` | - | InfluxDB server URL |
| `UXQA_INFLUX_TOKEN` | - | InfluxDB auth token |
| `UXQA_INFLUX_ORG` | - | InfluxDB organization |
| `UXQA_INFLUX_BUCKET` | `uxqa` | InfluxDB bucket |
| `UXQA_DATADOG_API_KEY` | - | Datadog API key |

### Alerting

| Variable | Default | Description |
|----------|---------|-------------|
| `UXQA_WEBHOOK_URL` | - | Webhook URL for alerts |
| `UXQA_SLACK_WEBHOOK` | - | Slack webhook URL |
| `UXQA_ALERT_ON_FAILURE` | `true` | Alert on test failures |
| `UXQA_COVERAGE_THRESHOLD` | - | Min coverage % to alert |

### Example .env

```bash
# .env.local
PORT=3200
UXQA_API_KEY=your-secret-key
UXQA_STORAGE=file
UXQA_STORAGE_PATH=./data/runs.json
UXQA_TELEMETRY=prometheus
UXQA_WEBHOOK_URL=https://hooks.slack.com/services/xxx
```

## Reporter Configuration

Options passed to `@ux.qa/reporter` in Playwright config.

### Options

```typescript
interface UxQaReporterOptions {
    // Required
    hubUrl: string;      // Dashboard URL
    appId: string;       // Application identifier
    suite: string;       // Test suite name

    // Optional
    apiKey?: string;     // API key for authentication
    ci?: string;         // CI environment (auto-detected)
    timeout?: number;    // Request timeout in ms (default: 5000)
    retries?: number;    // Publish retry attempts (default: 3)
}
```

### Option Details

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `hubUrl` | string | Yes | - | Dashboard API URL |
| `appId` | string | Yes | - | Unique application ID |
| `suite` | string | Yes | - | Test suite identifier |
| `apiKey` | string | No | - | Authentication key |
| `ci` | string | No | auto | CI environment name |
| `timeout` | number | No | 5000 | HTTP request timeout |
| `retries` | number | No | 3 | Retry attempts on failure |

### CI Auto-Detection

The reporter automatically detects CI environment from variables:

| CI System | Detection Variable | CI Value |
|-----------|-------------------|----------|
| GitHub Actions | `GITHUB_ACTIONS` | `github` |
| GitLab CI | `GITLAB_CI` | `gitlab` |
| Jenkins | `JENKINS_URL` | `jenkins` |
| CircleCI | `CIRCLECI` | `circleci` |
| Azure Pipelines | `TF_BUILD` | `azure` |
| Travis CI | `TRAVIS` | `travis` |
| Bitbucket Pipelines | `BITBUCKET_BUILD_NUMBER` | `bitbucket` |

### Usage Examples

**Basic:**

```typescript
// playwright.config.ts
export default defineConfig({
  reporter: [
    ['@ux.qa/reporter', {
      hubUrl: 'http://localhost:3200',
      appId: 'my-app',
      suite: 'e2e'
    }]
  ]
});
```

**With Authentication:**

```typescript
export default defineConfig({
  reporter: [
    ['@ux.qa/reporter', {
      hubUrl: process.env.UXQA_URL,
      appId: 'my-app',
      suite: 'e2e',
      apiKey: process.env.UXQA_API_KEY
    }]
  ]
});
```

**Multiple Suites:**

```typescript
export default defineConfig({
  projects: [
    {
      name: 'e2e',
      testDir: './tests/e2e',
    },
    {
      name: 'integration',
      testDir: './tests/integration',
    }
  ],
  reporter: [
    ['@ux.qa/reporter', {
      hubUrl: 'http://localhost:3200',
      appId: 'my-app',
      suite: process.env.TEST_SUITE || 'e2e'
    }]
  ]
});
```

**Environment-Based:**

```typescript
const isCI = process.env.CI === 'true';

export default defineConfig({
  reporter: [
    ['html'],
    ...(isCI ? [
      ['@ux.qa/reporter', {
        hubUrl: 'https://uxqa.company.com',
        appId: 'my-app',
        suite: 'e2e',
        apiKey: process.env.UXQA_API_KEY
      }]
    ] : [])
  ]
});
```

## Scanner Configuration

CLI options for `@ux.qa/scanner`.

### CLI Options

```bash
uxqa-scan [options] <directory>
```

| Option | Short | Default | Description |
|--------|-------|---------|-------------|
| `--output` | `-o` | `table` | Output format: `json`, `table`, `markdown` |
| `--include` | `-i` | `**/*.{tsx,jsx}` | Glob pattern for files |
| `--exclude` | `-e` | `node_modules/**` | Glob pattern to exclude |
| `--props` | `-p` | `false` | Include prop analysis |
| `--hooks` | `-h` | `false` | Include hook analysis |
| `--depth` | `-d` | `Infinity` | Max directory depth |
| `--config` | `-c` | `.uxqarc` | Config file path |

### Usage Examples

**Basic Scan:**

```bash
uxqa-scan ./src
```

**JSON Output:**

```bash
uxqa-scan ./src -o json > components.json
```

**With Props and Hooks:**

```bash
uxqa-scan ./src --props --hooks
```

**Custom Include Pattern:**

```bash
uxqa-scan ./src -i "components/**/*.tsx"
```

**Exclude Patterns:**

```bash
uxqa-scan ./src -e "**/*.test.tsx" -e "**/*.stories.tsx"
```

## Configuration Files

### .uxqarc

JSON configuration file for scanner defaults.

```json
{
  "include": ["**/*.tsx", "**/*.jsx"],
  "exclude": [
    "node_modules/**",
    "**/*.test.tsx",
    "**/*.stories.tsx"
  ],
  "output": "table",
  "props": true,
  "hooks": true
}
```

### .uxqarc.yaml

YAML alternative:

```yaml
include:
  - "**/*.tsx"
  - "**/*.jsx"
exclude:
  - "node_modules/**"
  - "**/*.test.tsx"
  - "**/*.stories.tsx"
output: table
props: true
hooks: true
```

### package.json

Configuration can also be in package.json:

```json
{
  "uxqa": {
    "scanner": {
      "include": ["**/*.tsx"],
      "output": "json"
    }
  }
}
```

### Configuration Precedence

1. CLI arguments (highest)
2. Environment variables
3. `.uxqarc` / `.uxqarc.yaml`
4. `package.json` uxqa field
5. Built-in defaults (lowest)

## Environment Variable Reference

### Complete List

```bash
# Dashboard Server
PORT=3200
NODE_ENV=production

# Authentication
UXQA_API_KEY=your-secret-key

# Storage
UXQA_STORAGE=file
UXQA_STORAGE_PATH=./data/runs.json

# Telemetry - Prometheus
UXQA_TELEMETRY=prometheus

# Telemetry - InfluxDB
UXQA_TELEMETRY=influx
UXQA_INFLUX_URL=http://localhost:8086
UXQA_INFLUX_TOKEN=your-token
UXQA_INFLUX_ORG=your-org
UXQA_INFLUX_BUCKET=uxqa

# Telemetry - Datadog
UXQA_TELEMETRY=datadog
UXQA_DATADOG_API_KEY=your-api-key

# Alerting
UXQA_WEBHOOK_URL=https://hooks.example.com/webhook
UXQA_SLACK_WEBHOOK=https://hooks.slack.com/services/xxx
UXQA_ALERT_ON_FAILURE=true
UXQA_COVERAGE_THRESHOLD=80

# Reporter (via playwright.config.ts or env)
UXQA_HUB_URL=http://localhost:3200
UXQA_APP_ID=my-app
UXQA_SUITE=e2e
```

### Docker Compose Example

```yaml
version: '3.8'
services:
  uxqa:
    image: uxqa/dashboard:latest
    ports:
      - "3200:3200"
    environment:
      - UXQA_STORAGE=file
      - UXQA_STORAGE_PATH=/data/runs.json
      - UXQA_API_KEY=${UXQA_API_KEY}
      - UXQA_TELEMETRY=prometheus
    volumes:
      - uxqa-data:/data

volumes:
  uxqa-data:
```
