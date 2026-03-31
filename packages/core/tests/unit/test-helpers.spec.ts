/**
 * Unit tests for TestHelpers utility functions
 * Covers all exported helpers: sleep, randomInt, randomString, randomEmail,
 * date utilities, retry, deepClone, object utilities, string utilities, and array utilities.
 */

import { describe, it, expect } from '@jest/globals';
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

// ── sleep() ──────────────────────────────────────────────────────────────────

describe('sleep()', () => {
  it('should resolve after the given delay', async () => {
    const start = Date.now();
    await sleep(50);
    expect(Date.now() - start).toBeGreaterThanOrEqual(40);
  });

  it('should resolve immediately for 0ms', async () => {
    const start = Date.now();
    await sleep(0);
    expect(Date.now() - start).toBeLessThan(50);
  });
});

// ── randomInt() ──────────────────────────────────────────────────────────────

describe('randomInt()', () => {
  it('should return a value within [min, max]', () => {
    for (let i = 0; i < 30; i++) {
      const val = randomInt(1, 10);
      expect(val).toBeGreaterThanOrEqual(1);
      expect(val).toBeLessThanOrEqual(10);
    }
  });

  it('should return the exact value when min === max', () => {
    expect(randomInt(7, 7)).toBe(7);
  });

  it('should return an integer', () => {
    expect(Number.isInteger(randomInt(0, 100))).toBe(true);
  });

  it('should handle large ranges', () => {
    const val = randomInt(0, 1_000_000);
    expect(val).toBeGreaterThanOrEqual(0);
    expect(val).toBeLessThanOrEqual(1_000_000);
  });
});

// ── randomString() ───────────────────────────────────────────────────────────

describe('randomString()', () => {
  it('should return a string of the specified length', () => {
    expect(randomString(12)).toHaveLength(12);
  });

  it('should default to length 8', () => {
    expect(randomString()).toHaveLength(8);
  });

  it('should contain only alphanumeric characters', () => {
    expect(randomString(50)).toMatch(/^[A-Za-z0-9]+$/);
  });

  it('should return different strings on successive calls', () => {
    const a = randomString(16);
    const b = randomString(16);
    // Technically could collide, but extremely unlikely with length 16
    expect(a).not.toBe(b);
  });

  it('should handle length 1', () => {
    expect(randomString(1)).toHaveLength(1);
  });
});

// ── randomEmail() ────────────────────────────────────────────────────────────

describe('randomEmail()', () => {
  it('should return a valid-looking email address', () => {
    expect(randomEmail()).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
  });

  it('should use the default domain "test.qa"', () => {
    expect(randomEmail()).toMatch(/@test\.qa$/);
  });

  it('should use a custom domain when provided', () => {
    expect(randomEmail('example.com')).toMatch(/@example\.com$/);
  });

  it('should prefix the local part with "test_"', () => {
    expect(randomEmail()).toMatch(/^test_/);
  });

  it('should generate different emails on successive calls', () => {
    const a = randomEmail();
    const b = randomEmail();
    expect(a).not.toBe(b);
  });
});

// ── today() / formatDate() / addDays() ───────────────────────────────────────

