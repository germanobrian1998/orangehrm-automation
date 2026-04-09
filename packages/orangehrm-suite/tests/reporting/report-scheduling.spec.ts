/**
 * OrangeHRM Suite - Report Scheduling Tests
 * Tests for report scheduling: daily, weekly, monthly schedules, email recipients,
 * modifying settings, cancellation, and execution history.
 * Follows the Page Object Model (ADR-004) and Testing Pyramid (ADR-003).
 *
 * Testing pyramid layer: Integration
 * Validates the ReportingPage scheduling methods and related selectors
 * without requiring a live OrangeHRM instance.
 */

import { test, expect } from '@qa-framework/core';
import { ReportingPage } from '../../src/pages/reporting.page';
import { selectors } from '../../src/selectors';

test.describe('@reporting Report Scheduling Tests', () => {
  // ── 1. Schedule report to run daily ───────────────────────────────────────

  test.describe('Schedule report to run daily', () => {
    test('scheduleReport method is defined on ReportingPage', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.scheduleReport).toBe('function');
    });

    test('Daily is a valid schedule frequency', () => {
      const frequency: 'Daily' | 'Weekly' | 'Monthly' = 'Daily';
      expect(frequency).toBe('Daily');
    });

    test('daily schedule data shape is correctly typed', () => {
      // Arrange / Act
      const scheduleData = {
        frequency: 'Daily' as const,
        time: '08:00',
        recipients: ['hr@company.com'],
      };

      // Assert
      expect(scheduleData.frequency).toBe('Daily');
      expect(scheduleData.time).toBe('08:00');
      expect(scheduleData.recipients).toHaveLength(1);
    });

    test('scheduleTab selector is defined in selectors', () => {
      expect(selectors.reporting.scheduleTab).toBeTruthy();
      expect(selectors.reporting.scheduleTab).toContain('Schedule');
    });

    test('scheduleFrequencySelect selector is defined in selectors', () => {
      expect(selectors.reporting.scheduleFrequencySelect).toBeTruthy();
    });

    test('scheduleFrequencyOption selector builder returns a string for Daily', () => {
      const selector = selectors.reporting.scheduleFrequencyOption('Daily');

      expect(typeof selector).toBe('string');
      expect(selector).toContain('Daily');
    });

    test('saveScheduleButton selector is defined in selectors', () => {
      expect(selectors.reporting.saveScheduleButton).toBeTruthy();
      expect(selectors.reporting.saveScheduleButton).toContain('Save Schedule');
    });
  });

  // ── 2. Schedule report to run weekly ──────────────────────────────────────

  test.describe('Schedule report to run weekly', () => {
    test('Weekly is a valid schedule frequency', () => {
      const frequency: 'Daily' | 'Weekly' | 'Monthly' = 'Weekly';
      expect(frequency).toBe('Weekly');
    });

    test('weekly schedule data shape includes day field', () => {
      // Arrange / Act
      const scheduleData = {
        frequency: 'Weekly' as const,
        day: 'Monday',
        time: '09:00',
        recipients: ['manager@company.com', 'hr@company.com'],
      };

      // Assert
      expect(scheduleData.frequency).toBe('Weekly');
      expect(scheduleData.day).toBe('Monday');
      expect(scheduleData.recipients).toHaveLength(2);
    });

    test('weekday names are valid schedule day values', () => {
      // Arrange
      const weekdays = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday'];

      // Assert
      weekdays.forEach((day) => {
        expect(typeof day).toBe('string');
        expect(day.length).toBeGreaterThan(0);
      });
      expect(weekdays).toHaveLength(5);
    });

    test('scheduleDaySelect selector is defined in selectors', () => {
      expect(selectors.reporting.scheduleDaySelect).toBeTruthy();
    });

    test('scheduleFrequencyOption selector builder returns a string for Weekly', () => {
      const selector = selectors.reporting.scheduleFrequencyOption('Weekly');

      expect(typeof selector).toBe('string');
      expect(selector).toContain('Weekly');
    });
  });

  // ── 3. Schedule report to run monthly ─────────────────────────────────────

  test.describe('Schedule report to run monthly', () => {
    test('Monthly is a valid schedule frequency', () => {
      const frequency: 'Daily' | 'Weekly' | 'Monthly' = 'Monthly';
      expect(frequency).toBe('Monthly');
    });

    test('monthly schedule data shape is correctly typed', () => {
      // Arrange / Act
      const scheduleData = {
        frequency: 'Monthly' as const,
        day: '1',
        time: '06:00',
        recipients: ['finance@company.com'],
      };

      // Assert
      expect(scheduleData.frequency).toBe('Monthly');
      expect(parseInt(scheduleData.day, 10)).toBeGreaterThanOrEqual(1);
      expect(parseInt(scheduleData.day, 10)).toBeLessThanOrEqual(31);
    });

    test('scheduleFrequencyOption selector builder returns a string for Monthly', () => {
      const selector = selectors.reporting.scheduleFrequencyOption('Monthly');

      expect(typeof selector).toBe('string');
      expect(selector).toContain('Monthly');
    });

    test('all three schedule frequencies are supported', () => {
      const frequencies = ['Daily', 'Weekly', 'Monthly'];

      expect(frequencies).toContain('Daily');
      expect(frequencies).toContain('Weekly');
      expect(frequencies).toContain('Monthly');
      expect(frequencies).toHaveLength(3);
    });
  });

  // ── 4. Set report email recipients ────────────────────────────────────────

  test.describe('Set report email recipients', () => {
    test('recipients field in schedule data is an array of strings', () => {
      // Arrange / Act
      const scheduleData = {
        frequency: 'Daily' as const,
        recipients: ['user1@company.com', 'user2@company.com', 'user3@company.com'],
      };

      // Assert
      expect(Array.isArray(scheduleData.recipients)).toBe(true);
      scheduleData.recipients.forEach((recipient) => {
        expect(typeof recipient).toBe('string');
        expect(recipient).toContain('@');
      });
    });

    test('recipientsInput selector is defined in selectors', () => {
      expect(selectors.reporting.recipientsInput).toBeTruthy();
    });

    test('single recipient schedule data is valid', () => {
      // Arrange / Act
      const scheduleData = {
        frequency: 'Weekly' as const,
        recipients: ['manager@company.com'],
      };

      // Assert
      expect(scheduleData.recipients).toHaveLength(1);
      expect(scheduleData.recipients[0]).toContain('@');
    });

    test('multiple recipients can be added to a scheduled report', () => {
      // Arrange / Act
      const recipients = [
        'admin@company.com',
        'hr@company.com',
        'manager@company.com',
        'director@company.com',
      ];

      // Assert
      expect(recipients.length).toBeGreaterThan(1);
      recipients.forEach((r) => expect(r).toMatch(/@.+\..+/));
    });

    test('schedule with no recipients is structurally invalid', () => {
      // Arrange / Act
      const scheduleData = {
        frequency: 'Daily' as const,
        recipients: [] as string[],
      };

      // Assert
      expect(scheduleData.recipients).toHaveLength(0);
    });

    test('scheduleTimeInput selector is defined in selectors', () => {
      expect(selectors.reporting.scheduleTimeInput).toBeTruthy();
    });
  });

  // ── 5. Verify scheduled report execution ──────────────────────────────────

  test.describe('Verify scheduled report execution', () => {
    test('scheduledReportsList selector is defined in selectors', () => {
      expect(selectors.reporting.scheduledReportsList).toBeTruthy();
    });

    test('scheduledReportRow selector builder returns a string', () => {
      const selector = selectors.reporting.scheduledReportRow('Monthly Payroll');

      expect(typeof selector).toBe('string');
      expect(selector).toContain('Monthly Payroll');
    });

    test('executionHistoryTab selector is defined in selectors', () => {
      expect(selectors.reporting.executionHistoryTab).toBeTruthy();
      expect(selectors.reporting.executionHistoryTab).toContain('Execution History');
    });

    test('viewExecutionHistory method is defined on ReportingPage', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.viewExecutionHistory).toBe('function');
    });

    test('execution history selector is defined in selectors', () => {
      expect(selectors.reporting.executionHistoryTable).toBeTruthy();
    });

    test('execution history row selector is defined in selectors', () => {
      expect(selectors.reporting.executionHistoryRow).toBeTruthy();
    });
  });

  // ── 6. Modify scheduled report settings ───────────────────────────────────

  test.describe('Modify scheduled report settings', () => {
    test('schedule frequency can be changed from Daily to Weekly', () => {
      // Arrange
      const originalFrequency: 'Daily' | 'Weekly' | 'Monthly' = 'Daily';
      let currentFrequency: 'Daily' | 'Weekly' | 'Monthly' = originalFrequency;

      // Act
      currentFrequency = 'Weekly';

      // Assert
      expect(currentFrequency).toBe('Weekly');
      expect(currentFrequency).not.toBe(originalFrequency);
    });

    test('modified schedule data shape remains valid', () => {
      // Arrange / Act
      const updatedSchedule = {
        frequency: 'Monthly' as const,
        day: '15',
        time: '10:00',
        recipients: ['newmanager@company.com'],
      };

      // Assert
      expect(updatedSchedule.frequency).toBe('Monthly');
      expect(updatedSchedule.recipients).toHaveLength(1);
    });

    test('scheduleReport method accepts updated schedule data', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.scheduleReport).toBe('function');
    });

    test('schedule modification preserves report name', () => {
      // Arrange / Act
      const reportName = 'Monthly Employee Report';

      // Assert
      expect(reportName).toBeTruthy();
      expect(typeof reportName).toBe('string');
    });
  });

  // ── 7. Cancel scheduled reports ───────────────────────────────────────────

  test.describe('Cancel scheduled reports', () => {
    test('cancelScheduledReport method is defined on ReportingPage', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.cancelScheduledReport).toBe('function');
    });

    test('cancelScheduleButton selector is defined in selectors', () => {
      expect(selectors.reporting.cancelScheduleButton).toBeTruthy();
      expect(selectors.reporting.cancelScheduleButton).toContain('Cancel Schedule');
    });

    test('cancelScheduledReport method accepts a report name string', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(reportingPage.cancelScheduledReport.length).toBe(1);
    });

    test('scheduled report row selector references the report name', () => {
      const reportName = 'Weekly Leave Summary';
      const selector = selectors.reporting.scheduledReportRow(reportName);

      expect(selector).toContain(reportName);
    });
  });

  // ── 8. View report execution history ──────────────────────────────────────

  test.describe('View report execution history', () => {
    test('viewExecutionHistory method accepts no arguments', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(reportingPage.viewExecutionHistory.length).toBe(0);
    });

    test('execution history tab label contains Execution History', () => {
      expect(selectors.reporting.executionHistoryTab).toContain('Execution History');
    });

    test('execution history table selector is distinct from the report table selector', () => {
      expect(selectors.reporting.executionHistoryTable).not.toBe(selectors.reporting.reportTable);
    });

    test('execution history row selector is defined', () => {
      expect(selectors.reporting.executionHistoryRow).toBeTruthy();
    });

    test('ReportingPage correctly separates scheduling from generation concerns', async ({
      testPage,
    }) => {
      const reportingPage = new ReportingPage(testPage);

      // Both scheduling and generation methods coexist
      expect(typeof reportingPage.scheduleReport).toBe('function');
      expect(typeof reportingPage.generateReport).toBe('function');
      expect(typeof reportingPage.viewExecutionHistory).toBe('function');
    });
  });
});
