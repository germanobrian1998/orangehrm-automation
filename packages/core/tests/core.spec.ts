/**
 * Core package - sanity test
 * Verifies that core exports are importable.
 */

import { test, expect } from '@playwright/test';
import { constants } from '../src/config/constants';
import { Logger, createLogger } from '../src/logger/logger';

test.describe('@core Logger', () => {
  test('createLogger returns a Logger instance', () => {
    const logger = createLogger('TestContext');
    expect(logger).toBeInstanceOf(Logger);
  });

  test('constants.TIMEOUTS are defined', () => {
    expect(constants.TIMEOUTS.SHORT).toBe(3000);
    expect(constants.TIMEOUTS.MEDIUM).toBe(5000);
    expect(constants.TIMEOUTS.LONG).toBe(10000);
  });
});
