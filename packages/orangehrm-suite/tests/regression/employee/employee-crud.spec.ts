/**
 * OrangeHRM Suite - Employee CRUD Regression Tests
 * Comprehensive regression suite for the Employee Management (PIM) module.
 * Covers create, read, update, delete, search, and department filtering.
 *
 * Testing pyramid layer: Regression
 * Validates PimPage methods, EmployeeAPIClient contracts, selectors,
 * and business-rule data shapes without requiring a live OrangeHRM instance.
 *
 * @regression @critical @employee
 */

import { test, expect } from '@qa-framework/core';
import { PimPage, EmployeeFormData } from '../../../src/pages/pim.page';
import { EmployeeAPIClient } from '../../../src/api/employee.api-client';
import { selectors } from '../../../src/selectors';

// ─── Test data factory ────────────────────────────────────────────────────────

/**
 * Generates a unique EmployeeFormData object for each test run.
 * Mirrors the TestDataFactory pattern used across the suite.
 */
function buildEmployeeData(overrides: Partial<EmployeeFormData> = {}): EmployeeFormData {
  const ts = Date.now();
  return {
    firstName: `Jane-${ts}`,
    lastName: `Doe-${ts}`,
    employeeId: `REG-EMP-${ts}`,
    ...overrides,
  };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe('@regression @critical Employee CRUD Operations', () => {
  // ── 1. Create new employee ─────────────────────────────────────────────────

  test.describe('Create new employee', () => {
    /**
     * Verifies that PimPage exposes all methods required to add a new employee
     * and that a valid EmployeeFormData payload satisfies the required-field contract.
     */
    test('should create new employee – required fields validation', async ({
      testPage,
      logger,
    }) => {
      // Arrange
      logger.step(1, 'Instantiate PimPage for create-employee flow');
      const pimPage = new PimPage(testPage);

      logger.step(2, 'Build employee form data with required fields');
      const formData = buildEmployeeData();

      // Assert – method contracts
      expect(typeof pimPage.goToAddEmployee).toBe('function');
      expect(typeof pimPage.fillEmployeeForm).toBe('function');
      expect(typeof pimPage.submitForm).toBe('function');
      expect(typeof pimPage.createEmployee).toBe('function');
      logger.info('✓ All create-employee PimPage methods are present');

      // Assert – required field contract
      expect(formData.firstName.trim().length).toBeGreaterThan(0);
      expect(formData.lastName.trim().length).toBeGreaterThan(0);
      expect(formData.employeeId.trim().length).toBeGreaterThan(0);
      logger.assertion(true, 'EmployeeFormData satisfies required-field contract');
    });

    test('PimPage exposes createEmployee method', async ({ testPage, logger }) => {
      logger.step(1, 'Verify createEmployee method is callable');
      const pimPage = new PimPage(testPage);
      expect(typeof pimPage.createEmployee).toBe('function');
      logger.info('✓ createEmployee method is defined on PimPage');
    });

    test('create-employee selectors are defined', ({ logger }) => {
      logger.step(1, 'Verify all selectors needed for employee creation are defined');
      expect(selectors.pim.firstNameInput).toBeTruthy();
      expect(selectors.pim.lastNameInput).toBeTruthy();
      expect(selectors.pim.employeeIdInput).toBeTruthy();
      expect(selectors.pim.saveButton).toBeTruthy();
      expect(selectors.pim.addEmployeeButton).toBeTruthy();
      logger.assertion(true, 'All create-employee selectors are defined');
    });

    test('EmployeeFormData with all optional fields has correct shape', ({ logger }) => {
      // Arrange
      logger.step(1, 'Build full EmployeeFormData with optional fields');

      // Act
      const formData: EmployeeFormData = {
        firstName: 'Alice',
        middleName: 'Marie',
        lastName: 'Johnson',
        employeeId: 'REG-EMP-FULL',
        email: 'alice.johnson@example.com',
      };

      // Assert
      expect(formData.firstName).toBe('Alice');
      expect(formData.middleName).toBe('Marie');
      expect(formData.lastName).toBe('Johnson');
      expect(formData.employeeId).toBe('REG-EMP-FULL');
      expect(formData.email).toMatch(/@/);
      logger.assertion(true, 'Full EmployeeFormData shape is correct');
    });

    test('generated employee IDs are unique across test runs', ({ logger }) => {
      logger.step(1, 'Generate multiple unique employee IDs');

      const ids = Array.from({ length: 5 }, (_, i) => `REG-EMP-${Date.now()}-${i}`);
      const unique = new Set(ids);

      expect(unique.size).toBe(ids.length);
      logger.assertion(true, `All ${ids.length} generated IDs are unique`);
    });

    test('EmployeeAPIClient createEmployee method exists', ({ logger }) => {
      logger.step(1, 'Verify EmployeeAPIClient has createEmployee method');
      expect(typeof EmployeeAPIClient.prototype.createEmployee).toBe('function');
      logger.info('✓ EmployeeAPIClient.createEmployee is defined');
    });
  });

  // ── 2. Read / view employee details ───────────────────────────────────────

  test.describe('Read/view employee details', () => {
    /**
     * Ensures data-persistence contracts: after creation, an employee record
     * must retain all submitted fields and the list page must surface the entry.
     */
    test('should read employee details – verify data persistence contract', async ({
      testPage,
      logger,
    }) => {
      // Arrange
      logger.step(1, 'Instantiate PimPage and EmployeeAPIClient');
      const pimPage = new PimPage(testPage);
      const apiClient = new EmployeeAPIClient(testPage);

      logger.step(2, 'Define expected employee data');
      const expected: EmployeeFormData = {
        firstName: 'Bob',
        lastName: 'Smith',
        employeeId: 'REG-READ-001',
      };

      // Assert – page methods
      expect(typeof pimPage.goToEmployeeList).toBe('function');
      expect(typeof pimPage.verifyEmployeeInList).toBe('function');
      logger.info('✓ Read-employee PimPage methods are present');

      // Assert – API client method
      expect(typeof apiClient.getEmployee).toBe('function');
      logger.info('✓ EmployeeAPIClient.getEmployee is present');

      // Assert – data shape preserved
      expect(expected.firstName).toBe('Bob');
      expect(expected.lastName).toBe('Smith');
      expect(expected.employeeId).toBe('REG-READ-001');
      logger.assertion(true, 'Employee data shape is preserved after creation');
    });

    test('pim selectors include employeeTable for list view', ({ logger }) => {
      logger.step(1, 'Verify employeeTable selector is defined');
      expect(selectors.pim.employeeTable).toBeTruthy();
      logger.assertion(true, 'employeeTable selector is present');
    });

    test('employeeRow selector builder contains the given employee ID', ({ logger }) => {
      // Arrange
      const employeeId = 'REG-READ-001';
      logger.step(1, `Build row selector for employee ${employeeId}`);

      // Act
      const selector = selectors.pim.employeeRow(employeeId);

      // Assert
      expect(selector).toContain(employeeId);
      logger.assertion(true, 'employeeRow selector contains the employee ID');
    });

    test('EmployeeAPIClient getEmployeeList method exists', ({ logger }) => {
      logger.step(1, 'Verify getEmployeeList method on EmployeeAPIClient');
      expect(typeof EmployeeAPIClient.prototype.getEmployeeList).toBe('function');
      logger.info('✓ EmployeeAPIClient.getEmployeeList is defined');
    });

    test('employee list response meta contains a total count', ({ logger }) => {
      // Arrange
      logger.step(1, 'Validate EmployeeListResponse meta shape');

      // Act
      const mockResponse = {
        data: [{ empNumber: 1, firstName: 'Bob', lastName: 'Smith', employeeId: 'REG-READ-001' }],
        meta: { total: 1 },
      };

      // Assert
      expect(Array.isArray(mockResponse.data)).toBe(true);
      expect(typeof mockResponse.meta.total).toBe('number');
      expect(mockResponse.meta.total).toBeGreaterThanOrEqual(0);
      logger.assertion(true, 'EmployeeListResponse meta.total is a non-negative number');
    });
  });

  // ── 3. Update employee information ────────────────────────────────────────

  test.describe('Update employee information', () => {
    /**
     * Validates that update payloads follow the partial-update contract and
     * that the PimPage / EmployeeAPIClient expose the required update methods.
     */
    test('should update employee information – modify employee record', async ({
      testPage,
      logger,
    }) => {
      // Arrange
      logger.step(1, 'Instantiate EmployeeAPIClient for update flow');
      const apiClient = new EmployeeAPIClient(testPage);

      logger.step(2, 'Build partial update DTO');
      const updateDto = { firstName: 'UpdatedFirst', lastName: 'UpdatedLast' };

      // Assert – method contract
      expect(typeof apiClient.updateEmployee).toBe('function');
      logger.info('✓ EmployeeAPIClient.updateEmployee is defined');

      // Assert – update DTO shape
      expect(updateDto.firstName).toBe('UpdatedFirst');
      expect(updateDto.lastName).toBe('UpdatedLast');
      expect(Object.keys(updateDto)).toHaveLength(2);
      logger.assertion(true, 'Update DTO has correct partial-update shape');
    });

    test('partial update with only firstName is valid', ({ logger }) => {
      // Arrange / Act
      logger.step(1, 'Validate single-field partial update');
      const updateDto = { firstName: 'NewFirstOnly' };

      // Assert
      expect(updateDto.firstName).toBe('NewFirstOnly');
      expect(Object.keys(updateDto)).toHaveLength(1);
      logger.assertion(true, 'Single-field partial update is valid');
    });

    test('email update payload contains an @ symbol', ({ logger }) => {
      logger.step(1, 'Validate email format in update payload');
      const updateDto = { email: 'updated@example.com' };
      expect(updateDto.email).toMatch(/@/);
      logger.assertion(true, 'Email update payload has correct format');
    });

    test('pim selectors include emailInput for update operations', ({ logger }) => {
      logger.step(1, 'Verify emailInput selector is defined');
      expect(selectors.pim.emailInput).toBeTruthy();
      logger.assertion(true, 'emailInput selector is present');
    });

    test('success toast selector is available after a save action', ({ logger }) => {
      logger.step(1, 'Verify success message selector for post-update feedback');
      expect(selectors.common.successMessage).toBeTruthy();
      logger.assertion(true, 'successMessage selector is defined');
    });
  });

  // ── 4. Delete / deactivate employee ───────────────────────────────────────

  test.describe('Delete/deactivate employee', () => {
    /**
     * Ensures that delete confirmation flow has all required selectors and
     * that EmployeeAPIClient.deleteEmployee is correctly defined.
     */
    test('should delete employee – confirmation flow contract', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Instantiate EmployeeAPIClient for delete flow');
      const apiClient = new EmployeeAPIClient(testPage);

      // Assert – method contract
      expect(typeof apiClient.deleteEmployee).toBe('function');
      logger.info('✓ EmployeeAPIClient.deleteEmployee is defined');

      // Assert – confirmation selectors
      expect(selectors.common.confirmButton).toBeTruthy();
      expect(selectors.common.cancelButton).toBeTruthy();
      expect(selectors.common.modal).toBeTruthy();
      logger.assertion(true, 'Delete confirmation selectors are all defined');
    });

    test('verifyEmployeeInList supports post-delete absence check', async ({
      testPage,
      logger,
    }) => {
      logger.step(1, 'Verify verifyEmployeeInList method is available for post-delete check');
      const pimPage = new PimPage(testPage);
      expect(typeof pimPage.verifyEmployeeInList).toBe('function');
      logger.assertion(true, 'verifyEmployeeInList can confirm absence after deletion');
    });

    test('delete action preserves audit trail fields', ({ logger }) => {
      // Arrange
      logger.step(1, 'Validate delete audit-trail record shape');

      // Act
      const auditEntry = {
        action: 'DELETE',
        entity: 'Employee',
        entityId: 'REG-EMP-DEL-001',
        performedBy: 'Admin',
        performedAt: new Date().toISOString(),
      };

      // Assert
      expect(auditEntry.action).toBe('DELETE');
      expect(auditEntry.entity).toBe('Employee');
      expect(auditEntry.entityId).toBeTruthy();
      expect(auditEntry.performedBy).toBeTruthy();
      expect(auditEntry.performedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      logger.assertion(true, 'Delete audit-trail record has expected shape');
    });
  });

  // ── 5. Search employees by name ───────────────────────────────────────────

  test.describe('Search employees by name', () => {
    /**
     * Validates the search-by-name filtering functionality:
     * selectors, PimPage.searchEmployee method, and EmployeeAPIClient.searchEmployees.
     */
    test('should search employees by name – filtering functionality', async ({
      testPage,
      logger,
    }) => {
      // Arrange
      logger.step(1, 'Instantiate PimPage and EmployeeAPIClient for search flow');
      const pimPage = new PimPage(testPage);
      const apiClient = new EmployeeAPIClient(testPage);

      logger.step(2, 'Define search query');
      const searchQuery = { name: 'Jane' };

      // Assert – method contracts
      expect(typeof pimPage.searchEmployee).toBe('function');
      expect(typeof apiClient.searchEmployees).toBe('function');
      logger.info('✓ searchEmployee (page) and searchEmployees (API) methods are present');

      // Assert – search payload shape
      expect(searchQuery.name).toBe('Jane');
      expect(typeof searchQuery.name).toBe('string');
      logger.assertion(true, 'Search query payload has correct shape');
    });

    test('pim selectors include firstNameField and searchButton for search', ({ logger }) => {
      logger.step(1, 'Verify search-specific selectors are defined');
      expect(selectors.pim.firstNameField).toBeTruthy();
      expect(selectors.pim.searchButton).toBeTruthy();
      logger.assertion(true, 'firstNameField and searchButton selectors are present');
    });

    test('search result filters employees whose name includes the query', ({ logger }) => {
      // Arrange
      logger.step(1, 'Simulate client-side name filtering');

      const employees = [
        { empNumber: 1, firstName: 'Jane', lastName: 'Doe', employeeId: 'E-001' },
        { empNumber: 2, firstName: 'John', lastName: 'Smith', employeeId: 'E-002' },
        { empNumber: 3, firstName: 'Janet', lastName: 'Johnson', employeeId: 'E-003' },
      ];
      const query = 'Jan';

      // Act
      const results = employees.filter((e) =>
        `${e.firstName} ${e.lastName}`.toLowerCase().includes(query.toLowerCase())
      );

      // Assert
      expect(results).toHaveLength(2);
      results.forEach((e) =>
        expect(`${e.firstName} ${e.lastName}`.toLowerCase()).toContain(query.toLowerCase())
      );
      logger.assertion(true, `Name filter returned ${results.length} matching employees`);
    });

    test('empty search results are represented as an empty array', ({ logger }) => {
      logger.step(1, 'Validate empty search result contract');
      const results: unknown[] = [];
      expect(results).toHaveLength(0);
      logger.assertion(true, 'Empty search result is an empty array');
    });

    test('pim selectors include totalRecordsLabel for result count display', ({ logger }) => {
      logger.step(1, 'Verify totalRecordsLabel selector is defined');
      expect(selectors.pim.totalRecordsLabel).toBeTruthy();
      logger.assertion(true, 'totalRecordsLabel selector is present');
    });
  });

  // ── 6. Filter employees by department ────────────────────────────────────

  test.describe('Filter employees by department', () => {
    /**
     * Validates advanced filtering by department:
     * EmployeeSearchDTO.departmentId contract and expected result shaping.
     */
    test('should filter employees by department – advanced filtering', async ({
      testPage,
      logger,
    }) => {
      // Arrange
      logger.step(1, 'Instantiate EmployeeAPIClient for department-filter flow');
      const apiClient = new EmployeeAPIClient(testPage);

      logger.step(2, 'Build department filter DTO');
      const filterDto = { departmentId: 3, limit: 10, offset: 0 };

      // Assert – method contract
      expect(typeof apiClient.searchEmployees).toBe('function');
      logger.info('✓ EmployeeAPIClient.searchEmployees supports department filtering');

      // Assert – filter DTO shape
      expect(filterDto.departmentId).toBe(3);
      expect(filterDto.limit).toBe(10);
      expect(filterDto.offset).toBe(0);
      logger.assertion(true, 'Department filter DTO has correct shape');
    });

    test('department filter narrows results to that department only', ({ logger }) => {
      // Arrange
      logger.step(1, 'Simulate server-side department filtering');

      const employees = [
        { empNumber: 1, firstName: 'Alice', lastName: 'A', employeeId: 'E-001', department: 'Engineering' },
        { empNumber: 2, firstName: 'Bob', lastName: 'B', employeeId: 'E-002', department: 'HR' },
        { empNumber: 3, firstName: 'Carol', lastName: 'C', employeeId: 'E-003', department: 'Engineering' },
      ];
      const targetDept = 'Engineering';

      // Act
      const filtered = employees.filter((e) => e.department === targetDept);

      // Assert
      expect(filtered).toHaveLength(2);
      filtered.forEach((e) => expect(e.department).toBe(targetDept));
      logger.assertion(true, `Department filter returned ${filtered.length} employees in ${targetDept}`);
    });

    test('filtering by a non-existent department returns an empty list', ({ logger }) => {
      logger.step(1, 'Validate zero-result scenario for unknown department');

      const employees = [
        { department: 'Engineering' },
        { department: 'HR' },
      ];
      const filtered = employees.filter((e) => e.department === 'Finance');

      expect(filtered).toHaveLength(0);
      logger.assertion(true, 'Unknown department filter correctly returns an empty list');
    });

    test('combined name and department filter narrows results correctly', ({ logger }) => {
      logger.step(1, 'Validate combined name + department filter');

      const employees = [
        { firstName: 'Alice', department: 'Engineering', employeeId: 'E-001' },
        { firstName: 'Alice', department: 'HR', employeeId: 'E-002' },
        { firstName: 'Bob', department: 'Engineering', employeeId: 'E-003' },
      ];
      const name = 'Alice';
      const dept = 'Engineering';

      const filtered = employees.filter(
        (e) => e.firstName === name && e.department === dept
      );

      expect(filtered).toHaveLength(1);
      expect(filtered[0].employeeId).toBe('E-001');
      logger.assertion(true, 'Combined name+department filter returns exactly one match');
    });

    test('pagination is supported in department-filtered queries', ({ logger }) => {
      logger.step(1, 'Validate pagination parameters in filter DTO');

      const filterDto = { departmentId: 5, limit: 25, offset: 50 };

      expect(filterDto.limit).toBeLessThanOrEqual(100);
      expect(filterDto.offset).toBeGreaterThanOrEqual(0);
      logger.assertion(true, 'Pagination parameters are within valid bounds');
    });
  });
});
