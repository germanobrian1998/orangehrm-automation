/**
 * Regression Tests - Employee CRUD Operations
 * Tests: Create, Read, Update, Delete employee
 * 
 * @regression
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { PIMPage } from '@pages/pim.page';
import { EmployeeAPI } from '@api/employee.api';
import { environment } from '@config/environment';
import { constants } from '@config/constants';

test.describe('PIM - Employee CRUD Operations @regression', () => {
  
  let pimPage: PIMPage;
  let loginPage: LoginPage;
  let employeeAPI: EmployeeAPI;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    pimPage = new PIMPage(page);
    employeeAPI = new EmployeeAPI(page);

    // Authenticate API
    await employeeAPI.authenticate(
      environment.adminUsername,
      environment.adminPassword
    );

    // Login UI
    await loginPage.login({
      username: environment.adminUsername,
      password: environment.adminPassword,
    });
  });

  test('Create employee and verify in database @regression', async ({ page }) => {
    // Arrange
    const newEmployee = {
      firstName: `Test_${Date.now()}`,
      lastName: 'Employee',
      employeeId: `EMP_${Date.now().toString().slice(-6)}`,
    };

    // Act - Create via API
    const createdEmployee = await employeeAPI.create(newEmployee);
    expect(createdEmployee.id).toBeTruthy();

    // Act - Verify in UI
    await pimPage.goToEmployeeList();
    await pimPage.searchEmployee(newEmployee.employeeId);
    const exists = await pimPage.verifyEmployeeInList(newEmployee.employeeId);

    // Assert
    expect(exists).toBe(true);

    // Cleanup
    await employeeAPI.delete(createdEmployee.id);
  });

  test('Update employee via UI and verify in API @regression', async ({ page }) => {
    // Arrange
    const newEmployee = {
      firstName: `Update_${Date.now()}`,
      lastName: 'Employee',
      employeeId: `EMPUPD_${Date.now().toString().slice(-6)}`,
    };

    const createdEmployee = await employeeAPI.create(newEmployee);

    // Act - Navigate to employee record
    await pimPage.goto(`/pim/viewPersonalDetails/empNumber/${createdEmployee.id}`);

    // Act - Update email
    const updatedEmail = `test_${Date.now()}@example.com`;
    await pimPage.fill('[name="email"]', updatedEmail);
    await pimPage.submitForm();

    // Assert - Verify in API
    const updatedEmployee = await employeeAPI.get(createdEmployee.id);
    expect(updatedEmployee.email).toBe(updatedEmail);

    // Cleanup
    await employeeAPI.delete(createdEmployee.id);
  });

  test('Delete employee via API and verify UI @regression', async ({ page }) => {
    // Arrange
    const newEmployee = {
      firstName: `Delete_${Date.now()}`,
      lastName: 'Employee',
      employeeId: `EMPDEL_${Date.now().toString().slice(-6)}`,
    };

    const createdEmployee = await employeeAPI.create(newEmployee);

    // Act - Delete via API
    await employeeAPI.delete(createdEmployee.id);

    // Assert - Verify in UI (should not exist)
    await pimPage.goToEmployeeList();
    await pimPage.searchEmployee(newEmployee.employeeId);
    const exists = await pimPage.verifyEmployeeInList(newEmployee.employeeId);

    expect(exists).toBe(false);
  });

  test('Form validation - Employee ID is required @regression', async ({ page }) => {
    // Arrange
    await pimPage.goToAddEmployee();

    // Act - Fill only first name
    await pimPage.fill('[placeholder="First Name"]', 'Test');

    // Act - Try to submit without employee ID
    await pimPage.submitForm();

    // Assert - Error should appear
    const errorMessage = await pimPage.getFieldError('employeeId');
    expect(errorMessage.toLowerCase()).toContain('required');
  });

  test('Duplicate Employee ID validation @regression', async ({ page }) => {
    // Arrange
    const uniqueId = `EMP_${Date.now().toString().slice(-6)}`;
    const employee1 = {
      firstName: 'First',
      lastName: 'Employee',
      employeeId: uniqueId,
    };

    // Create first employee
    const created = await employeeAPI.create(employee1);

    // Act - Try to create another with same ID
    await pimPage.goToAddEmployee();
    await pimPage.fillEmployeeForm(employee1);
    await pimPage.submitForm();

    // Assert - Should get duplicate error
    const errorMessage = await pimPage.getFieldError('employeeId');
    expect(errorMessage.toLowerCase()).toContain('exists');

    // Cleanup
    await employeeAPI.delete(created.id);
  });
});