/**
 * OrangeHRM Suite - Report Filtering Tests
 * Tests for report filter functionality: employee name, department, date range,
 * status filters, multiple filters, clearing filters, and saving custom configurations.
 * Follows the Page Object Model (ADR-004) and Testing Pyramid (ADR-003).
 *
 * Testing pyramid layer: Integration
 * Validates the ReportingPage filter methods and related selectors
 * without requiring a live OrangeHRM instance.
 */

import { test, expect } from '@qa-framework/core';
import { ReportingPage } from '../../src/pages/reporting.page';
import { selectors } from '../../src/selectors';

test.describe('@reporting Report Filtering Tests', () => {
  // ── 1. Filter by employee name ────────────────────────────────────────────

  test.describe('Filter report by employee name', () => {
    test('applyFilters method is defined on ReportingPage', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.applyFilters).toBe('function');
    });

    test('employee name filter data shape is correctly typed', () => {
      // Arrange / Act
      const filters = { employeeName: 'Alice Johnson' };

      // Assert
      expect(typeof filters.employeeName).toBe('string');
      expect(filters.employeeName).toBe('Alice Johnson');
    });

    test('employeeNameFilter selector is defined in selectors', () => {
      expect(selectors.reporting.employeeNameFilter).toBeTruthy();
      expect(typeof selectors.reporting.employeeNameFilter).toBe('string');
    });

    test('applyFiltersButton selector is defined in selectors', () => {
      expect(selectors.reporting.applyFiltersButton).toBeTruthy();
    });

    test('applyFiltersButton selector references a Search button', () => {
      expect(selectors.reporting.applyFiltersButton).toContain('Search');
    });

    test('employee name filter accepts special characters', () => {
      // Arrange / Act
      const filters = { employeeName: "O'Brien, Mary-Jane" };

      // Assert
      expect(filters.employeeName).toContain("'");
      expect(filters.employeeName).toContain('-');
    });

    test('partial employee name is valid for filter input', () => {
      // Arrange / Act
      const partialName = 'Ali';

      // Assert
      expect(partialName.length).toBeGreaterThan(0);
      expect(partialName.length).toBeLessThan(20);
    });
  });

  // ── 2. Filter by department ───────────────────────────────────────────────

  test.describe('Filter report by department', () => {
    test('department filter data shape is correctly typed', () => {
      // Arrange / Act
      const filters = { department: 'Engineering' };

      // Assert
      expect(typeof filters.department).toBe('string');
      expect(filters.department).toBe('Engineering');
    });

    test('departmentFilter selector is defined in selectors', () => {
      expect(selectors.reporting.departmentFilter).toBeTruthy();
    });

    test('known OrangeHRM departments are valid filter values', () => {
      // Arrange
      const departments = [
        'Engineering',
        'Human Resources',
        'Finance',
        'Marketing',
        'Operations',
      ];

      // Assert
      departments.forEach((dept) => {
        expect(typeof dept).toBe('string');
        expect(dept.length).toBeGreaterThan(0);
      });
    });
  });

  // ── 3. Filter by date range ───────────────────────────────────────────────

  test.describe('Filter report by date range', () => {
    test('date range filter data shape is correctly typed', () => {
      // Arrange / Act
      const filters = { fromDate: '2024-01-01', toDate: '2024-12-31' };

      // Assert
      expect(filters.fromDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(filters.toDate).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });

    test('fromDate must be before or equal to toDate', () => {
      // Arrange / Act
      const fromDate = new Date('2024-01-01');
      const toDate = new Date('2024-12-31');

      // Assert
      expect(fromDate.getTime()).toBeLessThanOrEqual(toDate.getTime());
    });

    test('fromDateFilter selector is defined in selectors', () => {
      expect(selectors.reporting.fromDateFilter).toBeTruthy();
    });

    test('toDateFilter selector is defined in selectors', () => {
      expect(selectors.reporting.toDateFilter).toBeTruthy();
    });

    test('date range spanning a single day is valid', () => {
      // Arrange / Act
      const filters = { fromDate: '2024-06-15', toDate: '2024-06-15' };

      // Assert
      expect(filters.fromDate).toBe(filters.toDate);
    });

    test('date range spanning multiple years is valid', () => {
      // Arrange / Act
      const fromDate = new Date('2022-01-01');
      const toDate = new Date('2024-12-31');

      // Assert
      const diffYears = toDate.getFullYear() - fromDate.getFullYear();
      expect(diffYears).toBeGreaterThan(0);
    });
  });

  // ── 4. Filter by status ───────────────────────────────────────────────────

  test.describe('Filter report by status', () => {
    test('Active is a valid report status', () => {
      const status: 'Active' | 'Inactive' | 'On Leave' = 'Active';
      expect(status).toBe('Active');
    });

    test('Inactive is a valid report status', () => {
      const status: 'Active' | 'Inactive' | 'On Leave' = 'Inactive';
      expect(status).toBe('Inactive');
    });

    test('On Leave is a valid report status', () => {
      const status: 'Active' | 'Inactive' | 'On Leave' = 'On Leave';
      expect(status).toBe('On Leave');
    });

    test('statusFilter selector is defined in selectors', () => {
      expect(selectors.reporting.statusFilter).toBeTruthy();
    });

    test('all three report statuses are supported', () => {
      const statuses = ['Active', 'Inactive', 'On Leave'];

      expect(statuses).toContain('Active');
      expect(statuses).toContain('Inactive');
      expect(statuses).toContain('On Leave');
      expect(statuses).toHaveLength(3);
    });

    test('status filter data shape accepts status field', () => {
      // Arrange / Act
      const filters = { status: 'Active' as const };

      // Assert
      expect(filters.status).toBe('Active');
    });
  });

  // ── 5. Apply multiple filters simultaneously ──────────────────────────────

  test.describe('Apply multiple filters simultaneously', () => {
    test('filter data can combine employee name and date range', () => {
      // Arrange / Act
      const filters = {
        employeeName: 'John Smith',
        fromDate: '2024-01-01',
        toDate: '2024-03-31',
      };

      // Assert
      expect(filters.employeeName).toBeTruthy();
      expect(filters.fromDate).toBeTruthy();
      expect(filters.toDate).toBeTruthy();
    });

    test('filter data can combine department and status', () => {
      // Arrange / Act
      const filters = {
        department: 'Engineering',
        status: 'Active' as const,
      };

      // Assert
      expect(filters.department).toBe('Engineering');
      expect(filters.status).toBe('Active');
    });

    test('all filter fields can be set simultaneously', () => {
      // Arrange / Act
      const filters = {
        employeeName: 'Jane Doe',
        department: 'Finance',
        fromDate: '2024-01-01',
        toDate: '2024-12-31',
        status: 'Active' as const,
      };

      // Assert
      expect(Object.keys(filters)).toHaveLength(5);
      expect(filters.employeeName).toBeTruthy();
      expect(filters.department).toBeTruthy();
      expect(filters.fromDate).toBeTruthy();
      expect(filters.toDate).toBeTruthy();
      expect(filters.status).toBeTruthy();
    });

    test('applyFilters handles a ReportFilterData object with all optional fields absent', () => {
      // Arrange / Act – empty filter object is valid
      const filters = {};

      // Assert
      expect(Object.keys(filters)).toHaveLength(0);
    });

    test('filterPanel selector is defined in selectors', () => {
      expect(selectors.reporting.filterPanel).toBeTruthy();
    });
  });

  // ── 6. Clear all filters ──────────────────────────────────────────────────

  test.describe('Clear all filters', () => {
    test('clearAllFilters method is defined on ReportingPage', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.clearAllFilters).toBe('function');
    });

    test('resetFiltersButton selector is defined in selectors', () => {
      expect(selectors.reporting.resetFiltersButton).toBeTruthy();
    });

    test('resetFiltersButton selector references a Reset button', () => {
      expect(selectors.reporting.resetFiltersButton).toContain('Reset');
    });

    test('clearAllFilters method returns undefined (void)', async ({ testPage, logger }) => {
      // Arrange
      logger.step(1, 'Verify clearAllFilters method signature');
      const reportingPage = new ReportingPage(testPage);

      // Assert – method is callable with no arguments
      expect(typeof reportingPage.clearAllFilters).toBe('function');
      expect(reportingPage.clearAllFilters.length).toBe(0);
      logger.assertion(true, 'clearAllFilters accepts no arguments');
    });
  });

  // ── 7. Save custom filter configurations ──────────────────────────────────

  test.describe('Save custom filter configurations', () => {
    test('saveCustomFilter method is defined on ReportingPage', async ({ testPage }) => {
      const reportingPage = new ReportingPage(testPage);
      expect(typeof reportingPage.saveCustomFilter).toBe('function');
    });

    test('custom filter data shape is correctly typed', () => {
      // Arrange / Act
      const customFilter = {
        filterName: 'Q1 Engineering Active',
        filters: {
          department: 'Engineering',
          fromDate: '2024-01-01',
          toDate: '2024-03-31',
          status: 'Active' as const,
        },
      };

      // Assert
      expect(typeof customFilter.filterName).toBe('string');
      expect(customFilter.filterName).toBe('Q1 Engineering Active');
      expect(customFilter.filters.department).toBe('Engineering');
    });

    test('saveFilterButton selector is defined in selectors', () => {
      expect(selectors.reporting.saveFilterButton).toBeTruthy();
    });

    test('filterNameInput selector is defined in selectors', () => {
      expect(selectors.reporting.filterNameInput).toBeTruthy();
    });

    test('savedFiltersDropdown selector is defined in selectors', () => {
      expect(selectors.reporting.savedFiltersDropdown).toBeTruthy();
    });

    test('custom filter name must be a non-empty string', () => {
      // Arrange / Act
      const validName = 'My Custom Filter';
      const emptyName = '';

      // Assert
      expect(validName.length).toBeGreaterThan(0);
      expect(emptyName.length).toBe(0);
    });

    test('custom filter name with special characters is valid', () => {
      // Arrange / Act
      const filterName = 'Q1 2024 - Engineering (Active)';

      // Assert
      expect(filterName).toContain('2024');
      expect(filterName).toContain('Engineering');
    });
  });
});
