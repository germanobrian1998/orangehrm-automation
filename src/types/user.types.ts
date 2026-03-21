/**
 * User and Admin related types
 */

export interface User {
  id: number;
  username: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  employeeId?: number;
  status: 'Enabled' | 'Disabled';
  userRole: UserRole;
  createdAt?: string;
  updatedAt?: string;
}

export interface UserRole {
  id: number;
  name: string;
  permissions?: string[];
}

export interface CreateUserDTO {
  username: string;
  password: string;
  email?: string;
  employeeId?: number;
  userRole?: string;
  status: 'Enabled' | 'Disabled';
}

export interface UpdateUserDTO {
  email?: string;
  firstName?: string;
  lastName?: string;
  status?: 'Enabled' | 'Disabled';
}

export interface ResetPasswordDTO {
  username: string;
  newPassword: string;
  confirmPassword: string;
}

export interface UserResponse<T = User> {
  data: T;
  success: boolean;
  message?: string;
}

export interface UserListResponse {
  data: User[];
  meta?: {
    total: number;
    page: number;
    pageSize: number;
  };
}

export interface JobTitle {
  id: number;
  title: string;
  description?: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface CreateJobTitleDTO {
  title: string;
  description?: string;
  isActive?: boolean;
}

export interface JobTitleResponse<T = JobTitle> {
  data: T;
  success: boolean;
  message?: string;
}