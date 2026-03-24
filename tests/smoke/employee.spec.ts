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

  test('should verify employee list page loads', async ({ page }) => {
    await employeePage.navigateToEmployeeList();
    
    // Verificar que estamos en la página correcta
    await expect(page).toHaveURL(/.*viewEmployeeList.*/);
  });

  test('should display employee section', async ({ page }) => {
    await employeePage.navigateToEmployeeList();
    
    // Verificar que la tabla está visible
    const table = await employeePage.verifyEmployeeTableVisible();
    expect(table).toBe(true);
  });
});
