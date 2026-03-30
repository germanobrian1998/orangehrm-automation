/**
 * Core framework - Shared test constants
 */

export const constants = {
  TIMEOUTS: {
    SHORT: 3000,
    MEDIUM: 5000,
    LONG: 10000,
    VERY_LONG: 30000,
  },

  DEFAULT_EMPLOYEE: {
    firstName: 'Test',
    lastName: 'Employee',
    middleName: 'Auto',
  },

  DEFAULT_CREDENTIALS: {
    username: 'Admin',
    password: 'admin123',
  },

  LEAVE_TYPES: {
    ANNUAL: 'Annual Leave',
    SICK: 'Sick Leave',
    UNPAID: 'Unpaid Leave',
  },

  LEAVE_STATUS: {
    PENDING: 'PENDING',
    APPROVED: 'APPROVED',
    REJECTED: 'REJECTED',
  },
} as const;
