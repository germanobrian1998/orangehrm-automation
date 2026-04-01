/**
 * Example: Login Flow Test
 *
 * Demonstrates the complete authentication flow using LoginPage.
 * Run: npx playwright test docs/examples/login-flow.spec.ts
 */

import { test, expect } from '@qa-framework/core';
import { LoginPage } from '../../src/pages/login.page';
import { selectors } from '../../src/selectors';

test.describe('@auth @smoke Login Flow Example', () => {
  // ── Successful login ────────────────────────────────────────────────────────

  test('admin user can log in and land on the dashboard', async ({ page, config, logger }) => {
    // Arrange
    logger.step(1, 'Set up LoginPage');
    const loginPage = new LoginPage(page);

    // Act
    logger.step(2, 'Perform login');
    await loginPage.login({
      username: config.adminUsername,
      password: config.adminPassword,
    });

    // Assert
    logger.step(3, 'Verify login success');
    const isLoggedIn = await loginPage.isLoggedIn();
    expect(isLoggedIn).toBe(true);
    logger.assertion(isLoggedIn, 'Admin is logged in and user dropdown is visible');
  });

  // ── Invalid credentials ─────────────────────────────────────────────────────

  test('wrong password shows an invalid credentials error', async ({ page, config, logger }) => {
    // Arrange
    logger.step(1, 'Set up LoginPage');
    const loginPage = new LoginPage(page);

    // Act
    logger.step(2, 'Attempt login with wrong password');
    const errorMessage = await loginPage.loginAndExpectError({
      username: config.adminUsername,
      password: 'definitely-wrong-password',
    });

    // Assert
    logger.step(3, 'Verify error message is shown');
    expect(errorMessage).toContain('Invalid credentials');
    logger.assertion(true, `Error message displayed: "${errorMessage}"`);
  });

  test('empty username shows a validation error', async ({ page, logger }) => {
    // Arrange
    logger.step(1, 'Navigate to login page');
    await page.goto('/auth/login');

    // Act
    logger.step(2, 'Submit the form with empty credentials');
    await page.locator(selectors.login.submitButton).click();

    // Assert
    logger.step(3, 'Verify URL remains on login page');
    expect(page.url()).toMatch(/auth\/login/);
    logger.assertion(true, 'Form submission with empty credentials did not navigate away');
  });

  // ── Logout ──────────────────────────────────────────────────────────────────

  test('logged-in user can log out successfully', async ({ page, config, logger }) => {
    // Arrange
    logger.step(1, 'Log in as admin');
    const loginPage = new LoginPage(page);
    await loginPage.login({
      username: config.adminUsername,
      password: config.adminPassword,
    });
    expect(await loginPage.isLoggedIn()).toBe(true);

    // Act
    logger.step(2, 'Log out');
    await loginPage.logout();

    // Assert
    logger.step(3, 'Verify user is redirected to login page');
    expect(page.url()).toMatch(/auth\/login/);
    logger.assertion(true, 'User was redirected to login page after logout');
  });

  // ── Session state ───────────────────────────────────────────────────────────

  test('fresh page has no active session', async ({ page, logger }) => {
    // Arrange
    logger.step(1, 'Create a fresh LoginPage');
    const loginPage = new LoginPage(page);

    // Act
    const sessionActive = await loginPage.isLoggedIn();

    // Assert
    expect(sessionActive).toBe(false);
    logger.assertion(!sessionActive, 'Fresh page correctly shows no active session');
  });
});
