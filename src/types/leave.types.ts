/**
 * Leave management related types and interfaces
 */

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'TAKEN' | 'CANCELLED';

export interface LeaveRequest {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  leaveTypeName: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  status: LeaveStatus;
  comment?: string;
  appliedDate: string;
  approvedDate?: string;
  approvedBy?: string;
  rejectionReason?: string;
  numberOfDays: number;
}

export interface CreateLeaveRequestDTO {
  employeeId: number;
  leaveTypeId: number;
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
  comment?: string;
}

export interface ApproveLeaveDTO {
  leaveRequestId: number;
  approvalDate?: string;
}

export interface RejectLeaveDTO {
  leaveRequestId: number;
  reason: string;
}

export interface LeaveBalance {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  leaveTypeName: string;
  balance: number;
  startDate: string;
  endDate: string;
}

export interface LeaveType {
  id: number;
  name: string;
  description?: string;
  isActive: boolean;
}

export interface LeaveResponse<T = LeaveRequest> {
  data: T;
  success: boolean;
  message?: string;
}

export interface LeaveListResponse {
  data: LeaveRequest[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface LeaveSearchDTO {
  employeeId?: number;
  status?: LeaveStatus;
  fromDate?: string;
  toDate?: string;
}
