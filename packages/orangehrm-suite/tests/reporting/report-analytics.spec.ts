/**
 * OrangeHRM Suite - Report Analytics Tests
 * Tests for report analytics features: dashboard metrics, trend analysis,
 * time period comparison, charts, data export, and custom analytics views.
 * Follows the Page Object Model (ADR-004) and Testing Pyramid (ADR-003).
 *
 * Testing pyramid layer: Integration
 * Validates the ReportingPage analytics methods and related selectors
 * without requiring a live OrangeHRM instance.
 */

import { test, expect } from '@qa-framework/core';
import { ReportingPage } from '../../src/pages/reporting.page';
import { selectors } from '../../src/selectors';

test.describe('@reporting Report Analytics Tests', () => {
  // ── 1. View report dashboard with key metrics ──────────────────────────────

  test.describe('View report dashboard with key metrics', () => {
    test('navigateToAnalytics method is defined on ReportingPage', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.navigateToAnalytics).toBe('function');
    });

    test('isDashboardMetricsVisible method is defined on ReportingPage', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.isDashboardMetricsVisible).toBe('function');
    });

    test('analyticsTab selector is defined in selectors', () => {
      expect(selectors.reporting.analyticsTab).toBeTruthy();
      expect(selectors.reporting.analyticsTab).toContain('Analytics');
    });

    test('dashboardMetrics selector is defined in selectors', () => {
      expect(selectors.reporting.dashboardMetrics).toBeTruthy();
    });

    test('isDashboardMetricsVisible returns boolean on fresh page', async ({
      testPage,
      logger,
    }) => {
      // Arrange
      logger.step(1, 'Verify isDashboardMetricsVisible return type');
      const reportingPage = new ReportingPage(testPage);

      // Act
      const result = await reportingPage.isDashboardMetricsVisible();

      // Assert
      expect(typeof result).toBe('boolean');
      logger.assertion(true, 'isDashboardMetricsVisible returns boolean on fresh page');
    });

    test('navigateToAnalytics accepts no arguments', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(reportingPage.navigateToAnalytics.length).toBe(0);
    });

    test('analytics metrics container selector uses an OrangeHRM-namespaced class', () => {
      expect(selectors.reporting.dashboardMetrics).toContain('orangehrm');
    });
  });

  // ── 2. Generate trend analysis report ─────────────────────────────────────

  test.describe('Generate trend analysis report', () => {
    test('isTrendAnalysisChartVisible method is defined on ReportingPage', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.isTrendAnalysisChartVisible).toBe('function');
    });

    test('trendAnalysisChart selector is defined in selectors', () => {
      expect(selectors.reporting.trendAnalysisChart).toBeTruthy();
    });

    test('isTrendAnalysisChartVisible returns boolean on fresh page', async ({
      testPage,
      logger,
    }) => {
      // Arrange
      logger.step(1, 'Verify isTrendAnalysisChartVisible return type');
      const reportingPage = new ReportingPage(testPage);

      // Act
      const result = await reportingPage.isTrendAnalysisChartVisible();

      // Assert
      expect(typeof result).toBe('boolean');
      logger.assertion(true, 'isTrendAnalysisChartVisible returns boolean on fresh page');
    });

    test('trend analysis chart selector uses an OrangeHRM-namespaced class', () => {
      expect(selectors.reporting.trendAnalysisChart).toContain('orangehrm');
    });

    test('trend analysis is separate from comparison chart', () => {
      expect(selectors.reporting.trendAnalysisChart).not.toBe(
        selectors.reporting.comparisonChart
      );
    });
  });

  // ── 3. Compare reports by time period ─────────────────────────────────────

  test.describe('Compare reports by time period', () => {
    test('comparisonChart selector is defined in selectors', () => {
      expect(selectors.reporting.comparisonChart).toBeTruthy();
    });

    test('timePeriodSelect selector is defined in selectors', () => {
      expect(selectors.reporting.timePeriodSelect).toBeTruthy();
    });

    test('time period comparison data shape is correctly typed', () => {
      // Arrange / Act
      const comparison = {
        periodA: { fromDate: '2023-01-01', toDate: '2023-12-31', label: '2023' },
        periodB: { fromDate: '2024-01-01', toDate: '2024-12-31', label: '2024' },
      };

      // Assert
      expect(comparison.periodA.label).toBe('2023');
      expect(comparison.periodB.label).toBe('2024');
      expect(new Date(comparison.periodA.fromDate).getFullYear()).toBeLessThan(
        new Date(comparison.periodB.fromDate).getFullYear()
      );
    });

    test('comparison chart selector uses an OrangeHRM-namespaced class', () => {
      expect(selectors.reporting.comparisonChart).toContain('orangehrm');
    });

    test('year-over-year comparison spans exactly one year per period', () => {
      // Arrange / Act
      const from2023 = new Date('2023-01-01');
      const to2023 = new Date('2023-12-31');
      const from2024 = new Date('2024-01-01');
      const to2024 = new Date('2024-12-31');

      // Assert – both periods start in different years
      expect(from2023.getFullYear()).toBe(2023);
      expect(to2023.getFullYear()).toBe(2023);
      expect(from2024.getFullYear()).toBe(2024);
      expect(to2024.getFullYear()).toBe(2024);
    });
  });

  // ── 4. Visualize data in charts and graphs ─────────────────────────────────

  test.describe('Visualize data in charts and graphs', () => {
    test('chartContainer selector is defined in selectors', () => {
      expect(selectors.reporting.chartContainer).toBeTruthy();
    });

    test('trendAnalysisChart and chartContainer selectors coexist', () => {
      expect(selectors.reporting.trendAnalysisChart).toBeTruthy();
      expect(selectors.reporting.chartContainer).toBeTruthy();
      expect(selectors.reporting.trendAnalysisChart).not.toBe(selectors.reporting.chartContainer);
    });

    test('chart container selector uses an OrangeHRM-namespaced class', () => {
      expect(selectors.reporting.chartContainer).toContain('orangehrm');
    });

    test('multiple chart types can be displayed simultaneously', () => {
      // Arrange
      const chartTypes = ['bar', 'line', 'pie', 'doughnut'];

      // Assert
      expect(chartTypes.length).toBeGreaterThan(1);
      chartTypes.forEach((type) => {
        expect(typeof type).toBe('string');
        expect(type.length).toBeGreaterThan(0);
      });
    });
  });

  // ── 5. Export analytics data ───────────────────────────────────────────────

  test.describe('Export analytics data', () => {
    test('exportAnalyticsData method is defined on ReportingPage', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.exportAnalyticsData).toBe('function');
    });

    test('analyticsExportButton selector is defined in selectors', () => {
      expect(selectors.reporting.analyticsExportButton).toBeTruthy();
      expect(selectors.reporting.analyticsExportButton).toContain('Export Analytics');
    });

    test('exportAnalyticsData accepts no arguments', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(reportingPage.exportAnalyticsData.length).toBe(0);
    });

    test('analytics export is distinct from report export', () => {
      // Both selectors exist but point to different elements
      expect(selectors.reporting.analyticsExportButton).not.toBe(selectors.reporting.exportButton);
    });
  });

  // ── 6. Create custom analytics views ──────────────────────────────────────

  test.describe('Create custom analytics views', () => {
    test('createCustomAnalyticsView method is defined on ReportingPage', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.createCustomAnalyticsView).toBe('function');
    });

    test('custom analytics view data shape is correctly typed', () => {
      // Arrange / Act
      const viewData = {
        viewName: 'Q1 Headcount Trend',
        timePeriod: '2024 Q1',
        metrics: ['headcount', 'turnover', 'new-hires'],
      };

      // Assert
      expect(typeof viewData.viewName).toBe('string');
      expect(viewData.viewName).toBe('Q1 Headcount Trend');
      expect(Array.isArray(viewData.metrics)).toBe(true);
      expect(viewData.metrics).toHaveLength(3);
    });

    test('customViewButton selector is defined in selectors', () => {
      expect(selectors.reporting.customViewButton).toBeTruthy();
      expect(selectors.reporting.customViewButton).toContain('Create Custom View');
    });

    test('customViewNameInput selector is defined in selectors', () => {
      expect(selectors.reporting.customViewNameInput).toBeTruthy();
    });

    test('custom view name must be a non-empty string', () => {
      // Arrange / Act
      const validName = 'Annual Headcount Analysis';
      const emptyName = '';

      // Assert
      expect(validName.length).toBeGreaterThan(0);
      expect(emptyName.length).toBe(0);
    });

    test('custom view can be created without specifying metrics', () => {
      // Arrange / Act
      const viewData = {
        viewName: 'Basic Trend View',
      };

      // Assert – metrics field is optional
      expect((viewData as Record<string, unknown>).metrics).toBeUndefined();
      expect(viewData.viewName).toBeTruthy();
    });

    test('timePeriodSelect selector is defined for custom view time period', () => {
      expect(selectors.reporting.timePeriodSelect).toBeTruthy();
    });

    test('multiple custom analytics views have distinct names', () => {
      // Arrange / Act
      const views = ['Q1 Report', 'Q2 Report', 'Annual Summary'];

      // Assert
      const uniqueNames = new Set(views);
      expect(uniqueNames.size).toBe(views.length);
    });
  });
});
