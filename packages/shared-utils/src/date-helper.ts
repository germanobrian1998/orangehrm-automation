/**
 * Shared Utils - Date Helper
 * Common date formatting and calculation utilities.
 */

export class DateHelper {
  /** Format a Date to YYYY-MM-DD */
  static toDateString(date: Date = new Date()): string {
    return date.toISOString().split('T')[0];
  }

  /** Add days to a date and return as YYYY-MM-DD */
  static addDays(days: number, from: Date = new Date()): string {
    const result = new Date(from);
    result.setDate(result.getDate() + days);
    return DateHelper.toDateString(result);
  }

  /** Return today as YYYY-MM-DD */
  static today(): string {
    return DateHelper.toDateString(new Date());
  }

  /** Return tomorrow as YYYY-MM-DD */
  static tomorrow(): string {
    return DateHelper.addDays(1);
  }

  /** Return yesterday as YYYY-MM-DD */
  static yesterday(): string {
    return DateHelper.addDays(-1);
  }
}
