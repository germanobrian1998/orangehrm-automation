import { BasePage } from './BasePage';
import { expect } from '@playwright/test';
import { selectors } from '../config/selectors';
import { environment } from '../config/environment';

export class LoginPage extends BasePage {
  async navigateToLogin() {
    await this.goto(`${environment.baseUrl}/web/index.php/auth/login`);
    await this.waitForNavigation();
  }

  async login(username: string, password: string) {
    await this.fillInput(selectors.login.usernameInput, username);
    await this.fillInput(selectors.login.passwordInput, password);
    await this.clickButton(selectors.login.submitButton);
    await this.waitForNavigation();
  }

  async verifyLoginSuccess() {
    await this.verifyURL(/.*dashboard.*/);
  }

  async verifyLoginError() {
    const isErrorVisible = await this.isElementVisible(selectors.login.errorMessage);
    expect(isErrorVisible).toBe(true);
  }

  async verifyValidationError() {
    const errorMessages = this.page.locator('.oxd-input-field-error-message');
    await errorMessages.first().waitFor({ timeout: 5000 });
  }
}
