# 🚀 Load Testing with k6

This document describes how to run performance/load tests for the OrangeHRM automation framework using [k6](https://k6.io/).

---

## 📦 Prerequisites

- **k6** installed locally — see [k6 installation guide](https://k6.io/docs/getting-started/installation/)
- Node.js 18+
- npm dependencies installed (`npm ci`)

### Installing k6 (Linux)

```bash
sudo apt-get update && sudo apt-get install -y k6
```

### Installing k6 (macOS)

```bash
brew install k6
```

### Installing k6 (Windows)

```bash
choco install k6
```

---

## 🧪 Test Scenarios

| Script | Users | Duration | Purpose |
|---|---|---|---|
| `smoke-load.js` | 10 | ~2 min | Baseline load validation |
| `soak-test.js` | 50 | ~9 min | Sustained load / memory leaks |
| `spike-test.js` | 100 | ~2 min | Sudden traffic spikes |
| `stress-test.js` | 100 | ~32 min | Find breaking point |

---

## ▶️ Running Load Tests Locally

### Run individual test scenarios

```bash
# Smoke load test (10 users, ~2 min)
npm run load:smoke

# Soak test (50 users, ~9 min)
npm run load:soak

# Spike test (100 users, ~2 min)
npm run load:spike

# Stress test (gradual ramp to 100 users, ~32 min)
npm run load:stress
```

### Run all scenarios sequentially

```bash
npm run load:all
```

### Run against a specific environment

```bash
# Against staging
npm run load:smoke:staging

# Against any custom URL
BASE_URL=https://my-env.example.com k6 run tests/performance/smoke-load.js
```

### Run with custom credentials

```bash
ADMIN_USER=myuser ADMIN_PASS=mypass npm run load:smoke
```

---

## 📊 Understanding k6 Metrics

k6 reports a rich set of built-in metrics after each run:

| Metric | Description |
|---|---|
| `http_req_duration` | Total time for an HTTP request (latency) |
| `http_req_failed` | Rate of failed requests (non-2xx / network errors) |
| `http_reqs` | Total HTTP requests made |
| `iterations` | Total number of script iterations completed |
| `vus` | Current number of active virtual users |
| `vus_max` | Maximum number of VUs during the test |

### Key percentiles

- **p(50)** — Median response time (50% of requests were faster)
- **p(95)** — 95th percentile (95% of requests were faster than this value)
- **p(99)** — 99th percentile (99% of requests were faster than this value)

---

## 🎯 Interpreting Results

### Thresholds (pass/fail criteria)

Each test script defines thresholds that determine whether the test passes:

```javascript
export const options = {
  thresholds: {
    http_req_duration: ['p(95)<500', 'p(99)<1000'],  // 95th pct < 500ms, 99th pct < 1000ms
    http_req_failed: ['rate<0.1'],                     // Error rate < 10%
  },
};
```

When a threshold is breached, k6 exits with a non-zero exit code, causing CI to fail.

### Baseline metrics

Baseline thresholds are defined in `tests/performance/baselines.json`:

```json
{
  "smoke-load": {
    "http_req_duration": { "p95": 500, "p99": 1000 },
    "http_req_failed": { "rate": 0.1 }
  }
}
```

Compare current run results against these baselines to detect regressions.

---

## 📈 Saving Results

### JSON output

```bash
k6 run --out json=k6-results/smoke-results.json tests/performance/smoke-load.js
```

### CSV output

```bash
k6 run --out csv=k6-results/smoke-results.csv tests/performance/smoke-load.js
```

### HTML report (via k6-reporter)

```bash
k6 run --out json=k6-results/results.json tests/performance/smoke-load.js
```

---

## 🔔 Setting Up Alerts

You can configure threshold-based alerting by integrating k6 results with:

- **Grafana + InfluxDB** — Real-time dashboards
- **DataDog** — `k6 run --out datadog tests/performance/smoke-load.js`
- **GitHub Actions** — Workflow fails automatically when thresholds are breached

---

## ⚙️ CI/CD Integration

Load tests run automatically via GitHub Actions (`.github/workflows/load-testing.yml`):

- **Schedule**: Daily at 2:00 AM UTC
- **Trigger**: Also available via `workflow_dispatch` (manual trigger)
- **Artifacts**: Results uploaded and retained for 90 days

### Triggering manually

1. Go to **Actions** tab in GitHub
2. Select **Load Testing** workflow
3. Click **Run workflow**

---

## 🗂️ File Structure

```
tests/performance/
├── lib/
│   └── helpers.js          # OrangeHRMClient helper class
├── smoke-load.js           # Smoke load test (10 users)
├── soak-test.js            # Soak test (50 users, sustained)
├── spike-test.js           # Spike test (100 users burst)
├── stress-test.js          # Stress test (gradual ramp to 100)
├── baselines.json          # Baseline performance thresholds
└── results/                # Created at runtime (gitignored)

.github/workflows/
└── load-testing.yml        # Scheduled CI workflow

docs/
└── LOAD-TESTING.md         # This file
```

---

## 🛠️ Helper Class: OrangeHRMClient

The `tests/performance/lib/helpers.js` module exports an `OrangeHRMClient` class that wraps common API operations:

```javascript
import { OrangeHRMClient } from './lib/helpers.js';

const client = new OrangeHRMClient('https://opensource-demo.orangehrmlive.com');

export default function () {
  client.authenticate('Admin', 'admin123');
  const res = client.getEmployees();
  check(res, { 'employees ok': (r) => r.status === 200 });
}
```

### Available methods

| Method | Description |
|---|---|
| `authenticate(username, password)` | Obtains an OAuth token |
| `getAuthHeaders()` | Returns headers with Bearer token |
| `getEmployees()` | GET `/api/v2/employees` |
| `createEmployee(data)` | POST `/api/v2/employees` |
| `deleteEmployee(id)` | DELETE `/api/v2/employees/:id` |
