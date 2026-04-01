/**
 * OrangeHRM Suite - smoke test placeholder
 * Validates that page objects are importable from the package.
 */

import { test, expect } from '@qa-framework/core';

test.describe('@orangehrm-suite smoke', () => {
  test('package exports are resolvable', async ({ logger }) => {
    logger.info('Verifying @qa-framework/orangehrm-suite exports');

    // Dynamic import to verify module resolution works
    const suite = await import('../src/index');
    expect(suite.LoginPage).toBeDefined();
    expect(suite.PimPage).toBeDefined();
    expect(suite.LeavePage).toBeDefined();
    expect(suite.EmployeeAPIClient).toBeDefined();

    logger.info('✓ All exports resolved successfully');
  });
});
