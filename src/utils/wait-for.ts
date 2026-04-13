/**
 * Custom wait utilities to avoid flaky tests
 * Anti-flaky strategies:
 * - Explicit waits instead of hardcoded delays
 * - Proper error messages for debugging
 */

import { Page } from '@playwright/test';

export class WaitFor {
  constructor(
    private page: Page,
    private timeout: number = 30000
  ) {}

  /**
   * Wait for element to be visible with retry logic
   */
  async elementVisible(selector: string, timeout?: number): Promise<void> {
    const timeoutMs = timeout || this.timeout;
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout: timeoutMs });
    } catch (error) {
      throw new Error(`Element "${selector}" was not visible within ${timeoutMs}ms`);
    }
  }

  /**
   * Wait for element to be hidden
   */
  async elementHidden(selector: string, timeout?: number): Promise<void> {
    const timeoutMs = timeout || this.timeout;
    try {
      await this.page.locator(selector).waitFor({ state: 'hidden', timeout: timeoutMs });
    } catch (error) {
      throw new Error(`Element "${selector}" did not become hidden within ${timeoutMs}ms`);
    }
  }

  /**
   * Wait for element to be attached to DOM
   */
  async elementAttached(selector: string, timeout?: number): Promise<void> {
    const timeoutMs = timeout || this.timeout;
    try {
      await this.page.locator(selector).waitFor({ state: 'attached', timeout: timeoutMs });
    } catch (error) {
      throw new Error(`Element "${selector}" was not attached within ${timeoutMs}ms`);
    }
  }

  /**
   * Wait for navigation to specific URL
   */
  async urlChange(expectedUrl: string | RegExp, timeout?: number): Promise<void> {
    const timeoutMs = timeout || this.timeout;
    try {
      await this.page.waitForURL(expectedUrl, { timeout: timeoutMs });
    } catch (error) {
      throw new Error(`URL did not match "${expectedUrl}" within ${timeoutMs}ms`);
    }
  }

  /**
   * Wait for specific text to appear
   */
  async text(text: string, timeout?: number): Promise<void> {
    const timeoutMs = timeout || this.timeout;
    try {
      await this.page.waitForSelector(`:has-text("${text}")`, { timeout: timeoutMs });
    } catch (error) {
      throw new Error(`Text "${text}" was not found within ${timeoutMs}ms`);
    }
  }

  /**
   * Wait for function to return true (polling)
   */
  async condition(
    callback: () => Promise<boolean>,
    timeout?: number,
    pollInterval: number = 500
  ): Promise<void> {
    const timeoutMs = timeout || this.timeout;
    const startTime = Date.now();

    while (Date.now() - startTime < timeoutMs) {
      try {
        const result = await callback();
        if (result) return;
      } catch (error) {
        // Continue polling
      }
      await this.page.waitForTimeout(pollInterval);
    }

    throw new Error(`Condition was not met within ${timeoutMs}ms`);
  }

  /**
   * Wait for network to be idle
   */
  async networkIdle(timeout?: number): Promise<void> {
    const timeoutMs = timeout || this.timeout;
    try {
      await this.page.waitForLoadState('networkidle', { timeout: timeoutMs });
    } catch (error) {
      throw new Error(`Network did not become idle within ${timeoutMs}ms`);
    }
  }

  /**
   * Wait for loading spinner to disappear
   */
  async loadingComplete(
    selector: string = '.oxd-loading-spinner',
    timeout?: number
  ): Promise<void> {
    const timeoutMs = timeout || 5000;

    // Check if spinner exists
    const spinnerExists = await this.page
      .locator(selector)
      .count()
      .then((count) => count > 0);

    if (spinnerExists) {
      await this.elementHidden(selector, timeoutMs);
    }
  }

  /**
   * Utility delay (use sparingly, for specific delays only)
   */
  async delay(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }
}

export const createWaitFor = (page: Page, timeout?: number): WaitFor => {
  return new WaitFor(page, timeout);
};
