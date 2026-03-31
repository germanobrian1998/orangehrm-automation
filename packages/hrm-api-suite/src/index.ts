/**
 * @qa-framework/hrm-api-suite
 * HRM REST API test suite - clients, schemas, validators and performance helpers
 */

// Legacy client (kept for backward compatibility)
export { HrmApiClient } from './clients/hrm-api.client';

// Focused API clients
export { EmployeeAPIClient } from './clients/EmployeeAPIClient';
export { LeaveAPIClient } from './clients/LeaveAPIClient';
export { DepartmentAPIClient } from './clients/DepartmentAPIClient';

// Schemas
export type {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  EmployeeSearchDTO,
  EmployeeListResponse,
  EmployeeApiResponse,
} from './schemas/Employee';

export type {
  LeaveStatus,
  LeaveType,
  LeaveRequest,
  CreateLeaveRequestDTO,
  UpdateLeaveRequestDTO,
  LeaveListResponse,
  LeaveBalance,
  LeaveApiResponse,
} from './schemas/Leave';

export type {
  Department,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  DepartmentListResponse,
  DepartmentEmployee,
  DepartmentApiResponse,
} from './schemas/Department';

// Fixtures
export {
  employeeFixtures,
  leaveFixtures,
  departmentFixtures,
  paginationFixtures,
  API_ENDPOINTS,
} from './fixtures/apiFixtures';
