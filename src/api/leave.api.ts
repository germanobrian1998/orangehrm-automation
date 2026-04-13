/**
 * Leave API endpoints
 * Handles all leave-related API calls
 */

import { BaseAPI } from './base.api';
import {
  LeaveRequest,
  CreateLeaveRequestDTO,
  LeaveBalance,
  LeaveListResponse,
} from '../types/leave.types';

export class LeaveAPI extends BaseAPI {
  /**
   * Apply for leave
   */
  async applyLeave(data: CreateLeaveRequestDTO): Promise<LeaveRequest> {
    try {
      this.logger.step(1, `Applying leave from ${data.fromDate} to ${data.toDate}`);
      const response = await this.post<{ data: LeaveRequest }>('/api/v2/leave/leave-requests', {
        data,
      });
      const leaveRequest = response.data;
      this.logger.info(`✓ Leave request created: ${leaveRequest.id}`);
      return leaveRequest;
    } catch (error) {
      this.logger.error('Failed to apply leave', error);
      throw error;
    }
  }

  /**
   * Get leave request by ID
   */
  async getLeaveRequest(leaveRequestId: number): Promise<LeaveRequest> {
    try {
      const response = await this.get<{ data: LeaveRequest }>(
        `/api/v2/leave/leave-requests/${leaveRequestId}`
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get leave request ${leaveRequestId}`, error);
      throw error;
    }
  }

  /**
   * Get leave balance for an employee
   */
  async getLeaveBalance(employeeId: number, leaveTypeId: number): Promise<LeaveBalance> {
    try {
      const response = await this.get<{ data: LeaveBalance }>(
        `/api/v2/leave/employees/${employeeId}/leave-balance?leaveTypeId=${leaveTypeId}`
      );
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get leave balance for employee ${employeeId}`, error);
      throw error;
    }
  }

  /**
   * Approve a leave request
   */
  async approveLeave(leaveRequestId: number): Promise<void> {
    try {
      this.logger.step(1, `Approving leave request ${leaveRequestId}`);
      await this.post(`/api/v2/leave/leave-requests/${leaveRequestId}/approve`, {
        data: {},
      });
      this.logger.info(`✓ Leave approved`);
    } catch (error) {
      this.logger.error(`Failed to approve leave ${leaveRequestId}`, error);
      throw error;
    }
  }

  /**
   * Reject a leave request
   */
  async rejectLeave(leaveRequestId: number, reason: string): Promise<void> {
    try {
      this.logger.step(1, `Rejecting leave request ${leaveRequestId}`);
      await this.post(`/api/v2/leave/leave-requests/${leaveRequestId}/reject`, {
        data: { reason },
      });
      this.logger.info(`✓ Leave rejected`);
    } catch (error) {
      this.logger.error(`Failed to reject leave ${leaveRequestId}`, error);
      throw error;
    }
  }

  /**
   * Get list of leave requests
   */
  async getLeaveList(filters?: {
    employeeId?: number;
    status?: string;
  }): Promise<LeaveListResponse> {
    try {
      let endpoint = '/api/v2/leave/leave-requests';

      if (filters) {
        const queryParams = new URLSearchParams(
          Object.entries(filters).reduce(
            (acc, [key, value]) => {
              if (value !== undefined && value !== null) {
                acc[key] = String(value);
              }
              return acc;
            },
            {} as Record<string, string>
          )
        ).toString();

        if (queryParams) {
          endpoint += `?${queryParams}`;
        }
      }

      const response = await this.get<LeaveListResponse>(endpoint);
      return response;
    } catch (error) {
      this.logger.error('Failed to get leave list', error);
      throw error;
    }
  }

  /**
   * Cancel a leave request
   */
  async cancelLeave(leaveRequestId: number): Promise<void> {
    try {
      this.logger.step(1, `Cancelling leave request ${leaveRequestId}`);
      await this.delete(`/api/v2/leave/leave-requests/${leaveRequestId}`);
      this.logger.info(`✓ Leave cancelled`);
    } catch (error) {
      this.logger.error(`Failed to cancel leave ${leaveRequestId}`, error);
      throw error;
    }
  }
}
