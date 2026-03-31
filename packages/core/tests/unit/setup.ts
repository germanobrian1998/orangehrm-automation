/**
 * Jest global test setup
 * Sets mock environment variables for all unit tests.
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
