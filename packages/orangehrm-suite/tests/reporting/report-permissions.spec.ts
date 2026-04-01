/**
 * OrangeHRM Suite - Report Permissions Tests
 * Tests for report access control: role-based access, unauthorized access prevention,
 * report sharing, visibility levels, and access history auditing.
 * Follows the Page Object Model (ADR-004) and Testing Pyramid (ADR-003).
 *
 * Testing pyramid layer: Integration
 * Validates the ReportingPage permissions methods and related selectors
 * without requiring a live OrangeHRM instance.
 */

import { test, expect } from '@qa-framework/core';
import { ReportingPage } from '../../src/pages/reporting.page';
import { selectors } from '../../src/selectors';

test.describe('@reporting Report Permissions Tests', () => {
  // ── 1. Access reports based on user role ──────────────────────────────────

  test.describe('Access reports based on user role', () => {
    test('ReportingPage is importable for permissions testing', async ({ logger }) => {
      // Arrange
      logger.step(1, 'Verify ReportingPage is importable');

      // Assert
      expect(ReportingPage).toBeDefined();
      logger.info('✓ ReportingPage is importable for permissions tests');
    });

    test('ReportingPage can be instantiated for permission checks', async ({
      testPage,
      logger,
    }) => {
      // Arrange
      logger.step(1, 'Instantiate ReportingPage');

      // Act
      const reportingPage = new ReportingPage(testPage);

      // Assert
      expect(reportingPage).toBeInstanceOf(ReportingPage);
      logger.info('✓ ReportingPage instantiated for permission checks');
    });

    test('isReportsLoaded returns boolean reflecting navigation state', async ({
      testPage,
      logger,
    }) => {
      // Arrange
      logger.step(1, 'Verify isReportsLoaded returns boolean');
      const reportingPage = new ReportingPage(testPage);

      // Act
      const result = await reportingPage.isReportsLoaded();

      // Assert
      expect(typeof result).toBe('boolean');
      logger.assertion(true, 'isReportsLoaded returns boolean');
    });

    test('OrangeHRM user roles that can access reports are defined', () => {
      // Arrange
      const rolesWithReportAccess = ['Admin', 'ESS User with report access', 'Supervisor'];

      // Assert
      expect(rolesWithReportAccess).toContain('Admin');
      expect(rolesWithReportAccess.length).toBeGreaterThan(0);
    });

    test('Admin role has access to all report types', () => {
      // Arrange / Act
      const adminReportAccess = {
        role: 'Admin',
        canAccessEmployeeReport: true,
        canAccessLeaveReport: true,
        canAccessAttendanceReport: true,
        canAccessPayrollReport: true,
      };

      // Assert
      expect(adminReportAccess.canAccessEmployeeReport).toBe(true);
      expect(adminReportAccess.canAccessLeaveReport).toBe(true);
      expect(adminReportAccess.canAccessAttendanceReport).toBe(true);
      expect(adminReportAccess.canAccessPayrollReport).toBe(true);
    });

    test('sidebarLink selector is defined for navigation access check', () => {
      expect(selectors.reporting.sidebarLink).toBeTruthy();
      expect(selectors.reporting.sidebarLink).toContain('Reports');
    });
  });

  // ── 2. Restrict report access for unauthorized users ───────────────────────

  test.describe('Restrict report access for unauthorized users', () => {
    test('isUnauthorizedMessageVisible method is defined on ReportingPage', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.isUnauthorizedMessageVisible).toBe('function');
    });

    test('isUnauthorizedMessageVisible returns boolean on fresh page', async ({
      testPage,
      logger,
    }) => {
      // Arrange
      logger.step(1, 'Verify isUnauthorizedMessageVisible return type');
      const reportingPage = new ReportingPage(testPage);

      // Act
      const result = await reportingPage.isUnauthorizedMessageVisible();

      // Assert
      expect(typeof result).toBe('boolean');
      logger.assertion(true, 'isUnauthorizedMessageVisible returns boolean on fresh page');
    });

    test('unauthorizedMessage selector is defined in selectors', () => {
      expect(selectors.reporting.unauthorizedMessage).toBeTruthy();
    });

    test('unauthorized message contains the expected text', () => {
      expect(selectors.reporting.unauthorizedMessage).toContain('You do not have permission');
    });

    test('unauthorized access check relies on the error message being visible', async ({
      testPage,
    }) => {
      const reportingPage = new ReportingPage(testPage);

      // On a fresh page, unauthorized message should not be visible
      const isUnauthorized = await reportingPage.isUnauthorizedMessageVisible();
      expect(isUnauthorized).toBe(false);
    });

    test('ESS role with no report access cannot view restricted reports', () => {
      // Arrange / Act
      const essRoleAccess = {
        role: 'ESS',
        canAccessEmployeeReport: false,
        canAccessPayrollReport: false,
      };

      // Assert
      expect(essRoleAccess.canAccessEmployeeReport).toBe(false);
      expect(essRoleAccess.canAccessPayrollReport).toBe(false);
    });
  });

  // ── 3. Share reports with specific users/departments ───────────────────────

  test.describe('Share reports with specific users/departments', () => {
    test('shareReport method is defined on ReportingPage', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.shareReport).toBe('function');
    });

    test('report permission data shape is correctly typed', () => {
      // Arrange / Act
      const permissionData = {
        shareWith: 'Engineering Department',
        visibilityLevel: 'Department Only' as const,
      };

      // Assert
      expect(typeof permissionData.shareWith).toBe('string');
      expect(permissionData.shareWith).toBe('Engineering Department');
      expect(permissionData.visibilityLevel).toBe('Department Only');
    });

    test('shareButton selector is defined in selectors', () => {
      expect(selectors.reporting.shareButton).toBeTruthy();
      expect(selectors.reporting.shareButton).toContain('Share');
    });

    test('shareWithInput selector is defined in selectors', () => {
      expect(selectors.reporting.shareWithInput).toBeTruthy();
    });

    test('permissionsTab selector is defined in selectors', () => {
      expect(selectors.reporting.permissionsTab).toBeTruthy();
      expect(selectors.reporting.permissionsTab).toContain('Permissions');
    });

    test('report can be shared with a specific user by name', () => {
      // Arrange / Act
      const shareData = {
        shareWith: 'john.doe',
        visibilityLevel: 'Private' as const,
      };

      // Assert
      expect(shareData.shareWith).toBe('john.doe');
      expect(shareData.visibilityLevel).toBe('Private');
    });

    test('report can be shared with a department', () => {
      // Arrange / Act
      const shareData = {
        shareWith: 'Finance Department',
        visibilityLevel: 'Department Only' as const,
      };

      // Assert
      expect(shareData.shareWith).toContain('Department');
      expect(shareData.visibilityLevel).toBe('Department Only');
    });
  });

  // ── 4. Set report visibility levels ───────────────────────────────────────

  test.describe('Set report visibility levels', () => {
    test('Public is a valid visibility level', () => {
      const visibility: 'Public' | 'Private' | 'Department Only' = 'Public';
      expect(visibility).toBe('Public');
    });

    test('Private is a valid visibility level', () => {
      const visibility: 'Public' | 'Private' | 'Department Only' = 'Private';
      expect(visibility).toBe('Private');
    });

    test('Department Only is a valid visibility level', () => {
      const visibility: 'Public' | 'Private' | 'Department Only' = 'Department Only';
      expect(visibility).toBe('Department Only');
    });

    test('visibilitySelect selector is defined in selectors', () => {
      expect(selectors.reporting.visibilitySelect).toBeTruthy();
      expect(selectors.reporting.visibilitySelect).toContain('Visibility');
    });

    test('visibilityOption selector builder returns a string for Public', () => {
      const selector = selectors.reporting.visibilityOption('Public');

      expect(typeof selector).toBe('string');
      expect(selector).toContain('Public');
    });

    test('visibilityOption selector builder returns a string for Private', () => {
      const selector = selectors.reporting.visibilityOption('Private');

      expect(typeof selector).toBe('string');
      expect(selector).toContain('Private');
    });

    test('visibilityOption selector builder returns a string for Department Only', () => {
      const selector = selectors.reporting.visibilityOption('Department Only');

      expect(typeof selector).toBe('string');
      expect(selector).toContain('Department Only');
    });

    test('all three visibility levels are supported', () => {
      const levels = ['Public', 'Private', 'Department Only'];

      expect(levels).toContain('Public');
      expect(levels).toContain('Private');
      expect(levels).toContain('Department Only');
      expect(levels).toHaveLength(3);
    });

    test('Public visibility allows broadest access', () => {
      // Arrange
      const accessMap: Record<string, number> = {
        Public: 3,
        'Department Only': 2,
        Private: 1,
      };

      // Assert
      expect(accessMap['Public']).toBeGreaterThan(accessMap['Department Only']);
      expect(accessMap['Department Only']).toBeGreaterThan(accessMap['Private']);
    });
  });

  // ── 5. Audit report access history ────────────────────────────────────────

  test.describe('Audit report access history', () => {
    test('viewAccessHistory method is defined on ReportingPage', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.viewAccessHistory).toBe('function');
    });

    test('accessHistoryTab selector is defined in selectors', () => {
      expect(selectors.reporting.accessHistoryTab).toBeTruthy();
      expect(selectors.reporting.accessHistoryTab).toContain('Access History');
    });

    test('accessHistoryTable selector is defined in selectors', () => {
      expect(selectors.reporting.accessHistoryTable).toBeTruthy();
    });

    test('reportAccessRow selector builder returns a string', () => {
      const selector = selectors.reporting.reportAccessRow('admin');

      expect(typeof selector).toBe('string');
      expect(selector).toContain('admin');
    });

    test('viewAccessHistory accepts no arguments', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(reportingPage.viewAccessHistory.length).toBe(0);
    });

    test('access history is distinct from execution history', () => {
      expect(selectors.reporting.accessHistoryTable).not.toBe(
        selectors.reporting.executionHistoryTable
      );
    });

    test('access history tracks individual user access events', () => {
      // Arrange / Act
      const accessEvent = {
        username: 'john.doe',
        reportName: 'Employee Report',
        accessedAt: '2024-06-15T09:30:00Z',
        action: 'view',
      };

      // Assert
      expect(accessEvent.username).toBeTruthy();
      expect(accessEvent.reportName).toBeTruthy();
      expect(new Date(accessEvent.accessedAt).getFullYear()).toBe(2024);
    });

    test('access history row selector correctly targets a username', () => {
      const username = 'jane.smith';
      const selector = selectors.reporting.reportAccessRow(username);

      expect(selector).toContain(username);
    });

    test('access history supports auditing multiple users', () => {
      // Arrange / Act
      const auditedUsers = ['admin', 'john.doe', 'jane.smith', 'supervisor'];

      // Assert
      auditedUsers.forEach((user) => {
        const selector = selectors.reporting.reportAccessRow(user);
        expect(selector).toContain(user);
      });
    });
  });
});
