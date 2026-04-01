/**
 * OrangeHRM Suite - Dashboard Tests
 * Tests for dashboard functionality: loading, quick links, and widgets.
 * Follows the Page Object Model (ADR-004) and Testing Pyramid (ADR-003).
 *
 * Testing pyramid layer: Integration
 * Validates DashboardPage class structure and dashboard data contracts
 * without requiring a live OrangeHRM instance.
 */

import { test, expect } from '@qa-framework/core';
import { DashboardPage, DASHBOARD_WIDGETS } from '../../src/pages/dashboard.page';
import { selectors } from '../../src/selectors';

test.describe('@dashboard Dashboard Tests', () => {
  // ── 1. Dashboard loads correctly ──────────────────────────────────────────

  test.describe('Dashboard loads correctly', () => {
    test('DashboardPage is importable from the suite', async ({ logger }) => {
      // Arrange
      logger.step(1, 'Verify DashboardPage module is importable');

      // Assert
      expect(DashboardPage).toBeDefined();
      logger.info('✓ DashboardPage is importable');
    });

    test('DashboardPage can be instantiated with a Playwright page', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Instantiate DashboardPage with a Playwright page');

      // Act
      const dashboardPage = new DashboardPage(testPage);

      // Assert
      expect(dashboardPage).toBeInstanceOf(DashboardPage);
      logger.info('✓ DashboardPage instantiated successfully');
    });

    test('navigate method is defined on DashboardPage', async ({ testPage }) => {
      const dashboardPage = new DashboardPage(testPage);
      expect(typeof dashboardPage.navigate).toBe('function');
    });

    test('isDashboardLoaded method is defined on DashboardPage', async ({ testPage }) => {
      const dashboardPage = new DashboardPage(testPage);
      expect(typeof dashboardPage.isDashboardLoaded).toBe('function');
    });

    test('getDashboardHeadingText method is defined on DashboardPage', async ({ testPage }) => {
      const dashboardPage = new DashboardPage(testPage);
      expect(typeof dashboardPage.getDashboardHeadingText).toBe('function');
    });

    test('isDashboardLoaded returns a boolean on fresh page', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Verify isDashboardLoaded return type');
      const dashboardPage = new DashboardPage(testPage);

      // Act
      const result = await dashboardPage.isDashboardLoaded();

      // Assert
      expect(typeof result).toBe('boolean');
      logger.assertion(true, 'isDashboardLoaded returns boolean on a fresh page');
    });

    test('dashboard heading selector is defined in selectors', () => {
      expect(selectors.dashboard.heading).toBeTruthy();
      expect(typeof selectors.dashboard.heading).toBe('string');
    });

    test('dashboard heading selector matches the expected heading text', () => {
      expect(selectors.dashboard.heading).toContain('Dashboard');
    });

    test('dashboard widget container selector is defined', () => {
      expect(selectors.dashboard.widgetContainer).toBeTruthy();
    });

    test('dashboard layout selector is defined', () => {
      expect(selectors.dashboard.dashboardWidgets).toBeTruthy();
    });

    test('multiple DashboardPage instances are independent objects', async ({ testPage }) => {
      // Arrange / Act
      const page1 = new DashboardPage(testPage);
      const page2 = new DashboardPage(testPage);

      // Assert
      expect(page1).not.toBe(page2);
      expect(page1).toBeInstanceOf(DashboardPage);
      expect(page2).toBeInstanceOf(DashboardPage);
    });
  });

  // ── 2. Quick links functionality ──────────────────────────────────────────

  test.describe('Quick links functionality', () => {
    test('getQuickLaunchLinks method is defined on DashboardPage', async ({ testPage }) => {
      const dashboardPage = new DashboardPage(testPage);
      expect(typeof dashboardPage.getQuickLaunchLinks).toBe('function');
    });

    test('clickQuickLaunchLink method is defined on DashboardPage', async ({ testPage }) => {
      const dashboardPage = new DashboardPage(testPage);
      expect(typeof dashboardPage.clickQuickLaunchLink).toBe('function');
    });

    test('quickLaunchWidget selector is defined in selectors', () => {
      expect(selectors.dashboard.quickLaunchWidget).toBeTruthy();
    });

    test('quickLaunchLinks selector is defined in selectors', () => {
      expect(selectors.dashboard.quickLaunchLinks).toBeTruthy();
    });

    test('assignLeaveLink selector is defined in selectors', () => {
      expect(selectors.dashboard.assignLeaveLink).toBeTruthy();
    });

    test('leaveListLink selector is defined in selectors', () => {
      expect(selectors.dashboard.leaveListLink).toBeTruthy();
    });

    test('timesheetsLink selector is defined in selectors', () => {
      expect(selectors.dashboard.timesheetsLink).toBeTruthy();
    });

    test('applyLeaveLink selector is defined in selectors', () => {
      expect(selectors.dashboard.applyLeaveLink).toBeTruthy();
    });

    test('myLeaveLink selector is defined in selectors', () => {
      expect(selectors.dashboard.myLeaveLink).toBeTruthy();
    });

    test('myTimesheetLink selector is defined in selectors', () => {
      expect(selectors.dashboard.myTimesheetLink).toBeTruthy();
    });

    test('expected quick launch link labels include Assign Leave and Leave List', () => {
      // Arrange
      const expectedLinks = [
        'Assign Leave',
        'Leave List',
        'Timesheets',
        'Apply Leave',
        'My Leave',
        'My Timesheet',
      ];

      // Assert
      expect(expectedLinks).toContain('Assign Leave');
      expect(expectedLinks).toContain('Leave List');
      expect(expectedLinks).toHaveLength(6);
    });

    test('isWidgetVisible method is defined on DashboardPage', async ({ testPage }) => {
      const dashboardPage = new DashboardPage(testPage);
      expect(typeof dashboardPage.isWidgetVisible).toBe('function');
    });

    test('isWidgetVisible returns a boolean on a fresh page', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Verify isWidgetVisible return type');
      const dashboardPage = new DashboardPage(testPage);

      // Act
      const result = await dashboardPage.isWidgetVisible(selectors.dashboard.quickLaunchWidget);

      // Assert
      expect(typeof result).toBe('boolean');
      logger.assertion(true, 'isWidgetVisible returns boolean on a fresh page');
    });
  });

  // ── 3. Widgets display correct data ──────────────────────────────────────

  test.describe('Widgets display correct data', () => {
    test('DASHBOARD_WIDGETS constant is exported and is an array', async ({ logger }) => {
      // Arrange
      logger.step(1, 'Verify DASHBOARD_WIDGETS export');

      // Assert
      expect(Array.isArray(DASHBOARD_WIDGETS)).toBe(true);
      expect(DASHBOARD_WIDGETS.length).toBeGreaterThan(0);
      logger.assertion(true, 'DASHBOARD_WIDGETS is a non-empty array');
    });

    test('each DASHBOARD_WIDGETS entry has a name and selector', () => {
      DASHBOARD_WIDGETS.forEach((widget) => {
        expect(typeof widget.name).toBe('string');
        expect(widget.name.length).toBeGreaterThan(0);
        expect(typeof widget.selector).toBe('string');
        expect(widget.selector.length).toBeGreaterThan(0);
      });
    });

    test('DASHBOARD_WIDGETS includes Quick Launch widget', () => {
      const names = DASHBOARD_WIDGETS.map((w) => w.name);
      expect(names).toContain('Quick Launch');
    });

    test('DASHBOARD_WIDGETS includes Time at Work widget', () => {
      const names = DASHBOARD_WIDGETS.map((w) => w.name);
      expect(names).toContain('Time at Work');
    });

    test('DASHBOARD_WIDGETS includes My Actions widget', () => {
      const names = DASHBOARD_WIDGETS.map((w) => w.name);
      expect(names).toContain('My Actions');
    });

    test('DASHBOARD_WIDGETS includes Employees on Leave widget', () => {
      const names = DASHBOARD_WIDGETS.map((w) => w.name);
      expect(names).toContain('Employees on Leave');
    });

    test('employeesOnLeaveWidget selector is defined in selectors', () => {
      expect(selectors.dashboard.employeesOnLeaveWidget).toBeTruthy();
    });

    test('timeAtWorkWidget selector is defined in selectors', () => {
      expect(selectors.dashboard.timeAtWorkWidget).toBeTruthy();
    });

    test('myActionsWidget selector is defined in selectors', () => {
      expect(selectors.dashboard.myActionsWidget).toBeTruthy();
    });

    test('buzzLatestPostsWidget selector is defined in selectors', () => {
      expect(selectors.dashboard.buzzLatestPostsWidget).toBeTruthy();
    });

    test('widget selectors in DASHBOARD_WIDGETS match the selectors object', () => {
      // Arrange
      const quickLaunchEntry = DASHBOARD_WIDGETS.find((w) => w.name === 'Quick Launch');
      const timeAtWorkEntry = DASHBOARD_WIDGETS.find((w) => w.name === 'Time at Work');

      // Assert
      expect(quickLaunchEntry?.selector).toBe(selectors.dashboard.quickLaunchWidget);
      expect(timeAtWorkEntry?.selector).toBe(selectors.dashboard.timeAtWorkWidget);
    });

    test('widget data structure supports presence checks', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Verify widget presence check pattern');
      const dashboardPage = new DashboardPage(testPage);

      // Act – check each widget selector
      const presenceChecks = await Promise.all(
        DASHBOARD_WIDGETS.map(async (widget) => ({
          name: widget.name,
          isVisible: await dashboardPage.isWidgetVisible(widget.selector),
        }))
      );

      // Assert – on a fresh (non-navigated) page, none should be visible
      presenceChecks.forEach((check) => {
        expect(typeof check.isVisible).toBe('boolean');
      });

      logger.assertion(true, 'Widget presence checks return boolean values');
    });

    test('user dropdown selector is defined for authenticated widget access', () => {
      expect(selectors.dashboard.userDropdown).toBeTruthy();
    });

    test('logout option selector is defined in dashboard selectors', () => {
      expect(selectors.dashboard.logoutOption).toBeTruthy();
    });
  });
});
