import { BasePage } from './BasePage';
import { expect } from '@playwright/test';

export class LoginPage extends BasePage {
  private usernameInput = 'input[name="username"]';
  private passwordInput = 'input[name="password"]';
  private submitButton = 'button[type="submit"]';
  private errorAlert = '.oxd-alert';

  async navigateToLogin() {
    const loginPath = '/web/index.php/auth/login';
    const retries = parseInt(process.env.LOGIN_NAVIGATION_RETRIES || '3', 10);

    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        await this.goto(loginPath);
        await this.waitForNavigation({
          timeout: parseInt(process.env.NAVIGATION_TIMEOUT || '45000', 10),
          retries: 2,
        });
        return;
      } catch (error) {
        if (attempt === retries) {
          throw new Error(
            `Failed to navigate to login page after ${retries} attempts using path ${loginPath}: ${
              error instanceof Error ? error.message : String(error)
            }`
          );
        }
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
