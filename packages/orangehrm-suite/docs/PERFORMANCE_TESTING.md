# Performance Testing Guide

This guide describes how to measure, analyse, and optimise the performance of the OrangeHRM application using the Playwright-based test framework.

## Table of Contents

- [Overview](#overview)
- [Load Testing Setup](#load-testing-setup)
- [Stress Testing Procedures](#stress-testing-procedures)
- [Performance Metrics Collection](#performance-metrics-collection)
- [Analysis and Reporting](#analysis-and-reporting)
- [Performance Optimization Tips](#performance-optimization-tips)

---

## Overview

Performance tests validate that the application meets response-time and throughput requirements under various load conditions. The framework supports:

- **Baseline benchmarking** – establishing a performance baseline for each release.
- **Load testing** – verifying behaviour under expected traffic.
- **Stress testing** – finding the breaking point beyond expected load.
- **Regression detection** – comparing metrics between releases to catch degradation.

Performance tests are tagged `@performance` and run separately from functional tests:

```bash
npx playwright test --grep "@performance"
```

---

## Load Testing Setup

### Built-in Web Vitals collection

Playwright can evaluate the [Web Vitals](https://web.dev/vitals/) directly from the browser:

```typescript
import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/login.page';
import { config } from '@qa-framework/core';

test.describe('@performance Dashboard Load Performance', () => {
  test('dashboard loads within acceptable time', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.login({
      username: config.adminUsername,
      password: config.adminPassword,
    });

    // Collect Web Vitals
    const metrics = await page.evaluate(() => {
      return new Promise<Record<string, number>>((resolve) => {
        const result: Record<string, number> = {};
        new PerformanceObserver((list) => {
          for (const entry of list.getEntries()) {
            result[entry.name] = entry.startTime;
          }
          resolve(result);
        }).observe({ type: 'largest-contentful-paint', buffered: true });
        setTimeout(() => resolve(result), 3000);
      });
    });

    // LCP should be under 2.5 seconds (good threshold per Web Vitals)
    if (metrics['largest-contentful-paint'] !== undefined) {
      expect(metrics['largest-contentful-paint']).toBeLessThan(2500);
    }
  });
});
```

### Navigation timing

Use the Navigation Timing API for page load measurements:

```typescript
test('login page loads within 3 seconds', async ({ page }) => {
  const start = Date.now();
  await page.goto(config.baseURL + '/auth/login', { waitUntil: 'networkidle' });
  const loadTime = Date.now() - start;

  expect(loadTime).toBeLessThan(3000);
});
```

### API response time measurement

```typescript
test('employee list API responds within 2 seconds', async ({ page }) => {
  const apiClient = new EmployeeAPIClient(page);
  await apiClient.authenticate(config.adminUsername, config.adminPassword);

  const start = Date.now();
  await apiClient.get('/api/v2/pim/employees?limit=50');
  const duration = Date.now() - start;

  expect(duration).toBeLessThan(2000);
});
```

### Benchmarking multiple runs

To reduce measurement noise, run the same operation multiple times and compute an average:

```typescript
test('search operation completes within 1.5 seconds (average over 5 runs)', async ({ page }) => {
  const apiClient = new EmployeeAPIClient(page);
  await apiClient.authenticate(config.adminUsername, config.adminPassword);

  const durations: number[] = [];
  for (let i = 0; i < 5; i++) {
    const start = Date.now();
    await apiClient.get('/api/v2/pim/employees?name=Admin');
    durations.push(Date.now() - start);
  }

  const average = durations.reduce((a, b) => a + b, 0) / durations.length;
  console.log(`Average response time: ${average.toFixed(0)}ms (runs: ${JSON.stringify(durations)})`);
  expect(average).toBeLessThan(1500);
});
```

---

## Stress Testing Procedures

### Concurrent user simulation

Simulate multiple concurrent users using `Promise.all`:

```typescript
test('@performance 10 concurrent users can log in simultaneously', async ({ browser }) => {
  const concurrentUsers = 10;
  const results: Array<{ success: boolean; duration: number }> = [];

  await Promise.all(
    Array.from({ length: concurrentUsers }, async () => {
      const context = await browser.newContext();
      const page = await context.newPage();
      const loginPage = new LoginPage(page);

      const start = Date.now();
      try {
        await loginPage.login({ username: config.adminUsername, password: config.adminPassword });
        results.push({ success: true, duration: Date.now() - start });
      } catch {
        results.push({ success: false, duration: Date.now() - start });
      } finally {
        await context.close();
      }
    })
  );

  const successCount = results.filter((r) => r.success).length;
  const avgDuration = results.reduce((sum, r) => sum + r.duration, 0) / results.length;

  console.log(`Success rate: ${successCount}/${concurrentUsers}`);
  console.log(`Average duration: ${avgDuration.toFixed(0)}ms`);

  expect(successCount).toBe(concurrentUsers);
  expect(avgDuration).toBeLessThan(10000);
});
```

### Sustained load test

Test behaviour under sustained load over a period of time:

```typescript
test('@performance API sustains 50 requests per minute', async ({ page }) => {
  const apiClient = new EmployeeAPIClient(page);
  await apiClient.authenticate(config.adminUsername, config.adminPassword);

  const requestCount = 50;
  const windowMs = 60_000;
  const intervalMs = windowMs / requestCount;

  const results: number[] = [];
  const start = Date.now();

  for (let i = 0; i < requestCount; i++) {
    const reqStart = Date.now();
    await apiClient.get('/api/v2/pim/employees?limit=10');
    results.push(Date.now() - reqStart);

    const elapsed = Date.now() - start;
    const expected = (i + 1) * intervalMs;
    if (elapsed < expected) {
      await new Promise((r) => setTimeout(r, expected - elapsed));
    }
  }

  const p95 = results.sort((a, b) => a - b)[Math.floor(results.length * 0.95)];
  console.log(`P95 response time: ${p95}ms`);
  expect(p95).toBeLessThan(3000);
});
```

---

## Performance Metrics Collection

### Collecting browser performance metrics

```typescript
async function collectMetrics(page: Page): Promise<Record<string, number>> {
  return page.evaluate(() => {
    const timing = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
    return {
      domContentLoaded: timing.domContentLoadedEventEnd - timing.startTime,
      load:             timing.loadEventEnd - timing.startTime,
      firstByte:        timing.responseStart - timing.startTime,
      domInteractive:   timing.domInteractive - timing.startTime,
    };
  });
}
```

### Network request monitoring

```typescript
const networkRequests: Array<{ url: string; duration: number; size: number }> = [];

page.on('response', async (response) => {
  const request = response.request();
  const timing  = request.timing();
  networkRequests.push({
    url:      request.url(),
    duration: timing.responseEnd - timing.requestStart,
    size:     (await response.body()).length,
  });
});

await page.goto(config.baseURL + '/dashboard/index');
await page.waitForLoadState('networkidle');

const slowRequests = networkRequests.filter((r) => r.duration > 1000);
if (slowRequests.length > 0) {
  console.warn('Slow requests detected:', slowRequests);
}
expect(slowRequests).toHaveLength(0);
```

### Defining performance budgets

| Metric | Good | Needs Improvement | Poor |
|---|---|---|---|
| Page Load Time | < 2s | 2–4s | > 4s |
| Time to First Byte | < 200ms | 200–600ms | > 600ms |
| Largest Contentful Paint | < 2.5s | 2.5–4s | > 4s |
| API Response Time (P95) | < 1s | 1–3s | > 3s |
| Concurrent Users (login) | 10+ at < 10s | 5–10 | < 5 |

---

## Analysis and Reporting

### Writing performance results to a file

```typescript
import fs from 'fs';
import path from 'path';

test.afterAll(async () => {
  const report = {
    timestamp: new Date().toISOString(),
    metrics:   collectedMetrics,
  };
  const reportPath = path.resolve('test-results', 'performance-report.json');
  fs.mkdirSync(path.dirname(reportPath), { recursive: true });
  fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
});
```

### Comparing against a baseline

Store baseline metrics in a JSON file and compare on each run:

```typescript
import baseline from '../fixtures/performance-baseline.json';

test('dashboard load time does not regress', async ({ page }) => {
  const metrics = await collectMetrics(page);
  const regressionThreshold = 1.2; // Allow 20% degradation

  expect(metrics.load).toBeLessThan(baseline.load * regressionThreshold);
});
```

---

## Performance Optimization Tips

### Reduce UI test execution time

- Run smoke tests in parallel with `fullyParallel: true`.
- Share authenticated state between tests using `storageState` to avoid repeated logins.
- Use `page.route()` to intercept and stub non-essential third-party requests.

### Reuse browser context for read-only tests

For tests that do not modify state, reuse a single browser context:

```typescript
test.describe.configure({ mode: 'parallel' });

let sharedPage: Page;
test.beforeAll(async ({ browser }) => {
  const context = await browser.newContext();
  sharedPage = await context.newPage();
  const loginPage = new LoginPage(sharedPage);
  await loginPage.login({ username: config.adminUsername, password: config.adminPassword });
});
```

### Disable animations in headed mode

```typescript
use: {
  launchOptions: {
    args: ['--disable-animations'],
  },
},
```

### Profile slow tests

Use `--reporter=list` and look for tests exceeding 30 seconds. Investigate with the Playwright trace viewer to identify slow selectors or network calls.
