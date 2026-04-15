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

  async waitForNavigation() {
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        await this.page.waitForLoadState('domcontentloaded', { timeout: 15000 });
        return;
      } catch (error) {
        if (attempt === 3) {
          throw error;
        }
        await this.page.waitForTimeout(1000 * attempt);
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
