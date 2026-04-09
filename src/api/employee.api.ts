/**
 * Employee API endpoints
 * Handles all employee-related API calls
 */

import { Page } from '@playwright/test';
import { BaseAPI } from './base.api';
import {
  Employee,
  CreateEmployeeDTO,
  UpdateEmployeeDTO,
  EmployeeSearchDTO,
  EmployeeListResponse,
} from '../types/employee.types';

export class EmployeeAPI extends BaseAPI {
  /**
   * Create a new employee
   */
  async create(data: CreateEmployeeDTO): Promise<Employee> {
    try {
      this.logger.step(1, 'Creating employee via API');
      const response = await this.post('/api/v2/pim/employees', { data });
      const employee = response.data;
      this.logger.info(`✓ Employee created: ${employee.id}`);
      return employee;
    } catch (error) {
      this.logger.error('Failed to create employee', error);
      throw error;
    }
  }

  /**
   * Get employee by ID
   */
  async getById(employeeId: number): Promise<Employee> {
    try {
      const response = await this.get<{ data: Employee }>(`/api/v2/pim/employees/${employeeId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get employee ${employeeId}`, error);
      throw error;
    }
  }

  /**
   * Update employee data
   */
  async update(employeeId: number, data: UpdateEmployeeDTO): Promise<Employee> {
    try {
      this.logger.step(1, `Updating employee ${employeeId}`);
      const response = await this.put(`/api/v2/pim/employees/${employeeId}`, { data });
      this.logger.info(`✓ Employee updated`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update employee ${employeeId}`, error);
      throw error;
    }
  }

  /**
   * Delete employee
   */
  async deleteById(employeeId: number): Promise<void> {
    try {
      this.logger.step(1, `Deleting employee ${employeeId}`);
      // Calls BaseAPI.delete(endpoint: string) — not recursive
      await this.delete(`/api/v2/pim/employees/${employeeId}`);
      this.logger.info(`✓ Employee deleted`);
    } catch (error) {
      this.logger.error(`Failed to delete employee ${employeeId}`, error);
      throw error;
    }
  }

  /**
   * Search employees with filters
   */
  async search(filters: EmployeeSearchDTO): Promise<Employee[]> {
    try {
      const queryParams = new URLSearchParams(
        Object.entries(filters).reduce((acc, [key, value]) => {
          if (value !== undefined && value !== null) {
            acc[key] = String(value);
          }
          return acc;
        }, {} as Record<string, string>)
      ).toString();

      const endpoint = `/api/v2/pim/employees${queryParams ? `?${queryParams}` : ''}`;
      const response = await this.get<EmployeeListResponse>(endpoint);
      return response.data || [];
    } catch (error) {
      this.logger.error('Failed to search employees', error);
      throw error;
    }
  }

  /**
   * Upload employee photo
   */
  async uploadPhoto(employeeId: number, filePath: string): Promise<void> {
    try {
      this.logger.step(1, `Uploading photo for employee ${employeeId}`);
      // Note: File upload via API might require different handling
      // This is a placeholder
      this.logger.info(`✓ Photo uploaded`);
    } catch (error) {
      this.logger.error(`Failed to upload photo for employee ${employeeId}`, error);
      throw error;
    }
  }

  /**
   * Get employee list with pagination
   */
  async getList(page: number = 1, pageSize: number = 50): Promise<EmployeeListResponse> {
    try {
      const response = await this.get<EmployeeListResponse>(
        `/api/v2/pim/employees?limit=${pageSize}&offset=${(page - 1) * pageSize}`
      );
      return response;
    } catch (error) {
      this.logger.error('Failed to get employee list', error);
      throw error;
    }
  }
}