/**
 * Smoke Tests - Employee Creation
 * Critical path: Admin can create employee
 * 
 * @smoke
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { PIMPage } from '@pages/pim.page';
import { EmployeeAPI } from '@api/employee.api';
import { environment } from '@config/environment';
import { constants } from '@config/constants';

test.describe('Employee Creation - Smoke Tests', () => {
  
  test.beforeEach(async ({ page }) => {
    // Login before each test
    const loginPage = new LoginPage(page);
    await loginPage.login({
      username: environment.adminUsername,
      password: environment.adminPassword,
    });
  });

  test('Admin can create employee via UI @smoke', async ({ page }) => {
    // Arrange
    const pimPage = new PIMPage(page);
    const employeeData = {
      firstName: `Test_${Date.now()}`,
      lastName: 'Employee',
      employeeId: `EMP_${Date.now().toString().slice(-6)}`,
    };

    // Act
    await pimPage.createEmployee(employeeData);

    // Assert
    await expect(page).toHaveURL(/.*\/pim\/viewPersonalDetails/);
  });

  test('API returns created employee data @smoke', async ({ page }) => {
    // Arrange
    const employeeAPI = new EmployeeAPI(page);
    await employeeAPI.authenticate(
      environment.adminUsername,
      environment.adminPassword
    );

    const employeeData = {
      firstName: `APITest_${Date.now()}`,
      lastName: 'Employee',
      employeeId: `EMPAPI_${Date.now().toString().slice(-6)}`,
    };

    // Act
    const createdEmployee = await employeeAPI.create(employeeData);

    // Assert
    expect(createdEmployee.id).toBeTruthy();
    expect(createdEmployee.firstName).toBe(employeeData.firstName);
    expect(createdEmployee.lastName).toBe(employeeData.lastName);

    // Cleanup
    await employeeAPI.delete(createdEmployee.id);
  });
});