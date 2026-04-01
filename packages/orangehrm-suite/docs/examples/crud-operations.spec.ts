/**
 * Example: CRUD Operations Test
 *
 * Demonstrates creating, reading, updating, and deleting an employee
 * using both the UI (PimPage) and the API (EmployeeAPIClient).
 * Run: npx playwright test docs/examples/crud-operations.spec.ts
 */

import { test, expect } from '@qa-framework/core';
import { faker } from '@faker-js/faker';
import { LoginPage } from '../../src/pages/login.page';
import { PimPage } from '../../src/pages/pim.page';
import { EmployeeAPIClient } from '../../src/api/employee.api-client';

// Shared state for cleanup
let createdEmployeeId: number | undefined;

test.describe('@pim @regression CRUD Operations Example', () => {
  test.beforeEach(async ({ page, config }) => {
    // Log in before each test
    const loginPage = new LoginPage(page);
    await loginPage.login({
      username: config.adminUsername,
      password: config.adminPassword,
    });
  });

  test.afterEach(async ({ page }) => {
    // Clean up any employee created during the test
    if (createdEmployeeId !== undefined) {
      const apiClient = new EmployeeAPIClient(page);
      await apiClient.authenticate(
        process.env.ORANGEHRM_ADMIN_USERNAME || 'Admin',
        process.env.ORANGEHRM_ADMIN_PASSWORD || 'admin123'
      );
      await apiClient.deleteEmployee(createdEmployeeId).catch(() => {
        // Ignore cleanup errors
      });
      createdEmployeeId = undefined;
    }
  });

  // ── Create via API ──────────────────────────────────────────────────────────

  test('create employee via API and verify via API', async ({ page, config, logger }) => {
    // Arrange
    logger.step(1, 'Authenticate API client');
    const apiClient = new EmployeeAPIClient(page);
    await apiClient.authenticate(config.adminUsername, config.adminPassword);

    const employeeData = {
      firstName: faker.person.firstName(),
      lastName:  faker.person.lastName(),
      employeeId: `EMP-${faker.string.numeric(6)}`,
    };

    // Act
    logger.step(2, `Creating employee: ${employeeData.firstName} ${employeeData.lastName}`);
    const created = await apiClient.createEmployee(employeeData);
    createdEmployeeId = created.empNumber;

    // Assert
    logger.step(3, 'Verify employee was created correctly');
    const fetched = await apiClient.getEmployee(created.empNumber);
    expect(fetched.firstName).toBe(employeeData.firstName);
    expect(fetched.lastName).toBe(employeeData.lastName);
    logger.assertion(true, `Employee ${created.empNumber} created and verified via API`);
  });

  // ── Create via UI ───────────────────────────────────────────────────────────

  test('create employee via UI and verify in the employee list', async ({ page, logger }) => {
    // Arrange
    logger.step(1, 'Navigate to PIM');
    const pimPage = new PimPage(page);
    await pimPage.navigate();

    const employeeData = {
      firstName: faker.person.firstName(),
      lastName:  faker.person.lastName(),
      employeeId: `EMP-${faker.string.numeric(6)}`,
    };

    // Act
    logger.step(2, `Creating employee via UI: ${employeeData.firstName} ${employeeData.lastName}`);
    await pimPage.createEmployee(employeeData);

    // Assert
    logger.step(3, 'Search for the new employee');
    await pimPage.searchEmployee(employeeData.firstName);
    const found = await pimPage.verifyEmployeeInList(employeeData.employeeId);
    expect(found).toBe(true);
    logger.assertion(found, `Employee ${employeeData.employeeId} found in list`);
  });

  // ── Update ──────────────────────────────────────────────────────────────────

  test('update employee first name via API and verify change', async ({ page, config, logger }) => {
    // Arrange
    const apiClient = new EmployeeAPIClient(page);
    await apiClient.authenticate(config.adminUsername, config.adminPassword);

    const created = await apiClient.createEmployee({
      firstName: 'Original',
      lastName:  faker.person.lastName(),
      employeeId: `EMP-${faker.string.numeric(6)}`,
    });
    createdEmployeeId = created.empNumber;

    // Act
    logger.step(1, `Updating employee ${created.empNumber} first name`);
    const updated = await apiClient.updateEmployee(created.empNumber, { firstName: 'Updated' });

    // Assert
    expect(updated.firstName).toBe('Updated');
    logger.assertion(true, 'Employee first name updated successfully');
  });

  // ── Delete ──────────────────────────────────────────────────────────────────

  test('delete employee via API – employee no longer retrievable', async ({ page, config, logger }) => {
    // Arrange
    const apiClient = new EmployeeAPIClient(page);
    await apiClient.authenticate(config.adminUsername, config.adminPassword);

    const created = await apiClient.createEmployee({
      firstName: faker.person.firstName(),
      lastName:  faker.person.lastName(),
      employeeId: `EMP-${faker.string.numeric(6)}`,
    });

    // Act
    logger.step(1, `Deleting employee ${created.empNumber}`);
    await apiClient.deleteEmployee(created.empNumber);
    createdEmployeeId = undefined; // already deleted

    // Assert
    logger.step(2, 'Verify employee is no longer retrievable');
    await expect(apiClient.getEmployee(created.empNumber)).rejects.toThrow();
    logger.assertion(true, 'Employee deleted – GET now throws as expected');
  });

  // ── Search ──────────────────────────────────────────────────────────────────

  test('search employees by name returns matching results', async ({ page, config, logger }) => {
    // Arrange
    const apiClient = new EmployeeAPIClient(page);
    await apiClient.authenticate(config.adminUsername, config.adminPassword);

    // Act
    logger.step(1, 'Search employees by name "Admin"');
    const results = await apiClient.searchEmployees({ name: 'Admin' });

    // Assert
    expect(Array.isArray(results)).toBe(true);
    logger.assertion(true, `Search returned ${results.length} results`);
  });
});