describe('today()', () => {
  it('should return a string in YYYY-MM-DD format', () => {
    expect(today()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  it('should match the current date', () => {
    const now = new Date();
    const expected = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}`;
    expect(today()).toBe(expected);
  });
});

describe('formatDate()', () => {
  it('should format a Date object as YYYY-MM-DD', () => {
    expect(formatDate(new Date(2024, 0, 15))).toBe('2024-01-15');
  });

  it('should pad month and day with leading zero', () => {
    expect(formatDate(new Date(2023, 8, 5))).toBe('2023-09-05');
  });

  it('should handle end-of-year dates', () => {
    expect(formatDate(new Date(2024, 11, 31))).toBe('2024-12-31');
  });
});

describe('addDays()', () => {
  it('should add positive days', () => {
    const base = new Date(2024, 0, 1);
    expect(addDays(base, 5).getDate()).toBe(6);
  });

  it('should subtract with negative days', () => {
    const base = new Date(2024, 0, 10);
    expect(addDays(base, -3).getDate()).toBe(7);
  });

  it('should NOT mutate the original date', () => {
    const base = new Date(2024, 0, 1);
    addDays(base, 10);
    expect(base.getDate()).toBe(1);
  });

  it('should return an equal date for 0 days', () => {
    const base = new Date(2024, 5, 15);
    expect(addDays(base, 0).getTime()).toBe(base.getTime());
  });

  it('should cross month boundary correctly', () => {
    const base = new Date(2024, 0, 30);
    const result = addDays(base, 3);
    expect(result.getMonth()).toBe(1); // February
    expect(result.getDate()).toBe(2);
  });
});

// ── retry() ──────────────────────────────────────────────────────────────────

describe('retry()', () => {
  it('should succeed on the first attempt and return the value', async () => {
    let calls = 0;
    const result = await retry(async () => { calls++; return 42; });
    expect(result).toBe(42);
    expect(calls).toBe(1);
  });

  it('should retry on failure and succeed on the nth attempt', async () => {
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

  it('should throw after exhausting all attempts', async () => {
    await expect(
      retry(async () => { throw new Error('always fails'); }, 2, 10)
    ).rejects.toThrow('always fails');
  });

  it('should default to 3 attempts', async () => {
    let calls = 0;
    await expect(
      retry(async () => { calls++; throw new Error('fail'); }, undefined, 10)
    ).rejects.toThrow();
    expect(calls).toBe(3);
  });

  it('should pass generic return type through', async () => {
    const result = await retry<string>(async () => 'hello');
    expect(result).toBe('hello');
  });
});

// ── deepClone() ───────────────────────────────────────────────────────────────

describe('deepClone()', () => {
  it('should return an equal but non-identical object', () => {
    const original = { a: 1, b: { c: 2 } };
    const clone = deepClone(original);
    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
  });

  it('should deep-clone nested objects', () => {
    const original = { a: { b: { c: 3 } } };
    const clone = deepClone(original);
    expect(clone.a.b).not.toBe(original.a.b);
  });

  it('should clone arrays', () => {
    const original = [1, 2, [3, 4]];
    const clone = deepClone(original);
    expect(clone).toEqual(original);
    expect(clone).not.toBe(original);
  });
});

// ── trimObjectValues() ────────────────────────────────────────────────────────

describe('trimObjectValues()', () => {
  it('should trim whitespace from string values', () => {
    const result = trimObjectValues({ name: '  Alice  ' } as Record<string, unknown>);
    expect((result as Record<string, unknown>).name).toBe('Alice');
  });

  it('should leave non-string values unchanged', () => {
    const result = trimObjectValues({ age: 30 } as Record<string, unknown>);
    expect((result as Record<string, unknown>).age).toBe(30);
  });

  it('should handle empty strings', () => {
    const result = trimObjectValues({ x: '   ' } as Record<string, unknown>);
    expect((result as Record<string, unknown>).x).toBe('');
  });
});

// ── isNonEmptyString() ────────────────────────────────────────────────────────

describe('isNonEmptyString()', () => {
  it('should return true for a non-empty string', () => {
    expect(isNonEmptyString('hello')).toBe(true);
  });

  it('should return false for an empty string', () => {
    expect(isNonEmptyString('')).toBe(false);
  });

  it('should return false for whitespace-only string', () => {
    expect(isNonEmptyString('   ')).toBe(false);
  });

  it('should return false for a number', () => {
    expect(isNonEmptyString(42)).toBe(false);
  });

  it('should return false for null', () => {
    expect(isNonEmptyString(null)).toBe(false);
  });

  it('should return false for undefined', () => {
    expect(isNonEmptyString(undefined)).toBe(false);
  });
});

// ── capitalise() ─────────────────────────────────────────────────────────────

describe('capitalise()', () => {
  it('should capitalise the first letter', () => {
    expect(capitalise('hello world')).toBe('Hello world');
  });

  it('should leave an already-capitalised string unchanged', () => {
    expect(capitalise('Hello')).toBe('Hello');
  });

  it('should handle a single character', () => {
    expect(capitalise('a')).toBe('A');
  });

  it('should handle an empty string without throwing', () => {
    expect(capitalise('')).toBe('');
  });
});

// ── camelToLabel() ────────────────────────────────────────────────────────────

describe('camelToLabel()', () => {
  it('should convert camelCase to a human-readable label', () => {
    expect(camelToLabel('firstName')).toBe('First Name');
  });

  it('should handle multi-word camelCase', () => {
    expect(camelToLabel('myVariableName')).toBe('My Variable Name');
  });

  it('should handle a single word', () => {
    expect(camelToLabel('name')).toBe('Name');
  });
});

// ── toQueryString() ───────────────────────────────────────────────────────────

describe('toQueryString()', () => {
  it('should build a query string from key-value pairs', () => {
    expect(toQueryString({ page: 1, size: 10 })).toBe('?page=1&size=10');
  });

  it('should return an empty string for an empty object', () => {
    expect(toQueryString({})).toBe('');
  });

  it('should handle boolean values', () => {
    expect(toQueryString({ active: true })).toBe('?active=true');
  });

  it('should encode special characters', () => {
    const qs = toQueryString({ q: 'hello world' });
    expect(qs).toContain('hello%20world');
  });
});

// ── parseQueryString() ────────────────────────────────────────────────────────

describe('parseQueryString()', () => {
  it('should parse a query string with leading "?"', () => {
    expect(parseQueryString('?foo=bar&baz=qux')).toEqual({ foo: 'bar', baz: 'qux' });
  });

  it('should parse a query string without leading "?"', () => {
    expect(parseQueryString('a=1&b=2')).toEqual({ a: '1', b: '2' });
  });

  it('should return an empty object for an empty string', () => {
    expect(parseQueryString('')).toEqual({});
  });

  it('should handle a single key-value pair', () => {
    expect(parseQueryString('key=value')).toEqual({ key: 'value' });
  });
});

// ── truncate() ───────────────────────────────────────────────────────────────

describe('truncate()', () => {
  it('should truncate a string longer than maxLength', () => {
    expect(truncate('Hello World', 5)).toBe('Hello…');
  });

  it('should leave a string shorter than maxLength unchanged', () => {
    expect(truncate('Hi', 10)).toBe('Hi');
  });

  it('should leave a string equal to maxLength unchanged', () => {
    expect(truncate('Hello', 5)).toBe('Hello');
  });

  it('should handle maxLength of 0', () => {
    expect(truncate('abc', 0)).toBe('…');
  });
});

// ── arraysEqual() ─────────────────────────────────────────────────────────────

describe('arraysEqual()', () => {
  // The implementation sorts both arrays before comparing, so order does not matter.
  it('should return true for two identical arrays', () => {
    expect(arraysEqual([1, 2, 3], [1, 2, 3])).toBe(true);
  });

  it('should return true for arrays with same elements in different order', () => {
    expect(arraysEqual([1, 2, 3], [3, 1, 2])).toBe(true);
  });

  it('should return false for arrays with different elements', () => {
    expect(arraysEqual([1, 2], [1, 3])).toBe(false);
  });

  it('should return false for arrays with different lengths', () => {
    expect(arraysEqual([1, 2, 3], [1, 2])).toBe(false);
  });

  it('should return true for two empty arrays', () => {
    expect(arraysEqual([], [])).toBe(true);
  });
});

// ── flattenObject() ───────────────────────────────────────────────────────────

describe('flattenObject()', () => {
  it('should flatten a deeply nested object', () => {
    expect(flattenObject({ a: { b: { c: 1 } } })).toEqual({ 'a.b.c': 1 });
  });

  it('should leave a flat object unchanged', () => {
    expect(flattenObject({ x: 1, y: 2 })).toEqual({ x: 1, y: 2 });
  });

  it('should handle multiple nested keys', () => {
    const result = flattenObject({ a: { b: 1 }, c: { d: 2 } });
    expect(result).toEqual({ 'a.b': 1, 'c.d': 2 });
  });

  it('should handle arrays as leaf values', () => {
    const result = flattenObject({ a: [1, 2, 3] });
    expect(result).toEqual({ a: [1, 2, 3] });
  });
});
