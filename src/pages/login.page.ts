/**
 * Login Page Object
 * Handles all login-related interactions
 */

import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { selectors } from '@config/selectors';
import { constants } from '@config/constants';

export interface LoginCredentials {
  username: string;
  password: string;
}

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Login with valid credentials
   */
  async login(credentials: LoginCredentials): Promise<void> {
    try {
      this.logger.step(1, `Logging in as ${credentials.username}`);

      await this.goto('/auth/login');

      // Fill username
      await this.fill(selectors.login.usernameInput, credentials.username);
      this.logger.debug('Username filled');

      // Fill password
      await this.fill(selectors.login.passwordInput, credentials.password);
      this.logger.debug('Password filled');

      // Click submit
      await this.click(selectors.login.submitButton);
      this.logger.debug('Submit button clicked');

      // Wait for navigation to dashboard
      await this.waitForUrl(/.*\/dashboard/);
      await this.waitFor.loadingComplete();

      this.logger.info(`✓ Login successful for ${credentials.username}`);
    } catch (error) {
      this.logger.error('Login failed', error);
      await this.screenshot('login_failure');
      throw error;
    }
  }

  /**
   * Try login and expect error
   */
  async loginAndExpectError(credentials: LoginCredentials): Promise<string> {
    try {
      this.logger.step(1, `Attempting login with invalid credentials`);

      await this.goto('/auth/login');

      await this.fill(selectors.login.usernameInput, credentials.username);
      await this.fill(selectors.login.passwordInput, credentials.password);
      await this.click(selectors.login.submitButton);

      // Wait for error message
      await this.waitFor.elementVisible(
        selectors.login.errorMessage,
        constants.TIMEOUTS.MEDIUM
      );

      const errorMessage = await this.getText(selectors.login.errorMessage);
      this.logger.info(`✓ Error message displayed: ${errorMessage}`);

      return errorMessage;
    } catch (error) {
      this.logger.error('Failed to get error message', error);
      throw error;
    }
  }

  /**
   * Logout
   */
  async logout(): Promise<void> {
    try {
      this.logger.step(1, 'Logging out');

      // Click user dropdown
      await this.click(selectors.dashboard.userDropdown);

      // Click logout option
      await this.click(selectors.dashboard.logoutOption);

      // Wait for login page to load
      await this.waitForUrl(/.*\/auth\/login/);

      this.logger.info(`✓ Logout successful`);
    } catch (error) {
      this.logger.error('Logout failed', error);
      throw error;
    }
  }

  /**
   * Check if already logged in
   */
  async isLoggedIn(): Promise<boolean> {
    try {
      const isVisible = await this.isVisible(selectors.dashboard.userDropdown);
      return isVisible;
    } catch (error) {
      return false;
    }
  }
}