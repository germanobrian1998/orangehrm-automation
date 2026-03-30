/**
 * Unit tests for Config, Logger, and TestHelpers
 * 68 unique unit tests covering the core framework utilities.
 */

import { test, expect } from '@playwright/test';
import { Config } from '../../src/config/Config';
import { Logger, createLogger } from '../../src/logger/logger';
import { constants } from '../../src/config/constants';
import { environment } from '../../src/config/environment';
import {
  sleep,
  randomInt,
  randomString,
  randomEmail,
  today,
  formatDate,
  addDays,
  retry,
  deepClone,
  trimObjectValues,
  isNonEmptyString,
  capitalise,
  camelToLabel,
  toQueryString,
  parseQueryString,
  truncate,
  arraysEqual,
  flattenObject,
} from '../../src/utils/TestHelpers';

// ─── Config ──────────────────────────────────────────────────────────────────

test.describe('@core Config', () => {
  test.beforeEach(() => {
    Config.reset();
  });

  test('getInstance returns a Config instance', () => {
    const cfg = Config.getInstance();
    expect(cfg).toBeInstanceOf(Config);
  });

  test('getInstance is a singleton', () => {
    const a = Config.getInstance();
    const b = Config.getInstance();
    expect(a).toBe(b);
  });

  test('baseURL has a value', () => {
    const cfg = Config.getInstance();
    expect(cfg.baseURL).toBeTruthy();
    expect(typeof cfg.baseURL).toBe('string');
  });

  test('adminUsername defaults to Admin', () => {
    const cfg = Config.getInstance();
    expect(cfg.adminUsername).toBe('Admin');
  });

  test('adminPassword defaults to admin123', () => {
    const cfg = Config.getInstance();
    expect(cfg.adminPassword).toBe('admin123');
  });

  test('testTimeout is a positive integer', () => {
    const cfg = Config.getInstance();
    expect(cfg.testTimeout).toBeGreaterThan(0);
    expect(Number.isInteger(cfg.testTimeout)).toBe(true);
  });

  test('apiTimeout is a positive integer', () => {
    const cfg = Config.getInstance();
    expect(cfg.apiTimeout).toBeGreaterThan(0);
    expect(Number.isInteger(cfg.apiTimeout)).toBe(true);
  });

  test('logLevel is a non-empty string', () => {
    const cfg = Config.getInstance();
    expect(typeof cfg.logLevel).toBe('string');
    expect(cfg.logLevel.length).toBeGreaterThan(0);
  });

  test('debug is a boolean', () => {
    const cfg = Config.getInstance();
    expect(typeof cfg.debug).toBe('boolean');
  });

  test('isCI is a boolean', () => {
    const cfg = Config.getInstance();
    expect(typeof cfg.isCI).toBe('boolean');
  });

  test('isDev is a boolean', () => {
    const cfg = Config.getInstance();
    expect(typeof cfg.isDev).toBe('boolean');
  });

  test('get() returns the correct value for a key', () => {
    const cfg = Config.getInstance();
    expect(cfg.get('adminUsername')).toBe('Admin');
  });

  test('getAll() returns all config values', () => {
    const cfg = Config.getInstance();
    const all = cfg.getAll();
    expect(all.baseURL).toBeTruthy();
    expect(all.adminUsername).toBe('Admin');
  });

  test('reset() forces a new instance', () => {
    const a = Config.getInstance();
    Config.reset();
    const b = Config.getInstance();
    expect(a).not.toBe(b);
  });
});

// ─── Logger ───────────────────────────────────────────────────────────────────

