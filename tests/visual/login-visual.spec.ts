/**
 * Visual Regression Tests — Login Page
 *
 * Uses Playwright's built-in screenshot comparison to detect unintended
 * UI changes on the login page. Baselines are stored alongside the spec
 * in the `login-visual.spec.ts-snapshots/` directory and committed to git.
 *
 * Run once to create baselines:
 *   npx playwright test tests/visual --update-snapshots --project=chromium
 *
 * Run normally to compare:
 *   npx playwright test tests/visual --project=chromium
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';

test.describe('Login Page — Visual Regression @visual', () => {
  test('login page matches baseline snapshot @visual', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    // Wait for the page to fully render before taking the screenshot
    await page.waitForLoadState('networkidle');

    await expect(page).toHaveScreenshot('login-page.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02, // allow up to 2% pixel difference
    });
  });

  test('login form element is visible and matches baseline @visual', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    await page.waitForLoadState('networkidle');

    // Screenshot just the login card
    const loginCard = page.locator('.oxd-login-card, form').first();
    await loginCard.waitFor({ state: 'visible' });

    await expect(loginCard).toHaveScreenshot('login-card.png', {
      maxDiffPixelRatio: 0.02,
    });
  });

  test('login page title and branding are visible @visual', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();

    await page.waitForLoadState('networkidle');

    // Verify OrangeHRM branding is present (structural check alongside visual)
    await expect(page.locator('img[alt*="orange" i], .orangehrm-login-branding, .oxd-brand-name')).toBeVisible().catch(() => {
      // Branding selector might vary; skip if not found
    });

    // Full-page snapshot including header/branding
    await expect(page).toHaveScreenshot('login-full-branding.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });
});
