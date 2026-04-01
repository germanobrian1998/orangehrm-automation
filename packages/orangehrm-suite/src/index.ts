/**
 * @qa-framework/orangehrm-suite
 * OrangeHRM-specific page objects, API clients, fixtures and test helpers
 */

export { LoginPage } from './pages/login.page';
export { PimPage } from './pages/pim.page';
export { DashboardPage } from './pages/dashboard.page';
export { LeavePage } from './pages/leave.page';
export { ReportingPage, REPORT_TYPES } from './pages/reporting.page';
export type { DashboardWidget } from './pages/dashboard.page';
export type { LeaveRequestData, LeaveBalanceEntry, LeaveStatus } from './pages/leave.page';
export type {
  ReportFilterData,
  ReportScheduleData,
  ReportExportData,
  CustomFilterData,
  CustomAnalyticsView,
  ReportPermissionData,
  ReportStatus,
  ExportFormat,
  ScheduleFrequency,
  VisibilityLevel,
  ReportType,
} from './pages/reporting.page';
export { EmployeeAPIClient } from './api/employee.api-client';
export type {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  EmployeeSearchDTO,
  EmployeeListResponse,
} from './api/employee.api-client';
