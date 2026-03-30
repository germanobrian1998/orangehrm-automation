/**
 * Core framework - Base Page Object
 * All page objects in any suite should extend this class.
 * Provides common browser interactions with built-in logging and error handling.
 */

import { Page, expect } from '@playwright/test';
import { Logger, createLogger } from '../logger/logger';
import { WaitFor, createWaitFor } from '../utils/wait-for';
import { ScreenshotManager, createScreenshotManager } from '../utils/screenshot-manager';
import { environment } from '../config/environment';
import { constants } from '../config/constants';

export class BasePage {
  protected logger: Logger;
  protected waitFor: WaitFor;
  protected screenshotManager: ScreenshotManager;

  constructor(protected page: Page) {
    this.logger = createLogger(this.constructor.name);
    this.waitFor = createWaitFor(page);
    this.screenshotManager = createScreenshotManager(page);
  }

  /** Navigate to a relative URL path */
  async goto(path: string): Promise<void> {
    try {
      this.logger.step(1, `Navigating to ${path}`);
      const url = `${environment.baseURL}${path}`;
      await this.page.goto(url, { waitUntil: 'networkidle' });
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Navigated to ${path}`);
    } catch (error) {
      this.logger.error(`Navigation failed to ${path}`, error);
      throw error;
    }
  }

  /** Fill an input field and blur to trigger validations */
  async fill(selector: string, value: string): Promise<void> {
    try {
      await this.waitFor.elementVisible(selector);
      await this.page.locator(selector).clear();
      await this.page.locator(selector).fill(value);
      await this.page.locator(selector).blur();
      this.logger.debug(`Filled ${selector} with value`);
    } catch (error) {
      this.logger.error(`Failed to fill ${selector}`, error);
      throw error;
    }
  }

  /** Click element with scroll into view */
  async click(selector: string): Promise<void> {
    try {
      await this.waitFor.elementVisible(selector);
      await this.page.locator(selector).scrollIntoViewIfNeeded();
      await this.page.locator(selector).click();
      this.logger.debug(`Clicked ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to click ${selector}`, error);
      throw error;
    }
  }

  /** Get trimmed text content of an element */
  async getText(selector: string): Promise<string> {
    try {
      await this.waitFor.elementVisible(selector);
      const text = await this.page.locator(selector).textContent();
      return text?.trim() || '';
    } catch (error) {
      this.logger.error(`Failed to get text from ${selector}`, error);
      throw error;
    }
  }

  /** Check if element is visible */
  async isVisible(selector: string): Promise<boolean> {
    try {
      return await this.page.locator(selector).isVisible();
    } catch {
      return false;
    }
  }

  /** Wait for URL to match pattern */
  async waitForUrl(expectedUrl: string | RegExp): Promise<void> {
    try {
      await this.page.waitForURL(expectedUrl, { timeout: constants.TIMEOUTS.MEDIUM });
      this.logger.info(`✓ URL matched: ${expectedUrl}`);
    } catch (error) {
      this.logger.error(`URL did not match ${expectedUrl}`, error);
      throw error;
    }
  }

  /** Verify page title contains expected text */
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    try {
      await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'));
      this.logger.info(`✓ Page title verified: ${expectedTitle}`);
    } catch (error) {
      this.logger.error(`Page title verification failed. Expected: ${expectedTitle}`, error);
      throw error;
    }
  }

  /** Take a named screenshot */
  async screenshot(stepName: string): Promise<void> {
    await this.screenshotManager.take(this.constructor.name, stepName);
  }

  /** Get current page URL */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /** Reload the page */
  async reload(): Promise<void> {
    try {
      this.logger.info('Reloading page');
      await this.page.reload({ waitUntil: 'networkidle' });
    } catch (error) {
      this.logger.error('Failed to reload page', error);
      throw error;
    }
  }
}
