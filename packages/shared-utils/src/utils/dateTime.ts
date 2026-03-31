/**
 * @qa-framework/shared-utils - Date & Time Utilities
 * Comprehensive date formatting, calculation, and range utilities.
 */

export type DateFormat = 'DD/MM/YYYY' | 'MM/DD/YYYY' | 'YYYY-MM-DD' | 'YYYY/MM/DD' | 'DD-MM-YYYY';

/**
 * Format a Date object into a string with the given format.
 * Supported tokens: YYYY, MM, DD
 */
export function formatDate(date: Date, format: DateFormat = 'YYYY-MM-DD'): string {
  const yyyy = date.getFullYear().toString();
  const mm = String(date.getMonth() + 1).padStart(2, '0');
  const dd = String(date.getDate()).padStart(2, '0');
  return format
    .replace('YYYY', yyyy)
    .replace('MM', mm)
    .replace('DD', dd);
}

/**
 * Parse a date string in common formats (YYYY-MM-DD, DD/MM/YYYY, MM/DD/YYYY) to a Date.
 * Throws if the string cannot be parsed.
 */
export function parseDate(dateStr: string): Date {
  // ISO format: YYYY-MM-DD
  const isoMatch = dateStr.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (isoMatch) {
    const [, y, m, d] = isoMatch;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  // DD/MM/YYYY or DD-MM-YYYY
  const dmyMatch = dateStr.match(/^(\d{2})[\/\-](\d{2})[\/\-](\d{4})$/);
  if (dmyMatch) {
    const [, d, m, y] = dmyMatch;
    return new Date(Number(y), Number(m) - 1, Number(d));
  }

  const parsed = new Date(dateStr);
  if (!isNaN(parsed.getTime())) return parsed;
  throw new Error(`Unable to parse date: "${dateStr}"`);
}

/**
 * Return the number of whole days between two dates (end - start).
 * Negative if start is after end.
 */
export function dateDiffInDays(start: Date, end: Date): number {
  const msPerDay = 1000 * 60 * 60 * 24;
  const utcStart = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const utcEnd = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.round((utcEnd - utcStart) / msPerDay);
}

/**
 * Return the number of whole months between two dates.
 */
export function dateDiffInMonths(start: Date, end: Date): number {
  return (end.getFullYear() - start.getFullYear()) * 12 + (end.getMonth() - start.getMonth());
}

/**
 * Add (or subtract) a number of days to a date, returning a new Date.
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

/**
 * Add (or subtract) a number of months to a date, returning a new Date.
 */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

/**
 * Add (or subtract) a number of years to a date, returning a new Date.
 */
export function addYears(date: Date, years: number): Date {
  const result = new Date(date);
  result.setFullYear(result.getFullYear() + years);
  return result;
}

/**
 * Return today's date with time set to midnight (00:00:00).
 */
export function today(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/**
 * Get a date range as an array of Date objects, inclusive of start and end.
 * @param start - range start date
 * @param end   - range end date
 */
export function getDateRange(start: Date, end: Date): Date[] {
  const range: Date[] = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);
  const endDay = new Date(end);
  endDay.setHours(0, 0, 0, 0);
  while (current <= endDay) {
    range.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return range;
}

/**
 * Check if a given date falls within a range (inclusive).
 */
export function isDateInRange(date: Date, start: Date, end: Date): boolean {
  const d = date.getTime();
  return d >= start.getTime() && d <= end.getTime();
}

/**
 * Return a formatted string for today using the given format.
 */
export function todayFormatted(format: DateFormat = 'YYYY-MM-DD'): string {
  return formatDate(today(), format);
}
