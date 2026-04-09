/**
 * Visual Regression Tests — Dashboard Page
 *
 * Captures the post-login dashboard to detect layout regressions.
 * Baselines are stored in `dashboard-visual.spec.ts-snapshots/` and committed to git.
 *
 * Run once to create baselines:
 *   npx playwright test tests/visual --update-snapshots --project=chromium
 *
 * Run normally to compare:
 *   npx playwright test tests/visual --project=chromium
 */

import { test, expect } from '@playwright/test';
import { LoginPage } from '../../src/pages/LoginPage';

test.describe('Dashboard Page — Visual Regression @visual', () => {
  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.navigateToLogin();
    await loginPage.login('Admin', 'admin123');
    await loginPage.verifyLoginSuccess();
    await page.waitForLoadState('networkidle');
  });

  test('dashboard page matches baseline snapshot @visual', async ({ page }) => {
    await expect(page).toHaveScreenshot('dashboard-page.png', {
      fullPage: true,
      maxDiffPixelRatio: 0.02,
    });
  });

  test('navigation sidebar matches baseline @visual', async ({ page }) => {
    const sidebar = page.locator('.oxd-sidepanel, nav[class*="side"], aside').first();
    await sidebar.waitFor({ state: 'visible' });

    await expect(sidebar).toHaveScreenshot('dashboard-sidebar.png', {
      maxDiffPixelRatio: 0.02,
    });
  });
});
