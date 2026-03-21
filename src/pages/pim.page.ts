/**
 * PIM (Personal Information Management) Page Object
 * Handles employee-related UI interactions
 */

import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { selectors } from '@config/selectors';
import { constants } from '@config/constants';

export interface EmployeeFormData {
  firstName: string;
  lastName: string;
  middleName?: string;
  employeeId: string;
  email?: string;
}

export class PIMPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to employee list
   */
  async goToEmployeeList(): Promise<void> {
    try {
      this.logger.step(1, 'Navigating to Employee List');
      await this.goto('/pim/viewEmployeeList');
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Navigated to Employee List`);
    } catch (error) {
      this.logger.error('Failed to navigate to Employee List', error);
      throw error;
    }
  }

  /**
   * Navigate to add employee form
   */
  async goToAddEmployee(): Promise<void> {
    try {
      this.logger.step(1, 'Navigating to Add Employee form');
      await this.goto('/pim/addEmployee');
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Navigated to Add Employee form`);
    } catch (error) {
      this.logger.error('Failed to navigate to Add Employee form', error);
      throw error;
    }
  }

  /**
   * Fill employee form
   */
  async fillEmployeeForm(data: EmployeeFormData): Promise<void> {
    try {
      this.logger.step(1, 'Filling employee form');

      await this.fill(selectors.pim.firstNameInput, data.firstName);
      this.logger.debug('First name filled');

      await this.fill(selectors.pim.lastNameInput, data.lastName);
      this.logger.debug('Last name filled');

      await this.fill(selectors.pim.employeeIdInput, data.employeeId);
      this.logger.debug('Employee ID filled');

      if (data.email) {
        await this.fill(selectors.pim.emailInput, data.email);
        this.logger.debug('Email filled');
      }

      if (data.middleName) {
        // Middle name field might not always be visible
        const isVisible = await this.isVisible('input[placeholder="Middle Name"]');
        if (isVisible) {
          await this.fill('input[placeholder="Middle Name"]', data.middleName);
          this.logger.debug('Middle name filled');
        }
      }

      this.logger.info(`✓ Employee form filled`);
    } catch (error) {
      this.logger.error('Failed to fill employee form', error);
      throw error;
    }
  }

  /**
   * Submit employee form
   */
  async submitForm(): Promise<void> {
    try {
      this.logger.step(1, 'Submitting employee form');
      await this.click(selectors.pim.saveButton);
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Form submitted`);
    } catch (error) {
      this.logger.error('Failed to submit form', error);
      throw error;
    }
  }

  /**
   * Create employee (combined flow)
   */
  async createEmployee(data: EmployeeFormData): Promise<void> {
    try {
      this.logger.step(1, 'Creating employee via UI');
      await this.goToAddEmployee();
      await this.fillEmployeeForm(data);
      await this.submitForm();
      this.logger.info(`✓ Employee created successfully`);
    } catch (error) {
      this.logger.error('Failed to create employee', error);
      throw error;
    }
  }

  /**
   * Search for employee
   */
  async searchEmployee(employeeId: string): Promise<void> {
    try {
      this.logger.step(1, `Searching for employee ${employeeId}`);
      await this.goToEmployeeList();
      await this.fill(selectors.pim.firstNameField, employeeId);
      await this.click(selectors.pim.searchButton);
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Search executed`);
    } catch (error) {
      this.logger.error('Failed to search employee', error);
      throw error;
    }
  }

  /**
   * Get validation error message
   */
  async getFieldError(fieldName: string): Promise<string> {
    try {
      const errorSelector = selectors.pim.fieldError(fieldName);
      await this.waitFor.elementVisible(errorSelector);
      const errorMessage = await this.getText(errorSelector);
      return errorMessage;
    } catch (error) {
      this.logger.error(`Failed to get error for field ${fieldName}`, error);
      throw error;
    }
  }

  /**
   * Verify employee exists in table
   */
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

  /**
   * Upload employee photo
   */
  async uploadPhoto(filePath: string): Promise<void> {
    try {
      this.logger.step(1, 'Uploading employee photo');
      await this.page.locator(selectors.pim.photoInput).setInputFiles(filePath);
      this.logger.info(`✓ Photo uploaded`);
    } catch (error) {
      this.logger.error('Failed to upload photo', error);
      throw error;
    }
  }
}