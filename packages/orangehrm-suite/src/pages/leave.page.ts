/**
 * OrangeHRM Suite - Leave Page Object
 */

import { Page } from '@playwright/test';
import { BasePage, constants } from '@qa-framework/core';
import { selectors } from '../selectors';

export interface LeaveRequestData {
  leaveType: string;
  fromDate: string;
  toDate: string;
  comment?: string;
}

export interface LeaveBalanceEntry {
  leaveTypeId: number;
  leaveTypeName: string;
  balance: number;
  used: number;
  scheduled: number;
  pending: number;
  taken: number;
}

export type LeaveStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'CANCELLED' | 'TAKEN';

export class LeavePage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async goToApplyLeave(): Promise<void> {
    try {
      this.logger.step(1, 'Navigating to Apply Leave');
      await this.goto('/leave/applyLeave');
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Navigated to Apply Leave');
    } catch (error) {
      this.logger.error('Failed to navigate to Apply Leave', error);
      throw error;
    }
  }

  async goToMyLeave(): Promise<void> {
    try {
      this.logger.step(1, 'Navigating to My Leave list');
      await this.goto('/leave/viewMyLeaveList');
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Navigated to My Leave list');
    } catch (error) {
      this.logger.error('Failed to navigate to My Leave list', error);
      throw error;
    }
  }

  async goToLeaveList(): Promise<void> {
    try {
      this.logger.step(1, 'Navigating to Leave list (admin view)');
      await this.goto('/leave/viewLeaveList');
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Navigated to Leave list');
    } catch (error) {
      this.logger.error('Failed to navigate to Leave list', error);
      throw error;
    }
  }

  async fillLeaveRequestForm(data: LeaveRequestData): Promise<void> {
    try {
      this.logger.step(1, 'Filling leave request form');
      await this.click(selectors.leave.leaveTypeSelect);
      await this.click(selectors.leave.leaveTypeOption(data.leaveType));
      await this.fill(selectors.leave.fromDateInput, data.fromDate);
      await this.fill(selectors.leave.toDateInput, data.toDate);

      if (data.comment) {
        await this.fill(selectors.leave.commentTextarea, data.comment);
      }

      this.logger.info('✓ Leave request form filled');
    } catch (error) {
      this.logger.error('Failed to fill leave request form', error);
      throw error;
    }
  }

  async submitLeaveRequest(data: LeaveRequestData): Promise<void> {
    try {
      this.logger.step(1, 'Submitting leave request');
      await this.goToApplyLeave();
      await this.fillLeaveRequestForm(data);
      await this.click(selectors.leave.submitButton);
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Leave request submitted');
    } catch (error) {
      this.logger.error('Failed to submit leave request', error);
      throw error;
    }
  }

  async approveLeaveRequest(leaveId: string): Promise<void> {
    try {
      this.logger.step(1, `Approving leave request ${leaveId}`);
      await this.goToLeaveList();
      const row = selectors.leave.leaveRow(leaveId);
      await this.waitFor.elementVisible(row);
      await this.click(row);
      await this.click(selectors.leave.approveButton);
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Leave request ${leaveId} approved`);
    } catch (error) {
      this.logger.error(`Failed to approve leave request ${leaveId}`, error);
      throw error;
    }
  }

  async rejectLeaveRequest(leaveId: string, reason: string): Promise<void> {
    try {
      this.logger.step(1, `Rejecting leave request ${leaveId}`);
      await this.goToLeaveList();
      const row = selectors.leave.leaveRow(leaveId);
      await this.waitFor.elementVisible(row);
      await this.click(row);
      await this.click(selectors.leave.rejectButton);
      await this.waitFor.elementVisible(selectors.leave.rejectReasonTextarea, constants.TIMEOUTS.SHORT);
      await this.fill(selectors.leave.rejectReasonTextarea, reason);
      await this.click(selectors.leave.confirmRejectButton);
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Leave request ${leaveId} rejected with reason`);
    } catch (error) {
      this.logger.error(`Failed to reject leave request ${leaveId}`, error);
      throw error;
    }
  }

  async cancelLeaveRequest(leaveId: string): Promise<void> {
    try {
      this.logger.step(1, `Cancelling leave request ${leaveId}`);
      await this.goToMyLeave();
      const row = selectors.leave.leaveRow(leaveId);
      await this.waitFor.elementVisible(row);
      await this.click(row);
      await this.click(selectors.leave.cancelLeaveButton);
      await this.click(selectors.common.confirmButton);
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Leave request ${leaveId} cancelled`);
    } catch (error) {
      this.logger.error(`Failed to cancel leave request ${leaveId}`, error);
      throw error;
    }
  }

  async getLeaveStatus(leaveId: string): Promise<string> {
    try {
      const statusText = await this.getText(selectors.leave.leaveStatus(leaveId));
      this.logger.info(`✓ Leave ${leaveId} status: ${statusText}`);
      return statusText;
    } catch (error) {
      this.logger.error(`Failed to get status for leave ${leaveId}`, error);
      throw error;
    }
  }

  async getLeaveBalance(): Promise<boolean> {
    try {
      this.logger.step(1, 'Navigating to leave entitlements / balance page');
      await this.goto('/leave/viewLeaveEntitlements');
      await this.waitFor.loadingComplete();
      const isVisible = await this.isVisible(selectors.leave.leaveBalanceTable);
      this.logger.info(`✓ Leave balance table ${isVisible ? 'visible' : 'not visible'}`);
      return isVisible;
    } catch (error) {
      this.logger.error('Failed to get leave balance', error);
      throw error;
    }
  }

  async isOverlapErrorDisplayed(): Promise<boolean> {
    try {
      return await this.isVisible(selectors.leave.overlapError);
    } catch {
      return false;
    }
  }
}
