/**
 * Smoke Tests - Login
 * Critical path: User can login and logout
 * 
 * @smoke
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '@pages/login.page';
import { environment } from '@config/environment';
import { constants } from '@config/constants';

test.describe('Login - Smoke Tests', () => {
  
  test('Admin can login successfully @smoke', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    await loginPage.login({
      username: environment.adminUsername,
      password: environment.adminPassword,
    });

    // Assert
    await expect(page).toHaveURL(/.*\/dashboard/);
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
  });

  test('Invalid credentials show error @smoke', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);

    // Act
    const errorMessage = await loginPage.loginAndExpectError({
      username: 'invalid@example.com',
      password: 'wrongpassword123',
    });

    // Assert
    expect(errorMessage.toLowerCase()).toContain('invalid');
  });

  test('User can logout @smoke', async ({ page }) => {
    // Arrange
    const loginPage = new LoginPage(page);
    await loginPage.login({
      username: environment.adminUsername,
      password: environment.adminPassword,
    });

    // Act
    await loginPage.logout();

    // Assert
    await expect(page).toHaveURL(/.*\/auth\/login/);
  });
});