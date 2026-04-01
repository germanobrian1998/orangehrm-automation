/**
 * @qa-framework/orangehrm-api-suite
 * OrangeHRM comprehensive REST API test suite - clients, schemas, and validators
 */

// API Clients
export { AuthAPIClient } from './clients/AuthAPIClient';
export { EmployeeAPIClient } from './clients/EmployeeAPIClient';
export { LeaveAPIClient } from './clients/LeaveAPIClient';

// Auth Schemas
export type {
  AuthToken,
  AuthResponse,
  LoginCredentials,
  RefreshTokenRequest,
  VerifyTokenResponse,
} from './schemas/Auth';

// Employee Schemas
export type {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  ContactInfoDTO,
  EmployeeSearchDTO,
  EmployeeListResponse,
} from './schemas/Employee';

// Leave Schemas
export type {
  LeaveStatus,
  LeaveType,
  LeaveRequest,
  CreateLeaveRequestDTO,
  UpdateLeaveRequestDTO,
  LeaveListResponse,
  LeaveBalance,
} from './schemas/Leave';
