/**
 * Shared Utils - String Helper
 * Common string utilities used across test suites.
 */

export class StringHelper {
  /** Truncate a string to the given max length */
  static truncate(str: string, maxLength: number): string {
    if (str.length <= maxLength) return str;
    return `${str.substring(0, maxLength - 3)}...`;
  }

  /** Convert camelCase to Title Case */
  static camelToTitle(str: string): string {
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/^./, (s) => s.toUpperCase())
      .trim();
  }

  /** Check if a string is a valid email */
  static isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  }

  /** Generate a slug-friendly string */
  static toSlug(str: string): string {
    return str
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-|-$/g, '');
  }
}
