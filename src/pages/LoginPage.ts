import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class LoginPage extends BasePage {
  private loginPath = '/web/index.php/auth/login';
  private usernameInput = 'input[name="username"]';
  private passwordInput = 'input[name="password"]';
  private submitButton = 'button[type="submit"]';
  private errorAlert = '.oxd-alert';

  async navigateToLogin(maxRetries: number = 3) {
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.goto(this.loginPath);
        await this.waitForNavigation();
        await this.waitForElement(this.usernameInput, this.getNavigationTimeout());
        return;
      } catch (error) {
        if (attempt === maxRetries) {
          throw error;
        }
        await this.page.waitForTimeout(attempt * 1000);
      }
    }
  }

  async login(username: string, password: string) {
    await this.fillInput(this.usernameInput, username);
    await this.fillInput(this.passwordInput, password);
    await this.clickButton(this.submitButton);
    await this.waitForNavigation();
  }

  async verifyLoginSuccess() {
    await this.verifyURL(/.*dashboard.*/);
  }

  async verifyLoginError() {
    const isErrorVisible = await this.isElementVisible(this.errorAlert);
    expect(isErrorVisible).toBe(true);
  }

  async verifyValidationError() {
    const errorMessages = this.page.locator('.oxd-input-field-error-message');
    await errorMessages.first().waitFor({ timeout: 5000 });
  }
}
