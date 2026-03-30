/**
 * TestFixtures — shared Playwright test fixtures for the core framework.
 *
 * Extend these fixtures in consuming packages to inherit base setup:
 *   logger, config, and a pre-built `baseUrl`.
 *
 * Usage in a test file:
 *   import { test, expect } from './TestFixtures';
 *
 *   test('should navigate to home', async ({ page, baseUrl, logger }) => {
 *     await page.goto(baseUrl);
 *     logger.info('Navigated to home page');
 *   });
 */

import { test as base } from '@playwright/test';
import { Logger } from '../logger/Logger';
import { Config } from '../config/Config';
import type { BaseFixtures } from '../types';

/**
 * Additional fixture types provided by the core framework.
 */
export type CoreFixtures = BaseFixtures & {
  /** A Logger instance scoped to the current test title. */
  logger: Logger;
  /** The resolved Config singleton. */
  config: Config;
};

/**
 * Extended Playwright `test` with core framework fixtures pre-wired.
 */
export const test = base.extend<CoreFixtures>({
  baseUrl: async ({}, use) => {
    const cfg = Config.getInstance();
    await use(cfg.get('BASE_URL', 'https://opensource-demo.orangehrmlive.com'));
  },

  apiUrl: async ({}, use) => {
    const cfg = Config.getInstance();
    await use(cfg.get('API_URL', 'https://opensource-demo.orangehrmlive.com/api/v2'));
  },

  timeout: async ({}, use) => {
    const cfg = Config.getInstance();
    await use(cfg.getNumber('TIMEOUT', 30000));
  },

  logger: async ({}, use, testInfo) => {
    const logger = new Logger(testInfo.title);
    logger.info(`▶ Starting test: ${testInfo.title}`);
    await use(logger);
    const status = testInfo.status === 'passed' ? '✓' : '✗';
    logger.info(`${status} Test finished: ${testInfo.title} [${testInfo.status ?? 'unknown'}]`);
  },

  config: async ({}, use) => {
    await use(Config.getInstance());
  },
});

export { expect } from '@playwright/test';
