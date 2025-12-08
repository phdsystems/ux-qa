# UX.QA

Reusable Playwright E2E automation hub with an API-driven dashboard. It accepts test run payloads over HTTP, renders live status cards, and can export metrics to Prometheus or InfluxDB for fleet-wide observability.

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              UX.QA Ecosystem                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  ┌──────────────────┐    ┌──────────────────┐    ┌──────────────────┐       │
│  │  Your Project    │    │  Your Project    │    │  Your Project    │       │
│  │  (Playwright)    │    │  (Playwright)    │    │  (Playwright)    │       │
│  └────────┬─────────┘    └────────┬─────────┘    └────────┬─────────┘       │
│           │                       │                       │                  │
│           │ @ux.qa/reporter       │ @ux.qa/reporter       │ @ux.qa/reporter │
│           │                       │                       │                  │
│           └───────────────────────┼───────────────────────┘                  │
│                                   │                                          │
│                                   ▼                                          │
│                        ┌─────────────────────┐                               │
│                        │   POST /api/runs    │                               │
│                        └──────────┬──────────┘                               │
│                                   │                                          │
│                                   ▼                                          │
│  ┌───────────────────────────────────────────────────────────────────────┐  │
│  │                         UX.QA Dashboard                                │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐  ┌─────────────┐   │  │
│  │  │  Run Cards  │  │   Charts    │  │  Artifacts  │  │   Alerts    │   │  │
│  │  └─────────────┘  └─────────────┘  └─────────────┘  └─────────────┘   │  │
│  └───────────────────────────────────────────────────────────────────────┘  │
│                                   │                                          │
│           ┌───────────────────────┼───────────────────────┐                  │
│           │                       │                       │                  │
│           ▼                       ▼                       ▼                  │
│  ┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐          │
│  │   Prometheus    │    │    InfluxDB     │    │    Webhooks     │          │
│  │   /api/metrics  │    │   (streaming)   │    │  (Slack, etc)   │          │
│  └─────────────────┘    └─────────────────┘    └─────────────────┘          │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────────────────────┐
│                             NPM Packages                                     │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                              │
│  @ux.qa/reporter                    @ux.qa/scanner                          │
│  ├── Playwright Reporter            ├── Component Scanner CLI               │
│  ├── Auto CI detection              ├── React/TypeScript analysis           │
│  ├── Git info extraction            ├── Props, hooks, state detection       │
│  └── HTTP POST to dashboard         └── JSON/Console/Markdown output        │
│                                                                              │
└─────────────────────────────────────────────────────────────────────────────┘
```

## Packages

| Package | Description | Install |
|---------|-------------|---------|
| `@ux.qa/reporter` | Playwright reporter - auto-publishes test results | `npm i @ux.qa/reporter` |
| `@ux.qa/scanner` | Component scanner CLI - analyzes React codebases | `npm i -g @ux.qa/scanner` |

## Features

- API-first contract (`POST /api/runs`) so any CI pipeline can push Playwright (or other) test telemetry.
- Reusable dashboard UI (Next.js + Bun) with trend charts, filters, and drill-down views per application/suite.
- Optional Prometheus metrics endpoint (`/api/metrics/prometheus`) plus InfluxDB writes triggered on every run.
- Pluggable storage layer (in-memory by default, file-based persistence with `UXQA_STORAGE=file`).
- Live updates: clients subscribe to `/api/events` (Server-Sent Events) so new runs appear instantly without page reloads.
- Alerting hooks: configure `ALERT_WEBHOOK_URL` (and optional `ALERT_COVERAGE_THRESHOLD`) to raise notifications whenever a run fails/turns unstable or dips below the coverage threshold.
- API key auth: set `UXQA_API_KEY` to require `x-uxqa-key` on all API calls (runs, events, metrics).
- Optional RBAC: set `UXQA_RBAC` (e.g. `admin:editor|viewer`) and send `x-uxqa-role` header to gate settings modifications. Datadog support via `DATADOG_API_KEY`/`DATADOG_SITE`. GraphQL endpoint available at `/api/graphql` for basic queries.
- Inline artifact viewer on `/apps/{appId}` pages to browse Playwright screenshots/videos without leaving the dashboard.
- Generated test-case suggestions per suite (`/apps/{appId}` UI and `/api/apps/{appId}/testcases`).
- Customizable dashboard widgets via `/api/settings` and the UI toggle chips (hide/show KPI cards, charts, histograms) plus advanced analytics (failure hotspots table) and saved filter sets.
- Theming controls (dark/light/auto) stored in settings so teams can match branding or embed the hub.

## Getting Started

### 1. Start the Dashboard

```bash
cd ux.qa
bun install
bun run dev
```

Access http://localhost:3200 (configure via `PORT`).

### 2. Integrate with Playwright

Install the reporter in your Playwright project:

```bash
npm install @ux.qa/reporter
```

Add to `playwright.config.ts`:

```typescript
import { defineConfig } from '@playwright/test';

