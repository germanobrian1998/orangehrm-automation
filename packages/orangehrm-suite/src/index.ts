/**
 * @qa-framework/orangehrm-suite
 * OrangeHRM-specific page objects, API clients, fixtures and test helpers
 */

export { LoginPage } from './pages/login.page';
export { PimPage } from './pages/pim.page';
export { DashboardPage } from './pages/dashboard.page';
export { LeavePage } from './pages/leave.page';
export type { DashboardWidget } from './pages/dashboard.page';
export type { LeaveRequestData, LeaveBalanceEntry, LeaveStatus } from './pages/leave.page';
export { EmployeeAPIClient } from './api/employee.api-client';
export type {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  EmployeeSearchDTO,
  EmployeeListResponse,
} from './api/employee.api-client';
