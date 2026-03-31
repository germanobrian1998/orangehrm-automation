/**
 * HRM API Suite - Department API Client
 * Extends BaseApiClient with OrangeHRM department management endpoints.
 */

import { Page } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import {
  Department,
  CreateDepartmentDTO,
  UpdateDepartmentDTO,
  DepartmentListResponse,
  DepartmentEmployee,
} from '../schemas/Department';

export class DepartmentAPIClient extends BaseApiClient {
  constructor(page: Page) {
    super(page);
  }

  /** Get a specific department by ID */
  async getDepartment(id: number): Promise<Department> {
    try {
      const response = await this.get<{ data: Department }>(`/api/v2/admin/subunits/${id}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get department ${id}`, error);
      throw error;
    }
  }

  /** List all departments */
  async listDepartments(limit: number = 50, offset: number = 0): Promise<DepartmentListResponse> {
    try {
      const response = await this.get<DepartmentListResponse>(
        `/api/v2/admin/subunits?limit=${limit}&offset=${offset}`
      );
      return response;
    } catch (error) {
      this.logger.error('Failed to list departments', error);
      throw error;
    }
  }

  /** Create a new department */
  async createDepartment(department: CreateDepartmentDTO): Promise<Department> {
    try {
      this.logger.step(1, 'Creating department via API');
      const response = await this.post<{ data: Department }>('/api/v2/admin/subunits', department);
      this.logger.info(`✓ Department created: ${response.data?.id}`);
      return response.data;
    } catch (error) {
      this.logger.error('Failed to create department', error);
      throw error;
    }
  }

  /** Update an existing department */
  async updateDepartment(id: number, department: UpdateDepartmentDTO): Promise<Department> {
    try {
      this.logger.step(1, `Updating department ${id}`);
      const response = await this.put<{ data: Department }>(
        `/api/v2/admin/subunits/${id}`,
        department
      );
      this.logger.info('✓ Department updated');
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to update department ${id}`, error);
      throw error;
    }
  }

  /** Delete a department by ID */
  async deleteDepartment(id: number): Promise<void> {
    try {
      this.logger.step(1, `Deleting department ${id}`);
      await this.delete(`/api/v2/admin/subunits/${id}`);
      this.logger.info('✓ Department deleted');
    } catch (error) {
      this.logger.error(`Failed to delete department ${id}`, error);
      throw error;
    }
  }

  /** Get employees in a department */
  async getDepartmentEmployees(departmentId: number): Promise<DepartmentEmployee[]> {
    try {
      const response = await this.get<{ data: DepartmentEmployee[] }>(
        `/api/v2/admin/subunits/${departmentId}/employees`
      );
      return response.data || [];
    } catch (error) {
      this.logger.error(`Failed to get employees for department ${departmentId}`, error);
      throw error;
    }
  }
}
