import { defineConfig, devices } from '@playwright/test';

const environment = process.env.ENVIRONMENT || 'development';
const isCI = process.env.CI === 'true' || !!process.env.CI;
const isDocker = process.env.DOCKER === 'true';
const testTimeout = process.env.TEST_TIMEOUT
  ? parseInt(process.env.TEST_TIMEOUT, 10)
  : isCI || isDocker
    ? 120000
    : 60000;
const baseURL =
  process.env.ORANGEHRM_BASE_URL || 'https://opensource-demo.orangehrmlive.com';

export default defineConfig({
  testDir: './tests',
  outputDir: `./test-results/${environment}`,
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI || isDocker ? 2 : 0,
  workers: isCI || isDocker ? 2 : undefined,
  timeout: testTimeout,
  expect: {
    timeout: isCI || isDocker ? 15000 : 10000,
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
    actionTimeout: isCI || isDocker ? 20000 : 10000,
    navigationTimeout: isCI || isDocker ? 60000 : 30000,
  },

  projects: isCI || isDocker
    ? [
        {
          name: 'chromium',
          use: { ...devices['Desktop Chrome'] },
        },
        {
          name: 'performance',
          testDir: './tests/performance',
          timeout: 120000,
          use: {
            ...devices['Desktop Chrome'],
            trace: 'on',
          },
        },
      ]
    : [
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
      ],
});
