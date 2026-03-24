import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';
import { EmployeePage } from '../../src/pages/EmployeePage';

test.describe('Employee Management Tests with Page Objects', () => {
  let loginPage: LoginPage;
  let employeePage: EmployeePage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    employeePage = new EmployeePage(page);
    
    // Login first
    await loginPage.navigateToLogin();
    await loginPage.login('Admin', 'admin123');
    await loginPage.verifyLoginSuccess();
  });

  test('should navigate to employee list', async () => {
    await employeePage.navigateToEmployeeList();
    const isTableVisible = await employeePage.verifyEmployeeTableVisible();
    expect(isTableVisible).toBe(true);
  });

  test('should display employee records', async () => {
    await employeePage.navigateToEmployeeList();
    const count = await employeePage.getEmployeeCount();
    expect(count).toBeGreaterThan(0);
  });

  test('should verify employee page title', async () => {
    await employeePage.navigateToEmployeeList();
    const titleValid = await employeePage.verifyPageTitle();
    expect(titleValid).toBe(true);
  });
});
