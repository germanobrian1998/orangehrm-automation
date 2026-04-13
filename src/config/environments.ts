import dotenv from 'dotenv';
import path from 'path';

// Load .env.local si existe, sino .env.example
const envFile = process.env.NODE_ENV === 'test' ? '.env.local' : '.env.example';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export const environment = {
  // OrangeHRM Configuration
  baseURL: process.env.ORANGEHRM_BASE_URL || 'https://opensource-demo.orangehrmlive.com',
  adminUsername: process.env.ORANGEHRM_ADMIN_USERNAME || 'Admin',
  adminPassword: process.env.ORANGEHRM_ADMIN_PASSWORD || 'admin123',

  // Test Configuration
  testTimeout: parseInt(process.env.TEST_TIMEOUT || '30000'),
  apiTimeout: parseInt(process.env.API_TIMEOUT || '10000'),

  // Logging
  logLevel: process.env.LOG_LEVEL || 'info',
  debug: process.env.DEBUG === 'true',

  // Results
  allureResultsDir: process.env.ALLURE_RESULTS_DIR || './test-results',

  // Environment flags
  isCI: process.env.CI === 'true',
  isDev: process.env.NODE_ENV !== 'production',
} as const;

export type Environment = typeof environment;
