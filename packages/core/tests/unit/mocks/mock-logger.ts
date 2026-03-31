/**
 * Mock Winston Logger for unit testing
 */

import type { Logger } from '../../../src/logger/logger';

/** Create a mock Logger instance */
export const createMockLogger = (): jest.Mocked<Logger> => ({
  debug: jest.fn(),
  info: jest.fn(),
  warn: jest.fn(),
  error: jest.fn(),
  step: jest.fn(),
  assertion: jest.fn(),
} as unknown as jest.Mocked<Logger>);

export type MockLogger = ReturnType<typeof createMockLogger>;
