import { defineConfig, devices } from '@playwright/test';

const baseURL = process.env.ORANGEHRM_BASE_URL || 'https://opensource-demo.orangehrmlive.com';

export default defineConfig({
  testDir: './tests',
  
  // ✅ Timeouts realistas
  timeout: 30 * 1000,
  expect: {
    timeout: 5 * 1000
  },
  
  // ✅ Parallelización
  workers: process.env.CI ? 4 : undefined,
  fullyParallel: true,
  
  // ✅ Reintentos solo en CI
  retries: process.env.CI ? 2 : 0,
  
  // ✅ Reportes
  reporter: [
    ['html', { outputFolder: 'test-results/html' }],
    ['json', { outputFile: 'test-results/results.json' }],
    ['junit', { outputFile: 'test-results/junit.xml' }],
    ['list']
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
  
  outputFolder: 'test-results'
});