import { defineConfig, devices } from '@playwright/test';
import path from 'path';

const baseURL = process.env.ORANGEHRM_BASE_URL || 'https://opensource-demo.orangehrmlive.com';

export default defineConfig({
  testDir: './tests',
  
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000
  },
  
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,
  retries: process.env.CI ? 2 : 0,
  
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report' }],
  ],
  
  use: {
    baseURL,
    video: process.env.CI ? 'retain-on-failure' : 'off',
    screenshot: 'only-on-failure',
    trace: 'on-first-retry',
  },
  
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
  
  webServer: undefined,
  
  // Add this to resolve path aliases
  snapshotDir: './test-results/snapshots',
});