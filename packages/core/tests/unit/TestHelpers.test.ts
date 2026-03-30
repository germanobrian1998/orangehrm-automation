/**
 * Unit tests for TestHelpers utility class.
 */

import { TestHelpers } from '../../src/utils/TestHelpers';

describe('TestHelpers', () => {
  // ─── uniqueId ─────────────────────────────────────────────────────────────

  describe('uniqueId', () => {
    it('should return a string containing the given prefix', () => {
      const id = TestHelpers.uniqueId('emp');
      expect(id).toMatch(/^emp_\d+_[a-z0-9]+$/);
    });

    it('should generate unique ids on every call', () => {
      const ids = Array.from({ length: 100 }, () => TestHelpers.uniqueId('x'));
      const unique = new Set(ids);
      expect(unique.size).toBe(100);
    });

    it('should use "id" as the default prefix', () => {
      expect(TestHelpers.uniqueId()).toMatch(/^id_/);
    });
  });

  // ─── uniqueEmail ──────────────────────────────────────────────────────────

  describe('uniqueEmail', () => {
    it('should return a valid-looking email address', () => {
      expect(TestHelpers.uniqueEmail()).toMatch(/^qa_\d+@test\.qa$/);
    });

    it('should honour a custom domain', () => {
      expect(TestHelpers.uniqueEmail('example.com')).toContain('@example.com');
    });
  });

  // ─── uniqueUsername ───────────────────────────────────────────────────────

  describe('uniqueUsername', () => {
    it('should return a string with the prefix', () => {
      expect(TestHelpers.uniqueUsername('admin')).toMatch(/^admin_\d+$/);
    });
  });

  // ─── formatDate / today / dateFromToday ───────────────────────────────────

  describe('formatDate', () => {
    it('should format a date as YYYY-MM-DD', () => {
      expect(TestHelpers.formatDate(new Date('2024-06-15T12:00:00Z'))).toBe('2024-06-15');
    });
  });

  describe('today', () => {
    it('should return a string in YYYY-MM-DD format', () => {
      expect(TestHelpers.today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
  });

  describe('dateFromToday', () => {
    it('should return tomorrow when days=1', () => {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      expect(TestHelpers.dateFromToday(1)).toBe(TestHelpers.formatDate(tomorrow));
    });
  });

  // ─── sleep ────────────────────────────────────────────────────────────────

  describe('sleep', () => {
    it('should resolve after at least the given milliseconds', async () => {
      const start = Date.now();
      await TestHelpers.sleep(50);
      expect(Date.now() - start).toBeGreaterThanOrEqual(40);
    });
  });

  // ─── retry ────────────────────────────────────────────────────────────────

  describe('retry', () => {
    it('should return immediately when the function succeeds on first try', async () => {
      const fn = jest.fn().mockResolvedValue('ok');
      const result = await TestHelpers.retry(fn, { maxRetries: 3, delay: 10 });
      expect(result).toBe('ok');
      expect(fn).toHaveBeenCalledTimes(1);
    });

    it('should retry the specified number of times and eventually resolve', async () => {
      let calls = 0;
      const fn = jest.fn().mockImplementation(() => {
        calls++;
        if (calls < 3) return Promise.reject(new Error('Not yet'));
        return Promise.resolve('done');
      });
      const result = await TestHelpers.retry(fn, { maxRetries: 3, delay: 10 });
      expect(result).toBe('done');
      expect(fn).toHaveBeenCalledTimes(3);
    });

    it('should throw after exhausting all retries', async () => {
      const fn = jest.fn().mockRejectedValue(new Error('Always fails'));
      await expect(TestHelpers.retry(fn, { maxRetries: 2, delay: 10 })).rejects.toThrow('Always fails');
      expect(fn).toHaveBeenCalledTimes(2);
    });
  });

  // ─── waitUntil ────────────────────────────────────────────────────────────

  describe('waitUntil', () => {
    it('should resolve as soon as the condition becomes true', async () => {
      let flag = false;
      setTimeout(() => { flag = true; }, 50);
      await TestHelpers.waitUntil(() => flag, { timeout: 1000, interval: 20 });
      expect(flag).toBe(true);
    });

    it('should throw when the condition is never met', async () => {
      await expect(
        TestHelpers.waitUntil(() => false, { timeout: 100, interval: 20 }),
      ).rejects.toThrow();
    });
  });

  // ─── deepClone ────────────────────────────────────────────────────────────

  describe('deepClone', () => {
    it('should return a deep copy with no shared references', () => {
      const original = { a: { b: 1 } };
      const clone = TestHelpers.deepClone(original);
      clone.a.b = 99;
      expect(original.a.b).toBe(1);
    });
  });

  // ─── capitalise ───────────────────────────────────────────────────────────

  describe('capitalise', () => {
    it('should capitalise the first letter', () => {
      expect(TestHelpers.capitalise('hello world')).toBe('Hello world');
    });

    it('should handle empty strings', () => {
      expect(TestHelpers.capitalise('')).toBe('');
    });
  });

  // ─── toKebabCase ──────────────────────────────────────────────────────────

  describe('toKebabCase', () => {
    it('should convert camelCase to kebab-case', () => {
      expect(TestHelpers.toKebabCase('myVariableName')).toBe('my-variable-name');
    });

    it('should convert PascalCase to kebab-case', () => {
      expect(TestHelpers.toKebabCase('MyVariableName')).toBe('my-variable-name');
    });
  });

  // ─── maskSecret ───────────────────────────────────────────────────────────

  describe('maskSecret', () => {
    it('should mask all but the last 3 characters by default', () => {
      expect(TestHelpers.maskSecret('mypassword')).toBe('*******ord');
    });

    it('should mask entirely if the string is shorter than visibleChars', () => {
      expect(TestHelpers.maskSecret('ab', 3)).toBe('**');
    });
  });
});
