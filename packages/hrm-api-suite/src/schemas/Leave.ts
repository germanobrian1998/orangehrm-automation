/**
 * HRM API Suite - Leave TypeScript interfaces
 */

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'TAKEN';

export interface LeaveType {
  id: number;
  name: string;
  situational?: boolean;
  deleted?: boolean;
}

export interface LeaveRequest {
  id: number;
  employeeId: number;
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  comment?: string;
  status: LeaveStatus;
  days: number;
}

export interface CreateLeaveRequestDTO {
  employeeId: number;
  leaveTypeId: number;
  fromDate: string;
  toDate: string;
  comment?: string;
}

export interface UpdateLeaveRequestDTO {
  status?: LeaveStatus;
  comment?: string;
}

export interface LeaveListResponse {
  data: LeaveRequest[];
  meta: {
    total: number;
    limit?: number;
    offset?: number;
  };
}

export interface LeaveBalance {
  leaveTypeId: number;
  leaveTypeName: string;
  balance: number;
  used: number;
  scheduled: number;
  pending: number;
  taken: number;
}

export interface LeaveApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}