export default defineConfig({
  reporter: [
    ['html'],
    ['@ux.qa/reporter', {
      hubUrl: 'http://localhost:3200',  // Your UX.QA instance
      appId: 'my-frontend-app',         // Unique app identifier
      suite: 'e2e',                     // Test suite name
      // apiKey: process.env.UXQA_API_KEY  // Optional: for auth
    }]
  ]
});
```

Run your tests:

```bash
npx playwright test
```

Results automatically appear in the dashboard.

### 3. Reporter Flow

```
┌─────────────────────────────────────────────────────────────────┐
│                      Playwright Test Run                         │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  Test Start → onBegin()                                          │
│      │        └── Initialize counters, record start time         │
│      │                                                           │
│      ▼                                                           │
│  Each Test → onTestEnd()                                         │
│      │        └── Track: title, status, duration, errors         │
│      │        └── Update: passed/failed/skipped/flaky counts     │
│      │                                                           │
│      ▼ (repeats)                                                 │
│                                                                  │
│  All Done → onEnd()                                              │
│              └── Aggregate results                               │
│              └── Auto-detect: git commit, branch, CI environment │
│              └── POST to /api/runs                               │
│                                                                  │
└─────────────────────────────────────────────────────────────────┘
```

### Reporter Options

| Option | Type | Required | Default | Description |
|--------|------|----------|---------|-------------|
| `appId` | `string` | Yes | - | Your application identifier |
| `hubUrl` | `string` | No | `http://localhost:3000` | URL of your UX.QA instance |
| `suite` | `string` | No | `'e2e'` | Test suite name |
| `environment` | `string` | No | auto-detected | Environment (ci, github, gitlab, etc.) |
| `apiKey` | `string` | No | - | API key for auth (or use `UXQA_API_KEY` env) |
| `verbose` | `boolean` | No | `false` | Enable detailed logging |
| `tags` | `string[]` | No | - | Custom tags for the run |
| `timeout` | `number` | No | `10000` | API request timeout (ms) |

## API

### POST /api/runs

```json
{
  "appId": "call-centre-frontend",
  "suite": "dashboard-e2e",
  "environment": "ci",
  "status": "passed",
  "total": 12,
  "passed": 12,
  "failed": 0,
  "durationMs": 187000,
  "coverage": 87.2,
  "commit": "bd0a9dd",
  "artifactUrl": "https://storage/run-123/index.html"
}
```

### GET /api/runs

Returns the latest test runs grouped by application.

> **Auth**: If `UXQA_API_KEY` is set, include `x-uxqa-key: {value}` on every request (POST/GET/events/metrics). Responses also include `x-uxqa-key-required: true` when auth is enabled.

### GET /api/events (SSE)

Server-Sent Events stream that pushes full history on connect (`event: bootstrap`) and every subsequent run (`event: run`). The dashboard uses it for live updates; other apps can subscribe for real-time automation signals.

### Node/Bun helper

You can also import the lightweight client helper (ESM) to publish runs directly from your Playwright scripts:

```ts
import { publishRun } from "./lib/client"; // adjust path if consuming from another repo

await publishRun("https://hub.example.com", {
  appId: "call-centre-frontend",
  suite: "dashboard-e2e",
  environment: "ci",
  status: "passed",
  total: 12,
  passed: 12,
  failed: 0,
  durationMs: 187_000,
  coverage: 87.2,
});
```

The helper simply POSTs to `/api/runs`, so it respects the same payload structure.

## Telemetry

Telemetry export is controlled via `UXQA_TELEMETRY` (default `prometheus`). Accepted values:

| Value | Behaviour |
|-------|-----------|
| `prometheus` | Built-in Prometheus exporter enabled (default) |
| `influx` | Only InfluxDB streaming enabled |
| `both` | Prometheus exporter + Influx streaming |
| `none` | Disable telemetry entirely |

Additional env vars:

- `PROMETHEUS_ENABLED=true/false` (optional override) exposes counters/gauges under `/api/metrics/prometheus`.
- `INFLUX_URL`, `INFLUX_TOKEN`, `INFLUX_ORG`, `INFLUX_BUCKET` configure InfluxDB writes (required when telemetry includes Influx).

## Storage Drivers

The hub uses an in-memory buffer by default (fastest for local dev). Configure alternatives through env vars:

| Env | Description |
|-----|-------------|
| `UXQA_STORAGE=memory` | Default in-memory circular buffer |
| `UXQA_STORAGE=file` | Persists to JSON file (`UXQA_DATA_FILE` or `./uiqa-data/runs.json`) |
| `UXQA_MAX_RUNS=200` | Maximum runs to retain across any driver |

Implementing additional drivers (Redis, Postgres, etc.) only requires exporting the same interface from `lib/storage/` and toggling this env.

## Component Scanner (@ux.qa/scanner)

