/**
 * @qa-framework/orangehrm-suite
 * OrangeHRM-specific page objects, API clients, fixtures and test helpers
 */

export { LoginPage } from './pages/login.page';
export { PimPage } from './pages/pim.page';
export { EmployeeAPIClient } from './api/employee.api-client';
export type {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  EmployeeSearchDTO,
  EmployeeListResponse,
} from './api/employee.api-client';
