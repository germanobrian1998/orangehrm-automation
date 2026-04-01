/**
 * OrangeHRM Suite - Dashboard Page Object
 */

import { Page } from '@playwright/test';
import { BasePage } from '@qa-framework/core';
import { selectors } from '../selectors';

export interface DashboardWidget {
  name: string;
  selector: string;
}

export const DASHBOARD_WIDGETS: DashboardWidget[] = [
  { name: 'Quick Launch', selector: selectors.dashboard.quickLaunchWidget },
  { name: 'Time at Work', selector: selectors.dashboard.timeAtWorkWidget },
  { name: 'My Actions', selector: selectors.dashboard.myActionsWidget },
  { name: 'Employees on Leave', selector: selectors.dashboard.employeesOnLeaveWidget },
];

export class DashboardPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    try {
      this.logger.step(1, 'Navigating to Dashboard');
      await this.goto('/dashboard/index');
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Navigated to Dashboard');
    } catch (error) {
      this.logger.error('Failed to navigate to Dashboard', error);
      throw error;
    }
  }

  async isDashboardLoaded(): Promise<boolean> {
    try {
      return await this.isVisible(selectors.dashboard.heading);
    } catch {
      return false;
    }
  }

  async isWidgetVisible(widgetSelector: string): Promise<boolean> {
    try {
      return await this.isVisible(widgetSelector);
    } catch {
      return false;
    }
  }

  async getQuickLaunchLinks(): Promise<string[]> {
    try {
      this.logger.step(1, 'Getting quick launch links');
      const items = await this.page.locator(selectors.dashboard.quickLaunchLinks).allTextContents();
      this.logger.info(`✓ Found ${items.length} quick launch links`);
      return items.map((text) => text.trim()).filter(Boolean);
    } catch (error) {
      this.logger.error('Failed to get quick launch links', error);
      throw error;
    }
  }

  async clickQuickLaunchLink(linkText: string): Promise<void> {
    try {
      this.logger.step(1, `Clicking quick launch link: ${linkText}`);
      await this.click(`p:has-text("${linkText}")`);
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Clicked quick launch link: ${linkText}`);
    } catch (error) {
      this.logger.error(`Failed to click quick launch link: ${linkText}`, error);
      throw error;
    }
  }

  async getDashboardHeadingText(): Promise<string> {
    try {
      const text = await this.getText(selectors.dashboard.heading);
      this.logger.info(`✓ Dashboard heading: ${text}`);
      return text;
    } catch (error) {
      this.logger.error('Failed to get dashboard heading text', error);
      throw error;
    }
  }
}
