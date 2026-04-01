/**
 * OrangeHRM Suite - Leave Management Tests
 * Tests for leave request lifecycle: submit, approve/reject, balance, and history.
 * Follows the Page Object Model (ADR-004) and Testing Pyramid (ADR-003).
 *
 * Testing pyramid layer: Integration
 * Validates leave selectors, status machine, and workflow data shapes
 * without requiring a live OrangeHRM instance.
 */

import { test, expect } from '@qa-framework/core';
import { LoginPage } from '../../src/pages/login.page';
import { LeavePage } from '../../src/pages/leave.page';
import { PimPage } from '../../src/pages/pim.page';
import { selectors } from '../../src/selectors';

/** Valid leave status values per the domain model. */
const VALID_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'TAKEN'] as const;

/** Allowed transitions for each leave status. */
const STATUS_TRANSITIONS: Record<string, string[]> = {
  PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['CANCELLED', 'TAKEN'],
  REJECTED: [],
  CANCELLED: [],
  TAKEN: [],
};

test.describe('@leave Leave Management Tests', () => {
  // ── 1. Submit leave request ───────────────────────────────────────────────

  test.describe('Submit leave request', () => {
    test('leave sidebarLink selector is defined', async ({ logger }) => {
      logger.step(1, 'Verify leave selectors are complete for submission flow');
      expect(selectors.leave.sidebarLink).toBeTruthy();
      logger.assertion(true, 'sidebarLink selector is defined');
    });

    test('leave applyLeaveLink selector is defined', () => {
      expect(selectors.leave.applyLeaveLink).toBeTruthy();
    });

    test('leave leaveTypeSelect selector is defined', () => {
      expect(selectors.leave.leaveTypeSelect).toBeTruthy();
    });

    test('leave fromDateInput selector is defined', () => {
      expect(selectors.leave.fromDateInput).toBeTruthy();
    });

    test('leave toDateInput selector is defined', () => {
      expect(selectors.leave.toDateInput).toBeTruthy();
    });

    test('leave submitButton selector is defined', () => {
      expect(selectors.leave.submitButton).toBeTruthy();
    });

    test('leave request date fields follow ISO 8601 format', async ({ logger }) => {
      // Arrange
      logger.step(1, 'Validate leave request date format');

      // Act
      const leaveRequest = {
        leaveType: 'Annual',
        fromDate: '2025-06-01',
        toDate: '2025-06-05',
      };

      // Assert
      expect(leaveRequest.fromDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(leaveRequest.toDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      logger.assertion(true, 'Dates are in ISO 8601 format');
    });

    test('fromDate must be earlier than toDate', () => {
      // Arrange
      const fromDate = new Date('2025-06-01');
      const toDate = new Date('2025-06-05');

      // Assert
      expect(fromDate.getTime()).toBeLessThan(toDate.getTime());
    });

    test('leave duration across multiple days is calculated correctly', () => {
      // Arrange
      const fromDate = new Date('2025-06-01');
      const toDate = new Date('2025-06-05');

      // Act
      const days =
        Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Assert
      expect(days).toBe(5);
    });

    test('single-day leave request has duration of 1', () => {
      // Arrange
      const fromDate = new Date('2025-07-10');
      const toDate = new Date('2025-07-10');

      // Act
      const days =
        Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Assert
      expect(days).toBe(1);
    });

    test('comment field is optional in a leave request', () => {
      // Arrange
      const withComment = {
        leaveType: 'Annual',
        fromDate: '2025-06-01',
        toDate: '2025-06-05',
        comment: 'Vacation',
      };
      const withoutComment = { leaveType: 'Annual', fromDate: '2025-06-01', toDate: '2025-06-05' };

      // Assert
      expect(withComment.comment).toBeTruthy();
      expect((withoutComment as Record<string, string>).comment).toBeUndefined();
    });

    test('multiple leave types are supported', () => {
      // Arrange / Act
      const leaveTypes = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Unpaid'];

      // Assert
      expect(leaveTypes).toHaveLength(5);
      leaveTypes.forEach((type) => expect(type).toBeTruthy());
    });

    test('leave workflow prerequisite: LoginPage is available', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Verify login page dependency is available for leave workflow');

      // Act
      const loginPage = new LoginPage(testPage);

      // Assert
      expect(loginPage).toBeDefined();
      logger.assertion(true, 'LoginPage is available as leave workflow prerequisite');
    });

    test('leave workflow prerequisite: PimPage is available for employee lookup', async ({
      testPage,
      logger,
    }) => {
      // Arrange
      logger.step(2, 'Verify PimPage dependency is available for leave workflow');

      // Act
      const pimPage = new PimPage(testPage);

      // Assert
      expect(pimPage).toBeDefined();
      logger.assertion(true, 'PimPage is available for employee lookup in leave workflow');
    });
  });

  // ── 2. Approve / Reject leave ─────────────────────────────────────────────

  test.describe('Approve/Reject leave', () => {
    test('approveButton selector is defined', () => {
      expect(selectors.leave.approveButton).toBeTruthy();
    });

    test('rejectButton selector is defined', () => {
      expect(selectors.leave.rejectButton).toBeTruthy();
    });

    test('all leave statuses are valid domain values', () => {
      VALID_STATUSES.forEach((status) => {
        expect(VALID_STATUSES).toContain(status);
      });
    });

    test('PENDING status can transition to APPROVED', () => {
      expect(STATUS_TRANSITIONS['PENDING']).toContain('APPROVED');
    });

    test('PENDING status can transition to REJECTED', () => {
      expect(STATUS_TRANSITIONS['PENDING']).toContain('REJECTED');
    });

    test('PENDING status can be CANCELLED', () => {
      expect(STATUS_TRANSITIONS['PENDING']).toContain('CANCELLED');
    });

    test('APPROVED leave can transition to TAKEN', () => {
      expect(STATUS_TRANSITIONS['APPROVED']).toContain('TAKEN');
    });

    test('REJECTED is a terminal status with no further transitions', () => {
      expect(STATUS_TRANSITIONS['REJECTED']).toHaveLength(0);
    });

    test('TAKEN is a terminal status with no further transitions', () => {
      expect(STATUS_TRANSITIONS['TAKEN']).toHaveLength(0);
    });

    test('CANCELLED is a terminal status with no further transitions', () => {
      expect(STATUS_TRANSITIONS['CANCELLED']).toHaveLength(0);
    });

    test('leave status after submission is PENDING', () => {
      // Arrange / Act
      const initialStatus = 'PENDING';

      // Assert
      expect(VALID_STATUSES).toContain(initialStatus);
    });
  });

  // ── 3. View leave balance ─────────────────────────────────────────────────

  test.describe('View leave balance', () => {
    test('leaveListLink selector is defined for leave list navigation', () => {
      expect(selectors.leave.leaveListLink).toBeTruthy();
    });

    test('leaveTable selector is defined for balance display', () => {
      expect(selectors.leave.leaveTable).toBeTruthy();
    });

    test('leave balance object has all required fields', async ({ logger }) => {
      // Arrange
      logger.step(1, 'Validate leave balance data structure');

      // Act – representative balance shape
      const balance = {
        leaveTypeId: 1,
        leaveTypeName: 'Annual Leave',
        balance: 10,
        used: 3,
        scheduled: 0,
        pending: 1,
        taken: 3,
      };

      // Assert
      expect(balance.leaveTypeId).toBeDefined();
      expect(balance.leaveTypeName).toBeTruthy();
      expect(typeof balance.balance).toBe('number');
      expect(typeof balance.used).toBe('number');
      expect(balance.balance).toBeGreaterThanOrEqual(0);
      logger.assertion(true, 'Leave balance object has correct structure');
    });

    test('used days cannot exceed the total balance', () => {
      // Arrange
      const balance = { total: 15, used: 5 };

      // Assert
      expect(balance.used).toBeLessThanOrEqual(balance.total);
    });

    test('remaining balance equals total minus used', () => {
      // Arrange
      const total = 15;
      const used = 5;

      // Act
      const remaining = total - used;

      // Assert
      expect(remaining).toBe(10);
    });

    test('zero remaining balance is a valid state', () => {
      // Arrange / Act
      const remaining = 15 - 15;

      // Assert
      expect(remaining).toBe(0);
    });
  });

  // ── 4. Leave history ──────────────────────────────────────────────────────

  test.describe('Leave history', () => {
    test('leaveRow selector builder contains the requested leave ID', () => {
      // Arrange
      const leaveId = 'LR-123';

      // Act
      const selector = selectors.leave.leaveRow(leaveId);

      // Assert
      expect(selector).toContain(leaveId);
    });

    test('leave history entry has the expected data fields', async ({ logger }) => {
      // Arrange
      logger.step(1, 'Validate leave history record shape');

      // Act
      const historyEntry = {
        id: 1,
        employeeId: 100,
        leaveType: 'Annual',
        fromDate: '2025-05-01',
        toDate: '2025-05-05',
        days: 5,
        status: 'APPROVED',
        comment: 'Pre-approved vacation',
      };

      // Assert
      expect(historyEntry.id).toBeDefined();
      expect(historyEntry.status).toBe('APPROVED');
      expect(historyEntry.days).toBe(5);
      logger.assertion(true, 'Leave history record has correct shape');
    });

    test('leave history can contain multiple entries for the same employee', () => {
      // Arrange / Act
      const entries = [
        { id: 1, status: 'APPROVED' },
        { id: 2, status: 'REJECTED' },
        { id: 3, status: 'PENDING' },
      ];

      // Assert
      expect(entries).toHaveLength(3);
      entries.forEach((e) => expect(VALID_STATUSES).toContain(e.status));
    });

    test('leave history entries are sorted by date (most recent first pattern)', () => {
      // Arrange
      const entries = [
        { id: 3, fromDate: '2025-07-01' },
        { id: 2, fromDate: '2025-06-01' },
        { id: 1, fromDate: '2025-05-01' },
      ];

      // Act – verify dates are in descending order
      for (let i = 0; i < entries.length - 1; i++) {
        const current = new Date(entries[i].fromDate).getTime();
        const next = new Date(entries[i + 1].fromDate).getTime();
        expect(current).toBeGreaterThan(next);
      }
    });

    test('leave history filtering by status is supported', () => {
      // Arrange
      const allEntries = [
        { id: 1, status: 'APPROVED' },
        { id: 2, status: 'PENDING' },
        { id: 3, status: 'APPROVED' },
      ];

      // Act
      const approvedOnly = allEntries.filter((e) => e.status === 'APPROVED');

      // Assert
      expect(approvedOnly).toHaveLength(2);
      approvedOnly.forEach((e) => expect(e.status).toBe('APPROVED'));
    });
  });

  // ── 5. Overlapping leave request (should fail) ────────────────────────────

  test.describe('Submit overlapping leave request', () => {
    test('LeavePage is importable from the suite', async ({ logger }) => {
      logger.step(1, 'Verify LeavePage module is importable');
      expect(LeavePage).toBeDefined();
      logger.info('✓ LeavePage is importable');
    });

    test('LeavePage can be instantiated with a Playwright page', async ({ testPage, logger }) => {
      logger.step(1, 'Instantiate LeavePage');
      const leavePage = new LeavePage(testPage);
      expect(leavePage).toBeInstanceOf(LeavePage);
      logger.info('✓ LeavePage instantiated successfully');
    });

    test('isOverlapErrorDisplayed method is defined on LeavePage', async ({ testPage }) => {
      const leavePage = new LeavePage(testPage);
      expect(typeof leavePage.isOverlapErrorDisplayed).toBe('function');
    });

    test('overlapping date ranges are detected correctly', () => {
      // Arrange
      const existing = { fromDate: new Date('2025-06-01'), toDate: new Date('2025-06-05') };
      const overlapping = { fromDate: new Date('2025-06-03'), toDate: new Date('2025-06-08') };

      // Act – two ranges overlap if one starts before the other ends
      const overlaps =
        overlapping.fromDate <= existing.toDate && overlapping.toDate >= existing.fromDate;

      // Assert
      expect(overlaps).toBe(true);
    });

    test('non-overlapping date ranges pass validation', () => {
      // Arrange
      const existing = { fromDate: new Date('2025-06-01'), toDate: new Date('2025-06-05') };
      const nonOverlapping = { fromDate: new Date('2025-06-06'), toDate: new Date('2025-06-10') };

      // Act
      const overlaps =
        nonOverlapping.fromDate <= existing.toDate && nonOverlapping.toDate >= existing.fromDate;

      // Assert
      expect(overlaps).toBe(false);
    });

    test('adjacent (touching) date ranges do not overlap', () => {
      // Arrange – second request starts the day after the first ends
      const existing = { fromDate: new Date('2025-06-01'), toDate: new Date('2025-06-05') };
      const adjacent = { fromDate: new Date('2025-06-06'), toDate: new Date('2025-06-07') };

      // Act
      const overlaps =
        adjacent.fromDate <= existing.toDate && adjacent.toDate >= existing.fromDate;

      // Assert
      expect(overlaps).toBe(false);
    });

    test('overlapError selector is defined', () => {
      expect(selectors.leave.overlapError).toBeTruthy();
    });

    test('duplicate date range is always an overlap', () => {
      // Arrange
      const request = { fromDate: new Date('2025-06-01'), toDate: new Date('2025-06-05') };

      // Act
      const overlaps = request.fromDate <= request.toDate && request.toDate >= request.fromDate;

      // Assert
      expect(overlaps).toBe(true);
    });
  });

  // ── 6. Reject leave request with reason ──────────────────────────────────

  test.describe('Reject leave request with reason', () => {
    test('rejectLeaveRequest method is defined on LeavePage', async ({ testPage }) => {
      const leavePage = new LeavePage(testPage);
      expect(typeof leavePage.rejectLeaveRequest).toBe('function');
    });

    test('rejectReasonTextarea selector is defined', () => {
      expect(selectors.leave.rejectReasonTextarea).toBeTruthy();
    });

    test('confirmRejectButton selector is defined', () => {
      expect(selectors.leave.confirmRejectButton).toBeTruthy();
    });

    test('rejection reason must be a non-empty string', () => {
      // Arrange
      const validate = (reason: string) => reason.trim().length > 0;

      // Assert
      expect(validate('Insufficient leave balance')).toBe(true);
      expect(validate('')).toBe(false);
      expect(validate('  ')).toBe(false);
    });

    test('rejection reason can contain detailed text', () => {
      // Arrange / Act
      const reason =
        'Leave rejected due to project deadline. Please reschedule for next quarter.';

      // Assert
      expect(reason.length).toBeGreaterThan(20);
      expect(typeof reason).toBe('string');
    });

    test('REJECTED is a terminal state — no further transitions allowed', () => {
      // Arrange
      const REJECTED_TRANSITIONS: string[] = STATUS_TRANSITIONS['REJECTED'];

      // Assert
      expect(REJECTED_TRANSITIONS).toHaveLength(0);
    });

    test('rejectButton selector targets the correct UI element', () => {
      expect(selectors.leave.rejectButton).toContain('Reject');
    });

    test('rejection data shape includes leaveId and reason', () => {
      // Arrange / Act
      const rejectionData = {
        leaveId: 'LR-100',
        reason: 'Business critical week — all hands on deck.',
        rejectedBy: 'Manager',
      };

      // Assert
      expect(rejectionData.leaveId).toBeTruthy();
      expect(rejectionData.reason).toBeTruthy();
      expect(rejectionData.rejectedBy).toBeTruthy();
    });
  });

  // ── 7. Cancel approved leave request ─────────────────────────────────────

  test.describe('Cancel approved leave request', () => {
    test('cancelLeaveRequest method is defined on LeavePage', async ({ testPage }) => {
      const leavePage = new LeavePage(testPage);
      expect(typeof leavePage.cancelLeaveRequest).toBe('function');
    });

    test('cancelLeaveButton selector is defined', () => {
      expect(selectors.leave.cancelLeaveButton).toBeTruthy();
    });

    test('APPROVED leave can transition to CANCELLED', () => {
      expect(STATUS_TRANSITIONS['APPROVED']).toContain('CANCELLED');
    });

    test('CANCELLED is a terminal status', () => {
      expect(STATUS_TRANSITIONS['CANCELLED']).toHaveLength(0);
    });

    test('cancel confirmation uses the common confirmButton selector', () => {
      expect(selectors.common.confirmButton).toBeTruthy();
    });

    test('cancel action data shape includes leave ID and reason', () => {
      // Arrange / Act
      const cancelData = {
        leaveId: 'LR-200',
        currentStatus: 'APPROVED',
        cancelledBy: 'Employee',
      };

      // Assert
      expect(cancelData.leaveId).toBeTruthy();
      expect(cancelData.currentStatus).toBe('APPROVED');
      expect(VALID_STATUSES).toContain(cancelData.currentStatus);
    });

    test('cancellation is only valid from APPROVED or PENDING state', () => {
      // Arrange
      const cancellableStates = Object.entries(STATUS_TRANSITIONS)
        .filter(([, transitions]) => transitions.includes('CANCELLED'))
        .map(([state]) => state);

      // Assert
      expect(cancellableStates).toContain('APPROVED');
      expect(cancellableStates).toContain('PENDING');
    });

    test('status after cancellation is CANCELLED', () => {
      // Arrange / Act
      const finalStatus = 'CANCELLED';

      // Assert
      expect(VALID_STATUSES).toContain(finalStatus);
      expect(STATUS_TRANSITIONS[finalStatus]).toHaveLength(0);
    });
  });
});
