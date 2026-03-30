/**
 * TestHelpers — generic utility functions used across all test suites.
 *
 * Usage:
 *   import { TestHelpers } from '@qa-framework/core';
 *   const id = TestHelpers.uniqueId('emp');
 */

import type { RetryOptions, WaitOptions } from '../types';

export class TestHelpers {
  // ─── Unique data generators ───────────────────────────────────────────────

  /**
   * Generate a unique identifier with an optional prefix.
   * Combines a timestamp and a short random alphanumeric string.
   *
   * @example TestHelpers.uniqueId('user') → "user_1716300000000_a3f2g"
   */
  static uniqueId(prefix = 'id'): string {
    const random = Math.random().toString(36).slice(-6);
    return `${prefix}_${Date.now()}_${random}`;
  }

  /**
   * Generate a unique e-mail address suitable for test data.
   */
  static uniqueEmail(domain = 'test.qa'): string {
    return `qa_${Date.now()}@${domain}`;
  }

  /**
   * Generate a unique username.
   */
  static uniqueUsername(prefix = 'user'): string {
    return `${prefix}_${Date.now()}`;
  }

  // ─── Date helpers ─────────────────────────────────────────────────────────

  /**
   * Format a `Date` object as `YYYY-MM-DD`.
   */
  static formatDate(date: Date): string {
    return date.toISOString().split('T')[0]!;
  }

  /**
   * Return today's date formatted as `YYYY-MM-DD`.
   */
  static today(): string {
    return TestHelpers.formatDate(new Date());
  }

  /**
   * Return a date `days` from today formatted as `YYYY-MM-DD`.
   */
  static dateFromToday(days: number): string {
    const date = new Date();
    date.setDate(date.getDate() + days);
    return TestHelpers.formatDate(date);
  }

  // ─── Async helpers ────────────────────────────────────────────────────────

  /**
   * Sleep for `ms` milliseconds.
   */
  static sleep(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }

  /**
   * Retry an async operation up to `maxRetries` times with optional backoff.
   *
   * @example
   *   await TestHelpers.retry(() => fetchData(), { maxRetries: 3, delay: 500 });
   */
  static async retry<T>(
    fn: () => Promise<T>,
    options: RetryOptions = { maxRetries: 3, delay: 1000 },
  ): Promise<T> {
    let lastError: unknown;
    for (let attempt = 1; attempt <= options.maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error;
        if (attempt < options.maxRetries) {
          const delay = options.backoff ? options.delay * attempt : options.delay;
          await TestHelpers.sleep(delay);
        }
      }
    }
    throw lastError;
  }

  /**
   * Poll `condition` every `interval` ms until it returns `true` or `timeout` is reached.
   *
   * @throws Error if the condition is not met within `timeout` ms.
   */
  static async waitUntil(
    condition: () => Promise<boolean> | boolean,
    options: WaitOptions = { timeout: 10000, interval: 500 },
  ): Promise<void> {
    const timeout = options.timeout ?? 10000;
    const interval = options.interval ?? 500;
    const deadline = Date.now() + timeout;

    while (Date.now() < deadline) {
      if (await condition()) return;
      await TestHelpers.sleep(interval);
    }

    throw new Error(`Condition not met within ${timeout}ms`);
  }

  // ─── Object / string utilities ────────────────────────────────────────────

  /**
   * Deep-clone a plain JSON-serialisable object.
   */
  static deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj)) as T;
  }

  /**
   * Capitalise the first letter of a string.
   */
  static capitalise(str: string): string {
    if (!str) return str;
    return str.charAt(0).toUpperCase() + str.slice(1);
  }

  /**
   * Convert a camelCase or PascalCase string to kebab-case.
   */
  static toKebabCase(str: string): string {
    return str
      .replace(/([a-z])([A-Z])/g, '$1-$2')
      .replace(/\s+/g, '-')
      .toLowerCase();
  }

  /**
   * Mask all but the last `visibleChars` characters of a sensitive string.
   *
   * @example TestHelpers.maskSecret('mypassword') → "******ord"
   */
  static maskSecret(value: string, visibleChars = 3): string {
    if (value.length <= visibleChars) return '*'.repeat(value.length);
    return '*'.repeat(value.length - visibleChars) + value.slice(-visibleChars);
  }
}
