import { Page, type LoadState } from '@playwright/test';

export class BasePage {
  protected page: Page;
  private readonly navigationTimeout = process.env.CI ? 60000 : 30000;
  private readonly maxNavigationRetries = process.env.CI ? 3 : 2;
  private readonly retryDelayMs = process.env.CI ? 2000 : 1000;

  constructor(page: Page) {
    this.page = page;
  }

  async goto(url: string) {
    let lastError: unknown;

    for (let attempt = 1; attempt <= this.maxNavigationRetries; attempt++) {
      try {
        await this.page.goto(url, {
          waitUntil: 'domcontentloaded',
          timeout: this.navigationTimeout,
        });
        return;
      } catch (error) {
        lastError = error;
        if (attempt === this.maxNavigationRetries) {
          throw error;
        }
        await this.page.waitForTimeout(this.retryDelayMs * attempt);
      }
    }

    throw lastError;
  }

  async fillInput(selector: string, text: string) {
    await this.page.fill(selector, text);
  }

  async clickButton(selector: string) {
    await this.page.click(selector);
  }

  async waitForNavigation(timeout: number = this.navigationTimeout) {
    const states: LoadState[] = ['domcontentloaded', 'load', 'networkidle'];
    const perStateTimeout = Math.max(5000, Math.floor(timeout / states.length));
    let lastError: unknown;

    for (const state of states) {
      try {
        await this.page.waitForLoadState(state, { timeout: perStateTimeout });
        return;
      } catch (error) {
        lastError = error;
      }
    }

    throw lastError;
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
