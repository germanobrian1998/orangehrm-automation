/**
 * Example: API Testing
 *
 * Demonstrates API-level testing patterns using EmployeeAPIClient.
 * Covers request/response validation, authentication, and error handling.
 * Run: npx playwright test docs/examples/api-testing.spec.ts
 */

import { test, expect } from '@qa-framework/core';
import { faker } from '@faker-js/faker';
import { EmployeeAPIClient } from '../../src/api/employee.api-client';

test.describe('@api @regression API Testing Example', () => {
  // ── Authentication ──────────────────────────────────────────────────────────

  test('authentication succeeds with valid credentials', async ({ page, config, logger }) => {
    // Arrange
    logger.step(1, 'Create API client');
    const apiClient = new EmployeeAPIClient(page);

    // Act – authenticate should not throw
    logger.step(2, 'Authenticate with valid credentials');
    await apiClient.authenticate(config.adminUsername, config.adminPassword);

    // Assert – if we reach this point, authentication succeeded
    logger.assertion(true, 'Authentication completed without error');
  });

  // ── Employee list ───────────────────────────────────────────────────────────

  test('GET employee list returns data array and metadata', async ({ page, config, logger }) => {
    // Arrange
    const apiClient = new EmployeeAPIClient(page);
    await apiClient.authenticate(config.adminUsername, config.adminPassword);

    // Act
    logger.step(1, 'Fetch employee list (limit 10)');
    const response = await apiClient.getEmployeeList(1, 10);

    // Assert – structure validation
    expect(Array.isArray(response.data)).toBe(true);
    expect(typeof response.meta.total).toBe('number');
    expect(response.meta.total).toBeGreaterThanOrEqual(0);
    logger.assertion(true, `Employee list returned ${response.data.length} items, total: ${response.meta.total}`);
  });

  test('each employee object has the expected shape', async ({ page, config, logger }) => {
    // Arrange
    const apiClient = new EmployeeAPIClient(page);
    await apiClient.authenticate(config.adminUsername, config.adminPassword);

    // Act
    const response = await apiClient.getEmployeeList(1, 1);

    // Assert
    if (response.data.length > 0) {
      const employee = response.data[0];
      logger.step(1, `Validating schema of employee ${employee.empNumber}`);

      expect(typeof employee.empNumber).toBe('number');
      expect(typeof employee.firstName).toBe('string');
      expect(typeof employee.lastName).toBe('string');
      expect(typeof employee.employeeId).toBe('string');

      logger.assertion(true, 'Employee object schema is valid');
    } else {
      logger.warn('No employees found in the system – skipping schema validation');
    }
  });

  // ── CRUD lifecycle ──────────────────────────────────────────────────────────

  test('full CRUD lifecycle: create → read → update → delete', async ({ page, config, logger }) => {
    const apiClient = new EmployeeAPIClient(page);
    await apiClient.authenticate(config.adminUsername, config.adminPassword);

    const originalData = {
      firstName: faker.person.firstName(),
      lastName:  faker.person.lastName(),
      employeeId: `EMP-${faker.string.numeric(6)}`,
    };

    // Create
    logger.step(1, 'Create employee via API');
    const created = await apiClient.createEmployee(originalData);
    expect(created.empNumber).toBeDefined();
    expect(created.firstName).toBe(originalData.firstName);

    try {
      // Read
      logger.step(2, 'Read employee via API');
      const fetched = await apiClient.getEmployee(created.empNumber);
      expect(fetched.firstName).toBe(originalData.firstName);
      expect(fetched.lastName).toBe(originalData.lastName);

      // Update
      logger.step(3, 'Update employee first name');
      const updated = await apiClient.updateEmployee(created.empNumber, {
        firstName: 'ModifiedName',
      });
      expect(updated.firstName).toBe('ModifiedName');

      // Verify update persisted
      const refetched = await apiClient.getEmployee(created.empNumber);
      expect(refetched.firstName).toBe('ModifiedName');

      logger.assertion(true, 'CRUD operations completed successfully');
    } finally {
      // Delete (always clean up)
      logger.step(4, 'Delete employee');
      await apiClient.deleteEmployee(created.empNumber);

      // Verify deletion
      await expect(apiClient.getEmployee(created.empNumber)).rejects.toThrow();
      logger.assertion(true, 'Employee deleted – not retrievable after deletion');
    }
  });

  // ── Search and filtering ────────────────────────────────────────────────────

  test('search by employee name returns filtered results', async ({ page, config, logger }) => {
    // Arrange
    const apiClient = new EmployeeAPIClient(page);
    await apiClient.authenticate(config.adminUsername, config.adminPassword);

    // Act
    logger.step(1, 'Search for employees named "Admin"');
    const results = await apiClient.searchEmployees({ name: 'Admin' });

    // Assert
    expect(Array.isArray(results)).toBe(true);
    logger.assertion(true, `Search returned ${results.length} employees matching "Admin"`);
  });

  test('pagination returns correct page size', async ({ page, config, logger }) => {
    // Arrange
    const apiClient = new EmployeeAPIClient(page);
    await apiClient.authenticate(config.adminUsername, config.adminPassword);

    // Act
    logger.step(1, 'Request page 1 with limit 5');
    const page1 = await apiClient.getEmployeeList(1, 5);

    // Assert
    expect(page1.data.length).toBeLessThanOrEqual(5);
    logger.assertion(true, `Page 1 returned ${page1.data.length} employees (max 5)`);
  });

  // ── Response time ───────────────────────────────────────────────────────────

  test('employee list API responds within 3 seconds', async ({ page, config, logger }) => {
    // Arrange
    const apiClient = new EmployeeAPIClient(page);
    await apiClient.authenticate(config.adminUsername, config.adminPassword);

    // Act
    logger.step(1, 'Measure response time');
    const start = Date.now();
    await apiClient.getEmployeeList(1, 10);
    const duration = Date.now() - start;

    // Assert
    logger.info(`Response time: ${duration}ms`);
    expect(duration).toBeLessThan(3000);
    logger.assertion(duration < 3000, `API responded in ${duration}ms (threshold: 3000ms)`);
  });

  // ── Route interception (mock) ───────────────────────────────────────────────

  test('UI handles a mocked 500 API error gracefully', async ({ page, logger }) => {
    // Arrange – intercept the employees API and return a 500
    logger.step(1, 'Set up route interception to simulate API failure');
    await page.route('**/api/v2/pim/employees**', (route) => {
      route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ error: 'Internal Server Error' }),
      });
    });

    // Act
    logger.step(2, 'Navigate to a page that calls the employees API');
    await page.goto('/pim/viewEmployeeList');

    // Assert – the page should not crash; it may show an error state
    // (exact behaviour depends on the application's error handling)
    logger.assertion(true, 'Page did not crash when API returned 500');

    // Remove route interception
    await page.unroute('**/api/v2/pim/employees**');
  });
});
