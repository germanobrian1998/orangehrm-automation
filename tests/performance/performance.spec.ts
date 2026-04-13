import { test, expect } from '@playwright/test';

const BASE_URL = 'https://opensource-demo.orangehrmlive.com';
const API_BASE = `${BASE_URL}/web/index.php/api/v2`;

// Performance thresholds (milliseconds)
const THRESHOLDS = {
  pageLoad: 10000,
  apiResponse: 5000,
  loginPage: 8000,
  dashboardLoad: 12000,
};

test.describe('Performance Tests', () => {
  test('login page should load within threshold', async ({ page }) => {
    const start = Date.now();
    await page.goto(`${BASE_URL}/web/index.php/auth/login`, {
      waitUntil: 'domcontentloaded',
    });
    const elapsed = Date.now() - start;

    console.log(`Login page load time: ${elapsed}ms (threshold: ${THRESHOLDS.loginPage}ms)`);
    expect(elapsed).toBeLessThan(THRESHOLDS.loginPage);
  });

  test('home page should load within threshold', async ({ page }) => {
    const start = Date.now();
    await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
    const elapsed = Date.now() - start;

    console.log(`Home page load time: ${elapsed}ms (threshold: ${THRESHOLDS.pageLoad}ms)`);
    expect(elapsed).toBeLessThan(THRESHOLDS.pageLoad);
  });

  test('API endpoint should respond within threshold', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/pim/employees`);
    const elapsed = Date.now() - start;

    console.log(`API response time: ${elapsed}ms (threshold: ${THRESHOLDS.apiResponse}ms)`);
    expect([200, 401]).toContain(response.status());
    expect(elapsed).toBeLessThan(THRESHOLDS.apiResponse);
  });

  test('leave API endpoint should respond within threshold', async ({ request }) => {
    const start = Date.now();
    const response = await request.get(`${API_BASE}/leave/leave-types`);
    const elapsed = Date.now() - start;

    console.log(`Leave API response time: ${elapsed}ms (threshold: ${THRESHOLDS.apiResponse}ms)`);
    expect([200, 401]).toContain(response.status());
    expect(elapsed).toBeLessThan(THRESHOLDS.apiResponse);
  });

  test('multiple API requests should complete within threshold', async ({ request }) => {
    const endpoints = [
      `${API_BASE}/pim/employees`,
      `${API_BASE}/leave/leave-types`,
      `${API_BASE}/leave/leave-requests`,
    ];

    const start = Date.now();
    const responses = await Promise.all(endpoints.map((url) => request.get(url)));
    const elapsed = Date.now() - start;

    console.log(
      `Parallel API requests (${endpoints.length}) completed in: ${elapsed}ms (threshold: ${THRESHOLDS.dashboardLoad}ms)`
    );

    for (const response of responses) {
      expect([200, 401]).toContain(response.status());
    }
    expect(elapsed).toBeLessThan(THRESHOLDS.dashboardLoad);
  });

  test('login page should have acceptable navigation timing', async ({ page }) => {
    await page.goto(`${BASE_URL}/web/index.php/auth/login`, {
      waitUntil: 'domcontentloaded',
    });

    const metrics = await page.evaluate(() => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const timing = (performance as any).getEntriesByType('navigation')[0];
      return {
        domInteractive: Math.round(timing.domInteractive),
        domContentLoaded: Math.round(timing.domContentLoadedEventEnd - timing.startTime),
        loadComplete: Math.round(timing.loadEventEnd - timing.startTime),
      };
    });

    console.log('Navigation timing metrics:', metrics);

    // domInteractive should be under the page load threshold
    expect(metrics.domInteractive).toBeLessThan(THRESHOLDS.pageLoad);
    // domContentLoaded should be under threshold (0 means not yet fired — skip in that case)
    if (metrics.domContentLoaded > 0) {
      expect(metrics.domContentLoaded).toBeLessThan(THRESHOLDS.dashboardLoad);
    }
  });
});
