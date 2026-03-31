/**
 * Core framework - Environment configuration
 */

import dotenv from 'dotenv';
import path from 'path';

const envFile = process.env.NODE_ENV === 'test' ? '.env.local' : '.env.example';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

type BrowserName = 'chromium' | 'firefox' | 'webkit';
const VALID_BROWSERS: BrowserName[] = ['chromium', 'firefox', 'webkit'];

function parseBrowser(value: string | undefined): BrowserName {
  const browser = value || 'chromium';
  if (VALID_BROWSERS.includes(browser as BrowserName)) {
    return browser as BrowserName;
  }
  return 'chromium';
}

export const environment = {
  baseURL: process.env.ORANGEHRM_BASE_URL || 'https://opensource-demo.orangehrmlive.com',
  adminUsername: process.env.ORANGEHRM_ADMIN_USERNAME || 'Admin',
  adminPassword: process.env.ORANGEHRM_ADMIN_PASSWORD || 'admin123',

  testTimeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
  apiTimeout: parseInt(process.env.API_TIMEOUT || '10000'),

  logLevel: process.env.LOG_LEVEL || 'info',
  debug: process.env.DEBUG === 'true',

  allureResultsDir: process.env.ALLURE_RESULTS_DIR || './test-results',

  isCI: process.env.CI === 'true',
  isDev: process.env.NODE_ENV !== 'production',

  browser: parseBrowser(process.env.BROWSER),
  headless: process.env.HEADLESS !== 'false',
} as const;

export type Environment = typeof environment;
