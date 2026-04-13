/**
 * Navigation Bar Component
 * Shared across all pages
 */

import { Page } from '@playwright/test';
import { BasePage } from '../base.page';
import { selectors } from '@config/selectors';

export class NavBar extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  /**
   * Click on PIM menu
   */
  async clickPIM(): Promise<void> {
    try {
      await this.click(selectors.pim.sidebarLink);
      this.logger.info(`✓ PIM menu clicked`);
    } catch (error) {
      this.logger.error('Failed to click PIM menu', error);
      throw error;
    }
  }

  /**
   * Click on Leave menu
   */
  async clickLeave(): Promise<void> {
    try {
      await this.click(selectors.leave.sidebarLink);
      this.logger.info(`✓ Leave menu clicked`);
    } catch (error) {
      this.logger.error('Failed to click Leave menu', error);
      throw error;
    }
  }

  /**
   * Click on Admin menu
   */
  async clickAdmin(): Promise<void> {
    try {
      await this.click(selectors.admin.sidebarLink);
      this.logger.info(`✓ Admin menu clicked`);
    } catch (error) {
      this.logger.error('Failed to click Admin menu', error);
      throw error;
    }
  }
}
