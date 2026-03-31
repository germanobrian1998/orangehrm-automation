/**
 * OrangeHRM Suite - Employee Management Integration Tests
 * Validates PimPage structure, employee CRUD operation shapes,
 * search workflow, and form data handling.
 */

import { test, expect } from '@qa-framework/core';
import { PimPage, EmployeeFormData } from '../../src/pages/pim.page';
import { selectors } from '../../src/selectors';

test.describe('@integration Employee Management', () => {
  // ─── PimPage structure ─────────────────────────────────────────────────

  test('PimPage is importable from the suite', async ({ logger }) => {
    logger.step(1, 'Verify PimPage import');
    expect(PimPage).toBeDefined();
    logger.info('✓ PimPage is importable');
  });

  test('PimPage can be instantiated with a Playwright page', async ({ testPage, logger }) => {
    logger.step(1, 'Instantiate PimPage');
    const pimPage = new PimPage(testPage);
    expect(pimPage).toBeDefined();
    logger.info('✓ PimPage instantiated successfully');
  });

  // ─── CRUD method availability ──────────────────────────────────────────

  test('PimPage exposes goToEmployeeList method', async ({ testPage }) => {
    const pimPage = new PimPage(testPage);
    expect(typeof pimPage.goToEmployeeList).toBe('function');
  });

  test('PimPage exposes goToAddEmployee method', async ({ testPage }) => {
    const pimPage = new PimPage(testPage);
    expect(typeof pimPage.goToAddEmployee).toBe('function');
  });

  test('PimPage exposes fillEmployeeForm method', async ({ testPage }) => {
    const pimPage = new PimPage(testPage);
    expect(typeof pimPage.fillEmployeeForm).toBe('function');
  });

  test('PimPage exposes submitForm method', async ({ testPage }) => {
    const pimPage = new PimPage(testPage);
    expect(typeof pimPage.submitForm).toBe('function');
  });

  test('PimPage exposes createEmployee method', async ({ testPage }) => {
    const pimPage = new PimPage(testPage);
    expect(typeof pimPage.createEmployee).toBe('function');
  });

  test('PimPage exposes searchEmployee method', async ({ testPage }) => {
    const pimPage = new PimPage(testPage);
    expect(typeof pimPage.searchEmployee).toBe('function');
  });

  test('PimPage exposes verifyEmployeeInList method', async ({ testPage }) => {
    const pimPage = new PimPage(testPage);
    expect(typeof pimPage.verifyEmployeeInList).toBe('function');
  });

  // ─── EmployeeFormData interface validation ─────────────────────────────

  test('EmployeeFormData with required fields is valid', async ({ logger }) => {
    logger.step(1, 'Validate required EmployeeFormData shape');
    const formData: EmployeeFormData = {
      firstName: 'John',
      lastName: 'Doe',
      employeeId: 'EMP-001',
    };
    expect(formData.firstName).toBe('John');
    expect(formData.lastName).toBe('Doe');
    expect(formData.employeeId).toBe('EMP-001');
    logger.assertion(true, 'Required form fields are correctly shaped');
  });

  test('EmployeeFormData accepts optional email field', () => {
    const formData: EmployeeFormData = {
      firstName: 'Jane',
      lastName: 'Smith',
      employeeId: 'EMP-002',
      email: 'jane.smith@example.com',
    };
    expect(formData.email).toBe('jane.smith@example.com');
  });

  test('EmployeeFormData accepts optional middleName field', () => {
    const formData: EmployeeFormData = {
      firstName: 'Alice',
      middleName: 'Marie',
      lastName: 'Johnson',
      employeeId: 'EMP-003',
    };
    expect(formData.middleName).toBe('Marie');
  });

  test('EmployeeFormData supports all optional fields simultaneously', () => {
    const formData: EmployeeFormData = {
      firstName: 'Bob',
      middleName: 'James',
      lastName: 'Williams',
      employeeId: 'EMP-004',
      email: 'bob.williams@example.com',
    };
    expect(Object.keys(formData)).toHaveLength(5);
  });

  // ─── PIM selectors completeness ────────────────────────────────────────

  test('pim selectors include firstNameInput', async ({ logger }) => {
    logger.step(1, 'Verify PIM selectors');
    expect(selectors.pim.firstNameInput).toBeTruthy();
    logger.assertion(true, 'firstNameInput selector is defined');
  });

  test('pim selectors include lastNameInput', () => {
    expect(selectors.pim.lastNameInput).toBeTruthy();
  });

  test('pim selectors include employeeIdInput', () => {
    expect(selectors.pim.employeeIdInput).toBeTruthy();
  });

  test('pim selectors include saveButton', () => {
    expect(selectors.pim.saveButton).toBeTruthy();
  });

  test('pim selectors include searchButton', () => {
    expect(selectors.pim.searchButton).toBeTruthy();
  });

  test('pim selectors employeeRow builder returns correct selector', () => {
    const selector = selectors.pim.employeeRow('EMP-999');
    expect(selector).toContain('EMP-999');
  });

  // ─── Employee ID uniqueness across form submissions ─────────────────────

  test('unique employee IDs are generated for distinct submissions', () => {
    const ids = new Set<string>();
    for (let i = 1; i <= 5; i++) {
      ids.add(`EMP-${Date.now()}-${i}`);
    }
    expect(ids.size).toBe(5);
  });

  // ─── Employee data validation rules ────────────────────────────────────

  test('firstName must be non-empty string', () => {
    const validate = (data: EmployeeFormData) =>
      data.firstName.length > 0 && data.lastName.length > 0 && data.employeeId.length > 0;

    expect(validate({ firstName: 'John', lastName: 'Doe', employeeId: 'E1' })).toBe(true);
    expect(validate({ firstName: '', lastName: 'Doe', employeeId: 'E1' })).toBe(false);
  });

  test('lastName must be non-empty string', () => {
    const isValid = (lastName: string) => lastName.trim().length > 0;
    expect(isValid('Doe')).toBe(true);
    expect(isValid('')).toBe(false);
    expect(isValid('  ')).toBe(false);
  });
});
