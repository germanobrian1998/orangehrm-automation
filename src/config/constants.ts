/**
 * Test constants and default values
 * Used across all tests for consistency
 */

export const constants = {
  // ===== TIMEOUTS =====
  TIMEOUTS: {
    SHORT: 3000,      // 3 seconds
    MEDIUM: 5000,     // 5 seconds
    LONG: 10000,      // 10 seconds
    VERY_LONG: 30000, // 30 seconds
  },

  // ===== TEST DATA - DEFAULT VALUES =====
  DEFAULT_EMPLOYEE: {
    firstName: 'Test',
    lastName: 'Employee',
    middleName: 'Auto',
  },

  DEFAULT_CREDENTIALS: {
    username: 'Admin',
    password: 'admin123',
  },

  // ===== LEAVE TYPES =====
  LEAVE_TYPES: {
    ANNUAL: 'Annual Leave',
    SICK: 'Sick Leave',
    UNPAID: 'Unpaid Leave',
  },

  // ===== LEAVE STATUS =====
  LEAVE_STATUS: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
    TAKEN: 'TAKEN',
  },

  // ===== USER ROLES =====
  ROLES: {
    ADMIN: 'Admin',
    EMPLOYEE: 'Employee',
    MANAGER: 'Manager',
  },

  // ===== TEST DATA PATTERNS =====
  PATTERNS: {
    UNIQUE_ID: () => `TEST_${Date.now()}_${Math.random().toString(36).slice(-6)}`,
    UNIQUE_EMAIL: () => `test_${Date.now()}@example.com`,
    UNIQUE_USERNAME: () => `user_${Date.now()}`,
  },

  // ===== API RESPONSE CODES =====
  HTTP_CODES: {
    OK: 200,
    CREATED: 201,
    BAD_REQUEST: 400,
    UNAUTHORIZED: 401,
    FORBIDDEN: 403,
    NOT_FOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500,
  },

  // ===== DATES =====
  DATES: {
    TOMORROW: () => {
      const date = new Date();
      date.setDate(date.getDate() + 1);
      return date.toISOString().split('T')[0];
    },
    DAY_AFTER_TOMORROW: () => {
      const date = new Date();
      date.setDate(date.getDate() + 2);
      return date.toISOString().split('T')[0];
    },
    NEXT_WEEK: () => {
      const date = new Date();
      date.setDate(date.getDate() + 7);
      return date.toISOString().split('T')[0];
    },
  },
} as const;

export type Constants = typeof constants;