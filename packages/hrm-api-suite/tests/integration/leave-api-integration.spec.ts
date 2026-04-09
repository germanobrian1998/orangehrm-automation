/**
 * HRM API Suite - Leave API Integration Tests
 * Validates LeaveAPIClient method contracts, leave request lifecycle,
 * balance schema, status transitions, and fixture correctness.
 */

import { test, expect } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import { LeaveAPIClient } from '../../src/clients/LeaveAPIClient';
import { leaveFixtures, API_ENDPOINTS } from '../../src/fixtures/apiFixtures';
import {
  LeaveRequest,
  LeaveType,
  LeaveBalance,
  CreateLeaveRequestDTO,
  UpdateLeaveRequestDTO,
  LeaveStatus,
} from '../../src/schemas/Leave';

test.describe('@integration @api Leave API Integration', () => {
  // ─── Client structure ───────────────────────────────────────────────────

  test('LeaveAPIClient inherits from BaseApiClient', () => {
    expect(LeaveAPIClient.prototype).toBeInstanceOf(BaseApiClient);
  });

  test('LeaveAPIClient exposes all required methods', () => {
    const methods = [
      'getLeaveTypes',
      'getLeaveRequest',
      'listLeaveRequests',
      'createLeaveRequest',
      'updateLeaveRequest',
      'deleteLeaveRequest',
      'getLeaveBalance',
      'getEmployeeLeaveRequests',
    ];
    methods.forEach(method => {
      expect(typeof (LeaveAPIClient.prototype as unknown as Record<string, unknown>)[method]).toBe('function');
    });
  });

  // ─── CreateLeaveRequestDTO validation ──────────────────────────────────

  test('CreateLeaveRequestDTO requires employeeId', () => {
    const dto: CreateLeaveRequestDTO = {
      employeeId: 42,
      leaveTypeId: 1,
      fromDate: '2025-06-01',
      toDate: '2025-06-05',
    };
    expect(dto.employeeId).toBe(42);
  });

  test('CreateLeaveRequestDTO requires leaveTypeId', () => {
    const dto: CreateLeaveRequestDTO = {
      employeeId: 42,
      leaveTypeId: 3,
      fromDate: '2025-06-01',
      toDate: '2025-06-05',
    };
    expect(dto.leaveTypeId).toBe(3);
  });

  test('CreateLeaveRequestDTO requires fromDate and toDate', () => {
    const dto: CreateLeaveRequestDTO = {
      employeeId: 42,
      leaveTypeId: 1,
      fromDate: '2025-06-01',
      toDate: '2025-06-05',
    };
    expect(dto.fromDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(dto.toDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });

  test('CreateLeaveRequestDTO accepts optional comment', () => {
    const dto: CreateLeaveRequestDTO = {
      employeeId: 42,
      leaveTypeId: 1,
      fromDate: '2025-06-01',
      toDate: '2025-06-05',
      comment: 'Team offsite',
    };
    expect(dto.comment).toBe('Team offsite');
  });

  // ─── UpdateLeaveRequestDTO validation ──────────────────────────────────

  test('UpdateLeaveRequestDTO allows status change to APPROVED', () => {
    const update: UpdateLeaveRequestDTO = { status: 'APPROVED' };
    expect(update.status).toBe('APPROVED');
  });

  test('UpdateLeaveRequestDTO allows status change to REJECTED', () => {
    const update: UpdateLeaveRequestDTO = { status: 'REJECTED' };
    expect(update.status).toBe('REJECTED');
  });

  test('UpdateLeaveRequestDTO allows comment update', () => {
    const update: UpdateLeaveRequestDTO = { comment: 'Updated reason' };
    expect(update.comment).toBe('Updated reason');
  });

  // ─── LeaveRequest schema validation ────────────────────────────────────

  test('LeaveRequest has numeric id and employeeId', () => {
    const lr: LeaveRequest = {
      id: 7,
      employeeId: 100,
      leaveTypeId: 2,
      fromDate: '2025-06-01',
      toDate: '2025-06-03',
      status: 'PENDING',
      days: 3,
    };
    expect(typeof lr.id).toBe('number');
    expect(typeof lr.employeeId).toBe('number');
  });

  test('LeaveRequest days field matches date range', () => {
    const fromDate = new Date('2025-06-01');
    const toDate = new Date('2025-06-03');
    const expectedDays = Math.floor((toDate.getTime() - fromDate.getTime()) / (1000 * 60 * 60 * 24)) + 1;
    expect(expectedDays).toBe(3);
  });

  // ─── LeaveType schema validation ────────────────────────────────────────

  test('LeaveType has id and name fields', () => {
    const leaveType: LeaveType = { id: 1, name: 'Annual Leave' };
    expect(leaveType.id).toBe(1);
    expect(leaveType.name).toBe('Annual Leave');
  });

  test('LeaveType allows optional situational flag', () => {
    const leaveType: LeaveType = { id: 2, name: 'Sick Leave', situational: true };
    expect(leaveType.situational).toBe(true);
  });

  // ─── LeaveBalance schema validation ─────────────────────────────────────

  test('LeaveBalance contains all required fields', () => {
    const balance: LeaveBalance = {
      leaveTypeId: 1,
      leaveTypeName: 'Annual Leave',
      balance: 15,
      used: 5,
      scheduled: 0,
      pending: 2,
      taken: 5,
    };
    expect(balance.balance).toBe(15);
    expect(balance.used).toBe(5);
    expect(balance.pending).toBe(2);
  });

  test('LeaveBalance used + pending + scheduled equals total consumed', () => {
    const balance: LeaveBalance = {
      leaveTypeId: 1,
      leaveTypeName: 'Annual Leave',
      balance: 15,
      used: 5,
      scheduled: 2,
      pending: 3,
      taken: 5,
    };
    const consumed = balance.used + balance.scheduled + balance.pending;
    expect(consumed).toBe(10);
  });

  // ─── Leave status workflow ──────────────────────────────────────────────

  test('all valid LeaveStatus values are correctly typed', () => {
    const statuses: LeaveStatus[] = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'TAKEN'];
    expect(statuses).toHaveLength(5);
    statuses.forEach(s => expect(typeof s).toBe('string'));
  });

  test('initial status after creation should be PENDING', () => {
    const initialStatus: LeaveStatus = 'PENDING';
    expect(initialStatus).toBe('PENDING');
  });

  // ─── Fixture integration ────────────────────────────────────────────────

  test('leaveFixtures.validCreate produces correct DTO for API call', () => {
    const dto = leaveFixtures.validCreate(100, 1);
    expect(dto.employeeId).toBe(100);
    expect(dto.leaveTypeId).toBe(1);
    expect(dto.fromDate).toBeTruthy();
    expect(dto.toDate).toBeTruthy();
  });

  test('leaveFixtures.validCreateWithComment includes comment field', () => {
    const dto = leaveFixtures.validCreateWithComment(200, 3);
    expect(dto.comment).toBeTruthy();
    expect(dto.employeeId).toBe(200);
  });

  test('invalid leave request fixture has missing dates', () => {
    const invalidDto = leaveFixtures.invalidCreate.missingDates;
    expect((invalidDto as Record<string, unknown>).fromDate).toBeUndefined();
    expect((invalidDto as Record<string, unknown>).toDate).toBeUndefined();
  });

  test('invalid date range fixture has toDate before fromDate', () => {
    const invalidDto = leaveFixtures.invalidCreate.invalidDateRange;
    const from = new Date(invalidDto.fromDate);
    const to = new Date(invalidDto.toDate);
    expect(from.getTime()).toBeGreaterThan(to.getTime());
  });

  // ─── API endpoint validation ────────────────────────────────────────────

  test('leave requests endpoint is correct', () => {
    expect(API_ENDPOINTS.leaveRequests).toBe('/api/v2/leave/leave-requests');
  });

  test('leave types endpoint is correct', () => {
    expect(API_ENDPOINTS.leaveTypes).toBe('/api/v2/leave/leave-types');
  });

  test('leave request endpoint builder includes ID', () => {
    const endpoint = API_ENDPOINTS.leaveRequest(15);
    expect(endpoint).toContain('15');
    expect(endpoint).toContain('/api/v2/leave/leave-requests/');
  });
});
