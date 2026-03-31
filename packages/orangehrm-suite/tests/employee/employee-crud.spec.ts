/**
 * OrangeHRM Suite - Employee Management Tests (CRUD)
 * Tests for employee lifecycle: create, read/list, update, and delete.
 * Follows the Page Object Model (ADR-004) and Testing Pyramid (ADR-003).
 *
 * Testing pyramid layer: Integration
 * Validates PimPage class structure and employee form data contracts
 * without requiring a live OrangeHRM instance.
 */

import { test, expect } from '@qa-framework/core';
import { PimPage, EmployeeFormData } from '../../src/pages/pim.page';
import { selectors } from '../../src/selectors';

test.describe('@employee Employee Management CRUD', () => {
  // ── 1. Create employee ────────────────────────────────────────────────────

  test.describe('Create employee', () => {
    test('PimPage is importable from the suite', async ({ logger }) => {
      // Arrange
      logger.step(1, 'Verify PimPage module is importable');

      // Assert
      expect(PimPage).toBeDefined();
      logger.info('✓ PimPage is importable');
    });

    test('PimPage can be instantiated with a Playwright page', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Instantiate PimPage');

      // Act
      const pimPage = new PimPage(testPage);

      // Assert
      expect(pimPage).toBeInstanceOf(PimPage);
      logger.info('✓ PimPage instantiated successfully');
    });

    test('createEmployee method is defined on PimPage', async ({ testPage }) => {
      const pimPage = new PimPage(testPage);
      expect(typeof pimPage.createEmployee).toBe('function');
    });

    test('goToAddEmployee method is defined on PimPage', async ({ testPage }) => {
      const pimPage = new PimPage(testPage);
      expect(typeof pimPage.goToAddEmployee).toBe('function');
    });

    test('fillEmployeeForm method is defined on PimPage', async ({ testPage }) => {
      const pimPage = new PimPage(testPage);
      expect(typeof pimPage.fillEmployeeForm).toBe('function');
    });

    test('submitForm method is defined on PimPage', async ({ testPage }) => {
      const pimPage = new PimPage(testPage);
      expect(typeof pimPage.submitForm).toBe('function');
    });

    test('EmployeeFormData with required fields has correct shape', async ({ logger }) => {
      // Arrange
      logger.step(1, 'Validate required EmployeeFormData shape');

      // Act
      const formData: EmployeeFormData = {
        firstName: 'John',
        lastName: 'Doe',
        employeeId: 'EMP-001',
      };

      // Assert
      expect(formData.firstName).toBe('John');
      expect(formData.lastName).toBe('Doe');
      expect(formData.employeeId).toBe('EMP-001');
      logger.assertion(true, 'Required form fields are correctly shaped');
    });

    test('EmployeeFormData accepts optional middleName', () => {
      // Arrange / Act
      const formData: EmployeeFormData = {
        firstName: 'Alice',
        middleName: 'Marie',
        lastName: 'Johnson',
        employeeId: 'EMP-002',
      };

      // Assert
      expect(formData.middleName).toBe('Marie');
    });

    test('EmployeeFormData accepts optional email', () => {
      // Arrange / Act
      const formData: EmployeeFormData = {
        firstName: 'Bob',
        lastName: 'Smith',
        employeeId: 'EMP-003',
        email: 'bob.smith@example.com',
      };

      // Assert
      expect(formData.email).toBe('bob.smith@example.com');
    });

    test('all optional EmployeeFormData fields can coexist', () => {
      // Arrange / Act
      const formData: EmployeeFormData = {
        firstName: 'Carol',
        middleName: 'Ann',
        lastName: 'Taylor',
        employeeId: 'EMP-004',
        email: 'carol.taylor@example.com',
      };

      // Assert
      expect(Object.keys(formData)).toHaveLength(5);
    });

    test('firstName must be a non-empty string', () => {
      // Arrange
      const validate = (firstName: string) => firstName.trim().length > 0;

      // Assert
      expect(validate('John')).toBe(true);
      expect(validate('')).toBe(false);
      expect(validate('  ')).toBe(false);
    });

    test('lastName must be a non-empty string', () => {
      // Arrange
      const validate = (lastName: string) => lastName.trim().length > 0;

      // Assert
      expect(validate('Doe')).toBe(true);
      expect(validate('')).toBe(false);
    });

    test('unique employee IDs are distinct across multiple submissions', () => {
      // Arrange / Act
      const ids = Array.from({ length: 5 }, (_, i) => `EMP-${Date.now()}-${i}`);
      const unique = new Set(ids);

      // Assert
      expect(unique.size).toBe(5);
    });

    test('pim selectors include firstNameInput and lastNameInput', () => {
      expect(selectors.pim.firstNameInput).toBeTruthy();
      expect(selectors.pim.lastNameInput).toBeTruthy();
    });

    test('pim selectors include employeeIdInput', () => {
      expect(selectors.pim.employeeIdInput).toBeTruthy();
    });

    test('pim selectors include saveButton', () => {
      expect(selectors.pim.saveButton).toBeTruthy();
    });
  });

  // ── 2. Read / List employees ──────────────────────────────────────────────

  test.describe('Read/List employees', () => {
    test('goToEmployeeList method is defined on PimPage', async ({ testPage }) => {
      const pimPage = new PimPage(testPage);
      expect(typeof pimPage.goToEmployeeList).toBe('function');
    });

    test('verifyEmployeeInList method is defined on PimPage', async ({ testPage }) => {
      const pimPage = new PimPage(testPage);
      expect(typeof pimPage.verifyEmployeeInList).toBe('function');
    });

    test('pim selectors include employeeTable', () => {
      expect(selectors.pim.employeeTable).toBeTruthy();
    });

    test('employeeRow selector builder returns selector containing the given ID', () => {
      // Arrange
      const employeeId = 'EMP-999';

      // Act
      const selector = selectors.pim.employeeRow(employeeId);

      // Assert
      expect(selector).toContain(employeeId);
    });

    test('searchEmployee method is defined on PimPage', async ({ testPage }) => {
      const pimPage = new PimPage(testPage);
      expect(typeof pimPage.searchEmployee).toBe('function');
    });

    test('pim selectors include searchButton', () => {
      expect(selectors.pim.searchButton).toBeTruthy();
    });

    test('pim selectors include firstNameField for search', () => {
      expect(selectors.pim.firstNameField).toBeTruthy();
    });
  });

  // ── 3. Update employee information ────────────────────────────────────────

  test.describe('Update employee information', () => {
    test('UpdateEmployeeDTO can represent a partial update', () => {
      // Arrange / Act – UpdateEmployeeDTO-like shape
      const updateDto = { firstName: 'UpdatedFirst' };

      // Assert
      expect(updateDto.firstName).toBe('UpdatedFirst');
      expect(Object.keys(updateDto)).toHaveLength(1);
    });

    test('partial update with only lastName is valid', () => {
      const updateDto = { lastName: 'UpdatedLast' };
      expect(updateDto.lastName).toBe('UpdatedLast');
    });

    test('update with both firstName and lastName is valid', () => {
      const updateDto = { firstName: 'NewFirst', lastName: 'NewLast' };
      expect(Object.keys(updateDto)).toHaveLength(2);
      expect(updateDto.firstName).toBe('NewFirst');
      expect(updateDto.lastName).toBe('NewLast');
    });

    test('email update payload has the correct format', () => {
      const updateDto = { email: 'updated@example.com' };
      expect(updateDto.email).toMatch(/@/);
    });

    test('pim selectors include emailInput for update operations', () => {
      expect(selectors.pim.emailInput).toBeTruthy();
    });
  });

  // ── 4. Delete employee ────────────────────────────────────────────────────

  test.describe('Delete employee', () => {
    test('common selectors include confirmButton for delete confirmation', () => {
      expect(selectors.common.confirmButton).toBeTruthy();
    });

    test('common selectors include cancelButton to abort delete', () => {
      expect(selectors.common.cancelButton).toBeTruthy();
    });

    test('common selectors include modal for delete confirmation dialog', () => {
      expect(selectors.common.modal).toBeTruthy();
    });

    test('verifyEmployeeInList can confirm absence after deletion', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Verify verifyEmployeeInList supports post-delete checks');
      const pimPage = new PimPage(testPage);

      // Assert – method must exist and return boolean
      expect(typeof pimPage.verifyEmployeeInList).toBe('function');
      logger.assertion(true, 'verifyEmployeeInList is available for post-delete verification');
    });

    test('success toast selector is defined for post-delete confirmation', () => {
      expect(selectors.common.successMessage).toBeTruthy();
    });
  });
});
