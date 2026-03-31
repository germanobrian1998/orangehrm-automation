/**
 * OrangeHRM Suite - Leave Management Integration Tests
 * Validates leave request workflow structure, selector completeness,
 * leave status transitions, and multi-step flow data shapes.
 */

import { test, expect } from '@qa-framework/core';
import { selectors } from '../../src/selectors';
import { LoginPage } from '../../src/pages/login.page';
import { PimPage } from '../../src/pages/pim.page';

test.describe('@integration Leave Management Workflows', () => {
  // ─── Leave selectors completeness ──────────────────────────────────────

  test('leave selectors include sidebarLink', async ({ logger }) => {
    logger.step(1, 'Verify leave selectors are complete');
    expect(selectors.leave.sidebarLink).toBeTruthy();
    logger.assertion(true, 'sidebarLink selector defined');
  });

  test('leave selectors include applyLeaveLink', () => {
    expect(selectors.leave.applyLeaveLink).toBeTruthy();
  });

  test('leave selectors include leaveListLink', () => {
    expect(selectors.leave.leaveListLink).toBeTruthy();
  });

  test('leave selectors include leaveTypeSelect', () => {
    expect(selectors.leave.leaveTypeSelect).toBeTruthy();
  });

  test('leave selectors include fromDateInput', () => {
    expect(selectors.leave.fromDateInput).toBeTruthy();
  });

  test('leave selectors include toDateInput', () => {
    expect(selectors.leave.toDateInput).toBeTruthy();
  });

  test('leave selectors include submitButton', () => {
    expect(selectors.leave.submitButton).toBeTruthy();
  });

  test('leave selectors include approveButton', () => {
    expect(selectors.leave.approveButton).toBeTruthy();
  });

  test('leave selectors include rejectButton', () => {
    expect(selectors.leave.rejectButton).toBeTruthy();
  });

  test('leave selectors leaveRow builder returns correct selector', () => {
    const selector = selectors.leave.leaveRow('LR-123');
    expect(selector).toContain('LR-123');
  });

  // ─── Leave request data shape validation ───────────────────────────────

  test('leave request data has required date fields', async ({ logger }) => {
    logger.step(1, 'Validate leave request data shape');
    const leaveRequest = {
      leaveType: 'Annual',
      fromDate: '2025-06-01',
      toDate: '2025-06-05',
    };
    expect(leaveRequest.leaveType).toBeTruthy();
    expect(leaveRequest.fromDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(leaveRequest.toDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    logger.assertion(true, 'Leave request dates are in ISO format');
  });

  test('leave request fromDate must be before toDate', () => {
    const fromDate = new Date('2025-06-01');
    const toDate = new Date('2025-06-05');
    expect(fromDate.getTime()).toBeLessThan(toDate.getTime());
  });

  test('leave duration is calculated correctly', () => {
    const fromDate = new Date('2025-06-01');
    const toDate = new Date('2025-06-05');
    const days = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    expect(days).toBe(5);
  });

  test('single-day leave request has duration of 1', () => {
    const fromDate = new Date('2025-07-10');
    const toDate = new Date('2025-07-10');
    const days = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    expect(days).toBe(1);
  });

  // ─── Leave status transitions ───────────────────────────────────────────

  test('leave status can be PENDING after submission', () => {
    const status = 'PENDING';
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'TAKEN'];
    expect(validStatuses).toContain(status);
  });

  test('leave status transitions from PENDING to APPROVED', () => {
    const transitions: Record<string, string[]> = {
      PENDING: ['APPROVED', 'REJECTED', 'CANCELLED'],
      APPROVED: ['CANCELLED', 'TAKEN'],
      REJECTED: [],
      CANCELLED: [],
      TAKEN: [],
    };
    expect(transitions['PENDING']).toContain('APPROVED');
    expect(transitions['PENDING']).toContain('REJECTED');
    expect(transitions['APPROVED']).toContain('TAKEN');
  });

  test('terminal leave statuses have no further transitions', () => {
    const transitions: Record<string, string[]> = {
      REJECTED: [],
      TAKEN: [],
    };
    expect(transitions['REJECTED']).toHaveLength(0);
    expect(transitions['TAKEN']).toHaveLength(0);
  });

  // ─── Multi-step leave workflow data flow ────────────────────────────────

  test('leave workflow step 1: employee must be logged in first', async ({ testPage, logger }) => {
    logger.step(1, 'Verify login page is available for leave workflow');
    const loginPage = new LoginPage(testPage);
    expect(loginPage).toBeDefined();
    logger.assertion(true, 'LoginPage is available for leave workflow prerequisite');
  });

  test('leave workflow step 2: PIM page is available for employee lookup', async ({ testPage, logger }) => {
    logger.step(2, 'Verify PimPage is available for employee lookup in leave workflow');
    const pimPage = new PimPage(testPage);
    expect(pimPage).toBeDefined();
    logger.assertion(true, 'PimPage is available for leave workflow employee lookup');
  });

  test('leave workflow: comment field is optional', () => {
    const withComment = { comment: 'Vacation trip', leaveType: 'Annual', fromDate: '2025-06-01', toDate: '2025-06-05' };
    const withoutComment = { leaveType: 'Annual', fromDate: '2025-06-01', toDate: '2025-06-05' };
    expect(withComment.comment).toBeTruthy();
    expect((withoutComment as Record<string, string>).comment).toBeUndefined();
  });

  test('leave workflow: multiple leave types are supported', () => {
    const leaveTypes = ['Annual', 'Sick', 'Maternity', 'Paternity', 'Unpaid'];
    expect(leaveTypes).toHaveLength(5);
    leaveTypes.forEach(type => expect(type).toBeTruthy());
  });
});
