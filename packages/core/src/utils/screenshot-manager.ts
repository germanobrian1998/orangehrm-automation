/**
 * Core framework - Screenshot Manager
 * Provides smart screenshot capture with descriptive naming.
 */

import { Page } from '@playwright/test';
import path from 'path';
import fs from 'fs';

export class ScreenshotManager {
  constructor(
    private page: Page,
    private screenshotDir: string = './test-results/screenshots'
  ) {
    this.ensureDir();
  }

  private ensureDir(): void {
    if (!fs.existsSync(this.screenshotDir)) {
      fs.mkdirSync(this.screenshotDir, { recursive: true });
    }
  }

  async take(testName: string, stepDescription: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = `${testName}_${stepDescription}_${timestamp}.png`;
    const filePath = path.join(this.screenshotDir, fileName);
    await this.page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  }

  async takeElement(testName: string, selector: string): Promise<string> {
    const element = this.page.locator(selector);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = `${testName}_element_${timestamp}.png`;
    const filePath = path.join(this.screenshotDir, fileName);
    await element.screenshot({ path: filePath });
    return filePath;
  }

  async captureOnFailure(testName: string, error: Error): Promise<string> {
    const filePath = await this.take(testName, 'FAILURE');
    console.error(`Screenshot saved: ${filePath}\nError: ${error.message}`);
    return filePath;
  }

  getScreenshotsForTest(testName: string): string[] {
    const files = fs.readdirSync(this.screenshotDir);
    return files
      .filter((file) => file.startsWith(testName))
      .map((file) => path.join(this.screenshotDir, file));
  }
}

export const createScreenshotManager = (page: Page, dir?: string): ScreenshotManager =>
  new ScreenshotManager(page, dir);
