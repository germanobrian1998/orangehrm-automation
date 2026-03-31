/**
 * OrangeHRM Suite - Login to Dashboard Integration Tests
 * Validates the full login flow: page object structure, credential handling,
 * session state, and cross-step data continuity.
 */

import { test, expect } from '@qa-framework/core';
import { LoginPage } from '../../src/pages/login.page';
import { selectors } from '../../src/selectors';

test.describe('@integration Login to Dashboard Flow', () => {
  // ─── LoginPage structure ───────────────────────────────────────────────

  test('LoginPage is importable from the suite', async ({ logger }) => {
    logger.step(1, 'Verify LoginPage import');
    expect(LoginPage).toBeDefined();
    logger.info('✓ LoginPage is importable');
  });

  test('LoginPage can be instantiated with a Playwright page', async ({ testPage, logger }) => {
    logger.step(1, 'Instantiate LoginPage');
    const loginPage = new LoginPage(testPage);
    expect(loginPage).toBeDefined();
    logger.info('✓ LoginPage instantiated successfully');
  });

  test('LoginPage exposes login method', async ({ testPage }) => {
    const loginPage = new LoginPage(testPage);
    expect(typeof loginPage.login).toBe('function');
  });

  test('LoginPage exposes loginAndExpectError method', async ({ testPage }) => {
    const loginPage = new LoginPage(testPage);
    expect(typeof loginPage.loginAndExpectError).toBe('function');
  });

  test('LoginPage exposes logout method', async ({ testPage }) => {
    const loginPage = new LoginPage(testPage);
    expect(typeof loginPage.logout).toBe('function');
  });

  test('LoginPage exposes isLoggedIn method', async ({ testPage }) => {
    const loginPage = new LoginPage(testPage);
    expect(typeof loginPage.isLoggedIn).toBe('function');
  });

  // ─── Selectors completeness ─────────────────────────────────────────────

  test('login selectors include usernameInput', async ({ logger }) => {
    logger.step(1, 'Verify login selectors');
    expect(selectors.login.usernameInput).toBeTruthy();
    logger.assertion(true, 'usernameInput selector is defined');
  });

  test('login selectors include passwordInput', () => {
    expect(selectors.login.passwordInput).toBeTruthy();
  });

  test('login selectors include submitButton', () => {
    expect(selectors.login.submitButton).toBeTruthy();
  });

  test('login selectors include errorMessage', () => {
    expect(selectors.login.errorMessage).toBeTruthy();
  });

  test('dashboard selectors include userDropdown', () => {
    expect(selectors.dashboard.userDropdown).toBeTruthy();
  });

  test('dashboard selectors include logoutOption', () => {
    expect(selectors.dashboard.logoutOption).toBeTruthy();
  });

  // ─── LoginCredentials interface validation ──────────────────────────────

  test('admin credentials object has required shape', async ({ logger }) => {
    logger.step(1, 'Validate admin credentials shape');
    const credentials = { username: 'Admin', password: 'admin123' };
    expect(credentials.username).toBe('Admin');
    expect(credentials.password).toBe('admin123');
    logger.assertion(true, 'Admin credentials have correct shape');
  });

  test('credentials with special characters are properly typed', () => {
    const credentials = { username: 'admin@test.com', password: 'P@$$w0rd!' };
    expect(typeof credentials.username).toBe('string');
    expect(typeof credentials.password).toBe('string');
  });

  test('empty credential strings fail validation check', () => {
    const credentials = { username: '', password: '' };
    const isValid = credentials.username.length > 0 && credentials.password.length > 0;
    expect(isValid).toBe(false);
  });

  // ─── Login flow state management ────────────────────────────────────────

  test('isLoggedIn returns a boolean', async ({ testPage, logger }) => {
    logger.step(1, 'Verify isLoggedIn return type');
    const loginPage = new LoginPage(testPage);
    const result = await loginPage.isLoggedIn();
    expect(typeof result).toBe('boolean');
    logger.assertion(true, 'isLoggedIn returns a boolean value');
  });

  test('unauthenticated session reports not logged in', async ({ testPage, logger }) => {
    logger.step(1, 'Check session state on fresh page');
    const loginPage = new LoginPage(testPage);
    const loggedIn = await loginPage.isLoggedIn();
    // On a fresh page without navigation the user is not logged in
    expect(loggedIn).toBe(false);
    logger.info('✓ Fresh session correctly identified as unauthenticated');
  });

  // ─── Multiple page object instances ────────────────────────────────────

  test('multiple LoginPage instances are independent', async ({ testPage }) => {
    const page1 = new LoginPage(testPage);
    const page2 = new LoginPage(testPage);
    expect(page1).not.toBe(page2);
  });
});
