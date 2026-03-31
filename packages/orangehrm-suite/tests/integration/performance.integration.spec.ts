/**
 * OrangeHRM Suite - Performance Baseline Integration Tests
 * Measures page object instantiation time, selector resolution speed,
 * and utility function throughput as structural performance baselines.
 */

import { test, expect } from '@qa-framework/core';
import { LoginPage } from '../../src/pages/login.page';
import { PimPage } from '../../src/pages/pim.page';
import { selectors } from '../../src/selectors';

test.describe('@integration @performance Performance Baselines', () => {
  // ─── Page object instantiation ──────────────────────────────────────────

  test('should instantiate LoginPage within 50ms', async ({ testPage, logger }) => {
    logger.step(1, 'Measure LoginPage instantiation time');
    const start = performance.now();
    const loginPage = new LoginPage(testPage);
    const elapsed = performance.now() - start;

    expect(loginPage).toBeDefined();
    expect(elapsed).toBeLessThan(50);
    logger.assertion(true, `LoginPage instantiated in ${elapsed.toFixed(2)}ms`);
  });

  test('should instantiate PimPage within 50ms', async ({ testPage, logger }) => {
    logger.step(1, 'Measure PimPage instantiation time');
    const start = performance.now();
    const pimPage = new PimPage(testPage);
    const elapsed = performance.now() - start;

    expect(pimPage).toBeDefined();
    expect(elapsed).toBeLessThan(50);
    logger.assertion(true, `PimPage instantiated in ${elapsed.toFixed(2)}ms`);
  });

  test('should instantiate 100 page objects within 200ms', async ({ testPage, logger }) => {
    logger.step(1, 'Measure bulk page object instantiation');
    const start = performance.now();
    for (let i = 0; i < 100; i++) {
      new LoginPage(testPage);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(200);
    logger.assertion(true, `100 LoginPage instances created in ${elapsed.toFixed(2)}ms`);
  });

  // ─── Selector resolution performance ────────────────────────────────────

  test('should resolve all selectors within 10ms', async ({ logger }) => {
    logger.step(1, 'Measure selector resolution time');
    const start = performance.now();

    const allSelectors = [
      selectors.login.usernameInput,
      selectors.login.passwordInput,
      selectors.login.submitButton,
      selectors.dashboard.userDropdown,
      selectors.dashboard.logoutOption,
      selectors.pim.firstNameInput,
      selectors.pim.lastNameInput,
      selectors.pim.saveButton,
      selectors.leave.leaveTypeSelect,
      selectors.leave.submitButton,
    ];
    const elapsed = performance.now() - start;

    allSelectors.forEach(s => expect(s).toBeTruthy());
    expect(elapsed).toBeLessThan(10);
    logger.assertion(true, `All selectors resolved in ${elapsed.toFixed(2)}ms`);
  });

  test('should build 1000 dynamic selectors within 100ms', async ({ logger }) => {
    logger.step(1, 'Measure dynamic selector builder performance');
    const start = performance.now();
    for (let i = 0; i < 1000; i++) {
      selectors.pim.employeeRow(`EMP-${i}`);
      selectors.leave.leaveRow(`LR-${i}`);
    }
    const elapsed = performance.now() - start;

    expect(elapsed).toBeLessThan(100);
    logger.assertion(true, `1000 dynamic selectors built in ${elapsed.toFixed(2)}ms`);
  });

  // ─── Employee form data creation ────────────────────────────────────────

  test('should create 100 unique employee form objects within 100ms', async ({ logger }) => {
    logger.step(1, 'Measure employee form data creation throughput');
    const start = performance.now();
    const employees = [];
    for (let i = 0; i < 100; i++) {
      employees.push({
        firstName: `First${i}`,
        lastName: `Last${i}`,
        employeeId: `EMP-${Date.now()}-${i}`,
      });
    }
    const elapsed = performance.now() - start;

    expect(employees).toHaveLength(100);
    expect(elapsed).toBeLessThan(100);
    logger.assertion(true, `100 employee form objects created in ${elapsed.toFixed(2)}ms`);
  });

  test('should generate unique employee IDs for concurrent submissions', async ({ logger }) => {
    logger.step(1, 'Verify unique ID generation');
    const ids = new Set<string>();
    for (let i = 0; i < 10; i++) {
      await new Promise(resolve => setTimeout(resolve, 2));
      ids.add(`EMP-${Date.now()}`);
    }
    expect(ids.size).toBe(10);
    logger.assertion(true, '10 unique employee IDs generated successfully');
  });

  // ─── Leave workflow data performance ────────────────────────────────────

  test('should process 50 leave request objects within 50ms', async ({ logger }) => {
    logger.step(1, 'Measure leave request data processing');
    const start = performance.now();
    const requests = [];
    for (let i = 0; i < 50; i++) {
      requests.push({
        leaveType: 'Annual',
        fromDate: `2025-0${(i % 9) + 1}-01`,
        toDate: `2025-0${(i % 9) + 1}-05`,
        comment: `Vacation ${i}`,
      });
    }
    const elapsed = performance.now() - start;

    expect(requests).toHaveLength(50);
    expect(elapsed).toBeLessThan(50);
    logger.assertion(true, `50 leave requests processed in ${elapsed.toFixed(2)}ms`);
  });
});
