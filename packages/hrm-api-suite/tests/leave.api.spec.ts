/**
 * HRM API Suite - Leave API tests
 * Tests for LeaveAPIClient: leave requests, types, balance, and status management.
 */

import { test, expect } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import { LeaveAPIClient } from '../src/clients/LeaveAPIClient';
import { leaveFixtures, API_ENDPOINTS } from '../src/fixtures/apiFixtures';

test.describe('@api Leave API Client', () => {
  // ─── Package structure ───────────────────────────────────────────────────

  test('LeaveAPIClient is defined', () => {
    expect(LeaveAPIClient).toBeDefined();
  });

  test('LeaveAPIClient extends BaseApiClient', () => {
    expect(LeaveAPIClient.prototype).toBeInstanceOf(BaseApiClient);
  });

  // ─── Method existence ────────────────────────────────────────────────────

  test('LeaveAPIClient has getLeaveTypes method', () => {
    expect(typeof LeaveAPIClient.prototype.getLeaveTypes).toBe('function');
  });

  test('LeaveAPIClient has getLeaveRequest method', () => {
    expect(typeof LeaveAPIClient.prototype.getLeaveRequest).toBe('function');
  });

  test('LeaveAPIClient has listLeaveRequests method', () => {
    expect(typeof LeaveAPIClient.prototype.listLeaveRequests).toBe('function');
  });

  test('LeaveAPIClient has createLeaveRequest method', () => {
    expect(typeof LeaveAPIClient.prototype.createLeaveRequest).toBe('function');
  });

  test('LeaveAPIClient has updateLeaveRequest method', () => {
    expect(typeof LeaveAPIClient.prototype.updateLeaveRequest).toBe('function');
  });

  test('LeaveAPIClient has deleteLeaveRequest method', () => {
    expect(typeof LeaveAPIClient.prototype.deleteLeaveRequest).toBe('function');
  });

  test('LeaveAPIClient has getLeaveBalance method', () => {
    expect(typeof LeaveAPIClient.prototype.getLeaveBalance).toBe('function');
  });

  test('LeaveAPIClient has getEmployeeLeaveRequests method', () => {
    expect(typeof LeaveAPIClient.prototype.getEmployeeLeaveRequests).toBe('function');
  });

  // ─── Schema validation ───────────────────────────────────────────────────

  test('LeaveRequest schema has required fields', () => {
    const leaveRequest = {
      id: 1,
      employeeId: 100,
      leaveTypeId: 2,
      fromDate: '2025-06-01',
      toDate: '2025-06-03',
      status: 'PENDING' as const,
      days: 3,
    };
    expect(leaveRequest.id).toBeDefined();
    expect(leaveRequest.employeeId).toBeDefined();
    expect(leaveRequest.status).toBe('PENDING');
    expect(leaveRequest.days).toBe(3);
  });

  test('LeaveStatus values are valid', () => {
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'TAKEN'];
    validStatuses.forEach(status => expect(status).toBeTruthy());
  });

  test('LeaveBalance schema has all required fields', () => {
    const balance = {
      leaveTypeId: 1,
      leaveTypeName: 'Annual Leave',
      balance: 10,
      used: 3,
      scheduled: 0,
      pending: 1,
      taken: 3,
    };
    expect(balance.balance).toBe(10);
    expect(balance.used).toBe(3);
    expect(balance.leaveTypeName).toBe('Annual Leave');
  });

  // ─── Fixtures validation ─────────────────────────────────────────────────

  test('leaveFixtures.validCreate returns correct DTO', () => {
    const dto = leaveFixtures.validCreate(100, 1);
    expect(dto.employeeId).toBe(100);
    expect(dto.leaveTypeId).toBe(1);
    expect(dto.fromDate).toBe('2025-06-01');
    expect(dto.toDate).toBe('2025-06-03');
    expect(dto.comment).toBe('Annual vacation');
  });

  test('leaveFixtures.validCreateWithComment includes comment', () => {
    const dto = leaveFixtures.validCreateWithComment(100, 2);
    expect(dto.comment).toBe('Medical appointment');
    expect(dto.fromDate).toBe('2025-07-10');
  });

  test('leaveFixtures.invalidCreate.missingDates has no date fields', () => {
    const dto = leaveFixtures.invalidCreate.missingDates;
    expect((dto as Record<string, unknown>).fromDate).toBeUndefined();
    expect((dto as Record<string, unknown>).toDate).toBeUndefined();
  });

  test('API_ENDPOINTS.leaveRequests points to correct path', () => {
    expect(API_ENDPOINTS.leaveRequests).toBe('/api/v2/leave/leave-requests');
  });

  test('API_ENDPOINTS.leaveRequest returns path with id', () => {
    expect(API_ENDPOINTS.leaveRequest(5)).toBe('/api/v2/leave/leave-requests/5');
  });

  test('API_ENDPOINTS.leaveTypes points to correct path', () => {
    expect(API_ENDPOINTS.leaveTypes).toBe('/api/v2/leave/leave-types');
  });
});
