/**
 * HRM API Suite - API smoke test placeholder
 */

import { test, expect } from '@playwright/test';
import { HrmApiClient } from '../src/clients/hrm-api.client';
import { EmployeeAPIClient } from '../src/clients/EmployeeAPIClient';
import { LeaveAPIClient } from '../src/clients/LeaveAPIClient';
import { DepartmentAPIClient } from '../src/clients/DepartmentAPIClient';

test.describe('@hrm-api-suite smoke', () => {
  test('package exports are resolvable', () => {
    expect(HrmApiClient).toBeDefined();
    expect(EmployeeAPIClient).toBeDefined();
    expect(LeaveAPIClient).toBeDefined();
    expect(DepartmentAPIClient).toBeDefined();
  });
});
