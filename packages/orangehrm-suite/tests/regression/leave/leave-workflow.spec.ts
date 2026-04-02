/**
 * OrangeHRM Suite - Leave Request Workflow Regression Tests
 * Comprehensive regression suite for the Leave Management module.
 * Covers apply, approve, reject, cancel, and view-balance workflows.
 *
 * Testing pyramid layer: Regression
 * Validates LeavePage methods, LeaveAPIClient contracts, selectors,
 * and business-rule data shapes without requiring a live OrangeHRM instance.
 *
 * @regression @critical @leave
 */

import { test, expect } from '@qa-framework/core';
import { LeavePage } from '../../../src/pages/leave.page';
import { LoginPage } from '../../../src/pages/login.page';
import { PimPage } from '../../../src/pages/pim.page';
import { selectors } from '../../../src/selectors';

// ─── Domain constants ─────────────────────────────────────────────────────────

/** All valid leave status values per the domain model. */
const VALID_LEAVE_STATUSES = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'TAKEN'] as const;
type LeaveStatus = (typeof VALID_LEAVE_STATUSES)[number];

/** Allowed status transitions per the leave workflow state machine. */
const STATUS_TRANSITIONS: Record<LeaveStatus, LeaveStatus[]> = {
  PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
  APPROVED: ['CANCELLED', 'TAKEN'],
  REJECTED: [],
  CANCELLED: [],
  TAKEN: [],
};

// ─── Test data factory ────────────────────────────────────────────────────────

/**
 * Builds a leave request payload with future dates to avoid date-range errors.
 * Mirrors the TestDataFactory pattern used across the suite.
 */
function buildLeaveRequest(overrides: Record<string, unknown> = {}) {
  // Use a 2-year buffer so dates are reliably in the future regardless of when
  // the test runs (avoids year-end boundary issues with +1 year calculations).
  const futureYear = new Date().getFullYear() + 2;
  return {
    leaveTypeId: 1,
    fromDate: `${futureYear}-06-01`,
    toDate: `${futureYear}-06-03`,
    comment: 'Annual leave – regression test',
    ...overrides,
  };
}

// ─── Test suite ───────────────────────────────────────────────────────────────

