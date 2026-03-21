/**
 * Leave Request Page Object
 * Handles leave application and management UI
 */

import { Page } from '@playwright/test';
import { BasePage } from './base.page';
import { selectors } from '@config/selectors';
import { constants } from '@config/constants';

export interface LeaveFormData {
  leaveType: string;
  fromDate: string; // YYYY-MM-DD
  toDate: string;   // YYYY-MM-DD
  comment?: string;
}

export class LeaveRequestPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to apply leave page
   */
  async goToApplyLeave(): Promise<void> {
    try {
      this.logger.step(1, 'Navigating to Apply Leave page');
      await this.goto('/leave/applyLeaveRequest');
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Navigated to Apply Leave page`);
    } catch (error) {
      this.logger.error('Failed to navigate to Apply Leave', error);
      throw error;
    }
  }

  /**
   * Fill leave form
   */
  async fillLeaveForm(data: LeaveFormData): Promise<void> {
    try {
      this.logger.step(1, 'Filling leave form');

      // Select leave type (dropdown)
      await this.click(selectors.leave.leaveTypeSelect);
      await this.page.getByText(data.leaveType).click();
      this.logger.debug(`Leave type selected: ${data.leaveType}`);

      // Fill from date
      const fromDateInputs = await this.page.locator(selectors.leave.fromDateInput).all();
      if (fromDateInputs.length > 0) {
        await fromDateInputs[0].fill(data.fromDate);
        this.logger.debug(`From date filled: ${data.fromDate}`);
      }

      // Fill to date
      const toDateInputs = await this.page.locator(selectors.leave.toDateInput).all();
      if (toDateInputs.length > 0) {
        await toDateInputs[toDateInputs.length - 1].fill(data.toDate);
        this.logger.debug(`To date filled: ${data.toDate}`);
      }

      // Fill comment if provided
      if (data.comment) {
        await this.fill(selectors.leave.commentTextarea, data.comment);
        this.logger.debug('Comment filled');
      }

      this.logger.info(`✓ Leave form filled`);
    } catch (error) {
      this.logger.error('Failed to fill leave form', error);
      throw error;
    }
  }

  /**
   * Submit leave form
   */
  async submitLeaveForm(): Promise<void> {
    try {
      this.logger.step(1, 'Submitting leave form');
      await this.click(selectors.leave.submitButton);
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Leave form submitted`);
    } catch (error) {
      this.logger.error('Failed to submit leave form', error);
      throw error;
    }
  }

  /**
   * Apply for leave (combined flow)
   */
  async applyLeave(data: LeaveFormData): Promise<void> {
    try {
      this.logger.step(1, 'Applying for leave');
      await this.goToApplyLeave();
      await this.fillLeaveForm(data);
      await this.submitLeaveForm();
      this.logger.info(`✓ Leave application submitted`);
    } catch (error) {
      this.logger.error('Failed to apply for leave', error);
      throw error;
    }
  }

  /**
   * Navigate to leave list
   */
  async goToLeaveList(): Promise<void> {
    try {
      this.logger.step(1, 'Navigating to Leave List');
      await this.goto('/leave/viewLeaveList');
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Navigated to Leave List`);
    } catch (error) {
      this.logger.error('Failed to navigate to Leave List', error);
      throw error;
    }
  }

  /**
   * Get validation error message
   */
  async getFieldError(): Promise<string> {
    try {
      const errorSelector = selectors.common.errorAlert;
      await this.waitFor.elementVisible(errorSelector);
      const errorMessage = await this.getText(errorSelector);
      return errorMessage;
    } catch (error) {
      this.logger.error('Failed to get error message', error);
      throw error;
    }
  }
}