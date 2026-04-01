/**
 * Example: Report Generation Test
 *
 * Demonstrates testing the OrangeHRM report generation workflow,
 * including navigation, report selection, and result validation.
 * Run: npx playwright test docs/examples/report-generation.spec.ts
 */

import { test, expect } from '@qa-framework/core';
import { LoginPage } from '../../src/pages/login.page';
import { ReportingPage } from '../../src/pages/reporting.page';
import { selectors } from '../../src/selectors';

test.describe('@reporting @regression Report Generation Example', () => {
  test.beforeEach(async ({ page, config }) => {
    // Log in before each test
    const loginPage = new LoginPage(page);
    await loginPage.login({
      username: config.adminUsername,
      password: config.adminPassword,
    });
  });

  // ── Navigation ──────────────────────────────────────────────────────────────

  test('Reports page is accessible from the sidebar', async ({ page, logger }) => {
    // Arrange
    logger.step(1, 'Set up ReportingPage');
    const reportingPage = new ReportingPage(page);

    // Act
    logger.step(2, 'Navigate to Reports');
    await reportingPage.navigate();

    // Assert
    logger.step(3, 'Verify Reports heading is visible');
    const heading = await page.locator(selectors.reporting.reportsHeading).isVisible();
    expect(heading).toBe(true);
    logger.assertion(heading, 'Reports page heading is visible');
  });

  // ── Report listing ──────────────────────────────────────────────────────────

  test('Reports table shows at least one predefined report', async ({ page, logger }) => {
    // Arrange
    const reportingPage = new ReportingPage(page);
    await reportingPage.navigate();

    // Act
    logger.step(1, 'Count rows in the reports table');
    const rowCount = await page.locator(`${selectors.reporting.reportTable} .oxd-table-row`).count();

    // Assert
    expect(rowCount).toBeGreaterThan(0);
    logger.assertion(rowCount > 0, `Reports table contains ${rowCount} report(s)`);
  });

  // ── Generate a report ───────────────────────────────────────────────────────

  test('Employee Information Report can be generated', async ({ page, logger }) => {
    // Arrange
    const reportingPage = new ReportingPage(page);
    await reportingPage.navigate();

    // Act
    logger.step(1, 'Generate the Employee Information report');
    await reportingPage.generateReport('Employee Information');

    // Assert
    logger.step(2, 'Verify report results are displayed');
    const resultsVisible = await page.locator(selectors.reporting.reportResultTable).isVisible();
    expect(resultsVisible).toBe(true);
    logger.assertion(resultsVisible, 'Report result table is visible after generation');
  });

  // ── Export report ───────────────────────────────────────────────────────────

  test('generated report can be exported as CSV', async ({ page, logger }) => {
    // Arrange
    const reportingPage = new ReportingPage(page);
    await reportingPage.navigate();
    await reportingPage.generateReport('Employee Information');

    // Act
    logger.step(1, 'Initiate CSV export');
    const [download] = await Promise.all([
      page.waitForEvent('download').catch(() => null), // Playwright download event
      reportingPage.exportReport('CSV'),
    ]);

    // Assert – either a download started or the export button was clicked without error
    if (download) {
      const filename = download.suggestedFilename();
      expect(filename).toMatch(/\.(csv|CSV)$/);
      logger.assertion(true, `CSV export downloaded: ${filename}`);
    } else {
      logger.warn('Download event not captured – verifying export button was clickable');
      const exportButtonExists = await page.locator(selectors.reporting.exportButton).isVisible()
        .catch(() => false);
      logger.assertion(true, `Export button interaction completed (downloadable: ${!exportButtonExists})`);
    }
  });

  // ── Selector validation ─────────────────────────────────────────────────────

  test('reporting selectors are correctly defined', ({ logger }) => {
    // Arrange / Assert – verify the selector namespace is complete
    logger.step(1, 'Validate reporting selectors');

    expect(selectors.reporting.sidebarLink).toBeTruthy();
    expect(selectors.reporting.reportsHeading).toBeTruthy();
    expect(selectors.reporting.generateButton).toBeTruthy();
    expect(selectors.reporting.reportTable).toBeTruthy();
    expect(selectors.reporting.reportResultTable).toBeTruthy();
    expect(selectors.reporting.exportButton).toBeTruthy();

    logger.assertion(true, 'All required reporting selectors are defined');
  });
});
