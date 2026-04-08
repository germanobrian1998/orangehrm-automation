/**
 * Admin API endpoints
 * Handles admin-related API calls (users, job titles, etc.)
 */

import { Page } from '@playwright/test';
import { BaseAPI } from './base.api';
import {
  User,
  CreateUserDTO,
  JobTitle,
  CreateJobTitleDTO,
  UserListResponse,
} from '../types/user.types';

export class AdminAPI extends BaseAPI {
  /**
   * Create a new user
   */
  async createUser(data: CreateUserDTO): Promise<User> {
    try {
      this.logger.step(1, `Creating user ${data.username}`);
      const response = await this.post('/api/v2/admin/users', { data });
      const user = response.data;
      this.logger.info(`✓ User created: ${user.id}`);
      return user;
    } catch (error) {
      this.logger.error('Failed to create user', error);
      throw error;
    }
  }

  /**
   * Get user by ID
   */
  async getUser(userId: number): Promise<User> {
    try {
      const response = await this.get(`/api/v2/admin/users/${userId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Delete user
   */
  async deleteUser(userId: number): Promise<void> {
    try {
      this.logger.step(1, `Deleting user ${userId}`);
      await this.delete(`/api/v2/admin/users/${userId}`);
      this.logger.info(`✓ User deleted`);
    } catch (error) {
      this.logger.error(`Failed to delete user ${userId}`, error);
      throw error;
    }
  }

  /**
   * Get list of users
   */
  async getUserList(page: number = 1, pageSize: number = 50): Promise<UserListResponse> {
    try {
      const response = await this.get<UserListResponse>(
        `/api/v2/admin/users?limit=${pageSize}&offset=${(page - 1) * pageSize}`
      );
      return response;
    } catch (error) {
      this.logger.error('Failed to get user list', error);
      throw error;
    }
  }

  /**
   * Create a job title
   */
  async createJobTitle(data: CreateJobTitleDTO): Promise<JobTitle> {
    try {
      this.logger.step(1, `Creating job title: ${data.title}`);
      const response = await this.post('/api/v2/admin/job-titles', { data });
      const jobTitle = response.data;
      this.logger.info(`✓ Job title created: ${jobTitle.id}`);
      return jobTitle;
    } catch (error) {
      this.logger.error('Failed to create job title', error);
      throw error;
    }
  }

  /**
   * Get job title by ID
   */
  async getJobTitle(jobTitleId: number): Promise<JobTitle> {
    try {
      const response = await this.get(`/api/v2/admin/job-titles/${jobTitleId}`);
      return response.data;
    } catch (error) {
      this.logger.error(`Failed to get job title ${jobTitleId}`, error);
      throw error;
    }
  }

  /**
   * Delete job title
   */
  async deleteJobTitle(jobTitleId: number): Promise<void> {
    try {
      this.logger.step(1, `Deleting job title ${jobTitleId}`);
      await this.delete(`/api/v2/admin/job-titles/${jobTitleId}`);
      this.logger.info(`✓ Job title deleted`);
    } catch (error) {
      this.logger.error(`Failed to delete job title ${jobTitleId}`, error);
      throw error;
    }
  }
}