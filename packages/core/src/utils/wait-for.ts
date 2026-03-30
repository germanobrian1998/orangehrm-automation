/**
 * Core framework - Wait utilities
 * Provides explicit waits to avoid flaky tests.
 */

import { Page } from '@playwright/test';

export class WaitFor {
  constructor(private page: Page, private timeout: number = 30000) {}

  async elementVisible(selector: string, timeout?: number): Promise<void> {
    const timeoutMs = timeout || this.timeout;
    try {
      await this.page.locator(selector).waitFor({ state: 'visible', timeout: timeoutMs });
    } catch {
      throw new Error(`Element "${selector}" was not visible within ${timeoutMs}ms`);
    }
  }

  async elementHidden(selector: string, timeout?: number): Promise<void> {
    const timeoutMs = timeout || this.timeout;
    try {
      await this.page.locator(selector).waitFor({ state: 'hidden', timeout: timeoutMs });
    } catch {
      throw new Error(`Element "${selector}" did not become hidden within ${timeoutMs}ms`);
    }
  }

  async elementAttached(selector: string, timeout?: number): Promise<void> {
    const timeoutMs = timeout || this.timeout;
    try {
      await this.page.locator(selector).waitFor({ state: 'attached', timeout: timeoutMs });
    } catch {
      throw new Error(`Element "${selector}" was not attached within ${timeoutMs}ms`);
    }
  }

  async urlChange(expectedUrl: string | RegExp, timeout?: number): Promise<void> {
    const timeoutMs = timeout || this.timeout;
    try {
      await this.page.waitForURL(expectedUrl, { timeout: timeoutMs });
    } catch {
      throw new Error(`URL did not match "${expectedUrl}" within ${timeoutMs}ms`);
    }
  }

  async text(text: string, timeout?: number): Promise<void> {
    const timeoutMs = timeout || this.timeout;
    try {
      await this.page.waitForSelector(`:has-text("${text}")`, { timeout: timeoutMs });
    } catch {
      throw new Error(`Text "${text}" was not found within ${timeoutMs}ms`);
    }
  }

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
      } catch {
        // Continue polling
      }
      await this.page.waitForTimeout(pollInterval);
    }

    throw new Error(`Condition was not met within ${timeoutMs}ms`);
  }

  async networkIdle(timeout?: number): Promise<void> {
    const timeoutMs = timeout || this.timeout;
    try {
      await this.page.waitForLoadState('networkidle', { timeout: timeoutMs });
    } catch {
      throw new Error(`Network did not become idle within ${timeoutMs}ms`);
    }
  }

  async loadingComplete(selector: string = '.oxd-loading-spinner', timeout?: number): Promise<void> {
    const timeoutMs = timeout || 5000;
    const spinnerExists = await this.page.locator(selector).count().then((count) => count > 0);
    if (spinnerExists) {
      await this.elementHidden(selector, timeoutMs);
    }
  }

  async delay(ms: number): Promise<void> {
    await this.page.waitForTimeout(ms);
  }
}

export const createWaitFor = (page: Page, timeout?: number): WaitFor => new WaitFor(page, timeout);
