/**
 * HRM API Suite - Leave API Client
 * Extends BaseApiClient with OrangeHRM leave management endpoints.
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
      const response = await this.get<{ data: LeaveType[] }>('/api/v2/leave/leave-types');
      return response.data || [];
    } catch (error) {
      this.logger.error('Failed to get leave types', error);
      throw error;
    }
  }

  /** Get a specific leave request by ID */
  async getLeaveRequest(id: number): Promise<LeaveRequest> {
    try {
      const response = await this.get<{ data: LeaveRequest }>(`/api/v2/leave/leave-requests/${id}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get leave request ${id}`, error);
      throw error;
    }
  }

  /** List leave requests with optional pagination */
  async listLeaveRequests(limit: number = 50, offset: number = 0): Promise<LeaveListResponse> {
    try {
      const response = await this.get<LeaveListResponse>(
        `/api/v2/leave/leave-requests?limit=${limit}&offset=${offset}`
      );
      return response;
    } catch (error) {
      this.logger.error('Failed to list leave requests', error);
      throw error;
    }
  }

  /** Create a new leave request */
  async createLeaveRequest(leaveRequest: CreateLeaveRequestDTO): Promise<LeaveRequest> {
    try {
      this.logger.step(1, 'Creating leave request via API');
      const response = await this.post<{ data: LeaveRequest }>(
        '/api/v2/leave/leave-requests',
        leaveRequest
      );
      this.logger.info(`✓ Leave request created: ${response.data?.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create leave request', error);
      throw error;
    }
  }

  /** Update a leave request status */
  async updateLeaveRequest(id: number, update: UpdateLeaveRequestDTO): Promise<LeaveRequest> {
    try {
      this.logger.step(1, `Updating leave request ${id}`);
      const response = await this.put<{ data: LeaveRequest }>(
        `/api/v2/leave/leave-requests/${id}`,
        update
      );
      this.logger.info('✓ Leave request updated');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update leave request ${id}`, error);
      throw error;
    }
  }

  /** Delete a leave request by ID */
  async deleteLeaveRequest(id: number): Promise<void> {
    try {
      this.logger.step(1, `Deleting leave request ${id}`);
      await this.delete(`/api/v2/leave/leave-requests/${id}`);
      this.logger.info('✓ Leave request deleted');
    } catch (error) {
      this.logger.error(`Failed to delete leave request ${id}`, error);
      throw error;
    }
  }

  /** Get leave balance for an employee */
  async getLeaveBalance(employeeId: number): Promise<LeaveBalance[]> {
    try {
      const response = await this.get<{ data: LeaveBalance[] }>(
        `/api/v2/leave/employees/${employeeId}/leave-balance`
      );
      return response.data || [];
    } catch (error) {
      this.logger.error(`Failed to get leave balance for employee ${employeeId}`, error);
      throw error;
    }
  }

  /** Get leave requests for a specific employee */
  async getEmployeeLeaveRequests(employeeId: number, limit: number = 50, offset: number = 0): Promise<LeaveListResponse> {
    try {
      const response = await this.get<LeaveListResponse>(
        `/api/v2/leave/employees/${employeeId}/leave-requests?limit=${limit}&offset=${offset}`
      );
      return response;
    } catch (error) {
      this.logger.error(`Failed to get leave requests for employee ${employeeId}`, error);
      throw error;
    }
  }
}
