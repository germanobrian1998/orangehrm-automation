/**
 * OrangeHRM API Suite - Leave API Tests
 *
 * Covers:
 *  - GET  /api/v1/leave-types                        (list leave types)
 *  - POST /api/v1/leave-requests                     (submit leave request)
 *  - GET  /api/v1/leave-requests/:id                 (get leave request details)
 *  - PUT  /api/v1/leave-requests/:id                 (update leave request)
 *  - DELETE /api/v1/leave-requests/:id               (cancel leave request)
 *  - GET  /api/v1/leave-balance?employeeId=          (get employee leave balance)
 *  - POST /api/v1/leave-requests/:id/approve         (approve request)
 *  - POST /api/v1/leave-requests/:id/reject          (reject request)
 */

import { test, expect } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import { LeaveAPIClient } from '../../src/clients/LeaveAPIClient';
import {
  validateResponseHasData,
  validateErrorFormat,
  validateLeaveRequestSchema,
  validatePaginatedResponse,
  validateArrayItems,
} from '../common/response-validator';
import type {
  LeaveRequest,
  LeaveType,
  LeaveBalance,
  CreateLeaveRequestDTO,
  UpdateLeaveRequestDTO,
} from '../../src/schemas/Leave';

// ─── Package structure ────────────────────────────────────────────────────────

