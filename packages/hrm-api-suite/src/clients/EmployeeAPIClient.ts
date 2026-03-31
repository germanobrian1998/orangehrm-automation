/**
 * HRM API Suite - Employee API Client
 * Extends BaseApiClient with OrangeHRM employee endpoints.
 */

import { Page } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  EmployeeSearchDTO,
  EmployeeListResponse,
} from '../schemas/Employee';

export class EmployeeAPIClient extends BaseApiClient {
  constructor(page: Page) {
    super(page);
  }

  /** Get a single employee by ID */
  async getEmployee(id: number): Promise<Employee> {
    try {
      const response = await this.get<{ data: Employee }>(`/api/v2/pim/employees/${id}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get employee ${id}`, error);
      throw error;
    }
  }

  /** List employees with optional pagination */
  async listEmployees(limit: number = 50, offset: number = 0): Promise<EmployeeListResponse> {
    try {
      const response = await this.get<EmployeeListResponse>(
        `/api/v2/pim/employees?limit=${limit}&offset=${offset}`
      );
      return response;
    } catch (error) {
      this.logger.error('Failed to list employees', error);
      throw error;
    }
  }

  /** Create a new employee */
  async createEmployee(employee: CreateEmployeeDTO): Promise<Employee> {
    try {
      this.logger.step(1, 'Creating employee via API');
      const response = await this.post<{ data: Employee }>('/api/v2/pim/employees', employee);
      this.logger.info(`✓ Employee created: ${response.data?.empNumber}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create employee', error);
      throw error;
    }
  }

  /** Update an existing employee */
  async updateEmployee(id: number, employee: UpdateEmployeeDTO): Promise<Employee> {
    try {
      this.logger.step(1, `Updating employee ${id}`);
      const response = await this.put<{ data: Employee }>(`/api/v2/pim/employees/${id}`, employee);
      this.logger.info('✓ Employee updated');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update employee ${id}`, error);
      throw error;
    }
  }

  /** Delete an employee by ID */
  async deleteEmployee(id: number): Promise<void> {
    try {
      this.logger.step(1, `Deleting employee ${id}`);
      await this.delete(`/api/v2/pim/employees/${id}`);
      this.logger.info('✓ Employee deleted');
    } catch (error) {
      this.logger.error(`Failed to delete employee ${id}`, error);
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
}
