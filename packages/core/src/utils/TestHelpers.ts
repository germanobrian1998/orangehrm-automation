/**
 * Core framework - Test utility functions
 * General-purpose helpers used across all test suites.
 */

/** Pause execution for the given number of milliseconds */
export const sleep = (ms: number): Promise<void> =>
  new Promise((resolve) => setTimeout(resolve, ms));

/** Generate a random integer in [min, max] (inclusive) */
export const randomInt = (min: number, max: number): number =>
  Math.floor(Math.random() * (max - min + 1)) + min;

/** Generate a random alphanumeric string of the given length */
export const randomString = (length: number = 8): string => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  return Array.from({ length }, () =>
    chars.charAt(Math.floor(Math.random() * chars.length))
  ).join('');
};

/** Generate a random email address */
export const randomEmail = (domain: string = 'test.qa'): string =>
  `test_${randomString(6).toLowerCase()}@${domain}`;

/** Return today's date formatted as YYYY-MM-DD */
export const today = (): string => {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

/** Format a Date object as YYYY-MM-DD */
export const formatDate = (date: Date): string => {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
};

/** Add days to a date and return the result */
export const addDays = (date: Date, days: number): Date => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

/** Retry an async operation up to maxAttempts times */
export const retry = async <T>(
  fn: () => Promise<T>,
  maxAttempts: number = 3,
  delayMs: number = 500
): Promise<T> => {
  let lastError: unknown;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error;
      if (attempt < maxAttempts) {
        await sleep(delayMs);
      }
    }
  }
  throw lastError;
};

/** Return a deep clone of a plain object */
export const deepClone = <T>(obj: T): T => JSON.parse(JSON.stringify(obj));

/** Strip leading/trailing whitespace from all string values in an object */
export const trimObjectValues = <T extends Record<string, unknown>>(obj: T): T => {
  const result = { ...obj } as Record<string, unknown>;
  for (const key of Object.keys(result)) {
    if (typeof result[key] === 'string') {
      result[key] = (result[key] as string).trim();
    }
  }
  return result as T;
};

/** Check whether a value is a non-empty string */
export const isNonEmptyString = (value: unknown): value is string =>
  typeof value === 'string' && value.trim().length > 0;

/** Capitalise the first letter of a string */
export const capitalise = (str: string): string =>
  str.charAt(0).toUpperCase() + str.slice(1);

/** Convert a camelCase key to a human-readable label */
export const camelToLabel = (camel: string): string =>
  camel.replace(/([A-Z])/g, ' $1').replace(/^./, (s) => s.toUpperCase());

/** Build a query string from a plain key-value object */
export const toQueryString = (params: Record<string, string | number | boolean>): string => {
  const pairs = Object.entries(params)
    .filter(([, v]) => v !== undefined && v !== null)
    .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`);
  return pairs.length ? `?${pairs.join('&')}` : '';
};

/** Parse a query string back into a plain object */
export const parseQueryString = (qs: string): Record<string, string> => {
  const result: Record<string, string> = {};
  const search = qs.startsWith('?') ? qs.slice(1) : qs;
  for (const pair of search.split('&')) {
    const [k, v] = pair.split('=');
    if (k) {
      result[decodeURIComponent(k)] = decodeURIComponent(v || '');
    }
  }
  return result;
};

/** Truncate a string to maxLength, appending '…' if trimmed */
export const truncate = (str: string, maxLength: number): string =>
  str.length <= maxLength ? str : `${str.slice(0, maxLength)}…`;

/** Check whether two arrays contain the same elements (order-insensitive) */
export const arraysEqual = <T>(a: T[], b: T[]): boolean => {
  if (a.length !== b.length) return false;
  const sortedA = [...a].sort();
  const sortedB = [...b].sort();
  return sortedA.every((val, i) => val === sortedB[i]);
};

/** Flatten a nested object into dot-notation key-value pairs */
export const flattenObject = (
  obj: Record<string, unknown>,
  prefix: string = ''
): Record<string, unknown> => {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}.${key}` : key;
    if (value !== null && typeof value === 'object' && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value as Record<string, unknown>, newKey));
    } else {
      result[newKey] = value;
    }
  }
  return result;
};