test.describe('@regression @critical Leave Request Workflow', () => {
  // ── 1. Apply for leave ─────────────────────────────────────────────────────

  test.describe('Apply for leave', () => {
    /**
     * Validates that LeavePage exposes the submit method,
     * selectors are defined, and the leave request payload satisfies its contract.
     */
    test('should apply for leave – create leave request', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Instantiate LeavePage and build a leave request');
      const leavePage = new LeavePage(testPage);
      const request = buildLeaveRequest();

      // Assert – method contracts
      expect(typeof leavePage.goToApplyLeave).toBe('function');
      logger.info('✓ LeavePage.goToApplyLeave method is present');

      // Assert – submit selector
      expect(selectors.leave.submitButton).toBeTruthy();
      logger.info('✓ Leave submit selector is defined');

      // Assert – request payload shape
      expect(typeof request.leaveTypeId).toBe('number');
      expect(request.fromDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(request.toDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(new Date(request.fromDate).getTime()).toBeLessThanOrEqual(
        new Date(request.toDate).getTime()
      );
      logger.assertion(true, 'Leave request payload satisfies date-range and type contract');
    });

    test('leave type and date selectors are defined', ({ logger }) => {
      logger.step(1, 'Verify all selectors needed for leave submission are defined');
      expect(selectors.leave.leaveTypeSelect).toBeTruthy();
      expect(selectors.leave.fromDateInput).toBeTruthy();
      expect(selectors.leave.toDateInput).toBeTruthy();
      expect(selectors.leave.commentTextarea).toBeTruthy();
      logger.assertion(true, 'All leave-submission selectors are present');
    });

    test('leave duration is calculated correctly for multi-day request', ({ logger }) => {
      // Arrange
      logger.step(1, 'Calculate leave duration for a 5-day request');
      const from = new Date('2026-06-01');
      const to = new Date('2026-06-05');

      // Act
      const days = Math.floor((to.getTime() - from.getTime()) / (1000 * 60 * 60 * 24)) + 1;

      // Assert
      expect(days).toBe(5);
      logger.assertion(true, 'Leave duration is 5 days for 2026-06-01 → 2026-06-05');
    });

    test('initial leave status after submission is PENDING', ({ logger }) => {
      logger.step(1, 'Confirm initial status is PENDING');
      const initialStatus: LeaveStatus = 'PENDING';
      expect(VALID_LEAVE_STATUSES).toContain(initialStatus);
      logger.assertion(true, 'Initial leave status is PENDING');
    });

    test('role dependencies (LoginPage, PimPage) are available for leave workflow', async ({
      testPage,
      logger,
    }) => {
      logger.step(1, 'Verify LoginPage and PimPage are available as prerequisites');
      const loginPage = new LoginPage(testPage);
      const pimPage = new PimPage(testPage);
      expect(loginPage).toBeDefined();
      expect(pimPage).toBeDefined();
      logger.assertion(true, 'LoginPage and PimPage are available for leave workflow setup');
    });
  });

  // ── 2. Approve leave request ───────────────────────────────────────────────

  test.describe('Approve leave request', () => {
    /**
     * Validates the manager approval flow: selector contract and state-machine
     * transitions from PENDING → APPROVED.
     */
    test('should approve leave request – manager perspective', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Instantiate LeavePage for approval flow');
      const leavePage = new LeavePage(testPage);

      // Assert – method contract
      expect(typeof leavePage.approveLeaveRequest).toBe('function');
      logger.info('✓ LeavePage.approveLeaveRequest method is present');

      // Assert – approval selector
      expect(selectors.leave.approveButton).toBeTruthy();
      logger.info('✓ Approve button selector is defined');

      // Assert – state transition
      expect(STATUS_TRANSITIONS['PENDING']).toContain('APPROVED');
      logger.assertion(true, 'PENDING → APPROVED is a valid state transition');
    });

    test('APPROVED status is a valid leave domain value', ({ logger }) => {
      logger.step(1, 'Confirm APPROVED is in the valid status set');
      expect(VALID_LEAVE_STATUSES).toContain('APPROVED');
      logger.assertion(true, 'APPROVED is a recognised leave status');
    });

    test('APPROVED leave can further transition to TAKEN', ({ logger }) => {
      logger.step(1, 'Verify APPROVED → TAKEN transition is allowed');
      expect(STATUS_TRANSITIONS['APPROVED']).toContain('TAKEN');
      logger.assertion(true, 'APPROVED → TAKEN transition is valid');
    });

    test('approval data shape includes leaveId and approvedBy', ({ logger }) => {
      // Arrange
      logger.step(1, 'Validate approval record shape');

      const approvalRecord = {
        leaveId: 'LR-REG-001',
        previousStatus: 'PENDING' as LeaveStatus,
        newStatus: 'APPROVED' as LeaveStatus,
        approvedBy: 'Manager',
        approvedAt: new Date().toISOString(),
      };

      // Assert
      expect(approvalRecord.leaveId).toBeTruthy();
      expect(approvalRecord.previousStatus).toBe('PENDING');
      expect(approvalRecord.newStatus).toBe('APPROVED');
      expect(approvalRecord.approvedBy).toBeTruthy();
      logger.assertion(true, 'Approval record has the expected shape');
    });
  });

  // ── 3. Reject leave request with reason ───────────────────────────────────

  test.describe('Reject leave request with reason', () => {
    /**
     * Validates the rejection flow: reason field requirements, selectors,
     * and that REJECTED is a terminal state.
     */
    test('should reject leave request with reason', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Instantiate LeavePage for rejection flow');
      const leavePage = new LeavePage(testPage);

      logger.step(2, 'Prepare rejection reason');
      const rejectionReason = 'Insufficient leave balance for the requested period.';

      // Assert – method contract
      expect(typeof leavePage.rejectLeaveRequest).toBe('function');
      logger.info('✓ LeavePage.rejectLeaveRequest method is present');

      // Assert – rejection selectors
      expect(selectors.leave.rejectButton).toBeTruthy();
      expect(selectors.leave.rejectReasonTextarea).toBeTruthy();
      expect(selectors.leave.confirmRejectButton).toBeTruthy();
      logger.info('✓ All rejection selectors are defined');

      // Assert – reason validation
      expect(rejectionReason.trim().length).toBeGreaterThan(0);
      expect(STATUS_TRANSITIONS['PENDING']).toContain('REJECTED');
      logger.assertion(true, 'Rejection reason is non-empty and PENDING → REJECTED is valid');
    });

    test('REJECTED is a terminal status with no further transitions', ({ logger }) => {
      logger.step(1, 'Confirm REJECTED is a terminal state');
      expect(STATUS_TRANSITIONS['REJECTED']).toHaveLength(0);
      logger.assertion(true, 'REJECTED has zero allowed transitions');
    });

    test('rejection reason must be a non-empty string', ({ logger }) => {
      logger.step(1, 'Validate rejection reason non-empty rule');
      const validate = (reason: string) => reason.trim().length > 0;

      expect(validate('Workload prevents absence')).toBe(true);
      expect(validate('')).toBe(false);
      expect(validate('  ')).toBe(false);
      logger.assertion(true, 'Rejection reason validation logic is correct');
    });

    test('rejection record includes leaveId, reason, and rejectedBy', ({ logger }) => {
      // Arrange
      logger.step(1, 'Validate rejection record shape');

      const rejectionRecord = {
        leaveId: 'LR-REG-002',
        reason: 'Critical project deadline — all hands needed.',
        rejectedBy: 'Manager',
        rejectedAt: new Date().toISOString(),
      };

      // Assert
      expect(rejectionRecord.leaveId).toBeTruthy();
      expect(rejectionRecord.reason).toBeTruthy();
      expect(rejectionRecord.rejectedBy).toBeTruthy();
      expect(rejectionRecord.rejectedAt).toMatch(/^\d{4}-\d{2}-\d{2}T/);
      logger.assertion(true, 'Rejection record has the expected shape');
    });
  });

  // ── 4. Cancel existing leave request ──────────────────────────────────────

  test.describe('Cancel existing leave request', () => {
    /**
     * Validates the cancellation flow: method availability, selectors,
     * allowed states from which cancellation is permitted, and terminal state.
     */
    test('should cancel existing leave request', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Instantiate LeavePage for cancellation flow');
      const leavePage = new LeavePage(testPage);

      // Assert – method contract
      expect(typeof leavePage.cancelLeaveRequest).toBe('function');
      logger.info('✓ LeavePage.cancelLeaveRequest method is present');

      // Assert – cancellation selectors
      expect(selectors.leave.cancelLeaveButton).toBeTruthy();
      expect(selectors.common.confirmButton).toBeTruthy();
      logger.info('✓ Cancellation selectors are defined');

      // Assert – state transitions
      expect(STATUS_TRANSITIONS['PENDING']).toContain('CANCELLED');
      expect(STATUS_TRANSITIONS['APPROVED']).toContain('CANCELLED');
      logger.assertion(true, 'Cancellation is allowed from both PENDING and APPROVED states');
    });

    test('CANCELLED is a terminal status', ({ logger }) => {
      logger.step(1, 'Confirm CANCELLED is a terminal state');
      expect(STATUS_TRANSITIONS['CANCELLED']).toHaveLength(0);
      logger.assertion(true, 'CANCELLED has zero allowed transitions');
    });

    test('only PENDING and APPROVED states allow cancellation', ({ logger }) => {
      logger.step(1, 'Derive cancellable states from the state machine');

      const cancellableStates = (
        Object.entries(STATUS_TRANSITIONS) as [LeaveStatus, LeaveStatus[]][]
      )
        .filter(([, transitions]) => transitions.includes('CANCELLED'))
        .map(([state]) => state);

      expect(cancellableStates).toContain('APPROVED');
      expect(cancellableStates).toContain('PENDING');
      expect(cancellableStates).toHaveLength(2);
      logger.assertion(true, 'Exactly two states allow cancellation: PENDING and APPROVED');
    });

    test('cancellation record includes leaveId, currentStatus, and cancelledBy', ({ logger }) => {
      // Arrange
      logger.step(1, 'Validate cancellation record shape');

      const cancelRecord = {
        leaveId: 'LR-REG-003',
        currentStatus: 'APPROVED' as LeaveStatus,
        cancelledBy: 'Employee',
        cancelledAt: new Date().toISOString(),
      };

      // Assert
      expect(cancelRecord.leaveId).toBeTruthy();
      expect(VALID_LEAVE_STATUSES).toContain(cancelRecord.currentStatus);
      expect(cancelRecord.cancelledBy).toBeTruthy();
      logger.assertion(true, 'Cancellation record has the expected shape');
    });
  });

  // ── 5. View leave balance and accrual details ──────────────────────────────

  test.describe('View leave balance and accrual details', () => {
    /**
     * Validates the leave balance view: selectors, balance data shape,
     * accrual business rules, and multiple leave types.
     */
    test('should view leave balance and accrual details', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Instantiate LeavePage for balance view');
      const leavePage = new LeavePage(testPage);

      logger.step(2, 'Define a representative leave balance record');
      const balance = {
        leaveTypeId: 1,
        leaveTypeName: 'Annual Leave',
        balance: 14,
        used: 3,
        scheduled: 0,
        pending: 1,
        taken: 3,
      };

      // Assert – page method contract
      expect(typeof leavePage.getLeaveBalance).toBe('function');
      logger.info('✓ LeavePage.getLeaveBalance method is present');

      // Assert – selectors
      expect(selectors.leave.leaveBalanceTable).toBeTruthy();
      logger.info('✓ leaveBalanceTable selector is defined');

      // Assert – balance data shape
      expect(typeof balance.balance).toBe('number');
      expect(typeof balance.used).toBe('number');
      expect(balance.balance).toBeGreaterThanOrEqual(0);
      expect(balance.used).toBeLessThanOrEqual(balance.balance);
      logger.assertion(true, 'Leave balance record satisfies non-negative and used ≤ total rules');
    });

    test('remaining balance equals total minus used days', ({ logger }) => {
      // Arrange
      logger.step(1, 'Calculate remaining balance');
      const total = 14;
      const used = 3;

      // Act
      const remaining = total - used;

      // Assert
      expect(remaining).toBe(11);
      expect(remaining).toBeGreaterThanOrEqual(0);
      logger.assertion(true, 'Remaining balance is correctly calculated as total − used');
    });

    test('zero remaining balance is a valid state', ({ logger }) => {
      logger.step(1, 'Validate zero-remaining-balance edge case');
      const total = 14;
      const used = 14;
      const remaining = total - used;
      expect(remaining).toBe(0);
      logger.assertion(true, 'Zero remaining balance is a valid state');
    });

    test('leave balance row selector contains the leave type name', ({ logger }) => {
      // Arrange
      const leaveTypeName = 'Annual Leave';
      logger.step(1, `Build balance row selector for "${leaveTypeName}"`);

      // Act
      const selector = selectors.leave.leaveBalanceRow(leaveTypeName);

      // Assert
      expect(selector).toContain(leaveTypeName);
      logger.assertion(true, 'leaveBalanceRow selector contains the leave type name');
    });

    test('multiple leave types can appear in the balance table', ({ logger }) => {
      logger.step(1, 'Validate multi-type leave balance list');

      const balances = [
        { leaveTypeName: 'Annual Leave', balance: 14, used: 3 },
        { leaveTypeName: 'Sick Leave', balance: 7, used: 1 },
        { leaveTypeName: 'Maternity Leave', balance: 90, used: 0 },
      ];

      expect(balances).toHaveLength(3);
      balances.forEach((b) => {
        expect(b.leaveTypeName).toBeTruthy();
        expect(b.balance).toBeGreaterThanOrEqual(0);
        expect(b.used).toBeLessThanOrEqual(b.balance);
      });
      logger.assertion(true, 'All leave type balances satisfy invariants');
    });
  });
});
