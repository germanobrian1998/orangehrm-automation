/**
 * OrangeHRM Suite - smoke test placeholder
 * Validates that page objects are importable from the package.
 */

import { test, expect } from '@playwright/test';

test.describe('@orangehrm-suite smoke', () => {
  test('package exports are resolvable', async () => {
    // Dynamic import to verify module resolution works
    const suite = await import('../src/index');
    expect(suite.LoginPage).toBeDefined();
    expect(suite.PimPage).toBeDefined();
  });
});
