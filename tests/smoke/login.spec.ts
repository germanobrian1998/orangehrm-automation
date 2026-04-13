import { test, expect } from '@playwright/test';
import { allure } from 'allure-playwright';
import { LoginPage } from '../../src/pages/LoginPage';

test.describe('Login Tests @smoke', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  test('should login with valid credentials @critical', async () => {
    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.story('User logs in with valid credentials');
    await allure.severity('critical');
    await allure.description('Verify that a user can login with valid admin credentials');
    await allure.tags('smoke', 'auth');

    await allure.step('Login with valid credentials', async () => {
      await loginPage.login('Admin', 'admin123');
    });

    await allure.step('Verify dashboard is displayed', async () => {
      await loginPage.verifyLoginSuccess();
    });
  });

  test('should handle invalid credentials gracefully @major', async ({ page }) => {
    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.story('System shows error for invalid credentials');
    await allure.severity('major');
    await allure.description('Verify error message is shown for invalid login');

    await allure.step('Login with invalid credentials', async () => {
      await loginPage.login('invalid', 'wrongpass');
    });

    await allure.step('Verify user is not redirected to dashboard', async () => {
      await page.waitForURL(/(?!.*dashboard).*/, { timeout: 5000 }).catch(() => {});
      const url = page.url();
      expect(url).not.toContain('dashboard');
    });
  });

  test('should display validation for empty fields @minor', async () => {
    await allure.epic('Authentication');
    await allure.feature('Login');
    await allure.story('Validation error shown for empty fields');
    await allure.severity('minor');
    await allure.description(
      'Verify validation error is displayed when submitting empty login form'
    );

    await allure.step('Submit empty login form', async () => {
      await loginPage.clickButton('button[type="submit"]');
    });

    await allure.step('Verify validation error is displayed', async () => {
      await loginPage.verifyValidationError();
    });
  });
});
