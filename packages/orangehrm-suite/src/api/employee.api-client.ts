/**
 * OrangeHRM Suite - Employee API Client
 * Extends BaseApiClient from @qa-framework/core with OrangeHRM-specific employee endpoints.
 */

import { Page } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';

export interface Employee {
  empNumber: number;
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId: string;
  email?: string;
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
}

export interface EmployeeSearchDTO {
  name?: string;
  employeeId?: string;
  limit?: number;
  offset?: number;
}

export interface EmployeeListResponse {
  data: Employee[];
  meta: {
    total: number;
  };
}

export class EmployeeAPIClient extends BaseApiClient {
  constructor(page: Page) {
    super(page);
  }

  /** Create a new employee via API */
  async createEmployee(data: CreateEmployeeDTO): Promise<Employee> {
    try {
      this.logger.step(1, 'Creating employee via API');
      const response = await this.post<{ data: Employee }>('/api/v2/pim/employees', data);
      this.logger.info(`✓ Employee created: ${response.data?.empNumber}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create employee', error);
      throw error;
    }
  }

  /** Get employee by ID */
  async getEmployee(employeeId: number): Promise<Employee> {
    try {
      const response = await this.get<{ data: Employee }>(`/api/v2/pim/employees/${employeeId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get employee ${employeeId}`, error);
      throw error;
    }
  }

  /** Update employee data */
  async updateEmployee(employeeId: number, data: UpdateEmployeeDTO): Promise<Employee> {
    try {
      this.logger.step(1, `Updating employee ${employeeId}`);
      const response = await this.put<{ data: Employee }>(`/api/v2/pim/employees/${employeeId}`, data);
      this.logger.info('✓ Employee updated');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update employee ${employeeId}`, error);
      throw error;
    }
  }

  /** Delete employee */
  async deleteEmployee(employeeId: number): Promise<void> {
    try {
      this.logger.step(1, `Deleting employee ${employeeId}`);
      await this.delete(`/api/v2/pim/employees/${employeeId}`);
      this.logger.info('✓ Employee deleted');
    } catch (error) {
      this.logger.error(`Failed to delete employee ${employeeId}`, error);
      throw error;
    }
  }

  /** Search employees with filters */
  async searchEmployees(filters: EmployeeSearchDTO): Promise<Employee[]> {
    try {
      const params = new URLSearchParams(
        Object.entries(filters).reduce(
          (acc, [key, value]) => {
            if (value !== undefined && value !== null) acc[key] = String(value);
            return acc;
          },
          {} as Record<string, string>
        )
      ).toString();

      const endpoint = `/api/v2/pim/employees${params ? `?${params}` : ''}`;
      const response = await this.get<EmployeeListResponse>(endpoint);
      return response.data || [];
    } catch (error) {
      this.logger.error('Failed to search employees', error);
      throw error;
    }
  }

  /** Get paginated employee list */
  async getEmployeeList(pageNumber: number = 1, pageSize: number = 50): Promise<EmployeeListResponse> {
    try {
      const response = await this.get<EmployeeListResponse>(
        `/api/v2/pim/employees?limit=${pageSize}&offset=${(pageNumber - 1) * pageSize}`
      );
      return response;
    } catch (error) {
      this.logger.error('Failed to get employee list', error);
      throw error;
    }
  }
}
