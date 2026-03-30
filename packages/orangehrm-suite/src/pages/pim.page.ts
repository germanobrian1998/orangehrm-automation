/**
 * OrangeHRM Suite - PIM (Personal Information Management) Page Object
 */

import { Page } from '@playwright/test';
import { BasePage } from '@qa-framework/core';
import { selectors } from '../selectors';

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId: string;
  email?: string;
}

export class PimPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goToEmployeeList(): Promise<void> {
    try {
      this.logger.step(1, 'Navigating to Employee List');
      await this.goto('/pim/viewEmployeeList');
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Navigated to Employee List');
    } catch (error) {
      this.logger.error('Failed to navigate to Employee List', error);
      throw error;
    }
  }

  async goToAddEmployee(): Promise<void> {
    try {
      this.logger.step(1, 'Navigating to Add Employee form');
      await this.goto('/pim/addEmployee');
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Navigated to Add Employee form');
    } catch (error) {
      this.logger.error('Failed to navigate to Add Employee form', error);
      throw error;
    }
  }

  async fillEmployeeForm(data: EmployeeFormData): Promise<void> {
    try {
      this.logger.step(1, 'Filling employee form');
      await this.fill(selectors.pim.firstNameInput, data.firstName);
      await this.fill(selectors.pim.lastNameInput, data.lastName);
      await this.fill(selectors.pim.employeeIdInput, data.employeeId);

      if (data.email) {
        await this.fill(selectors.pim.emailInput, data.email);
      }

      if (data.middleName) {
        const isVisible = await this.isVisible('input[placeholder="Middle Name"]');
        if (isVisible) {
          await this.fill('input[placeholder="Middle Name"]', data.middleName);
        }
      }

      this.logger.info('✓ Employee form filled');
    } catch (error) {
      this.logger.error('Failed to fill employee form', error);
      throw error;
    }
  }

  async submitForm(): Promise<void> {
    try {
      this.logger.step(1, 'Submitting employee form');
      await this.click(selectors.pim.saveButton);
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Form submitted');
    } catch (error) {
      this.logger.error('Failed to submit form', error);
      throw error;
    }
  }

  async createEmployee(data: EmployeeFormData): Promise<void> {
    try {
      this.logger.step(1, 'Creating employee via UI');
      await this.goToAddEmployee();
      await this.fillEmployeeForm(data);
      await this.submitForm();
      this.logger.info('✓ Employee created successfully');
    } catch (error) {
      this.logger.error('Failed to create employee', error);
      throw error;
    }
  }

  async searchEmployee(employeeId: string): Promise<void> {
    try {
      this.logger.step(1, `Searching for employee ${employeeId}`);
      await this.goToEmployeeList();
      await this.fill(selectors.pim.firstNameField, employeeId);
      await this.click(selectors.pim.searchButton);
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Search executed');
    } catch (error) {
      this.logger.error('Failed to search employee', error);
      throw error;
    }
  }

  async verifyEmployeeInList(employeeId: string): Promise<boolean> {
    try {
      const rowSelector = selectors.pim.employeeRow(employeeId);
      const exists = await this.isVisible(rowSelector);
      this.logger.info(`✓ Employee ${employeeId} ${exists ? 'found' : 'not found'} in list`);
      return exists;
    } catch (error) {
      this.logger.error('Failed to verify employee in list', error);
      throw error;
    }
  }
}
