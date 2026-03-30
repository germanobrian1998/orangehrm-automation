/**
 * HRM API Suite - API smoke test placeholder
 */

import { test, expect } from '@playwright/test';

test.describe('@hrm-api-suite smoke', () => {
  test('package exports are resolvable', async () => {
    const suite = await import('../src/index');
    expect(suite.HrmApiClient).toBeDefined();
  });
});
