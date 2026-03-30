/**
 * OrangeHRM Suite - Login Page Object
 */

import { Page } from '@playwright/test';
import { BasePage, constants } from '@qa-framework/core';
import { selectors } from '../selectors';

export interface LoginCredentials {
  username: string;
  password: string;
}

export class LoginPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async login(credentials: LoginCredentials): Promise<void> {
    try {
      this.logger.step(1, `Logging in as ${credentials.username}`);

      await this.goto('/auth/login');
      await this.fill(selectors.login.usernameInput, credentials.username);
      await this.fill(selectors.login.passwordInput, credentials.password);
      await this.click(selectors.login.submitButton);

      await this.waitForUrl(/.*\/dashboard/);
      await this.waitFor.loadingComplete();

      this.logger.info(`✓ Login successful for ${credentials.username}`);
    } catch (error) {
      this.logger.error('Login failed', error);
      await this.screenshot('login_failure');
      throw error;
    }
  }

  async loginAndExpectError(credentials: LoginCredentials): Promise<string> {
    try {
      this.logger.step(1, 'Attempting login with invalid credentials');

      await this.goto('/auth/login');
      await this.fill(selectors.login.usernameInput, credentials.username);
      await this.fill(selectors.login.passwordInput, credentials.password);
      await this.click(selectors.login.submitButton);

      await this.waitFor.elementVisible(selectors.login.errorMessage, constants.TIMEOUTS.MEDIUM);

      const errorMessage = await this.getText(selectors.login.errorMessage);
      this.logger.info(`✓ Error message displayed: ${errorMessage}`);
      return errorMessage;
    } catch (error) {
      this.logger.error('Failed to get error message', error);
      throw error;
    }
  }

  async logout(): Promise<void> {
    try {
      this.logger.step(1, 'Logging out');
      await this.click(selectors.dashboard.userDropdown);
      await this.click(selectors.dashboard.logoutOption);
      await this.waitForUrl(/.*\/auth\/login/);
      this.logger.info('✓ Logout successful');
    } catch (error) {
      this.logger.error('Logout failed', error);
      throw error;
    }
  }

  async isLoggedIn(): Promise<boolean> {
    try {
      return await this.isVisible(selectors.dashboard.userDropdown);
    } catch {
      return false;
    }
  }
}
