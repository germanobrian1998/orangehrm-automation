/**
 * HRM API Suite - Department TypeScript interfaces
 */

export interface Department {
  id: number;
  name: string;
  parentId?: number;
  parentName?: string;
  headId?: number;
  headName?: string;
}

export interface CreateDepartmentDTO {
  name: string;
  parentId?: number;
  headId?: number;
}

export interface UpdateDepartmentDTO {
  name?: string;
  parentId?: number;
  headId?: number;
}

export interface DepartmentListResponse {
  data: Department[];
  meta: {
    total: number;
    limit?: number;
    offset?: number;
  };
}

export interface DepartmentEmployee {
  empNumber: number;
  firstName: string;
  lastName: string;
  employeeId: string;
  jobTitle?: string;
}

export interface DepartmentApiResponse<T> {
  data: T;
  meta?: Record<string, unknown>;
}
