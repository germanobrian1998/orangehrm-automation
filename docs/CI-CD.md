# ⚙️ CI/CD Pipeline Guide

Deep dive into the GitHub Actions workflows for the OrangeHRM Automation Suite.

---

## Table of Contents

- [Pipeline Overview](#-pipeline-overview)
- [Workflow Diagrams](#-workflow-diagrams)
- [Workflow Details](#-workflow-details)
- [GitHub Secrets Configuration](#-github-secrets-configuration)
- [Playwright Configuration for CI](#-playwright-configuration-for-ci)
- [Performance Metrics](#-performance-metrics)
- [Manually Triggering Workflows](#-manually-triggering-workflows)
- [Troubleshooting CI Failures](#-troubleshooting-ci-failures)

---

## 🔭 Pipeline Overview

| Workflow             | File                   | Trigger                            | Duration | Purpose                       |
| -------------------- | ---------------------- | ---------------------------------- | -------- | ----------------------------- |
| **Smoke Tests**      | `smoke-tests.yml`      | Push/PR to `main`                  | ~5 min   | Fast gate — blocks broken PRs |
| **Regression Tests** | `regression-tests.yml` | Push to `main` + nightly 02:00 UTC | ~20 min  | Full validation               |
| **Code Quality**     | `code-quality.yml`     | PR to `main`                       | ~2 min   | ESLint + TypeScript           |
| **Full Matrix**      | `test.yml`             | Push/PR to `main`                  | ~25 min  | All tests × 3 browsers        |
| **Monorepo CI**      | `monorepo-ci.yml`      | Push/PR to `main`                  | ~15 min  | Per-package test runs         |
| **CI**               | `ci.yml`               | Push/PR to `main`                  | ~10 min  | Combined CI check             |

### Branch Protection Requirements

Before a PR can merge to `main`, these checks must pass:

- ✅ `smoke / smoke`
- ✅ `lint / lint`

---

## 📊 Workflow Diagrams

### Smoke Tests Flow

```
Push to main / PR opened
          │
          ▼
┌─────────────────────┐
│  Checkout code       │ (2s)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Setup Node.js 18   │ (5s — cached)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  npm ci             │ (30s — node_modules cached)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Install Chromium   │ (5s — browser cached)
└──────────┬──────────┘
           │
           ▼
┌─────────────────────┐
│  Run @smoke tests   │ (~3-4 min, 2 workers)
└──────────┬──────────┘
           │
     ┌─────┴──────┐
     │            │
   PASS          FAIL
     │            │
     ▼            ▼
  ✅ Green     Upload HTML report + screenshots
             ❌ Red (PR blocked)
```

### Full Matrix Flow (test.yml)

```
Push to main / PR opened
          │
          ▼
   ┌──────┴────────────────────────────────┐
   │         Matrix Strategy               │
   │  browser: [chromium, firefox, webkit] │
   └──────┬────────────────────────────────┘
          │
   ┌──────┼──────┐
   ▼      ▼      ▼
[Chromium] [Firefox] [WebKit]  ← Run in PARALLEL
   │         │         │
   └────┬────┴─────────┘
        │
        ▼
  Upload artifacts per browser:
  • playwright-report-chromium/
  • playwright-report-firefox/
  • playwright-report-webkit/
  (retained 30 days)
```

### Regression + Nightly Flow

```
Push to main                   Cron: 02:00 UTC daily
      │                                │
      └─────────────┬─────────────────┘
                    ▼
        ┌───────────────────────┐
        │  Full regression run  │
        │  @regression tests    │
        │  Chromium only        │
        │  ~20 min              │
        └───────────┬───────────┘
                    │
                    ▼
        Upload regression-report/
        (retained 14 days)
```

---

## 📄 Workflow Details

### 1. Smoke Tests (`smoke-tests.yml`)

```yaml
name: Smoke Tests
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  smoke:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps chromium
      - run: npm run test:smoke
        env:
          CI: true
          ORANGEHRM_ADMIN_PASSWORD: ${{ secrets.ORANGEHRM_ADMIN_PASSWORD }}
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: smoke-report
          path: playwright-report/
          retention-days: 7
```

### 2. Code Quality (`code-quality.yml`)

```yaml
name: Code Quality
on:
  pull_request:
    branches: [main]

jobs:
  lint:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npm run lint # ESLint
      - run: npm run build # TypeScript type check
```

### 3. Full Matrix (`test.yml`)

```yaml
name: Full Test Matrix
on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      fail-fast: false # keep running other browsers on failure
      matrix:
        browser: [chromium, firefox, webkit]
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'
      - run: npm ci
      - run: npx playwright install --with-deps ${{ matrix.browser }}
      - run: npx playwright test --project=${{ matrix.browser }}
        env:
          CI: true
      - uses: actions/upload-artifact@v4
        if: always()
        with:
          name: playwright-report-${{ matrix.browser }}
          path: playwright-report/
          retention-days: 30
```

---

## 🔐 GitHub Secrets Configuration

### Setting up secrets

Navigate to: **Repository → Settings → Secrets and variables → Actions**

| Secret                     | Description            | Example Value                               |
| -------------------------- | ---------------------- | ------------------------------------------- |
| `ORANGEHRM_BASE_URL`       | Target application URL | `https://opensource-demo.orangehrmlive.com` |
| `ORANGEHRM_ADMIN_USERNAME` | Admin username         | `Admin`                                     |
| `ORANGEHRM_ADMIN_PASSWORD` | Admin password         | _(set from your .env.local)_                |

### Using secrets in workflows

```yaml
- run: npm run test:smoke
  env:
    ORANGEHRM_BASE_URL: ${{ secrets.ORANGEHRM_BASE_URL }}
    ORANGEHRM_ADMIN_PASSWORD: ${{ secrets.ORANGEHRM_ADMIN_PASSWORD }}
```

Secrets are masked in all logs with `***`. Fork PRs cannot access secrets (security feature).

### Environment-specific secrets

Use [GitHub Environments](https://docs.github.com/en/actions/deployment/targeting-different-environments/using-environments-for-deployment) for staging/production:

```yaml
jobs:
  staging-smoke:
    environment: staging # uses 'staging' environment's secrets
    steps:
      - run: npm run test:smoke
        env:
          ORANGEHRM_BASE_URL: ${{ secrets.STAGING_BASE_URL }}
```

---

## ⚙️ Playwright Configuration for CI

Key `playwright.config.ts` settings that differ between local and CI:

```typescript
export default defineConfig({
  // Fail fast if test.only() was accidentally committed
  forbidOnly: !!process.env.CI,

  // 2 retries in CI (absorbs network flakiness); 0 locally
  retries: process.env.CI ? 2 : 0,

  // 2 workers in CI; auto (CPU count) locally
  workers: process.env.CI ? 2 : undefined,

  use: {
    // Capture trace on first retry — enables step-by-step replay
    trace: 'on-first-retry',

    // Screenshot on failure — visible in HTML report
    screenshot: 'only-on-failure',

    // Video disabled by default (expensive); enable for debugging
    video: 'off',
  },
});
```

---

## 📈 Performance Metrics

| Metric                             | Target   | Current    |
| ---------------------------------- | -------- | ---------- |
| Smoke suite duration               | < 5 min  | ~3-4 min   |
| Regression suite duration          | < 20 min | ~15-18 min |
| Full matrix (3 browsers, parallel) | < 30 min | ~20-25 min |
| Code quality check                 | < 3 min  | ~1-2 min   |
| Browser install (cached)           | < 10 s   | ~5 s       |
| Browser install (cold)             | < 90 s   | ~60 s      |
| npm ci (cached)                    | < 20 s   | ~15 s      |

### Speed optimizations in use

1. **npm cache** — `actions/setup-node` with `cache: 'npm'`
2. **Browser cache** — `~/.cache/ms-playwright` cached by `package-lock.json` hash
3. **Parallel matrix** — 3 browser jobs run simultaneously
4. **2 workers** — tests within a job run in parallel
5. **`on-first-retry` trace** — traces only captured when needed

---

## 🖱️ Manually Triggering Workflows

### Via GitHub UI

1. Go to **Actions** tab
2. Select the workflow (e.g., "Smoke Tests")
3. Click **Run workflow**
4. Select the branch and click **Run workflow**

### Via GitHub CLI

```bash
# Trigger smoke tests on main
gh workflow run smoke-tests.yml --branch main

# Trigger with input parameters (if workflow_dispatch inputs are defined)
gh workflow run regression-tests.yml --branch main --field browser=chromium

# List recent runs
gh run list --workflow smoke-tests.yml

# Watch a running workflow
gh run watch
```

### Via API

```bash
curl -X POST \
  -H "Authorization: Bearer $GITHUB_TOKEN" \
  -H "Accept: application/vnd.github+json" \
  https://api.github.com/repos/germanobrian1998/orangehrm-automation/actions/workflows/smoke-tests.yml/dispatches \
  -d '{"ref":"main"}'
```

---

## 🔧 Troubleshooting CI Failures

### Workflow doesn't trigger

- Check the `on:` triggers in the workflow file match your branch name exactly
- Ensure the workflow YAML is valid: paste into [yaml-lint.com](https://www.yamllint.com/)
- Check Actions is enabled: **Settings → Actions → Allow all actions**

### Tests pass locally, fail in CI

| Cause          | Diagnosis                        | Fix                                        |
| -------------- | -------------------------------- | ------------------------------------------ |
| Missing secret | Check env var is set in workflow | Add GitHub Secret                          |
| Demo site down | Check site status                | Retry workflow                             |
| Race condition | Compare trace with local         | Add `waitForResponse` or `waitForURL`      |
| Worker count   | CI uses 2 workers                | Test locally with `--workers=2`            |
| `forbidOnly`   | `test.only()` in code            | Remove `.only()` or use a different branch |

### Artifacts not appearing

Add `if: always()` to upload steps — without it, artifacts are skipped on failure:

```yaml
- uses: actions/upload-artifact@v4
  if: always() # ← upload even when tests fail
  with:
    name: playwright-report
    path: playwright-report/
```

### Reading CI failure details

1. Click the failed workflow run in GitHub Actions
2. Click the failed job
3. Expand the failing step to see the error
4. Download the `playwright-report` artifact
5. Open `index.html` locally — click the failed test to see:
   - Error message
   - Screenshot at point of failure
   - Playwright trace (if retry happened)

### Re-running failed tests only

GitHub Actions supports re-running only failed jobs:

1. Open the workflow run
2. Click **Re-run failed jobs** (not "Re-run all jobs")

Or via CLI:

```bash
gh run rerun <run-id> --failed
```

---

[← Back to docs/](.) | [SCALABILITY.md](SCALABILITY.md) | [Main README](../README.md)
