/**
 * OrangeHRM Suite - Reporting Page Object
 */

import { Page } from '@playwright/test';
import { BasePage } from '@qa-framework/core';
import { selectors } from '../selectors';

export interface ReportFilterData {
  employeeName?: string;
  department?: string;
  fromDate?: string;
  toDate?: string;
  status?: ReportStatus;
}

export interface ReportScheduleData {
  frequency: ScheduleFrequency;
  day?: string;
  time?: string;
  recipients: string[];
}

export interface ReportExportData {
  reportName: string;
  format: ExportFormat;
}

export interface CustomFilterData {
  filterName: string;
  filters: ReportFilterData;
}

export interface CustomAnalyticsView {
  viewName: string;
  timePeriod?: string;
  metrics?: string[];
}

export interface ReportPermissionData {
  shareWith: string;
  visibilityLevel: VisibilityLevel;
}

export type ReportStatus = 'Active' | 'Inactive' | 'On Leave';
export type ExportFormat = 'PDF' | 'Excel' | 'CSV';
export type ScheduleFrequency = 'Daily' | 'Weekly' | 'Monthly';
export type VisibilityLevel = 'Public' | 'Private' | 'Department Only';

export const REPORT_TYPES = [
  'Employee Report',
  'Leave Report',
  'Attendance Report',
  'Payroll Report',
] as const;

export type ReportType = (typeof REPORT_TYPES)[number];

export class ReportingPage extends BasePage {
  constructor(page: Page) {
    super(page);
  }

  async navigate(): Promise<void> {
    try {
      this.logger.step(1, 'Navigating to Reports');
      await this.goto('/reports');
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Navigated to Reports');
    } catch (error) {
      this.logger.error('Failed to navigate to Reports', error);
      throw error;
    }
  }

  async isReportsLoaded(): Promise<boolean> {
    try {
      return await this.isVisible(selectors.reporting.reportsHeading);
    } catch {
      return false;
    }
  }

