/**
 * Core framework - Playwright test fixtures
 * Extends the base Playwright test with reusable logger and config fixtures.
 */

import { test as base, Page } from '@playwright/test';
import { Logger, createLogger } from '../logger/logger';
import { Config } from '../config/Config';
import { BasePage } from '../page-objects/base.page';
import { BaseApiClient } from '../api-client/base.api-client';

export interface CoreFixtures {
  /** Winston logger scoped to the current test */
  logger: Logger;
  /** Singleton Config instance */
  config: Config;
  /** BasePage bound to the current page */
  basePage: BasePage;
  /** BaseApiClient bound to the current page */
  baseApiClient: BaseApiClient;
  /** Convenience accessor to the raw Playwright Page */
  testPage: Page;
}

/**
 * Extended test object that includes all CoreFixtures.
 * Import and use this instead of the stock `test` from @playwright/test:
 *
 * ```ts
 * import { test, expect } from '@qa-framework/core';
 *
 * test('my test', async ({ logger, basePage }) => {
 *   logger.info('Starting test');
 *   await basePage.goto('/');
 * });
 * ```
 */
export const test = base.extend<CoreFixtures>({
  logger: async ({ }, use, testInfo) => {
    const logger = createLogger(testInfo.title);
    logger.info(`▶ Starting test: ${testInfo.title}`);
    await use(logger);
    logger.info(`■ Finished test: ${testInfo.title} → ${testInfo.status}`);
  },

  config: async ({ }, use) => {
    await use(Config.getInstance());
  },

  basePage: async ({ page }, use) => {
    const bp = new BasePage(page);
    await use(bp);
  },

  baseApiClient: async ({ page }, use) => {
    const client = new BaseApiClient(page);
    await use(client);
  },

  testPage: async ({ page }, use) => {
    await use(page);
  },
});

export { expect } from '@playwright/test';
