/**
 * Example: Custom Page Object
 *
 * Demonstrates how to create a custom page object by extending BasePage.
 * This example implements a hypothetical "Job Titles" admin page.
 */

import { Page } from '@playwright/test';
import { BasePage } from '@qa-framework/core';

// ── Interfaces ──────────────────────────────────────────────────────────────

export interface JobTitle {
  title: string;
  description?: string;
  note?: string;
}

// ── Selectors ────────────────────────────────────────────────────────────────
// In a real project, these would live in src/selectors.ts

const jobTitleSelectors = {
  sidebarLink:      'a:has-text("Admin")',
  jobTitlesMenu:    'a:has-text("Job")',
  jobTitlesLink:    'a:has-text("Job Titles")',
  addButton:        'button:has-text("Add")',
  titleInput:       'input[name="jobTitle"]',
  descriptionInput: 'textarea[name="jobDescription"]',
  noteInput:        'textarea[name="note"]',
  saveButton:       'button[type="submit"]',
  successToast:     '.oxd-toast--success',
  tableBody:        '.oxd-table-body',
  tableRow:         (title: string) => `.oxd-table-body .oxd-table-row:has-text("${title}")`,
  deleteButton:     'button:has-text("Delete")',
  confirmButton:    '.orangehrm-modal-footer button:has-text("Yes, Delete")',
  noRecords:        '.oxd-table-card p:has-text("No Records Found")',
};

// ── Page Object ──────────────────────────────────────────────────────────────

/**
 * JobTitlesPage
 *
 * Encapsulates all interactions with the Admin > Job > Job Titles page.
 * Extends BasePage to inherit logging, waiting, and screenshot utilities.
 */
export class JobTitlesPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Navigate to Admin → Job → Job Titles.
   */
  async navigate(): Promise<void> {
    try {
      this.logger.step(1, 'Navigating to Job Titles page');
      await this.click(jobTitleSelectors.sidebarLink);
      await this.waitFor.loadingComplete();
      await this.click(jobTitleSelectors.jobTitlesMenu);
      await this.click(jobTitleSelectors.jobTitlesLink);
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Navigated to Job Titles page');
    } catch (error) {
      this.logger.error('Failed to navigate to Job Titles page', error);
      await this.screenshot('navigate_failure');
      throw error;
    }
  }

  /**
   * Add a new job title.
   *
   * @param jobTitle - The job title data to create.
   */
  async addJobTitle(jobTitle: JobTitle): Promise<void> {
    try {
      this.logger.step(1, `Adding job title: ${jobTitle.title}`);

      await this.click(jobTitleSelectors.addButton);
      await this.fill(jobTitleSelectors.titleInput, jobTitle.title);

      if (jobTitle.description) {
        await this.fill(jobTitleSelectors.descriptionInput, jobTitle.description);
      }

      if (jobTitle.note) {
        await this.fill(jobTitleSelectors.noteInput, jobTitle.note);
      }

      await this.click(jobTitleSelectors.saveButton);
      await this.waitFor.elementVisible(jobTitleSelectors.successToast);

      this.logger.info(`✓ Job title "${jobTitle.title}" created successfully`);
    } catch (error) {
      this.logger.error(`Failed to add job title "${jobTitle.title}"`, error);
      await this.screenshot('add_job_title_failure');
      throw error;
    }
  }

  /**
   * Check if a job title exists in the table.
   *
   * @param title - The job title text to look for.
   * @returns true if found, false otherwise.
   */
  async jobTitleExists(title: string): Promise<boolean> {
    try {
      const row = this.page.locator(jobTitleSelectors.tableRow(title));
      return await row.isVisible();
    } catch {
      return false;
    }
  }

  /**
   * Delete a job title by its title text.
   *
   * @param title - The job title to delete.
   */
  async deleteJobTitle(title: string): Promise<void> {
    try {
      this.logger.step(1, `Deleting job title: ${title}`);

      const row = this.page.locator(jobTitleSelectors.tableRow(title));
      await row.locator(jobTitleSelectors.deleteButton).click();

      await this.click(jobTitleSelectors.confirmButton);
      await this.waitFor.loadingComplete();

      this.logger.info(`✓ Job title "${title}" deleted`);
    } catch (error) {
      this.logger.error(`Failed to delete job title "${title}"`, error);
      await this.screenshot('delete_job_title_failure');
      throw error;
    }
  }

  /**
   * Get the total number of job titles displayed in the table.
   */
  async getJobTitleCount(): Promise<number> {
    const rows = await this.page.locator(`${jobTitleSelectors.tableBody} .oxd-table-row`).count();
    this.logger.info(`Job title count: ${rows}`);
    return rows;
  }

  /**
   * Check if the "No Records Found" message is displayed.
   */
  async isEmptyStateVisible(): Promise<boolean> {
    return this.isVisible(jobTitleSelectors.noRecords);
  }
}

// ── Reusable Component Example ────────────────────────────────────────────────

/**
 * ConfirmationDialogComponent
 *
 * Encapsulates interactions with the standard OrangeHRM confirmation modal.
 * Can be composed inside any page object that shows a delete confirmation.
 */
export class ConfirmationDialogComponent extends BasePage {
  private readonly confirmSelector: string;
  private readonly cancelSelector: string;

  constructor(page: Page, confirmSelector: string, cancelSelector: string) {
    super(page);
    this.confirmSelector = confirmSelector;
    this.cancelSelector  = cancelSelector;
  }

  async confirm(): Promise<void> {
    this.logger.step(1, 'Confirming dialog');
    await this.click(this.confirmSelector);
    await this.waitFor.loadingComplete();
    this.logger.info('✓ Confirmation dialog accepted');
  }

  async cancel(): Promise<void> {
    this.logger.step(1, 'Cancelling dialog');
    await this.click(this.cancelSelector);
    this.logger.info('✓ Confirmation dialog cancelled');
  }
}
