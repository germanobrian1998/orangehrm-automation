/**
 * Base Page Object class
 * All page objects inherit from this
 * Contains common methods to avoid duplication
 */

import { Page, expect } from '@playwright/test';
import { Logger, createLogger } from '@utils/logger';
import { WaitFor, createWaitFor } from '@utils/wait-for';
import { ScreenshotManager, createScreenshotManager } from '@utils/screenshot-manager';
import { environment } from '@config/environment';
import { constants } from '@config/constants';

export class BasePage {
  protected logger: Logger;
  protected waitFor: WaitFor;
  protected screenshotManager: ScreenshotManager;

  constructor(protected page: Page) {
    this.logger = createLogger(this.constructor.name);
    this.waitFor = createWaitFor(page);
    this.screenshotManager = createScreenshotManager(page);
  }

  /**
   * Navigate to URL
   */
  async goto(path: string): Promise<void> {
    try {
      this.logger.step(1, `Navigating to ${path}`);
      const url = `${environment.baseUrl}${path}`;
      await this.page.goto(url, { waitUntil: 'networkidle' });
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Navigated to ${path}`);
    } catch (error) {
      this.logger.error(`Navigation failed to ${path}`, error);
      throw error;
    }
  }

  /**
   * Fill input field with explicit wait
   */
  async fill(selector: string, value: string): Promise<void> {
    try {
      await this.waitFor.elementVisible(selector);
      await this.page.locator(selector).clear();
      await this.page.locator(selector).fill(value);
      await this.page.locator(selector).blur(); // Trigger validations
      this.logger.debug(`Filled ${selector} with value`);
    } catch (error) {
      this.logger.error(`Failed to fill ${selector}`, error);
      throw error;
    }
  }

  /**
   * Click element with scroll into view
   */
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

  /**
   * Double click element
   */
  async doubleClick(selector: string): Promise<void> {
    try {
      await this.waitFor.elementVisible(selector);
      await this.page.locator(selector).dblclick();
      this.logger.debug(`Double clicked ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to double click ${selector}`, error);
      throw error;
    }
  }

  /**
   * Right click element
   */
  async rightClick(selector: string): Promise<void> {
    try {
      await this.waitFor.elementVisible(selector);
      await this.page.locator(selector).click({ button: 'right' });
      this.logger.debug(`Right clicked ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to right click ${selector}`, error);
      throw error;
    }
  }

  /**
   * Get text from element
   */
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

  /**
   * Get input value
   */
  async getInputValue(selector: string): Promise<string> {
    try {
      const value = await this.page.locator(selector).inputValue();
      return value || '';
    } catch (error) {
      this.logger.error(`Failed to get input value from ${selector}`, error);
      throw error;
    }
  }

  /**
   * Check if element is visible
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      return await this.page.locator(selector).isVisible();
    } catch (error) {
      return false;
    }
  }

  /**
   * Check if element is enabled
   */
  async isEnabled(selector: string): Promise<boolean> {
    try {
      return await this.page.locator(selector).isEnabled();
    } catch (error) {
      return false;
    }
  }

  /**
   * Wait for URL to match pattern
   */
  async waitForUrl(expectedUrl: string | RegExp): Promise<void> {
    try {
      await this.page.waitForURL(expectedUrl, { timeout: constants.TIMEOUTS.MEDIUM });
      this.logger.info(`✓ URL matched: ${expectedUrl}`);
    } catch (error) {
      this.logger.error(`URL did not match ${expectedUrl}`, error);
      throw error;
    }
  }

  /**
   * Select option from dropdown
   */
  async selectOption(selector: string, value: string): Promise<void> {
    try {
      await this.page.locator(selector).selectOption(value);
      this.logger.debug(`Selected option: ${value}`);
    } catch (error) {
      this.logger.error(`Failed to select option ${value} from ${selector}`, error);
      throw error;
    }
  }

  /**
   * Check checkbox
   */
  async check(selector: string): Promise<void> {
    try {
      await this.page.locator(selector).check();
      this.logger.debug(`Checked ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to check ${selector}`, error);
      throw error;
    }
  }

  /**
   * Uncheck checkbox
   */
  async uncheck(selector: string): Promise<void> {
    try {
      await this.page.locator(selector).uncheck();
      this.logger.debug(`Unchecked ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to uncheck ${selector}`, error);
      throw error;
    }
  }

  /**
   * Wait for element to be visible
   */
  async waitForElement(selector: string): Promise<void> {
    await this.waitFor.elementVisible(selector);
  }

  /**
   * Take screenshot
   */
  async screenshot(stepName: string): Promise<void> {
    await this.screenshotManager.take(this.constructor.name, stepName);
  }

  /**
   * Verify page title
   */
  async verifyPageTitle(expectedTitle: string): Promise<void> {
    try {
      await expect(this.page).toHaveTitle(new RegExp(expectedTitle, 'i'));
      this.logger.info(`✓ Page title verified: ${expectedTitle}`);
    } catch (error) {
      this.logger.error(`Page title verification failed. Expected: ${expectedTitle}`, error);
      throw error;
    }
  }

  /**
   * Get page URL
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Reload page
   */
  async reload(): Promise<void> {
    try {
      this.logger.info('Reloading page');
      await this.page.reload({ waitUntil: 'networkidle' });
    } catch (error) {
      this.logger.error('Failed to reload page', error);
      throw error;
    }
  }

  /**
   * Accept alert
   */
  async acceptAlert(): Promise<void> {
    try {
      this.page.on('dialog', (dialog) => dialog.accept());
      this.logger.debug('Alert accepted');
    } catch (error) {
      this.logger.error('Failed to accept alert', error);
      throw error;
    }
  }

  /**
   * Dismiss alert
   */
  async dismissAlert(): Promise<void> {
    try {
      this.page.on('dialog', (dialog) => dialog.dismiss());
      this.logger.debug('Alert dismissed');
    } catch (error) {
      this.logger.error('Failed to dismiss alert', error);
      throw error;
    }
  }
}