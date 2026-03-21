/**
 * Smart screenshot management
 * Helps with debugging in CI/CD without creating huge artifacts
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

  /**
   * Take screenshot with descriptive name
   */
  async take(testName: string, stepDescription: string): Promise<string> {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = `${testName}_${stepDescription}_${timestamp}.png`;
    const filePath = path.join(this.screenshotDir, fileName);

    await this.page.screenshot({ path: filePath, fullPage: true });
    return filePath;
  }

  /**
   * Take screenshot of specific element
   */
  async takeElement(testName: string, selector: string): Promise<string> {
    const element = this.page.locator(selector);
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
    const fileName = `${testName}_element_${timestamp}.png`;
    const filePath = path.join(this.screenshotDir, fileName);

    await element.screenshot({ path: filePath });
    return filePath;
  }

  /**
   * Take screenshot only on failure (auto-called)
   */
  async captureOnFailure(testName: string, error: Error): Promise<string> {
    const filePath = await this.take(testName, 'FAILURE');
    console.error(`Screenshot saved: ${filePath}\nError: ${error.message}`);
    return filePath;
  }

  /**
   * Compare screenshots (useful for visual regression)
   * Note: This is a simple implementation, use Percy or similar for production
   */
  async compare(baseline: string, current: string): Promise<boolean> {
    // This is a placeholder for visual regression testing
    // In production, you'd use tools like:
    // - Percy.io
    // - BackstopJS
    // - Pixelmatch
    console.warn('Visual comparison not implemented. Use Percy or similar tool.');
    return true;
  }

  /**
   * Get all screenshots for a test
   */
  getScreenshotsForTest(testName: string): string[] {
    const files = fs.readdirSync(this.screenshotDir);
    return files
      .filter((file) => file.startsWith(testName))
      .map((file) => path.join(this.screenshotDir, file));
  }
}

export const createScreenshotManager = (page: Page, dir?: string): ScreenshotManager => {
  return new ScreenshotManager(page, dir);
};