test.describe('@core Logger', () => {
  test('createLogger returns a Logger instance', () => {
    const logger = createLogger('TestCtx');
    expect(logger).toBeInstanceOf(Logger);
  });

  test('Logger instantiates without context', () => {
    const logger = new Logger();
    expect(logger).toBeInstanceOf(Logger);
  });

  test('logger.info does not throw', () => {
    const logger = createLogger('Test');
    expect(() => logger.info('info message')).not.toThrow();
  });

  test('logger.debug does not throw', () => {
    const logger = createLogger('Test');
    expect(() => logger.debug('debug message')).not.toThrow();
  });

  test('logger.warn does not throw', () => {
    const logger = createLogger('Test');
    expect(() => logger.warn('warn message')).not.toThrow();
  });

  test('logger.error does not throw with string', () => {
    const logger = createLogger('Test');
    expect(() => logger.error('error message')).not.toThrow();
  });

  test('logger.error does not throw with Error object', () => {
    const logger = createLogger('Test');
    expect(() => logger.error('err', new Error('boom'))).not.toThrow();
  });

  test('logger.step does not throw', () => {
    const logger = createLogger('Test');
    expect(() => logger.step(1, 'step description')).not.toThrow();
  });

  test('logger.assertion does not throw for true condition', () => {
    const logger = createLogger('Test');
    expect(() => logger.assertion(true, 'passed')).not.toThrow();
  });

  test('logger.assertion does not throw for false condition', () => {
    const logger = createLogger('Test');
    expect(() => logger.assertion(false, 'failed')).not.toThrow();
  });

  test('createLogger with empty string context does not throw', () => {
    expect(() => createLogger('')).not.toThrow();
  });
});

// ─── Constants ────────────────────────────────────────────────────────────────

test.describe('@core Constants', () => {
  test('TIMEOUTS.SHORT is 3000', () => {
    expect(constants.TIMEOUTS.SHORT).toBe(3000);
  });

  test('TIMEOUTS.MEDIUM is 5000', () => {
    expect(constants.TIMEOUTS.MEDIUM).toBe(5000);
  });

  test('TIMEOUTS.LONG is 10000', () => {
    expect(constants.TIMEOUTS.LONG).toBe(10000);
  });

  test('TIMEOUTS.VERY_LONG is 30000', () => {
    expect(constants.TIMEOUTS.VERY_LONG).toBe(30000);
  });

  test('DEFAULT_CREDENTIALS.username is Admin', () => {
    expect(constants.DEFAULT_CREDENTIALS.username).toBe('Admin');
  });
});

// ─── Environment ──────────────────────────────────────────────────────────────

