/**
 * OrangeHRM API Suite - Employee TypeScript interfaces
 */

export interface Employee {
  empNumber: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId: string;
  email?: string;
  workEmail?: string;
  jobTitle?: string;
  department?: string;
  status?: 'active' | 'inactive';
  hireDate?: string;
}

export interface CreateEmployeeDTO {
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId: string;
}

export interface UpdateEmployeeDTO {
  firstName?: string;
  lastName?: string;
  middleName?: string;
  email?: string;
  jobTitle?: string;
}

export interface ContactInfoDTO {
  street1?: string;
  street2?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  country?: string;
  phone?: string;
  mobile?: string;
  workPhone?: string;
  email?: string;
  workEmail?: string;
}

export interface EmployeeSearchDTO {
  name?: string;
  employeeId?: string;
  departmentId?: number;
  limit?: number;
  offset?: number;
}

export interface EmployeeListResponse {
  data: Employee[];
  meta: {
    total: number;
    limit?: number;
    offset?: number;
  };
}
