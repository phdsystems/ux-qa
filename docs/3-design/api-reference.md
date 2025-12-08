# API Reference

## TLDR

- REST API for test run submission and retrieval
- SSE endpoint for real-time updates
- Prometheus-compatible metrics endpoint
- Optional API key authentication via `x-uxqa-key` header

## Table of Contents

1. [Base URL](#base-url)
2. [Authentication](#authentication)
3. [Endpoints](#endpoints)
4. [Error Handling](#error-handling)
5. [Examples](#examples)

## Base URL

```
http://localhost:3200/api
```

Configure via `UXQA_PORT` environment variable.

## Authentication

Authentication is **optional** and disabled by default for local development.

### Enable Authentication

Set `UXQA_API_KEY` environment variable:

```bash
UXQA_API_KEY=your-secret-key bun run dev
```

### Using API Key

Include in request header:

```http
x-uxqa-key: your-secret-key
```

## Endpoints

### POST /api/runs

Submit a new test run.

**Request:**

```http
POST /api/runs HTTP/1.1
Content-Type: application/json
x-uxqa-key: optional-api-key

{
  "appId": "my-app",
  "suite": "e2e",
  "status": "passed",
  "passed": 45,
  "failed": 0,
  "skipped": 2,
  "flaky": 1,
  "total": 48,
  "duration": 125000,
  "git": {
    "commit": "abc123",
    "branch": "main"
  },
  "ci": "github"
}
```

**Response:**

```json
{
  "id": "run_1234567890",
  "appId": "my-app",
  "suite": "e2e",
  "status": "passed",
  "passed": 45,
  "failed": 0,
  "skipped": 2,
  "flaky": 1,
  "total": 48,
  "duration": 125000,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "git": {
    "commit": "abc123",
    "branch": "main"
  },
  "ci": "github"
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 201 | Run created successfully |
| 400 | Invalid request body |
| 401 | Invalid or missing API key |
| 500 | Server error |

**Request Body Schema:**

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| `appId` | string | Yes | Application identifier |
| `suite` | string | Yes | Test suite name |
| `status` | string | Yes | Overall status: `passed`, `failed`, `flaky`, `skipped` |
| `passed` | number | Yes | Count of passed tests |
| `failed` | number | Yes | Count of failed tests |
| `skipped` | number | Yes | Count of skipped tests |
| `flaky` | number | Yes | Count of flaky tests |
| `total` | number | Yes | Total test count |
| `duration` | number | Yes | Duration in milliseconds |
| `git` | object | No | Git context |
| `git.commit` | string | No | Commit SHA |
| `git.branch` | string | No | Branch name |
| `git.message` | string | No | Commit message |
| `git.author` | string | No | Commit author |
| `ci` | string | No | CI environment name |

---

### GET /api/runs

Retrieve test runs.

**Request:**

```http
GET /api/runs HTTP/1.1
x-uxqa-key: optional-api-key
```

**Query Parameters:**

| Parameter | Type | Description |
|-----------|------|-------------|
| `appId` | string | Filter by application |
| `suite` | string | Filter by suite |
| `status` | string | Filter by status |
| `limit` | number | Max results (default: 100) |
| `offset` | number | Pagination offset |

**Response:**

```json
{
  "runs": [
    {
      "id": "run_1234567890",
      "appId": "my-app",
      "suite": "e2e",
      "status": "passed",
      "passed": 45,
      "failed": 0,
      "skipped": 2,
      "flaky": 1,
      "total": 48,
      "duration": 125000,
      "timestamp": "2024-01-15T10:30:00.000Z"
    }
  ],
  "total": 150,
  "limit": 100,
  "offset": 0
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Invalid or missing API key |
| 500 | Server error |

---

### GET /api/runs/:id

Retrieve a specific test run.

**Request:**

```http
GET /api/runs/run_1234567890 HTTP/1.1
x-uxqa-key: optional-api-key
```

**Response:**

```json
{
  "id": "run_1234567890",
  "appId": "my-app",
  "suite": "e2e",
  "status": "passed",
  "passed": 45,
  "failed": 0,
  "skipped": 2,
  "flaky": 1,
  "total": 48,
  "duration": 125000,
  "timestamp": "2024-01-15T10:30:00.000Z",
  "git": {
    "commit": "abc123",
    "branch": "main"
  },
  "ci": "github"
}
```

**Status Codes:**

| Code | Description |
|------|-------------|
| 200 | Success |
| 401 | Invalid or missing API key |
| 404 | Run not found |
| 500 | Server error |

---

### GET /api/events

Server-Sent Events endpoint for real-time updates.

**Request:**

```http
GET /api/events HTTP/1.1
Accept: text/event-stream
x-uxqa-key: optional-api-key
```

**Response:**

```
event: bootstrap
data: {"runs":[...]}

event: run
data: {"id":"run_123","appId":"my-app",...}

event: run
data: {"id":"run_124","appId":"my-app",...}
```

**Event Types:**

| Event | Description | Data |
|-------|-------------|------|
| `bootstrap` | Initial state on connect | `{ runs: Run[] }` |
| `run` | New run created | `Run` object |
| `ping` | Keep-alive (every 30s) | Empty |

**Usage Example:**

```javascript
const events = new EventSource('/api/events');

events.addEventListener('bootstrap', (e) => {
  const { runs } = JSON.parse(e.data);
  console.log('Initial runs:', runs);
});

events.addEventListener('run', (e) => {
  const run = JSON.parse(e.data);
  console.log('New run:', run);
});

events.onerror = () => {
  console.log('Connection lost, reconnecting...');
};
```

---

### GET /api/metrics/prometheus

Prometheus-compatible metrics endpoint.

**Request:**

```http
GET /api/metrics/prometheus HTTP/1.1
```

**Response:**

```
# HELP uxqa_test_runs_total Total number of test runs
# TYPE uxqa_test_runs_total counter
uxqa_test_runs_total{app="my-app",suite="e2e",status="passed"} 42
uxqa_test_runs_total{app="my-app",suite="e2e",status="failed"} 3

# HELP uxqa_test_duration_seconds Test run duration in seconds
# TYPE uxqa_test_duration_seconds histogram
uxqa_test_duration_seconds_bucket{app="my-app",le="60"} 10
uxqa_test_duration_seconds_bucket{app="my-app",le="120"} 35
uxqa_test_duration_seconds_bucket{app="my-app",le="300"} 45
uxqa_test_duration_seconds_bucket{app="my-app",le="+Inf"} 45

# HELP uxqa_tests_passed Number of passed tests
# TYPE uxqa_tests_passed gauge
uxqa_tests_passed{app="my-app",suite="e2e"} 45

# HELP uxqa_tests_failed Number of failed tests
# TYPE uxqa_tests_failed gauge
uxqa_tests_failed{app="my-app",suite="e2e"} 0

# HELP uxqa_tests_flaky Number of flaky tests
# TYPE uxqa_tests_flaky gauge
uxqa_tests_flaky{app="my-app",suite="e2e"} 1
```

**Metrics:**

| Metric | Type | Labels | Description |
|--------|------|--------|-------------|
| `uxqa_test_runs_total` | counter | app, suite, status | Total runs |
| `uxqa_test_duration_seconds` | histogram | app | Run duration |
| `uxqa_tests_passed` | gauge | app, suite | Passed count |
| `uxqa_tests_failed` | gauge | app, suite | Failed count |
| `uxqa_tests_flaky` | gauge | app, suite | Flaky count |
| `uxqa_tests_skipped` | gauge | app, suite | Skipped count |

## Error Handling

### Error Response Format

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid request body",
    "details": {
      "field": "appId",
      "issue": "required"
    }
  }
}
```

### Error Codes

| Code | HTTP Status | Description |
|------|-------------|-------------|
| `VALIDATION_ERROR` | 400 | Invalid request body |
| `UNAUTHORIZED` | 401 | Missing or invalid API key |
| `NOT_FOUND` | 404 | Resource not found |
| `INTERNAL_ERROR` | 500 | Server error |

## Examples

### cURL - Submit Run

```bash
curl -X POST http://localhost:3200/api/runs \
  -H "Content-Type: application/json" \
  -d '{
    "appId": "my-app",
    "suite": "e2e",
    "status": "passed",
    "passed": 10,
    "failed": 0,
    "skipped": 0,
    "flaky": 0,
    "total": 10,
    "duration": 30000
  }'
```

### cURL - Get Runs

```bash
curl http://localhost:3200/api/runs?appId=my-app&limit=10
```

### cURL - SSE Connection

```bash
curl -N http://localhost:3200/api/events
```

### JavaScript - Full Integration

```javascript
// Submit run
const response = await fetch('/api/runs', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-uxqa-key': 'your-api-key'
  },
  body: JSON.stringify({
    appId: 'my-app',
    suite: 'e2e',
    status: 'passed',
    passed: 10,
    failed: 0,
    skipped: 0,
    flaky: 0,
    total: 10,
    duration: 30000
  })
});

const run = await response.json();
console.log('Created run:', run.id);

// Subscribe to updates
const events = new EventSource('/api/events');
events.addEventListener('run', (e) => {
  console.log('New run:', JSON.parse(e.data));
});
```

### Prometheus Scrape Config

```yaml
scrape_configs:
  - job_name: 'uxqa'
    static_configs:
      - targets: ['localhost:3200']
    metrics_path: '/api/metrics/prometheus'
    scrape_interval: 30s
```
