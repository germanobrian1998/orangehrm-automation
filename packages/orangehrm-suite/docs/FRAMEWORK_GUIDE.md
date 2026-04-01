# Automation Framework Guide

This guide covers the end-to-end execution model of the OrangeHRM automation framework, including configuration, logging, reporting, parallel execution, and CI/CD integration.

## Table of Contents

- [Test Execution Flow](#test-execution-flow)
- [Configuration System Usage](#configuration-system-usage)
- [Logger Implementation](#logger-implementation)
- [Report Generation](#report-generation)
- [Screenshot and Video Recording](#screenshot-and-video-recording)
- [Parallel Execution Setup](#parallel-execution-setup)
- [CI/CD Integration](#cicd-integration)

---

## Test Execution Flow

### High-level flow

```
npm test
  └─ playwright test
       ├─ Read playwright.config.ts
       ├─ Load environment via Config singleton
       ├─ Spin up workers (parallel)
       │    ├─ Worker 1: run test file A
       │    │    ├─ beforeEach → create Page, inject fixtures
       │    │    ├─ test body → instantiate page objects, interact, assert
       │    │    └─ afterEach → cleanup, take screenshot if failed
       │    └─ Worker 2: run test file B ...
       ├─ Collect results
       └─ Generate HTML report
```

### Fixture injection lifecycle

```typescript
// The extended test from @qa-framework/core injects these fixtures:
test('my test', async ({ page, logger, config, basePage, baseApiClient }) => {
  //                     ^     ^       ^       ^          ^
  //                     |     |       |       |          BaseApiClient bound to page
  //                     |     |       |       BasePage bound to page
  //                     |     |       Config singleton
  //                     |     Logger scoped to this test title
  //                     Playwright Page (per-test browser context)
});
```

### Order of operations in a typical test

1. Playwright opens a new browser context and page.
2. Fixtures are instantiated and injected.
3. `test.beforeEach` hooks run (e.g., login).
4. The test body executes.
5. `test.afterEach` hooks run (e.g., cleanup, logout).
6. On failure: screenshots and traces are captured.
7. The browser context is torn down.

---

## Configuration System Usage

### Accessing configuration

The `Config` singleton is available via the `config` fixture or by importing directly:

```typescript
// Via fixture (recommended in tests)
test('example', async ({ config }) => {
  const url = config.baseURL;
});

// Direct import (in page objects and utilities)
import { config } from '@qa-framework/core';
const timeout = config.testTimeout;
```

### Available configuration properties

| Property | Type | Environment Variable | Default |
|---|---|---|---|
| `baseURL` | `string` | `ORANGEHRM_BASE_URL` | `https://opensource-demo.orangehrmlive.com` |
| `adminUsername` | `string` | `ORANGEHRM_ADMIN_USERNAME` | `Admin` |
| `adminPassword` | `string` | `ORANGEHRM_ADMIN_PASSWORD` | `admin123` |
| `testTimeout` | `number` | `TEST_TIMEOUT` | `30000` |
| `apiTimeout` | `number` | `API_TIMEOUT` | `10000` |
| `logLevel` | `string` | `LOG_LEVEL` | `info` |
| `debug` | `boolean` | `DEBUG` | `false` |
| `isCI` | `boolean` | `CI` | `false` |
| `isDev` | `boolean` | `NODE_ENV` | `true` |
| `browser` | `BrowserName` | `BROWSER` | `chromium` |
| `headless` | `boolean` | `HEADLESS` | `true` |

### Configuration in `playwright.config.ts`

The suite's `playwright.config.ts` reads from the `environment` helper (a thin wrapper around `Config`):

```typescript
import { defineConfig, devices } from '@playwright/test';
import { environment } from '@qa-framework/core';

export default defineConfig({
  timeout: environment.testTimeout,
  retries: environment.isCI ? 2 : 0,
  workers: environment.isCI ? 2 : undefined,
  use: {
    baseURL: environment.baseURL,
    actionTimeout: environment.apiTimeout,
  },
});
```

### Override configuration at runtime

Environment variables can be set inline for a single run:

```bash
BROWSER=firefox HEADLESS=false npm test
TEST_TIMEOUT=60000 npm run test:regression
```

---

## Logger Implementation

### Creating a logger

The `Logger` is a Winston-based logger. Each page object and fixture automatically gets a logger scoped to its class name:

```typescript
// In a page object (automatically created by BasePage)
this.logger.info('Navigating to dashboard');

// In a test (injected via fixture)
test('my test', async ({ logger }) => {
  logger.info('Test started');
});
```

### Log methods

| Method | Description | Example |
|---|---|---|
| `logger.step(n, msg)` | Major numbered test step | `logger.step(1, 'Filling login form')` |
| `logger.info(msg)` | Informational message | `logger.info('✓ Login successful')` |
| `logger.debug(msg)` | Detailed debugging info | `logger.debug('Clicked submit button')` |
| `logger.warn(msg)` | Non-fatal warning | `logger.warn('Element took longer than expected')` |
| `logger.error(msg, err?)` | Error with optional Error object | `logger.error('Login failed', error)` |
| `logger.assertion(passed, msg)` | Log assertion result | `logger.assertion(true, 'User is logged in')` |

### Log output format

Logs are emitted to the console with timestamps and class-name prefixes:

```
[2024-01-15 10:23:45] [LoginPage] STEP 1: Logging in as Admin
[2024-01-15 10:23:46] [LoginPage] INFO  : ✓ Login successful for Admin
[2024-01-15 10:23:46] [DashboardPage] STEP 1: Loading dashboard
```

### Controlling log verbosity

Set `LOG_LEVEL` to control which messages appear:

```bash
LOG_LEVEL=debug npm test    # Show all messages including debug
LOG_LEVEL=warn  npm test    # Show only warnings and errors
```

---

## Report Generation

### Built-in reporters

The suite uses two Playwright reporters configured in `playwright.config.ts`:

```typescript
reporter: [
  ['list'],                          // Real-time console output
  ['html', { open: 'never' }],      // HTML report saved to playwright-report/
],
```

### Viewing the HTML report

After a test run:

```bash
npx playwright show-report
```

This opens an interactive HTML report in your browser showing:
- Test results by suite and file
- Failed test details with error messages
- Attached screenshots and traces

### Adding custom reporters

Playwright supports [custom reporters](https://playwright.dev/docs/test-reporters#custom-reporters). Add them to `playwright.config.ts`:

```typescript
reporter: [
  ['list'],
  ['html', { open: 'never' }],
  ['json', { outputFile: 'test-results/results.json' }],
  ['junit', { outputFile: 'test-results/results.xml' }],
],
```

### Allure reports (optional)

If `allure-playwright` is installed, configure it in `playwright.config.ts`:

```typescript
reporter: [
  ['allure-playwright', { resultsDir: process.env.ALLURE_RESULTS_DIR || './allure-results' }],
],
```

Generate and open the report:

```bash
allure generate allure-results --clean -o allure-report
allure open allure-report
```

---

## Screenshot and Video Recording

### Automatic screenshots on failure

Screenshots are captured automatically when a test fails (configured in `playwright.config.ts`):

```typescript
use: {
  screenshot: 'only-on-failure',  // or 'on' for every test
},
```

### Manual screenshots in page objects

Page objects call `this.screenshot(stepName)` to capture named screenshots at key points:

```typescript
async login(credentials: LoginCredentials): Promise<void> {
  try {
    // ... login actions ...
  } catch (error) {
    await this.screenshot('login_failure');  // → screenshots/LoginPage/login_failure-<timestamp>.png
    throw error;
  }
}
```

### Video recording

Enable video recording in `playwright.config.ts`:

```typescript
use: {
  video: 'retain-on-failure',   // or 'on' for every test
},
```

Videos are saved to `test-results/` and linked in the HTML report.

### Trace recording

Traces capture a full timeline of browser events, DOM snapshots, and network requests:

```typescript
use: {
  trace: 'on-first-retry',   // Capture trace on the first retry only
  // trace: 'on',            // Capture trace for every test
},
```

View traces:

```bash
npx playwright show-trace test-results/<test-name>/trace.zip
```

---

## Parallel Execution Setup

### How parallelism works

Playwright runs test files in parallel across worker processes. Within a file, tests run sequentially by default.

```typescript
// playwright.config.ts
export default defineConfig({
  fullyParallel: true,          // Files AND tests within files run in parallel
  workers: environment.isCI ? 2 : undefined,   // CPU count in dev, 2 in CI
});
```

### Making tests parallel-safe

Each test must be fully independent:

- Use `test.beforeEach` to set up fresh state.
- Generate unique test data with `faker` to avoid collisions.
- Clean up after tests in `test.afterEach`.
- Do not use shared mutable variables at the file scope.

### Limiting parallelism

If a particular test suite must run sequentially (e.g., it shares a database resource):

```typescript
test.describe.configure({ mode: 'serial' });

test.describe('@reporting Report Generation', () => {
  // Tests in this block run one at a time
});
```

### Sharding for large suites

Split the suite across multiple CI runners:

```bash
# Runner 1
npx playwright test --shard=1/3

# Runner 2
npx playwright test --shard=2/3

# Runner 3
npx playwright test --shard=3/3
```

---

## CI/CD Integration

### GitHub Actions example

```yaml
name: OrangeHRM Test Suite

on:
  push:
    branches: [main, develop]
  pull_request:

jobs:
  test:
    runs-on: ubuntu-latest
    timeout-minutes: 30

    steps:
      - uses: actions/checkout@v4

      - uses: actions/setup-node@v4
        with:
          node-version: '18'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Install Playwright browsers
        run: npx playwright install --with-deps chromium

      - name: Run tests
        env:
          CI: true
          ORANGEHRM_BASE_URL: ${{ secrets.ORANGEHRM_BASE_URL }}
          ORANGEHRM_ADMIN_USERNAME: ${{ secrets.ORANGEHRM_ADMIN_USERNAME }}
          ORANGEHRM_ADMIN_PASSWORD: ${{ secrets.ORANGEHRM_ADMIN_PASSWORD }}
        run: npm run test:orangehrm

      - name: Upload HTML report
        if: always()
        uses: actions/upload-artifact@v4
        with:
          name: playwright-report
          path: packages/orangehrm-suite/playwright-report/
          retention-days: 30
```

### Environment secrets

Store sensitive values as repository secrets in GitHub (Settings → Secrets and variables → Actions):

| Secret | Description |
|---|---|
| `ORANGEHRM_BASE_URL` | Application URL |
| `ORANGEHRM_ADMIN_USERNAME` | Admin username |
| `ORANGEHRM_ADMIN_PASSWORD` | Admin password |

### CI-specific behaviour

When `CI=true`:

- Test retries increase to 2.
- Maximum workers set to 2 to avoid resource exhaustion.
- `forbidOnly` is enabled (tests with `test.only()` cause CI failure).
- Traces are captured on the first retry.

### Running smoke tests only in CI

For fast feedback on every commit, run only `@smoke` tests:

```yaml
- name: Run smoke tests
  run: npm run test:smoke
```

Run the full regression suite on a schedule or before release:

```yaml
on:
  schedule:
    - cron: '0 2 * * *'   # Nightly at 02:00 UTC
```
