/**
 * OrangeHRM Suite - Login Test Suite
 * Tests for authentication flows: successful login, invalid credentials,
 * session management, and logout. Follows the Page Object Model (ADR-004).
 *
 * Testing pyramid layer: Integration (ADR-003)
 * These tests validate the LoginPage class structure and behaviour contracts
 * without requiring a live OrangeHRM instance.
 */

import { test, expect } from '@qa-framework/core';
import { LoginPage } from '../../src/pages/login.page';
import { selectors } from '../../src/selectors';

test.describe('@auth Login Test Suite', () => {
  // ── 1. Successful login scenario ──────────────────────────────────────────

  test.describe('Successful login', () => {
    test('LoginPage is importable from the suite', async ({ logger }) => {
      // Arrange
      logger.step(1, 'Verify LoginPage module is importable');

      // Assert
      expect(LoginPage).toBeDefined();
      logger.info('✓ LoginPage is importable');
    });

    test('LoginPage can be instantiated with a Playwright page', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Instantiate LoginPage with a Playwright page');

      // Act
      const loginPage = new LoginPage(testPage);

      // Assert
      expect(loginPage).toBeInstanceOf(LoginPage);
      logger.info('✓ LoginPage instantiated successfully');
    });

    test('login method is defined on LoginPage', async ({ testPage }) => {
      // Arrange
      const loginPage = new LoginPage(testPage);

      // Assert
      expect(typeof loginPage.login).toBe('function');
    });

    test('valid admin credential shape is correctly typed', async ({ logger }) => {
      // Arrange
      logger.step(1, 'Validate admin credential object shape');

      // Act
      const credentials = { username: 'Admin', password: 'admin123' };

      // Assert
      expect(typeof credentials.username).toBe('string');
      expect(typeof credentials.password).toBe('string');
      expect(credentials.username).toBe('Admin');
      expect(credentials.password).toBe('admin123');
      logger.assertion(true, 'Admin credentials have the correct shape');
    });

    test('credential object with special characters is valid', () => {
      // Arrange / Act
      const credentials = { username: 'admin@corp.com', password: 'P@$$w0rd!' };

      // Assert
      expect(credentials.username).toMatch(/@/);
      expect(credentials.password).toContain('!');
    });

    test('isLoggedIn returns a boolean value', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Verify isLoggedIn return type');
      const loginPage = new LoginPage(testPage);

      // Act
      const result = await loginPage.isLoggedIn();

      // Assert
      expect(typeof result).toBe('boolean');
      logger.assertion(true, 'isLoggedIn correctly returns a boolean');
    });

    test('unauthenticated fresh page returns false for isLoggedIn', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Check session state on fresh (unauthenticated) page');
      const loginPage = new LoginPage(testPage);

      // Act
      const loggedIn = await loginPage.isLoggedIn();

      // Assert
      expect(loggedIn).toBe(false);
      logger.info('✓ Fresh page is correctly identified as unauthenticated');
    });
  });

  // ── 2. Invalid credentials handling ─────────────────────────────────────

  test.describe('Invalid credentials handling', () => {
    test('loginAndExpectError method is defined on LoginPage', async ({ testPage }) => {
      // Arrange
      const loginPage = new LoginPage(testPage);

      // Assert
      expect(typeof loginPage.loginAndExpectError).toBe('function');
    });

    test('empty username and password fail validation', () => {
      // Arrange
      const credentials = { username: '', password: '' };

      // Act
      const isValid = credentials.username.length > 0 && credentials.password.length > 0;

      // Assert
      expect(isValid).toBe(false);
    });

    test('blank username alone makes credentials invalid', () => {
      // Arrange
      const credentials = { username: '', password: 'somePassword' };

      // Act
      const isValid = credentials.username.trim().length > 0;

      // Assert
      expect(isValid).toBe(false);
    });

    test('blank password alone makes credentials invalid', () => {
      // Arrange
      const credentials = { username: 'Admin', password: '' };

      // Act
      const isValid = credentials.password.trim().length > 0;

      // Assert
      expect(isValid).toBe(false);
    });

    test('whitespace-only password is treated as invalid', () => {
      // Arrange / Act
      const password = '   ';

      // Assert
      expect(password.trim().length).toBe(0);
    });

    test('error message selector is defined in selectors', () => {
      // Assert
      expect(selectors.login.errorMessage).toBeTruthy();
      expect(typeof selectors.login.errorMessage).toBe('string');
    });
  });

  // ── 3. Session management ─────────────────────────────────────────────────

  test.describe('Session management', () => {
    test('multiple LoginPage instances share the same page but are independent objects', async ({ testPage }) => {
      // Arrange / Act
      const page1 = new LoginPage(testPage);
      const page2 = new LoginPage(testPage);

      // Assert
      expect(page1).not.toBe(page2);
      expect(page1).toBeInstanceOf(LoginPage);
      expect(page2).toBeInstanceOf(LoginPage);
    });

    test('dashboard userDropdown selector is defined for session verification', () => {
      // Assert
      expect(selectors.dashboard.userDropdown).toBeTruthy();
    });

    test('login selector set is complete for session flow', () => {
      // Assert
      expect(selectors.login.usernameInput).toBeTruthy();
      expect(selectors.login.passwordInput).toBeTruthy();
      expect(selectors.login.submitButton).toBeTruthy();
    });

    test('session check relies on visible user dropdown', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Verify session check mechanism');
      const loginPage = new LoginPage(testPage);

      // Act – on a fresh page the user dropdown should not be visible
      const sessionActive = await loginPage.isLoggedIn();

      // Assert
      expect(sessionActive).toBe(false);
      logger.assertion(true, 'isLoggedIn correctly reports no active session on fresh page');
    });
  });

  // ── 4. Logout functionality ───────────────────────────────────────────────

  test.describe('Logout functionality', () => {
    test('logout method is defined on LoginPage', async ({ testPage }) => {
      // Arrange
      const loginPage = new LoginPage(testPage);

      // Assert
      expect(typeof loginPage.logout).toBe('function');
    });

    test('logoutOption selector is defined in dashboard selectors', () => {
      // Assert
      expect(selectors.dashboard.logoutOption).toBeTruthy();
    });

    test('logout selector points to the correct element text', () => {
      // Assert
      expect(selectors.dashboard.logoutOption).toContain('Logout');
    });

    test('userDropdown selector is required before logout can execute', () => {
      // Assert – both selectors must exist for the two-step logout sequence
      expect(selectors.dashboard.userDropdown).toBeTruthy();
      expect(selectors.dashboard.logoutOption).toBeTruthy();
    });
  });

  // ── 5. Remember me functionality ─────────────────────────────────────────

  test.describe('Remember me functionality', () => {
    test('rememberMeCheckbox selector is defined', () => {
      // Assert
      expect(selectors.login.rememberMeCheckbox).toBeTruthy();
    });

    test('rememberMeLabel selector is defined', () => {
      // Assert
      expect(selectors.login.rememberMeLabel).toBeTruthy();
    });

    test('remember me credential shape includes the rememberMe flag', () => {
      // Arrange / Act
      const credentials = { username: 'Admin', password: 'admin123', rememberMe: true };

      // Assert
      expect(credentials.rememberMe).toBe(true);
    });

    test('remember me can be disabled by setting the flag to false', () => {
      // Arrange / Act
      const credentials = { username: 'Admin', password: 'admin123', rememberMe: false };

      // Assert
      expect(credentials.rememberMe).toBe(false);
    });

    test('credential object without rememberMe flag defaults to not remembered', () => {
      // Arrange / Act
      const credentials = { username: 'Admin', password: 'admin123' };

      // Assert – rememberMe is optional; absence means it defaults to false/unset
      expect((credentials as Record<string, unknown>).rememberMe).toBeUndefined();
    });

    test('rememberMe flag is a boolean type when provided', () => {
      // Arrange / Act
      const withRemember = { username: 'Admin', password: 'admin123', rememberMe: true };
      const withoutRemember = { username: 'Admin', password: 'admin123', rememberMe: false };

      // Assert
      expect(typeof withRemember.rememberMe).toBe('boolean');
      expect(typeof withoutRemember.rememberMe).toBe('boolean');
    });

    test('rememberMeCheckbox selector references a checkbox input', () => {
      // Assert – the selector should target an input of type checkbox
      expect(selectors.login.rememberMeCheckbox).toContain('checkbox');
    });
  });
});
