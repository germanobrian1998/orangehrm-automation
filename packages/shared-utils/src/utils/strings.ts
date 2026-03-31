/**
 * @qa-framework/shared-utils - String Utilities
 * Validation, transformation, and generation helpers for strings.
 */

// ─── Validation ──────────────────────────────────────────────────────────────

/** Returns true if the string is a valid e-mail address (basic format check suitable for test data). */
export function isValidEmail(value: string): boolean {
  const at = value.indexOf('@');
  if (at <= 0 || at !== value.lastIndexOf('@')) return false;
  const local = value.slice(0, at);
  const domain = value.slice(at + 1);
  if (!local || /\s/.test(local)) return false;
  const dot = domain.lastIndexOf('.');
  if (dot <= 0 || dot >= domain.length - 1) return false;
  return !/\s/.test(domain);
}

/** Returns true if the string contains only digits (0-9). */
export function isNumeric(value: string): boolean {
  return /^\d+$/.test(value);
}

/** Returns true if the string is a valid phone number (digits, spaces, +, -, ()). */
export function isValidPhone(value: string): boolean {
  return /^[\d\s\+\-\(\)]{7,20}$/.test(value.trim());
}

/** Returns true if the string is non-empty after trimming. */
export function isNotBlank(value: string): boolean {
  return value.trim().length > 0;
}

// ─── Transformation ───────────────────────────────────────────────────────────

/** Convert a string to camelCase. */
export function toCamelCase(value: string): string {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+(.)/g, (_, char: string) => char.toUpperCase());
}

/** Convert a string to snake_case. */
export function toSnakeCase(value: string): string {
  return value
    .replace(/([A-Z])/g, '_$1')
    .replace(/[\s\-]+/g, '_')
    .toLowerCase()
    .replace(/^_/, '');
}

/** Convert a string to kebab-case (slug). */
export function toKebabCase(value: string): string {
  return value
    .replace(/([A-Z])/g, '-$1')
    .replace(/[\s_]+/g, '-')
    .toLowerCase()
    .replace(/^-/, '');
}

/** Convert camelCase to Title Case. */
export function camelToTitle(value: string): string {
  return value
    .replace(/([A-Z])/g, ' $1')
    .replace(/^./, (s) => s.toUpperCase())
    .trim();
}

/** Capitalize only the first character of a string. */
export function capitalize(value: string): string {
  if (!value) return value;
  return value.charAt(0).toUpperCase() + value.slice(1);
}

/** Convert a string to lowercase. */
export function toLowerCase(value: string): string {
  return value.toLowerCase();
}

/** Convert a string to UPPERCASE. */
export function toUpperCase(value: string): string {
  return value.toUpperCase();
}

/**
 * Truncate a string to at most maxLength characters.
 * If truncated, appends "..." (counts toward maxLength).
 */
export function truncate(value: string, maxLength: number): string {
  if (value.length <= maxLength) return value;
  return `${value.substring(0, maxLength - 3)}...`;
}

/** Remove leading and trailing whitespace. */
export function trim(value: string): string {
  return value.trim();
}

// ─── Generation ───────────────────────────────────────────────────────────────

const ALPHA = 'abcdefghijklmnopqrstuvwxyz';
const ALPHANUMERIC = `${ALPHA}ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789`;

/**
 * Generate a random alphanumeric string of the requested length.
 * Uses only characters from [a-zA-Z0-9].
 */
export function randomString(length: number = 8): string {
  return Array.from({ length }, () =>
    ALPHANUMERIC.charAt(Math.floor(Math.random() * ALPHANUMERIC.length)),
  ).join('');
}

/**
 * Generate a random alphabetic string (lowercase) of the requested length.
 */
export function randomAlpha(length: number = 8): string {
  return Array.from({ length }, () =>
    ALPHA.charAt(Math.floor(Math.random() * ALPHA.length)),
  ).join('');
}

/**
 * Generate a random numeric string of the requested length.
 */
export function randomNumeric(length: number = 6): string {
  return Array.from({ length }, () => Math.floor(Math.random() * 10).toString()).join('');
}