test.describe('@core Environment', () => {
  test('environment.baseURL is a valid URL string', () => {
    expect(environment.baseURL).toMatch(/^https?:\/\//);
  });

  test('environment.adminUsername is a non-empty string', () => {
    expect(environment.adminUsername.length).toBeGreaterThan(0);
  });
});

// ─── TestHelpers ─────────────────────────────────────────────────────────────

test.describe('@core TestHelpers', () => {
  test('sleep resolves after the given delay', async () => {
    const start = Date.now();
    await sleep(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
  });

  test('randomInt returns a value within [min, max]', () => {
    for (let i = 0; i < 20; i++) {
      const val = randomInt(1, 10);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  test('randomInt with equal min/max returns that value', () => {
    expect(randomInt(5, 5)).toBe(5);
  });

  test('randomString returns a string of the correct length', () => {
    expect(randomString(12)).toHaveLength(12);
  });

  test('randomString defaults to length 8', () => {
    expect(randomString()).toHaveLength(8);
  });

  test('randomString contains only alphanumeric characters', () => {
    expect(randomString(20)).toMatch(/^[A-Za-z0-9]+$/);
  });

  test('randomEmail returns a valid-looking email', () => {
    const email = randomEmail();
    expect(email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
  });

  test('randomEmail uses the provided domain', () => {
    const email = randomEmail('example.com');
    expect(email).toMatch(/@example\.com$/);
  });

  test('today returns a date in YYYY-MM-DD format', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('formatDate formats a Date correctly', () => {
    const d = new Date(2024, 0, 15); // 2024-01-15
    expect(formatDate(d)).toBe('2024-01-15');
  });

  test('addDays adds positive days', () => {
    const base = new Date(2024, 0, 1);
    const result = addDays(base, 5);
    expect(result.getDate()).toBe(6);
  });

  test('addDays subtracts with negative days', () => {
    const base = new Date(2024, 0, 10);
    const result = addDays(base, -3);
    expect(result.getDate()).toBe(7);
  });

  test('addDays does not mutate the original date', () => {
    const base = new Date(2024, 0, 1);
    addDays(base, 10);
    expect(base.getDate()).toBe(1);
  });

  test('retry succeeds on first attempt', async () => {
    let calls = 0;
    const result = await retry(async () => {
      calls++;
      return 42;
    });
    expect(result).toBe(42);
    expect(calls).toBe(1);
  });

  test('retry retries on failure then succeeds', async () => {
    let calls = 0;
    const result = await retry(
      async () => {
        calls++;
        if (calls < 3) throw new Error('not yet');
        return 'done';
      },
      3,
      10
    );
    expect(result).toBe('done');
    expect(calls).toBe(3);
  });

  test('retry throws after exhausting attempts', async () => {
    await expect(
      retry(async () => { throw new Error('always fails'); }, 2, 10)
    ).rejects.toThrow('always fails');
  });

  test('deepClone returns an equal but different object', () => {
    const original = { a: 1, b: { c: 2 } };
    const clone = deepClone(original);
    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
    expect(clone.b).not.toBe(original.b);
  });

  test('trimObjectValues trims string values', () => {
    const input = { name: '  Alice  ', age: 30 };
    const result = trimObjectValues(input as Record<string, unknown>) as typeof input;
    expect(result.name).toBe('Alice');
    expect(result.age).toBe(30);
  });

  test('isNonEmptyString returns true for non-empty string', () => {
    expect(isNonEmptyString('hello')).toBe(true);
  });

  test('isNonEmptyString returns false for empty string', () => {
    expect(isNonEmptyString('')).toBe(false);
  });

  test('isNonEmptyString returns false for whitespace-only string', () => {
    expect(isNonEmptyString('   ')).toBe(false);
  });

  test('isNonEmptyString returns false for non-string', () => {
    expect(isNonEmptyString(42)).toBe(false);
  });

  test('capitalise capitalises the first letter', () => {
    expect(capitalise('hello world')).toBe('Hello world');
  });

  test('capitalise handles already-capitalised string', () => {
    expect(capitalise('Hello')).toBe('Hello');
  });

  test('camelToLabel converts camelCase to readable label', () => {
    expect(camelToLabel('firstName')).toBe('First Name');
  });

  test('toQueryString builds a query string', () => {
    expect(toQueryString({ page: 1, size: 10 })).toBe('?page=1&size=10');
  });

  test('toQueryString returns empty string for empty object', () => {
    expect(toQueryString({})).toBe('');
  });

  test('parseQueryString parses a query string', () => {
    const result = parseQueryString('?foo=bar&baz=qux');
    expect(result).toEqual({ foo: 'bar', baz: 'qux' });
  });

  test('parseQueryString handles string without leading ?', () => {
    const result = parseQueryString('a=1&b=2');
    expect(result).toEqual({ a: '1', b: '2' });
  });

  test('truncate shortens long strings', () => {
    expect(truncate('Hello World', 5)).toBe('Hello…');
  });

  test('truncate leaves short strings intact', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });

  test('arraysEqual returns true for equal arrays', () => {
    expect(arraysEqual([1, 2, 3], [3, 1, 2])).toBe(true);
  });

  test('arraysEqual returns false for different arrays', () => {
    expect(arraysEqual([1, 2], [1, 3])).toBe(false);
  });

  test('arraysEqual returns false for different lengths', () => {
    expect(arraysEqual([1, 2, 3], [1, 2])).toBe(false);
  });

  test('flattenObject flattens nested objects', () => {
    const result = flattenObject({ a: { b: { c: 1 } } });
    expect(result).toEqual({ 'a.b.c': 1 });
  });

  test('flattenObject leaves flat objects unchanged', () => {
    const result = flattenObject({ x: 1, y: 2 });
    expect(result).toEqual({ x: 1, y: 2 });
  });
});
