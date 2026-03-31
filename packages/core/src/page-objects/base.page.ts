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

  /** Double-click an element */
  async doubleClick(selector: string): Promise<void> {
    try {
      await this.waitFor.elementVisible(selector);
      await this.page.locator(selector).dblclick();
      this.logger.debug(`Double-clicked ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to double-click ${selector}`, error);
      throw error;
    }
  }

  /** Right-click an element */
  async rightClick(selector: string): Promise<void> {
    try {
      await this.waitFor.elementVisible(selector);
      await this.page.locator(selector).click({ button: 'right' });
      this.logger.debug(`Right-clicked ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to right-click ${selector}`, error);
      throw error;
    }
  }

  /** Hover over an element */
  async hover(selector: string): Promise<void> {
    try {
      await this.waitFor.elementVisible(selector);
      await this.page.locator(selector).hover();
      this.logger.debug(`Hovered over ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to hover over ${selector}`, error);
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

  /** Get the current value of an input element */
  async getInputValue(selector: string): Promise<string> {
    try {
      const value = await this.page.locator(selector).inputValue();
      return value || '';
    } catch (error) {
      this.logger.error(`Failed to get input value from ${selector}`, error);
      throw error;
    }
  }

  /** Get an attribute value from an element */
  async getAttribute(selector: string, attribute: string): Promise<string | null> {
    try {
      await this.waitFor.elementVisible(selector);
      return await this.page.locator(selector).getAttribute(attribute);
    } catch (error) {
      this.logger.error(`Failed to get attribute "${attribute}" from ${selector}`, error);
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

  /** Check if element is enabled */
  async isEnabled(selector: string): Promise<boolean> {
    try {
      return await this.page.locator(selector).isEnabled();
    } catch {
      return false;
    }
  }

  /** Select an option from a <select> dropdown */
  async selectOption(selector: string, value: string): Promise<void> {
    try {
      await this.page.locator(selector).selectOption(value);
      this.logger.debug(`Selected option "${value}" in ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to select option "${value}" in ${selector}`, error);
      throw error;
    }
  }

  /** Check a checkbox or radio button */
  async check(selector: string): Promise<void> {
    try {
      await this.page.locator(selector).check();
      this.logger.debug(`Checked ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to check ${selector}`, error);
      throw error;
    }
  }

  /** Uncheck a checkbox */
  async uncheck(selector: string): Promise<void> {
    try {
      await this.page.locator(selector).uncheck();
      this.logger.debug(`Unchecked ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to uncheck ${selector}`, error);
      throw error;
    }
  }

  /** Register a one-time handler that accepts the next browser dialog */
  acceptAlert(): void {
    this.page.once('dialog', (dialog) => {
      this.logger.debug('Accepting dialog');
      void dialog.accept();
    });
  }

  /** Register a one-time handler that dismisses the next browser dialog */
  dismissAlert(): void {
    this.page.once('dialog', (dialog) => {
      this.logger.debug('Dismissing dialog');
      void dialog.dismiss();
    });
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

  /** Wait for an element to reach the given state (default: visible) */
  async waitForElement(
    selector: string,
    state: 'visible' | 'hidden' | 'attached' | 'detached' = 'visible',
    timeout?: number
  ): Promise<void> {
    try {
      await this.page
        .locator(selector)
        .waitFor({ state, timeout: timeout ?? constants.TIMEOUTS.LONG });
      this.logger.debug(`Element "${selector}" reached state "${state}"`);
    } catch (error) {
      this.logger.error(
        `Element "${selector}" did not reach state "${state}"`,
        error
      );
      throw error;
    }
  }

  /** Wait until an arbitrary async condition returns true */
  async waitUntil(
    condition: () => Promise<boolean>,
    timeout: number = constants.TIMEOUTS.LONG
  ): Promise<void> {
    await this.waitFor.condition(condition, timeout);
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
