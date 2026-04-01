/**
 * OrangeHRM API Suite - Leave API Client
 * Provides typed methods for OrangeHRM leave management endpoints.
 */

import { Page } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import {
  LeaveRequest,
  LeaveType,
  LeaveBalance,
  CreateLeaveRequestDTO,
  UpdateLeaveRequestDTO,
  LeaveListResponse,
} from '../schemas/Leave';

export class LeaveAPIClient extends BaseApiClient {
  constructor(page: Page) {
    super(page);
  }

  /** Get all available leave types */
  async getLeaveTypes(): Promise<LeaveType[]> {
    try {
      const response = await this.get<{ data: LeaveType[] }>('/api/v1/leave-types');
      return response.data || [];
    } catch (error) {
      this.logger.error('Failed to get leave types', error);
      throw error;
    }
  }

  /** Submit a new leave request */
  async createLeaveRequest(leaveRequest: CreateLeaveRequestDTO): Promise<LeaveRequest> {
    try {
      this.logger.step(1, 'Creating leave request via API');
      const response = await this.post<{ data: LeaveRequest }>(
        '/api/v1/leave-requests',
        leaveRequest
      );
      this.logger.info(`✓ Leave request created: ${response.data?.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create leave request', error);
      throw error;
    }
  }

  /** Get a specific leave request by ID */
  async getLeaveRequest(id: number): Promise<LeaveRequest> {
    try {
      const response = await this.get<{ data: LeaveRequest }>(`/api/v1/leave-requests/${id}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get leave request ${id}`, error);
      throw error;
    }
  }

  /** Update a leave request */
  async updateLeaveRequest(id: number, update: UpdateLeaveRequestDTO): Promise<LeaveRequest> {
    try {
      this.logger.step(1, `Updating leave request ${id}`);
      const response = await this.put<{ data: LeaveRequest }>(
        `/api/v1/leave-requests/${id}`,
        update
      );
      this.logger.info('✓ Leave request updated');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update leave request ${id}`, error);
      throw error;
    }
  }

  /** Cancel (delete) a leave request */
  async deleteLeaveRequest(id: number): Promise<void> {
    try {
      this.logger.step(1, `Cancelling leave request ${id}`);
      await this.delete(`/api/v1/leave-requests/${id}`);
      this.logger.info('✓ Leave request cancelled');
    } catch (error) {
      this.logger.error(`Failed to cancel leave request ${id}`, error);
      throw error;
    }
  }

  /** Get leave balance for an employee */
  async getLeaveBalance(employeeId: number): Promise<LeaveBalance[]> {
    try {
      const response = await this.get<{ data: LeaveBalance[] }>(
        `/api/v1/leave-balance?employeeId=${employeeId}`
      );
      return response.data || [];
    } catch (error) {
      this.logger.error(`Failed to get leave balance for employee ${employeeId}`, error);
      throw error;
    }
  }

  /** Approve a leave request */
  async approveLeaveRequest(id: number): Promise<LeaveRequest> {
    try {
      this.logger.step(1, `Approving leave request ${id}`);
      const response = await this.post<{ data: LeaveRequest }>(
        `/api/v1/leave-requests/${id}/approve`
      );
      this.logger.info('✓ Leave request approved');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to approve leave request ${id}`, error);
      throw error;
    }
  }

  /** Reject a leave request */
  async rejectLeaveRequest(id: number, comment?: string): Promise<LeaveRequest> {
    try {
      this.logger.step(1, `Rejecting leave request ${id}`);
      const response = await this.post<{ data: LeaveRequest }>(
        `/api/v1/leave-requests/${id}/reject`,
        comment ? { comment } : undefined
      );
      this.logger.info('✓ Leave request rejected');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to reject leave request ${id}`, error);
      throw error;
    }
  }

  /** List leave requests with optional pagination */
  async listLeaveRequests(limit: number = 50, offset: number = 0): Promise<LeaveListResponse> {
    try {
      const response = await this.get<LeaveListResponse>(
        `/api/v1/leave-requests?limit=${limit}&offset=${offset}`
      );
      return response;
    } catch (error) {
      this.logger.error('Failed to list leave requests', error);
      throw error;
    }
  }
}
