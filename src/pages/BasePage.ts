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

  async waitForNavigation(options?: { timeout?: number; retries?: number }) {
    const timeout = options?.timeout ?? 45000;
    const retries = options?.retries ?? 2;
    const loadStates: Array<'networkidle' | 'load' | 'domcontentloaded'> = [
      'networkidle',
      'load',
      'domcontentloaded',
    ];

    let lastError: unknown;

    for (let attempt = 1; attempt <= retries; attempt++) {
      for (const loadState of loadStates) {
        try {
          await this.page.waitForLoadState(loadState, { timeout });
          return;
        } catch (error) {
          lastError = error;
        }
      }
    }

    const message = `waitForNavigation failed after ${retries} retries using load states: ${loadStates.join(
      ', '
    )}`;
    if (lastError instanceof Error) {
      throw new Error(`${message}. Last error: ${lastError.message}`);
    }
    throw new Error(`${message}. Last error: ${String(lastError)}`);
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
