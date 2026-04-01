/**
 * OrangeHRM API Suite - Playwright Configuration
 * Extends the core framework defaults with OrangeHRM API-specific settings.
 */

import { defineConfig } from '@playwright/test';
import { environment } from '@qa-framework/core';

export default defineConfig({
  testDir: './tests',
  outputDir: './test-results',
  fullyParallel: true,
  forbidOnly: environment.isCI,
  retries: environment.isCI ? 1 : 0,
  workers: environment.isCI ? 2 : undefined,
  timeout: 30000,
  expect: {
    timeout: 5000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: environment.baseURL,
    trace: 'on-first-retry',
    actionTimeout: environment.apiTimeout,
  },

  projects: [
    {
      name: 'chromium',
    },
  ],
});
