import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';

test.describe('Login Tests with Page Objects', () => {
  let loginPage: LoginPage;

  test.beforeEach(async ({ page }) => {
    loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
  });

  test('should login with valid credentials', async () => {
    await loginPage.login('Admin', 'admin123');
    await loginPage.verifyLoginSuccess();
  });

  test('should display error with invalid credentials', async () => {
    await loginPage.login('invalid', 'wrongpass');
    await loginPage.verifyLoginError();
  });

  test('should display validation for empty fields', async () => {
    await loginPage.clickButton('button[type="submit"]');
    await loginPage.verifyValidationError();
  });
});
