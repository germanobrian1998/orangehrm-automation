import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { LoginPage } from '../../src/pages/LoginPage';
import { EmployeePage } from '../../src/pages/EmployeePage';

test.describe('Employee Management Tests @employee', () => {
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

  test('should navigate to employee list @smoke @major', async () => {
    await allure.epic('Employee Management');
    await allure.feature('Employee List');
    await allure.story('User navigates to employee list');
    await allure.severity('major');
    await allure.description('Verify that an admin can navigate to the employee list');
    await allure.tag('smoke', 'employee');

    await allure.step('Navigate to employee module', async () => {
      await employeePage.navigateToEmployeeList();
    });

    await allure.step('Verify employee list is displayed', async () => {
      const isTableVisible = await employeePage.verifyEmployeeTableVisible();
      expect(isTableVisible).toBe(true);
    });
  });

  test('should verify employee list page loads @major', async ({ page }) => {
    await allure.epic('Employee Management');
    await allure.feature('Employee List');
    await allure.story('Employee list page loads with correct URL');
    await allure.severity('major');
    await allure.description('Verify that the employee list page loads with the correct URL');

    await allure.step('Navigate to employee list', async () => {
      await employeePage.navigateToEmployeeList();
    });

    await allure.step('Verify correct URL is shown', async () => {
      await expect(page).toHaveURL(/.*viewEmployeeList.*/);
    });
  });

  test('should display employee section @minor', async () => {
    await allure.epic('Employee Management');
    await allure.feature('Employee List');
    await allure.story('Employee table is visible on page');
    await allure.severity('minor');
    await allure.description('Verify that the employee table section is visible after navigation');

    await allure.step('Navigate to employee list', async () => {
      await employeePage.navigateToEmployeeList();
    });

    await allure.step('Verify employee table is visible', async () => {
      const table = await employeePage.verifyEmployeeTableVisible();
      expect(table).toBe(true);
    });
  });
});
