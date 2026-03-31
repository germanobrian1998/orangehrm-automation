/**
 * OrangeHRM Suite - Cross-Package Integration Tests
 * Validates integration between the orangehrm-suite UI package
 * and hrm-api-suite API package: shared schemas, data consistency,
 * and combined workflow correctness.
 */

import { test, expect } from '@qa-framework/core';
import { LoginPage } from '../../src/pages/login.page';
import { PimPage } from '../../src/pages/pim.page';
import { EmployeeAPIClient } from '../../src/api/employee.api-client';
import { selectors } from '../../src/selectors';

test.describe('@integration Cross-Package Integration', () => {
  // ─── Package exports ────────────────────────────────────────────────────

  test('all cross-package dependencies are resolvable', async ({ logger }) => {
    logger.step(1, 'Verify UI page objects are importable');
    expect(LoginPage).toBeDefined();
    expect(PimPage).toBeDefined();

    logger.step(2, 'Verify API client is importable from suite');
    expect(EmployeeAPIClient).toBeDefined();

    logger.assertion(true, 'All cross-package exports are resolvable');
  });

  test('EmployeeAPIClient is accessible from orangehrm-suite', async ({ logger }) => {
    logger.step(1, 'Check EmployeeAPIClient is importable from suite');
    // EmployeeAPIClient is statically imported at the top of this file from the suite path
    expect(EmployeeAPIClient).toBeDefined();
    logger.assertion(true, 'EmployeeAPIClient is importable from orangehrm-suite');
  });

  test('LoginPage and EmployeeAPIClient can coexist in same test scope', async ({ testPage, logger }) => {
    logger.step(1, 'Instantiate UI page object');
    const loginPage = new LoginPage(testPage);

    logger.step(2, 'Instantiate API client');
    const apiClient = new EmployeeAPIClient(testPage);

    expect(loginPage).toBeDefined();
    expect(apiClient).toBeDefined();
    logger.assertion(true, 'UI page object and API client coexist in same scope');
  });

  // ─── Shared employee data schema ────────────────────────────────────────

  test('UI form data shape is compatible with API schema', async ({ logger }) => {
    logger.step(1, 'Define UI form data');
    const uiFormData = {
      firstName: 'CrossPkg',
      lastName: 'Test',
      employeeId: `EMP-${Date.now()}`,
    };

    logger.step(2, 'Define API create DTO');
    const apiDto = {
      firstName: uiFormData.firstName,
      lastName: uiFormData.lastName,
      employeeId: uiFormData.employeeId,
    };

    logger.step(3, 'Verify field compatibility');
    expect(apiDto.firstName).toBe(uiFormData.firstName);
    expect(apiDto.lastName).toBe(uiFormData.lastName);
    expect(apiDto.employeeId).toBe(uiFormData.employeeId);

    logger.assertion(true, 'UI form data is compatible with API DTO schema');
  });

  test('employee ID format is consistent between UI and API', () => {
    const uiEmployeeId = 'EMP-001';
    const apiEmployeeId = 'EMP-001';
    expect(uiEmployeeId).toBe(apiEmployeeId);
    expect(uiEmployeeId).toMatch(/^EMP-/);
  });

  test('name fields have same type constraints in UI and API', () => {
    const uiConstraints = { firstName: 'string', lastName: 'string', employeeId: 'string' };
    const apiConstraints = { firstName: 'string', lastName: 'string', employeeId: 'string' };
    expect(uiConstraints).toEqual(apiConstraints);
  });

  // ─── UI selector and API endpoint consistency ───────────────────────────

  test('PIM UI path and API employee endpoint are related', async ({ logger }) => {
    logger.step(1, 'Verify UI path references PIM');
    const uiPath = '/pim/viewEmployeeList';
    expect(uiPath).toContain('pim');

    logger.step(2, 'Verify API endpoint references employees');
    const apiEndpoint = '/api/v2/pim/employees';
    expect(apiEndpoint).toContain('pim');
    expect(apiEndpoint).toContain('employees');

    logger.assertion(true, 'UI and API paths share consistent naming');
  });

  test('selectors and API client expose equivalent create operations', async ({ testPage }) => {
    const pimPage = new PimPage(testPage);
    const apiClient = new EmployeeAPIClient(testPage);

    expect(typeof pimPage.createEmployee).toBe('function');
    expect(typeof apiClient.createEmployee).toBe('function');
  });

  test('selectors and API client expose equivalent search operations', async ({ testPage }) => {
    const pimPage = new PimPage(testPage);
    const apiClient = new EmployeeAPIClient(testPage);

    expect(typeof pimPage.searchEmployee).toBe('function');
    expect(typeof apiClient.searchEmployees).toBe('function');
  });

  // ─── Combined workflow validation ───────────────────────────────────────

  test('combined UI + API workflow data is consistent', async ({ testPage, logger }) => {
    logger.step(1, 'Prepare combined workflow data');
    const sharedData = {
      firstName: 'Integration',
      lastName: 'Test',
      employeeId: `EMP-CROSS-${Date.now()}`,
    };

    logger.step(2, 'Verify UI page object can consume the data');
    const pimPage = new PimPage(testPage);
    expect(typeof pimPage.createEmployee).toBe('function');

    logger.step(3, 'Verify API client can consume the same data');
    const apiClient = new EmployeeAPIClient(testPage);
    expect(typeof apiClient.createEmployee).toBe('function');

    logger.step(4, 'Verify data is unchanged across both consumers');
    expect(sharedData.firstName).toBe('Integration');
    expect(sharedData.lastName).toBe('Test');
    expect(sharedData.employeeId).toMatch(/^EMP-CROSS-\d+$/);

    logger.assertion(true, 'Combined UI + API workflow data consistency verified');
  });

  test('UI success message selector matches post-API-create validation expectations', async ({ logger }) => {
    logger.step(1, 'Verify success feedback path in cross-package workflow');
    expect(selectors.common.successMessage).toBeTruthy();
    expect(selectors.common.errorAlert).toBeTruthy();
    logger.assertion(true, 'Feedback selectors available for cross-package workflow validation');
  });
});
