/**
 * Database/API validation helpers
 * Used to verify that UI changes are persisted in the database
 * This is critical to differentiate between UI bugs and data bugs
 */

export class DBValidator {
  /**
   * Validate that response contains expected data
   */
  static validateResponseData<T>(
    response: Record<string, unknown>,
    expectedFields: (keyof T)[]
  ): { isValid: boolean; missingFields: string[] } {
    const missingFields: string[] = [];

    for (const field of expectedFields) {
      if (!(field in response) || response[field] === undefined || response[field] === null) {
        missingFields.push(String(field));
      }
    }

    return {
      isValid: missingFields.length === 0,
      missingFields,
    };
  }

  /**
   * Validate that API response has correct HTTP status
   */
  static validateStatus(actualStatus: number, expectedStatus: number): boolean {
    return actualStatus === expectedStatus;
  }

  /**
   * Validate that pagination metadata is correct
   */
  static validatePagination(data: {
    meta?: {
      total: unknown;
      page: unknown;
      pageSize: unknown;
      totalPages: unknown;
    };
  }): {
    isValid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    if (!data.meta) {
      errors.push('Missing pagination metadata');
    } else {
      const { total, page, pageSize, totalPages } = data.meta;

      if (typeof total !== 'number') errors.push('Invalid total count');
      if (typeof page !== 'number') errors.push('Invalid page number');
      if (typeof pageSize !== 'number') errors.push('Invalid page size');
      if (typeof totalPages !== 'number') errors.push('Invalid total pages');

      // Validate logical consistency
      if (page < 1) errors.push('Page number cannot be less than 1');
      if (pageSize < 1) errors.push('Page size cannot be less than 1');
      if (totalPages < 0) errors.push('Total pages cannot be negative');

      // Validate that totalPages matches total/pageSize
      const calculatedPages = Math.ceil(total / pageSize);
      if (calculatedPages !== totalPages) {
        errors.push(`Total pages (${totalPages}) doesn't match calculated (${calculatedPages})`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Validate that date format is correct (YYYY-MM-DD)
   */
  static validateDateFormat(dateString: string): boolean {
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!dateRegex.test(dateString)) return false;

    // Also validate that it's a real date
    const date = new Date(dateString);
    return date instanceof Date && !isNaN(date.getTime());
  }

  /**
   * Validate that object matches expected schema
   */
  static validateSchema<T extends Record<string, unknown>>(
    data: Record<string, unknown>,
    schema: Record<keyof T, 'string' | 'number' | 'boolean' | 'object' | 'array'>
  ): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];

    for (const [field, expectedType] of Object.entries(schema)) {
      if (!(field in data)) {
        errors.push(`Missing field: ${field}`);
        continue;
      }

      const value = data[field];
      const actualType = Array.isArray(value) ? 'array' : typeof value;

      if (actualType !== expectedType) {
        errors.push(`Field "${field}": expected ${expectedType}, got ${actualType}`);
      }
    }

    return {
      isValid: errors.length === 0,
      errors,
    };
  }

  /**
   * Compare two objects for deep equality
   */
  static deepEqual(obj1: unknown, obj2: unknown): boolean {
    if (obj1 === obj2) return true;
    if (typeof obj1 !== 'object' || obj1 === null) return false;
    if (typeof obj2 !== 'object' || obj2 === null) return false;

    const record1 = obj1 as Record<string, unknown>;
    const record2 = obj2 as Record<string, unknown>;
    const keys1 = Object.keys(record1);
    const keys2 = Object.keys(record2);

    if (keys1.length !== keys2.length) return false;

    for (const key of keys1) {
      if (!keys2.includes(key)) return false;
      if (!this.deepEqual(record1[key], record2[key])) return false;
    }

    return true;
  }

  /**
   * Extract specific fields from response
   */
  static extractFields<T extends Record<string, unknown>>(
    data: Record<string, unknown>,
    fields: (keyof T)[]
  ): Partial<T> {
    const result: Partial<T> = {};
    for (const field of fields) {
      result[field] = data[field];
    }
    return result;
  }
}
