import { Page } from '@playwright/test';

export class BasePage {
  protected page: Page;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    await this.page.goto(url);
  }

  async fillInput(selector: string, text: string) {
    await this.page.fill(selector, text);
  }

  async clickButton(selector: string) {
    await this.page.click(selector);
  }

  protected getNavigationTimeout(): number {
    if (process.env.NAVIGATION_TIMEOUT) {
      return parseInt(process.env.NAVIGATION_TIMEOUT, 10);
    }

    if (process.env.CI === 'true' || process.env.DOCKER === 'true') {
      return 60000;
    }

    if (process.env.ENVIRONMENT === 'staging') {
      return 45000;
    }

    return 30000;
  }

  async waitForNavigation(maxRetries: number = 2) {
    const timeout = this.getNavigationTimeout();

    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      try {
        await this.page.waitForLoadState('load', { timeout });
        return;
      } catch (loadError) {
        try {
          await this.page.waitForLoadState('domcontentloaded', {
            timeout: Math.floor(timeout / 2),
          });
          return;
        } catch {
          if (attempt === maxRetries) {
            throw loadError;
          }
          await this.page.waitForTimeout(attempt * 1000);
        }
      }
    }
  }

  async getPageTitle() {
    return this.page.title();
  }

  async verifyURL(urlPattern: RegExp) {
    await this.page.waitForURL(urlPattern);
  }

  async getElementText(selector: string) {
    return this.page.locator(selector).textContent();
  }

  async isElementVisible(selector: string): Promise<boolean> {
    try {
      return await this.page.locator(selector).isVisible();
    } catch {
      return false;
    }
  }

  async waitForElement(selector: string, timeout: number = 5000) {
    await this.page.locator(selector).waitFor({ timeout });
  }
}