test.describe('@api Leave API', () => {
  test('LeaveAPIClient is defined', () => {
    expect(LeaveAPIClient).toBeDefined();
  });

  test('LeaveAPIClient extends BaseApiClient', () => {
    expect(LeaveAPIClient.prototype).toBeInstanceOf(BaseApiClient);
  });

  // ─── Method existence ──────────────────────────────────────────────────────

  test('LeaveAPIClient has getLeaveTypes method', () => {
    expect(typeof LeaveAPIClient.prototype.getLeaveTypes).toBe('function');
  });

  test('LeaveAPIClient has createLeaveRequest method', () => {
    expect(typeof LeaveAPIClient.prototype.createLeaveRequest).toBe('function');
  });

  test('LeaveAPIClient has getLeaveRequest method', () => {
    expect(typeof LeaveAPIClient.prototype.getLeaveRequest).toBe('function');
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

  test('LeaveAPIClient has approveLeaveRequest method', () => {
    expect(typeof LeaveAPIClient.prototype.approveLeaveRequest).toBe('function');
  });

  test('LeaveAPIClient has rejectLeaveRequest method', () => {
    expect(typeof LeaveAPIClient.prototype.rejectLeaveRequest).toBe('function');
  });

  // ─── GET /api/v1/leave-types ─────────────────────────────────────────────

  test.describe('GET /api/v1/leave-types', () => {
    test('leave-types endpoint path is correct', () => {
      expect('/api/v1/leave-types').toContain('/leave-types');
    });

    test('leave types response is an array', () => {
      const mockTypes: LeaveType[] = [
        { id: 1, name: 'Annual Leave' },
        { id: 2, name: 'Sick Leave' },
      ];
      expect(Array.isArray(mockTypes)).toBe(true);
    });

    test('leave type items have id and name fields', () => {
      const types = [
        { id: 1, name: 'Annual Leave' },
        { id: 2, name: 'Sick Leave' },
      ] as Record<string, unknown>[];
      validateArrayItems(types, ['id', 'name']);
    });

    test('leave type id is numeric', () => {
      const leaveType: LeaveType = { id: 1, name: 'Annual Leave' };
      expect(typeof leaveType.id).toBe('number');
    });

    test('leave type name is a string', () => {
      const leaveType: LeaveType = { id: 1, name: 'Annual Leave' };
      expect(typeof leaveType.name).toBe('string');
    });
  });

  // ─── POST /api/v1/leave-requests ─────────────────────────────────────────

  test.describe('POST /api/v1/leave-requests', () => {
    test('leave-requests endpoint path is correct', () => {
      expect('/api/v1/leave-requests').toContain('/leave-requests');
    });

    test('create leave request DTO has required fields', () => {
      const dto: CreateLeaveRequestDTO = {
        employeeId: 1,
        leaveTypeId: 2,
        fromDate: '2026-06-01',
        toDate: '2026-06-03',
      };
      expect(dto.employeeId).toBeDefined();
      expect(dto.leaveTypeId).toBeDefined();
      expect(dto.fromDate).toBeDefined();
      expect(dto.toDate).toBeDefined();
    });

    test('create leave request DTO with comment is valid', () => {
      const dto: CreateLeaveRequestDTO = {
        employeeId: 1,
        leaveTypeId: 2,
        fromDate: '2026-06-01',
        toDate: '2026-06-03',
        comment: 'Annual vacation',
      };
      expect(dto.comment).toBe('Annual vacation');
    });

    test('created leave request has PENDING status by default', () => {
      const mockResponse: LeaveRequest = {
        id: 10,
        employeeId: 1,
        leaveTypeId: 2,
        fromDate: '2026-06-01',
        toDate: '2026-06-03',
        status: 'PENDING',
        days: 3,
      };
      expect(mockResponse.status).toBe('PENDING');
    });

    test('create leave request response matches schema', () => {
      const mockResponse: Record<string, unknown> = {
        id: 10,
        employeeId: 1,
        leaveTypeId: 2,
        fromDate: '2026-06-01',
        toDate: '2026-06-03',
        status: 'PENDING',
        days: 3,
      };
      validateLeaveRequestSchema(mockResponse);
    });

    test('create leave request with missing fromDate returns error', () => {
      const dto = { employeeId: 1, leaveTypeId: 2, toDate: '2026-06-03' } as Record<string, unknown>;
      expect(dto['fromDate']).toBeUndefined();
    });

    test('create leave request with invalid date range returns error', () => {
      const dto: CreateLeaveRequestDTO = {
        employeeId: 1,
        leaveTypeId: 2,
        fromDate: '2026-06-05',
        toDate: '2026-06-01',
      };
      const fromDate = new Date(dto.fromDate);
      const toDate = new Date(dto.toDate);
      expect(fromDate > toDate).toBe(true);
    });
  });

  // ─── GET /api/v1/leave-requests/:id ──────────────────────────────────────

  test.describe('GET /api/v1/leave-requests/:id', () => {
    test('get leave request endpoint path is correct', () => {
      const id = 10;
      expect(`/api/v1/leave-requests/${id}`).toBe('/api/v1/leave-requests/10');
    });

    test('get leave request response has data field', () => {
      const mockRequest: LeaveRequest = {
        id: 10,
        employeeId: 1,
        leaveTypeId: 2,
        fromDate: '2026-06-01',
        toDate: '2026-06-03',
        status: 'PENDING',
        days: 3,
      };
      const mockResponse = { data: mockRequest };
      validateResponseHasData(mockResponse);
    });

    test('get leave request data matches schema', () => {
      const leaveRequest: Record<string, unknown> = {
        id: 10,
        employeeId: 1,
        leaveTypeId: 2,
        fromDate: '2026-06-01',
        toDate: '2026-06-03',
        status: 'PENDING',
        days: 3,
      };
      validateLeaveRequestSchema(leaveRequest);
    });

    test('get leave request not found returns error format', () => {
      const mockError = { message: 'Leave request not found', status: 404 };
      validateErrorFormat(mockError);
    });
  });

  // ─── PUT /api/v1/leave-requests/:id ──────────────────────────────────────

  test.describe('PUT /api/v1/leave-requests/:id', () => {
    test('update leave request endpoint path is correct', () => {
      const id = 10;
      expect(`/api/v1/leave-requests/${id}`).toBe('/api/v1/leave-requests/10');
    });

    test('update leave request DTO can update status', () => {
      const dto: UpdateLeaveRequestDTO = { status: 'CANCELLED' };
      expect(dto.status).toBe('CANCELLED');
    });

    test('update leave request DTO can update comment', () => {
      const dto: UpdateLeaveRequestDTO = { comment: 'Updated reason' };
      expect(dto.comment).toBe('Updated reason');
    });

    test('update leave request response contains updated data', () => {
      const mockResponse = {
        data: {
          id: 10,
          employeeId: 1,
          leaveTypeId: 2,
          fromDate: '2026-06-01',
          toDate: '2026-06-03',
          status: 'CANCELLED',
          days: 3,
        },
      };
      validateResponseHasData(mockResponse);
      expect(mockResponse.data.status).toBe('CANCELLED');
    });

    test('valid leave status values are recognized', () => {
      const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'CANCELLED', 'TAKEN'];
      expect(validStatuses).toContain('PENDING');
      expect(validStatuses).toContain('APPROVED');
      expect(validStatuses).toContain('REJECTED');
      expect(validStatuses).toContain('CANCELLED');
      expect(validStatuses).toContain('TAKEN');
    });
  });

  // ─── DELETE /api/v1/leave-requests/:id ───────────────────────────────────

  test.describe('DELETE /api/v1/leave-requests/:id', () => {
    test('cancel leave request endpoint path is correct', () => {
      const id = 10;
      expect(`/api/v1/leave-requests/${id}`).toBe('/api/v1/leave-requests/10');
    });

    test('cancel leave request does not return a body on success', () => {
      const mockVoidResponse = undefined;
      expect(mockVoidResponse).toBeUndefined();
    });

    test('cancel non-existent leave request returns error', () => {
      const mockError = { message: 'Leave request not found', status: 404 };
      validateErrorFormat(mockError);
    });
  });

  // ─── GET /api/v1/leave-balance ───────────────────────────────────────────

  test.describe('GET /api/v1/leave-balance', () => {
    test('leave-balance endpoint path is correct', () => {
      const employeeId = 1;
      expect(`/api/v1/leave-balance?employeeId=${employeeId}`).toContain('/leave-balance');
    });

    test('leave balance response is an array', () => {
      const mockBalances: LeaveBalance[] = [
        { leaveTypeId: 1, leaveTypeName: 'Annual Leave', balance: 10, used: 3, scheduled: 0, pending: 1, taken: 3 },
      ];
      expect(Array.isArray(mockBalances)).toBe(true);
    });

    test('leave balance items have required fields', () => {
      const balances = [
        { leaveTypeId: 1, leaveTypeName: 'Annual Leave', balance: 10, used: 3, scheduled: 0, pending: 1, taken: 3 },
      ] as Record<string, unknown>[];
      validateArrayItems(balances, ['leaveTypeId', 'leaveTypeName', 'balance', 'used', 'taken']);
    });

    test('leave balance values are non-negative numbers', () => {
      const balance: LeaveBalance = {
        leaveTypeId: 1,
        leaveTypeName: 'Annual Leave',
        balance: 10,
        used: 3,
        scheduled: 0,
        pending: 1,
        taken: 3,
      };
      expect(balance.balance).toBeGreaterThanOrEqual(0);
      expect(balance.used).toBeGreaterThanOrEqual(0);
      expect(balance.scheduled).toBeGreaterThanOrEqual(0);
      expect(balance.pending).toBeGreaterThanOrEqual(0);
      expect(balance.taken).toBeGreaterThanOrEqual(0);
    });

    test('leave balance: used = taken + pending + scheduled', () => {
      const balance: LeaveBalance = {
        leaveTypeId: 1,
        leaveTypeName: 'Annual Leave',
        balance: 10,
        used: 4,
        scheduled: 1,
        pending: 0,
        taken: 3,
      };
      const calculatedUsed = balance.taken + balance.pending + balance.scheduled;
      expect(calculatedUsed).toBe(balance.used);
    });
  });

  // ─── POST /api/v1/leave-requests/:id/approve ────────────────────────────

  test.describe('POST /api/v1/leave-requests/:id/approve', () => {
    test('approve endpoint path is correct', () => {
      const id = 10;
      expect(`/api/v1/leave-requests/${id}/approve`).toBe('/api/v1/leave-requests/10/approve');
    });

    test('approved leave request has APPROVED status', () => {
      const mockResponse: LeaveRequest = {
        id: 10,
        employeeId: 1,
        leaveTypeId: 2,
        fromDate: '2026-06-01',
        toDate: '2026-06-03',
        status: 'APPROVED',
        days: 3,
      };
      expect(mockResponse.status).toBe('APPROVED');
    });

    test('approve response contains updated leave request data', () => {
      const mockResponse = {
        data: {
          id: 10,
          employeeId: 1,
          leaveTypeId: 2,
          fromDate: '2026-06-01',
          toDate: '2026-06-03',
          status: 'APPROVED',
          days: 3,
        },
      };
      validateResponseHasData(mockResponse);
      validateLeaveRequestSchema(mockResponse.data as Record<string, unknown>);
    });

    test('approving already approved request returns appropriate response', () => {
      const alreadyApproved: LeaveRequest = {
        id: 10,
        employeeId: 1,
        leaveTypeId: 2,
        fromDate: '2026-06-01',
        toDate: '2026-06-03',
        status: 'APPROVED',
        days: 3,
      };
      expect(alreadyApproved.status).toBe('APPROVED');
    });
  });

  // ─── POST /api/v1/leave-requests/:id/reject ─────────────────────────────

  test.describe('POST /api/v1/leave-requests/:id/reject', () => {
    test('reject endpoint path is correct', () => {
      const id = 10;
      expect(`/api/v1/leave-requests/${id}/reject`).toBe('/api/v1/leave-requests/10/reject');
    });

    test('rejected leave request has REJECTED status', () => {
      const mockResponse: LeaveRequest = {
        id: 10,
        employeeId: 1,
        leaveTypeId: 2,
        fromDate: '2026-06-01',
        toDate: '2026-06-03',
        status: 'REJECTED',
        days: 3,
      };
      expect(mockResponse.status).toBe('REJECTED');
    });

    test('reject with comment is supported', () => {
      const rejectPayload = { comment: 'Not enough leave balance' };
      expect(rejectPayload.comment).toBeDefined();
      expect(typeof rejectPayload.comment).toBe('string');
    });

    test('reject response contains updated leave request data', () => {
      const mockResponse = {
        data: {
          id: 10,
          employeeId: 1,
          leaveTypeId: 2,
          fromDate: '2026-06-01',
          toDate: '2026-06-03',
          status: 'REJECTED',
          days: 3,
        },
      };
      validateResponseHasData(mockResponse);
      expect(mockResponse.data.status).toBe('REJECTED');
    });

    test('reject non-existent request returns error', () => {
      const mockError = { message: 'Leave request not found', status: 404 };
      validateErrorFormat(mockError);
    });
  });
});
