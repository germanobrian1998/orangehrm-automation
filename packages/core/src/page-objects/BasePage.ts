/**
 * BasePage — abstract base class for all Page Object Model classes.
 *
 * Provides common browser interactions with built-in logging, error handling,
 * and wait strategies so that every page object is consistent and DRY.
 *
 * Usage:
 *   import { BasePage } from '@qa-framework/core';
 *
 *   export class LoginPage extends BasePage {
 *     async login(username: string, password: string): Promise<void> {
 *       await this.fill('#username', username);
 *       await this.fill('#password', password);
 *       await this.click('.submit-button');
 *     }
 *   }
 */

import { Page, expect } from '@playwright/test';
import { Logger } from '../logger/Logger';
import type { NavigationOptions, WaitOptions } from '../types';

export abstract class BasePage {
  protected readonly logger: Logger;

  constructor(protected readonly page: Page) {
    this.logger = new Logger(this.constructor.name);
  }

  // ─── Navigation ──────────────────────────────────────────────────────────

  /**
   * Navigate to an absolute URL or path relative to `page.context().pages()[0].url()`.
   */
  async goto(url: string, options?: NavigationOptions): Promise<void> {
    try {
      this.logger.step(1, `Navigating to ${url}`);
      await this.page.goto(url, {
        waitUntil: options?.waitUntil ?? 'networkidle',
        timeout: options?.timeout,
      });
      this.logger.info(`✓ Navigated to ${url}`);
    } catch (error) {
      this.logger.error(`Navigation failed to ${url}`, error);
      throw error;
    }
  }

  /**
   * Returns the current page URL.
   */
  getCurrentUrl(): string {
    return this.page.url();
  }

  /**
   * Reload the current page.
   */
  async reload(options?: NavigationOptions): Promise<void> {
    try {
      this.logger.info('Reloading page');
      await this.page.reload({ waitUntil: options?.waitUntil ?? 'networkidle' });
    } catch (error) {
      this.logger.error('Failed to reload page', error);
      throw error;
    }
  }

  // ─── Waits ───────────────────────────────────────────────────────────────

  /**
   * Wait for an element to become visible.
   */
  async waitForElement(selector: string, options?: WaitOptions): Promise<void> {
    try {
      await this.page.locator(selector).waitFor({
        state: 'visible',
        timeout: options?.timeout,
      });
      this.logger.debug(`Element visible: ${selector}`);
    } catch (error) {
      this.logger.error(`Element not visible: ${selector}`, error);
      throw new Error(`Element "${selector}" was not visible within the expected time`);
    }
  }

  /**
   * Wait for a URL pattern to match the current page URL.
   */
  async waitForUrl(expectedUrl: string | RegExp, timeout?: number): Promise<void> {
    try {
      await this.page.waitForURL(expectedUrl, { timeout });
      this.logger.info(`✓ URL matched: ${String(expectedUrl)}`);
    } catch (error) {
      this.logger.error(`URL did not match ${String(expectedUrl)}`, error);
      throw error;
    }
  }

  // ─── Interactions ─────────────────────────────────────────────────────────

  /**
   * Click an element, scrolling it into view first.
   */
  async click(selector: string): Promise<void> {
    try {
      await this.waitForElement(selector);
      await this.page.locator(selector).scrollIntoViewIfNeeded();
      await this.page.locator(selector).click();
      this.logger.debug(`Clicked: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to click: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Clear an input and fill it with `text`.
   */
  async fill(selector: string, text: string): Promise<void> {
    try {
      await this.waitForElement(selector);
      await this.page.locator(selector).clear();
      await this.page.locator(selector).fill(text);
      this.logger.debug(`Filled: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to fill: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Get the trimmed text content of an element.
   */
  async getText(selector: string): Promise<string> {
    try {
      await this.waitForElement(selector);
      const text = await this.page.locator(selector).textContent();
      return text?.trim() ?? '';
    } catch (error) {
      this.logger.error(`Failed to get text from: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Get the value of an input element.
   */
  async getInputValue(selector: string): Promise<string> {
    try {
      const value = await this.page.locator(selector).inputValue();
      return value ?? '';
    } catch (error) {
      this.logger.error(`Failed to get input value from: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Select an option from a `<select>` element.
   */
  async selectOption(selector: string, value: string): Promise<void> {
    try {
      await this.page.locator(selector).selectOption(value);
      this.logger.debug(`Selected option "${value}" in: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to select option in: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Double-click an element.
   */
  async doubleClick(selector: string): Promise<void> {
    try {
      await this.waitForElement(selector);
      await this.page.locator(selector).dblclick();
      this.logger.debug(`Double-clicked: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to double-click: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Check a checkbox.
   */
  async check(selector: string): Promise<void> {
    try {
      await this.page.locator(selector).check();
      this.logger.debug(`Checked: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to check: ${selector}`, error);
      throw error;
    }
  }

  /**
   * Uncheck a checkbox.
   */
  async uncheck(selector: string): Promise<void> {
    try {
      await this.page.locator(selector).uncheck();
      this.logger.debug(`Unchecked: ${selector}`);
    } catch (error) {
      this.logger.error(`Failed to uncheck: ${selector}`, error);
      throw error;
    }
  }

  // ─── State checks ─────────────────────────────────────────────────────────

  /**
   * Returns `true` if the element is visible on the page.
   */
  async isVisible(selector: string): Promise<boolean> {
    try {
      return await this.page.locator(selector).isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Returns `true` if the element is enabled (not disabled).
   */
  async isEnabled(selector: string): Promise<boolean> {
    try {
      return await this.page.locator(selector).isEnabled();
    } catch {
      return false;
    }
  }

  // ─── Assertions ──────────────────────────────────────────────────────────

  /**
   * Assert that the page `<title>` matches `expectedTitle` (case-insensitive).
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

  // ─── Dialogs ─────────────────────────────────────────────────────────────

  /**
   * Accept the next browser dialog (alert / confirm / prompt).
   */
  acceptAlert(): void {
    this.page.on('dialog', (dialog) => {
      this.logger.debug('Accepted dialog');
      dialog.accept();
    });
  }

  /**
   * Dismiss the next browser dialog.
   */
  dismissAlert(): void {
    this.page.on('dialog', (dialog) => {
      this.logger.debug('Dismissed dialog');
      dialog.dismiss();
    });
  }
}
