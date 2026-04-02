# 📊 Performance Benchmarks & Optimization Guide

Performance targets, baselines, and optimization strategies for the OrangeHRM Automation Suite.

---

## Table of Contents

- [Performance Baselines by Module](#-performance-baselines-by-module)
- [Test Suite Execution Targets](#-test-suite-execution-targets)
- [Execution Time Comparison](#-execution-time-comparison)
- [Optimization Strategies](#-optimization-strategies)
- [Performance Monitoring in CI/CD](#-performance-monitoring-in-cicd)
- [Identifying Slow Tests](#-identifying-slow-tests)
- [Playwright Performance Configuration](#-playwright-performance-configuration)

---

## 🎯 Performance Baselines by Module

These are the target page-action durations for individual test steps. Tests that consistently exceed these thresholds should be investigated.

| Module / Action | Target (P50) | Acceptable (P95) | Flag if > |
|-----------------|-------------|-----------------|----------|
| Login — valid credentials | < 3 s | < 5 s | 8 s |
| Login — invalid credentials (error) | < 2 s | < 4 s | 6 s |
| Dashboard load after login | < 4 s | < 7 s | 10 s |
| Employee list page load | < 4 s | < 6 s | 10 s |
| Create employee (full UI flow) | < 5 s | < 8 s | 12 s |
| Edit employee details | < 4 s | < 7 s | 10 s |
| Delete employee | < 3 s | < 5 s | 8 s |
| Leave list page load | < 4 s | < 6 s | 10 s |
| API: POST /api/v2/auth/login | < 1 s | < 2 s | 3 s |
| API: GET /api/v2/pim/employees | < 1.5 s | < 3 s | 5 s |
| API: POST /api/v2/pim/employees | < 2 s | < 3.5 s | 6 s |

> **Note:** Baselines measured against `https://opensource-demo.orangehrmlive.com`, a shared public demo. Real application performance will vary.

---

## 🏁 Test Suite Execution Targets

| Suite | Target | Acceptable | Workers |
|-------|--------|------------|---------|
| Smoke (Chromium only) | < 5 min | < 10 min | 2 |
| API Suite | < 3 min | < 6 min | 2 |
| Regression (Chromium) | < 20 min | < 30 min | 2 |
| Cross-Browser (3 browsers) | < 25 min | < 40 min | parallel matrix |
| Full Matrix (all suites × 3 browsers) | < 35 min | < 60 min | parallel matrix |
| Performance Suite | < 10 min | < 20 min | 1 (serial) |

---

## 📈 Execution Time Comparison

### UI vs API Setup (same outcome)

| Setup Method | Time | Use When |
|-------------|------|----------|
| UI login + UI employee create | ~8 s | Testing the create UI itself |
| API login + API employee create | ~0.8 s | Setting up data for another test |

**API setup is 10× faster** — always prefer it for test data management.

### Worker Count Impact

| Workers | 19-spec smoke suite | Notes |
|---------|--------------------|----|
| 1 | ~3 min | Baseline |
| 2 | ~90 s | Default CI setting |
| 4 | ~60 s | Optimal for local |
| 8 | ~55 s | Diminishing returns (I/O bound) |

### Browser Execution Time

| Browser | Relative Speed | Notes |
|---------|---------------|-------|
| Chromium | 1× (baseline) | Fastest, best DevTools |
| Firefox | ~1.1× | Slightly slower startup |
| WebKit | ~1.2× | Strictest, slowest |

---

## ⚡ Optimization Strategies

### 1. Use API for Test Setup

```typescript
// ❌ Slow — UI flow for data setup (~8s)
test('edit employee', async ({ page }) => {
  await loginPage.login('Admin', 'admin123');
  await employeePage.createEmployee({ firstName: 'Test', lastName: 'User' });
  // now test edit...
});

// ✅ Fast — API for setup, UI only for the feature under test (~1.5s setup)
test('edit employee', async ({ page, request }) => {
  const employee = await employeeApi.create(request, { firstName: 'Test', lastName: 'User' });
  await loginPage.login('Admin', 'admin123');
  await employeePage.navigateTo(employee.id);
  // test the edit UI...
});
```

### 2. Reuse Authentication State

```typescript
// playwright.config.ts — save auth state once per project
export default defineConfig({
  projects: [
    {
      name: 'setup',
      testMatch: '**/global.setup.ts',
    },
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: '.auth/admin.json', // reuse saved login
      },
      dependencies: ['setup'],
    },
  ],
});
```

### 3. Avoid Hard Waits

```typescript
// ❌ Adds fixed 2s even when the element appears in 200ms
await page.waitForTimeout(2000);

// ✅ Resolves as soon as the element appears
await page.waitForSelector('.oxd-table-body', { state: 'visible' });
await page.waitForLoadState('domcontentloaded');
```

### 4. Choose the Right `waitForLoadState`

| State | Waits for | Use when |
|-------|----------|----------|
| `'domcontentloaded'` | HTML parsed | SPA navigation, fastest |
| `'load'` | All resources | Images/scripts needed |
| `'networkidle'` | No network for 500ms | Dynamic data loading |

### 5. Parallel Test Design

```typescript
// ❌ Tests that share state can't run in parallel
let sharedEmployee: Employee;
beforeAll(async () => { sharedEmployee = await createEmployee(); });

// ✅ Each test creates its own data
test('edit employee name', async ({ request }) => {
  const emp = await createEmployee(request);
  // test independently
  await deleteEmployee(request, emp.id);
});
```

---

## 📡 Performance Monitoring in CI/CD

### Tracking Duration Trends

Every GitHub Actions run uploads an HTML report. To track trends:

1. Enable `json` reporter alongside `html`:
```typescript
reporter: [
  ['html', { open: 'never' }],
  ['json', { outputFile: 'test-results/results.json' }],
],
```

2. Parse durations in a post-step:
```yaml
- name: Check for slow tests
  run: |
    node -e "
    const results = require('./test-results/results.json');
    const slow = results.suites.flatMap(s => s.specs)
      .filter(spec => spec.tests[0].results[0].duration > 30000);
    if (slow.length > 0) {
      console.warn('SLOW TESTS:', slow.map(s => s.title));
    }
    "
```

### Allure Trends

The project uses `allure-playwright`. To view historical trends:
```bash
# Serve allure results after accumulating multiple runs
allure serve ./allure-results
```

---

## 🔍 Identifying Slow Tests

### Method 1 — HTML Report

Run tests and open the report:
```bash
npm test
npm run report
```
Click **"Duration"** column header to sort by slowest.

### Method 2 — CLI with `--reporter=list`

```bash
npx playwright test --reporter=list 2>&1 | grep -E "^\s+✓|✗" | sort -t'(' -k2 -rn | head -10
```

### Method 3 — JSON Output

```bash
npx playwright test --reporter=json > results.json
node -e "
const r = require('./results.json');
r.suites.flatMap(s=>s.specs)
  .map(s=>({title:s.title, ms:s.tests[0].results[0].duration}))
  .sort((a,b)=>b.ms-a.ms)
  .slice(0,10)
  .forEach(t=>console.log(t.ms+'ms', t.title));
"
```

### Method 4 — Performance Suite

The project includes a dedicated performance test suite:
```bash
npx playwright test --project=performance
```

These tests use Playwright's `performance` API to capture Web Vitals:
```typescript
const perfData = await page.evaluate(() => ({
  lcp: performance.getEntriesByType('largest-contentful-paint').slice(-1)[0]?.startTime,
  fcp: performance.getEntriesByType('paint').find(e => e.name === 'first-contentful-paint')?.startTime,
}));
expect(perfData.lcp).toBeLessThan(3000);
```

---

## ⚙️ Playwright Performance Configuration

Key settings in `playwright.config.ts` that affect performance:

```typescript
export default defineConfig({
  fullyParallel: true,          // run tests within a file in parallel
  workers: process.env.CI ? 2 : undefined, // 2 in CI, auto locally
  timeout: 60000,               // max per test
  expect: { timeout: 10000 },   // max per assertion
  use: {
    actionTimeout: 10000,       // max per click/fill/etc.
    navigationTimeout: 30000,   // max per page navigation
    trace: 'on-first-retry',    // only capture trace on retry (saves disk)
    screenshot: 'only-on-failure', // saves processing on passing tests
    video: 'off',               // video is expensive; enable only when debugging
  },
});
```

---

[← Back to docs/](.) | [TROUBLESHOOTING.md](TROUBLESHOOTING.md) | [Main README](../README.md)
