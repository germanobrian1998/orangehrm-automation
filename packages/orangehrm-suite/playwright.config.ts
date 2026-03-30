/**
 * OrangeHRM Suite - Playwright Configuration
 * Extends the core framework defaults with OrangeHRM-specific settings.
 */

import { defineConfig, devices } from '@playwright/test';
import { environment } from '@qa-framework/core';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: environment.isCI,
  retries: environment.isCI ? 2 : 0,
  workers: environment.isCI ? 2 : undefined,
  timeout: environment.testTimeout,
  expect: {
    timeout: 10000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: environment.baseURL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    actionTimeout: environment.apiTimeout,
    navigationTimeout: 30000,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
