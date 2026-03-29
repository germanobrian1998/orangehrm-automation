# CI/CD Documentation

![Automation Tests](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/test.yml/badge.svg)
![Smoke Tests](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/smoke-tests.yml/badge.svg)
![Regression Tests](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/regression-tests.yml/badge.svg)
![Code Quality](https://github.com/germanobrian1998/orangehrm-automation/actions/workflows/code-quality.yml/badge.svg)

## Overview

This project uses **GitHub Actions** to run automated Playwright tests across multiple browsers on every push and pull request to `main`.

## Workflows

### 1. Automation Tests (`test.yml`)

Triggered on: `push` and `pull_request` to `main`

Runs tests in parallel across **Chromium**, **Firefox**, and **WebKit** using a matrix strategy. Uploads HTML reports and test artifacts for each browser.

| Step | Description |
|------|-------------|
| Checkout | Clone repository |
| Setup Node.js 18 | Install Node with npm cache |
| Install dependencies | `npm ci` |
| Install browsers | `npx playwright install --with-deps` |
| Run tests | `npx playwright test --project=<browser>` |
| Upload artifacts | HTML report + test results (30 days) |

### 2. Smoke Tests (`smoke-tests.yml`)

Triggered on: `push` and `pull_request` to `main`

Runs the `@smoke` tagged test suite on Chromium only. Designed to give fast feedback (≤ 15 minutes).

### 3. Regression Tests (`regression-tests.yml`)

Triggered on: `push` to `main` and nightly at **02:00 UTC**

Full regression suite on Chromium. Reports retained for 14 days.

### 4. Code Quality (`code-quality.yml`)

Triggered on: `pull_request` to `main`

| Check | Command |
|-------|---------|
| ESLint | `npm run lint` |
| TypeScript | `npm run build` |

## Test Execution

```bash
# Run all tests locally
npm test

# Run smoke tests only
npm run test:smoke

# Run regression tests only
npm run test:regression

# Run with UI mode
npm run test:ui

# Run in headed mode
npm run test:headed
```

## Parallel Execution

The Playwright configuration uses `fullyParallel: true` with **2 workers in CI** (`workers: 2`) for faster execution while keeping resource usage predictable. Locally, the worker count defaults to the number of CPU cores.

## Timeouts

| Setting | Value |
|---------|-------|
| Test timeout | 60000 ms |
| Assertion timeout | 10000 ms |
| Action timeout | 10000 ms |
| Navigation timeout | 30000 ms |

## Retries

Tests are retried **twice** in CI (`retries: 2`) to reduce flakiness caused by network variance. No retries are used locally.

## Artifacts

After each run, the following are uploaded to GitHub Actions:

- `playwright-report-<browser>/` – HTML report (30 days)
- `test-results-<browser>/` – Raw test results (30 days)
- `smoke-report/` – Smoke test HTML report (7 days)
- `regression-report/` – Regression HTML report (14 days)

## Branch Protection Rules

- **Required status checks** before merging:
  - `smoke / smoke`
  - `lint / lint`
- Pull request reviews required before merging.
- Stale approvals dismissed when new commits are pushed.

## Local vs CI Differences

| Setting | Local | CI |
|---------|-------|-----|
| Workers | CPU cores | 2 |
| Retries | 0 | 2 |
| `forbidOnly` | false | true |
| Reporters | list + html | list + html |