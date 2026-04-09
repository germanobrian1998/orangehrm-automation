import { defineConfig, devices } from '@playwright/test';

const environment = process.env.ENVIRONMENT || 'development';
const testTimeout = process.env.TEST_TIMEOUT ? parseInt(process.env.TEST_TIMEOUT, 10) : 60000;
const baseURL =
  process.env.ORANGEHRM_BASE_URL || 'https://opensource-demo.orangehrmlive.com';

export default defineConfig({
  testDir: './tests',
  outputDir: `./test-results/${environment}`,
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  timeout: testTimeout,
  expect: {
    timeout: 10000,
  },
  reporter: [
    ['list'],
    ['html', { open: 'never', attachmentsBaseURL: './' }],
    ['allure-playwright', { resultsDir: process.env.ALLURE_RESULTS_DIR || './allure-results' }],
  ],
  use: {
    baseURL,
    trace: environment === 'development' ? 'on-first-retry' : 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10000,
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
    {
      name: 'performance',
      testDir: './tests/performance',
      timeout: 120000,
      use: {
        ...devices['Desktop Chrome'],
        // Capture performance metrics on every run
        trace: 'on',
      },
    },
    {
      name: 'visual',
      testDir: './tests/visual',
      use: {
        ...devices['Desktop Chrome'],
        // Always capture screenshots for visual regression tests
        screenshot: 'on',
        trace: 'on',
      },
    },
  ],
});