The scanner CLI analyzes React/TypeScript codebases to inventory components, their props, hooks, and state usage.

### Installation

```bash
npm install -g @ux.qa/scanner
# or locally
npm install @ux.qa/scanner
```

### Usage

```bash
# Scan current directory
uxqa-scanner .

# Scan specific path with JSON output
uxqa-scanner ./src/components --format json

# Output to file
uxqa-scanner ./src --format json --output components.json

# Markdown report
uxqa-scanner ./src --format markdown --output COMPONENTS.md
```

### Output Formats

| Format | Description |
|--------|-------------|
| `console` | Human-readable terminal output (default) |
| `json` | Machine-readable JSON for CI pipelines |
| `markdown` | Documentation-ready markdown tables |

### Example JSON Output

```json
{
  "components": [
    {
      "name": "Button",
      "file": "src/components/Button.tsx",
      "line": 15,
      "props": ["variant", "size", "disabled", "onClick"],
      "hooks": ["useState", "useCallback"],
      "state": ["isLoading"],
      "complexity": "medium"
    }
  ],
  "summary": {
    "totalComponents": 42,
    "totalProps": 156,
    "totalHooks": 89,
    "avgPropsPerComponent": 3.7
  }
}
```

### Programmatic API

```typescript
import { scanDirectory, formatOutput } from '@ux.qa/scanner';

const results = await scanDirectory('./src/components', {
  include: ['**/*.tsx'],
  exclude: ['**/*.test.tsx', '**/*.stories.tsx']
});

console.log(formatOutput(results, 'json'));
```

## Folder Layout

```
ux.qa/
├── app/                    # Next.js App Router UI + route handlers
├── components/
│   ├── dashboard/          # Dashboard widgets (RunDashboard, charts)
│   └── apps/               # App-specific widgets (ArtifactViewer)
├── lib/                    # In-memory data store and telemetry exporters
│   ├── storage/            # Storage drivers (memory, file)
│   └── telemetry/          # Prometheus and Influx helpers
├── content/help/           # Help center markdown articles
├── public/ui-templates/    # Reference HTML mocks/design templates
└── packages/
    ├── reporter/           # @ux.qa/reporter - Playwright reporter
    │   ├── src/
    │   │   ├── reporter.ts # Main reporter class
    │   │   ├── types.ts    # TypeScript interfaces
    │   │   └── index.ts    # Package exports
    │   └── tests/
    └── scanner/            # @ux.qa/scanner - Component scanner CLI
        ├── src/
        │   ├── scanner.ts  # Component analysis logic
        │   ├── parser.ts   # Babel AST parsing
        │   ├── formatter.ts# Output formatters
        │   └── cli.ts      # CLI entry point
        └── tests/
```

## Reuse

Other apps integrate by calling the REST API or embedding the dashboard via iframe. The store layer is framework-agnostic, so you can import `@/lib/client` to push runs directly from Node scripts if you host the hub alongside Playwright.

## Help Center

- Markdown articles live under `content/help/` (indexed by `index.json`, with optional role allowlists).
- The `/help` page lists all articles; `/help/[slug]` renders each Markdown file with GitHub-flavored markup.
- Use this space for internal runbooks (e.g., dev-only guides), integration templates, or embedding additional UI references. Articles marked with `"roles": ["dev"]` require callers to send `x-uxqa-role=dev` alongside the API key.
- `/admin/*` routes (and any admin/help tooling) are guarded by both NGINX and the built-in Next middleware. Set `UXQA_ADMIN_ROLE` so the middleware knows which role is required; unauthorized requests receive 401/redirects before React components render.

## UI Design Guide

UX.QA follows a dark-first aesthetic with high-contrast surfaces. Use the following guidelines when contributing new components:

- Surfaces: `var(--surface)` with `var(--border)` outlines. Keep border radius at 16–20px for cards.
- Typography: Inter 400/600 with uppercase tracking for section headings.
- Charts: Use blue (`#38bdf8`) for coverage, pink (`#f472b6`) for duration, green (`#34d399`) for pass state.
- Spacing: Cards use 16–24px padding; grid gaps at 16px.
- Light theme: rely on CSS variables (`[data-theme="light"]`) for palette adjustments.

### Templates

- `public/mock-dashboard.html` – Quick reference layout showcasing all widgets (KPI, timeline, histograms).
- `public/ui-templates/help-card.html` *(example placeholder)* – Add more HTML snippets for reusable sections (filters, help cards, failure tables) as needed.
## Alerting

- Set `ALERT_WEBHOOK_URL=https://hooks.slack.com/...` (or any JSON webhook endpoint). The hub will POST a payload whenever a run finishes with `status = failed|unstable` or when `coverage < ALERT_COVERAGE_THRESHOLD` (if configured).
- Optional `ALERT_COVERAGE_THRESHOLD=85` enforces a minimum percentage; leave unset or `0` to disable coverage-based alerts.
