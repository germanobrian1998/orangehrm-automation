/**
 * Jest global test setup
 * Sets mock environment variables for all unit tests.
 *
 * MSW Integration Note:
 * When running API tests that require network interception (e.g. packages/hrm-api-suite),
 * use the MSW server exported from `packages/hrm-api-suite/src/mocks/server.ts` and manage
 * its lifecycle with beforeAll/afterEach/afterAll in your test file or via a
 * `setupFilesAfterFramework` entry in the Jest config for that package.
 *
 * Example (for packages that can import from hrm-api-suite without circular deps):
 *   import { server } from '@qa-framework/hrm-api-suite/src/mocks/server';
 *   beforeAll(() => server.listen());
 *   afterEach(() => server.resetHandlers());
 *   afterAll(() => server.close());
 */

// Mock environment variables before any module is loaded
process.env.ORANGEHRM_BASE_URL = 'https://test.orangehrmlive.com';
process.env.ORANGEHRM_ADMIN_USERNAME = 'Admin';
process.env.ORANGEHRM_ADMIN_PASSWORD = 'admin123';
process.env.TEST_TIMEOUT = '30000';
process.env.API_TIMEOUT = '10000';
process.env.LOG_LEVEL = 'info';
process.env.DEBUG = 'false';
process.env.CI = 'false';
process.env.NODE_ENV = 'test';
process.env.USE_MOCK_API = process.env.USE_MOCK_API || 'false';