  async selectReportType(reportType: ReportType): Promise<void> {
    try {
      this.logger.step(1, `Selecting report type: ${reportType}`);
      await this.click(selectors.reporting.reportTypeSelect);
      await this.click(selectors.reporting.reportTypeOption(reportType));
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Report type selected: ${reportType}`);
    } catch (error) {
      this.logger.error(`Failed to select report type: ${reportType}`, error);
      throw error;
    }
  }

  async applyFilters(filters: ReportFilterData): Promise<void> {
    try {
      this.logger.step(1, 'Applying report filters');

      if (filters.employeeName) {
        await this.fill(selectors.reporting.employeeNameFilter, filters.employeeName);
      }

      if (filters.fromDate) {
        await this.fill(selectors.reporting.fromDateFilter, filters.fromDate);
      }

      if (filters.toDate) {
        await this.fill(selectors.reporting.toDateFilter, filters.toDate);
      }

      await this.click(selectors.reporting.applyFiltersButton);
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Report filters applied');
    } catch (error) {
      this.logger.error('Failed to apply report filters', error);
      throw error;
    }
  }

  async clearAllFilters(): Promise<void> {
    try {
      this.logger.step(1, 'Clearing all report filters');
      await this.click(selectors.reporting.resetFiltersButton);
      await this.waitFor.loadingComplete();
      this.logger.info('✓ All filters cleared');
    } catch (error) {
      this.logger.error('Failed to clear all filters', error);
      throw error;
    }
  }

  async saveCustomFilter(data: CustomFilterData): Promise<void> {
    try {
      this.logger.step(1, `Saving custom filter: ${data.filterName}`);
      await this.applyFilters(data.filters);
      await this.click(selectors.reporting.saveFilterButton);
      await this.fill(selectors.reporting.filterNameInput, data.filterName);
      await this.click(selectors.reporting.saveFilterButton);
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Custom filter saved: ${data.filterName}`);
    } catch (error) {
      this.logger.error(`Failed to save custom filter: ${data.filterName}`, error);
      throw error;
    }
  }

  async generateReport(reportType: ReportType, filters?: ReportFilterData): Promise<void> {
    try {
      this.logger.step(1, `Generating ${reportType}`);
      await this.selectReportType(reportType);

      if (filters) {
        await this.applyFilters(filters);
      }

      await this.click(selectors.reporting.generateButton);
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ ${reportType} generated`);
    } catch (error) {
      this.logger.error(`Failed to generate ${reportType}`, error);
      throw error;
    }
  }

  async exportReport(format: ExportFormat): Promise<void> {
    try {
      this.logger.step(1, `Exporting report as ${format}`);
      await this.click(selectors.reporting.exportButton);

      const formatSelector =
        format === 'PDF'
          ? selectors.reporting.exportPdfOption
          : format === 'Excel'
            ? selectors.reporting.exportExcelOption
            : selectors.reporting.exportCsvOption;

      await this.click(formatSelector);
      this.logger.info(`✓ Report exported as ${format}`);
    } catch (error) {
      this.logger.error(`Failed to export report as ${format}`, error);
      throw error;
    }
  }

  async scheduleReport(data: ReportScheduleData): Promise<void> {
    try {
      this.logger.step(1, 'Scheduling report');
      await this.click(selectors.reporting.scheduleTab);
      await this.click(selectors.reporting.scheduleFrequencySelect);
      await this.click(selectors.reporting.scheduleFrequencyOption(data.frequency));

      if (data.day) {
        await this.click(selectors.reporting.scheduleDaySelect);
      }

      if (data.time) {
        await this.fill(selectors.reporting.scheduleTimeInput, data.time);
      }

      for (const recipient of data.recipients) {
        await this.fill(selectors.reporting.recipientsInput, recipient);
      }

      await this.click(selectors.reporting.saveScheduleButton);
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Report scheduled: ${data.frequency}`);
    } catch (error) {
      this.logger.error('Failed to schedule report', error);
      throw error;
    }
  }

  async cancelScheduledReport(reportName: string): Promise<void> {
    try {
      this.logger.step(1, `Cancelling scheduled report: ${reportName}`);
      await this.click(selectors.reporting.scheduledReportRow(reportName));
      await this.click(selectors.reporting.cancelScheduleButton);
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Scheduled report cancelled: ${reportName}`);
    } catch (error) {
      this.logger.error(`Failed to cancel scheduled report: ${reportName}`, error);
      throw error;
    }
  }

  async viewExecutionHistory(): Promise<void> {
    try {
      this.logger.step(1, 'Viewing report execution history');
      await this.click(selectors.reporting.executionHistoryTab);
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Execution history displayed');
    } catch (error) {
      this.logger.error('Failed to view execution history', error);
      throw error;
    }
  }

  async isReportResultVisible(): Promise<boolean> {
    try {
      return await this.isVisible(selectors.reporting.reportResultTable);
    } catch {
      return false;
    }
  }

  async isNoRecordsMessageVisible(): Promise<boolean> {
    try {
      return await this.isVisible(selectors.reporting.noRecordsMessage);
    } catch {
      return false;
    }
  }

  async navigateToAnalytics(): Promise<void> {
    try {
      this.logger.step(1, 'Navigating to Analytics tab');
      await this.click(selectors.reporting.analyticsTab);
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Analytics tab opened');
    } catch (error) {
      this.logger.error('Failed to navigate to Analytics tab', error);
      throw error;
    }
  }

  async isDashboardMetricsVisible(): Promise<boolean> {
    try {
      return await this.isVisible(selectors.reporting.dashboardMetrics);
    } catch {
      return false;
    }
  }

  async isTrendAnalysisChartVisible(): Promise<boolean> {
    try {
      return await this.isVisible(selectors.reporting.trendAnalysisChart);
    } catch {
      return false;
    }
  }

  async createCustomAnalyticsView(data: CustomAnalyticsView): Promise<void> {
    try {
      this.logger.step(1, `Creating custom analytics view: ${data.viewName}`);
      await this.navigateToAnalytics();
      await this.click(selectors.reporting.customViewButton);
      await this.fill(selectors.reporting.customViewNameInput, data.viewName);

      if (data.timePeriod) {
        await this.click(selectors.reporting.timePeriodSelect);
      }

      await this.click(selectors.reporting.saveFilterButton);
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Custom analytics view created: ${data.viewName}`);
    } catch (error) {
      this.logger.error(`Failed to create custom analytics view: ${data.viewName}`, error);
      throw error;
    }
  }

  async exportAnalyticsData(): Promise<void> {
    try {
      this.logger.step(1, 'Exporting analytics data');
      await this.click(selectors.reporting.analyticsExportButton);
      this.logger.info('✓ Analytics data export initiated');
    } catch (error) {
      this.logger.error('Failed to export analytics data', error);
      throw error;
    }
  }

  async shareReport(data: ReportPermissionData): Promise<void> {
    try {
      this.logger.step(1, `Sharing report with ${data.shareWith}`);
      await this.click(selectors.reporting.permissionsTab);
      await this.click(selectors.reporting.shareButton);
      await this.fill(selectors.reporting.shareWithInput, data.shareWith);
      await this.click(selectors.reporting.visibilitySelect);
      await this.click(selectors.reporting.visibilityOption(data.visibilityLevel));
      await this.click(selectors.reporting.saveFilterButton);
      await this.waitFor.loadingComplete();
      this.logger.info(`✓ Report shared with ${data.shareWith}`);
    } catch (error) {
      this.logger.error(`Failed to share report with ${data.shareWith}`, error);
      throw error;
    }
  }

  async isUnauthorizedMessageVisible(): Promise<boolean> {
    try {
      return await this.isVisible(selectors.reporting.unauthorizedMessage);
    } catch {
      return false;
    }
  }

  async viewAccessHistory(): Promise<void> {
    try {
      this.logger.step(1, 'Viewing report access history');
      await this.click(selectors.reporting.accessHistoryTab);
      await this.waitFor.loadingComplete();
      this.logger.info('✓ Access history displayed');
    } catch (error) {
      this.logger.error('Failed to view access history', error);
      throw error;
    }
  }
}
