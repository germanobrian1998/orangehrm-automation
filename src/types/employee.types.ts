/**
 * Employee-related types and interfaces
 */

export interface Employee {
  id: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId: string;
  email?: string;
  dateOfBirth?: string;
  nationality?: string;
  maritalStatus?: string;
  gender?: 'Male' | 'Female';
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateEmployeeDTO {
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId: string;
  email?: string;
  dateOfBirth?: string;
  nationality?: string;
  maritalStatus?: string;
  gender?: 'Male' | 'Female';
}

export interface UpdateEmployeeDTO {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  dateOfBirth?: string;
  nationality?: string;
  maritalStatus?: string;
  gender?: 'Male' | 'Female';
}

export interface EmployeeSearchDTO {
  employeeId?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

export interface EmployeePhotoDTO {
  photo: Buffer;
  fileName: string;
}

export interface EmployeeResponse<T = Employee> {
  data: T;
  success: boolean;
  message?: string;
}

export interface EmployeeListResponse {
  data: Employee[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
}