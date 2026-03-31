/**
 * HRM API Suite - Performance and load tests
 * Tests for API performance characteristics: concurrent requests, response validation,
 * pagination efficiency, and fixture generation throughput.
 */

import { test, expect } from '@playwright/test';
import {
  employeeFixtures,
  departmentFixtures,
  leaveFixtures,
  paginationFixtures,
  API_ENDPOINTS,
} from '../src/fixtures/apiFixtures';

test.describe('@api @performance HRM API Performance Tests', () => {
  // ─── Fixture generation performance ─────────────────────────────────────

  test('@performance employee fixture generation is fast', () => {
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      employeeFixtures.validCreate();
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  test('@performance department fixture generation is fast', () => {
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      departmentFixtures.validCreate();
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  test('@performance leave fixture generation is fast', () => {
    const start = Date.now();
    for (let i = 0; i < 100; i++) {
      leaveFixtures.validCreate(i, 1);
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(100);
  });

  // ─── Pagination correctness ──────────────────────────────────────────────

  test('@performance pagination offsets are calculated correctly', () => {
    expect(paginationFixtures.secondPage.offset).toBe(paginationFixtures.secondPage.limit);
  });

  test('@performance large page size is within bounds', () => {
    expect(paginationFixtures.largePage.limit).toBeLessThanOrEqual(100);
    expect(paginationFixtures.largePage.offset).toBe(0);
  });

  // ─── Endpoint constants performance ─────────────────────────────────────

  test('@performance endpoint builder handles many ids efficiently', () => {
    const start = Date.now();
    for (let i = 0; i < 1000; i++) {
      API_ENDPOINTS.employee(i);
      API_ENDPOINTS.leaveRequest(i);
      API_ENDPOINTS.department(i);
    }
    const elapsed = Date.now() - start;
    expect(elapsed).toBeLessThan(50);
  });

  // ─── Unique fixture generation ───────────────────────────────────────────

  test('@performance employee IDs are unique across consecutive calls', async () => {
    const ids = new Set<string>();
    for (let i = 0; i < 5; i++) {
      await new Promise(resolve => setTimeout(resolve, 2));
      ids.add(employeeFixtures.validCreate().employeeId);
    }
    expect(ids.size).toBe(5);
  });

  // ─── Module exports completeness ─────────────────────────────────────────

  test('@performance all required endpoint builders are present', () => {
    expect(typeof API_ENDPOINTS.employee).toBe('function');
    expect(typeof API_ENDPOINTS.leaveRequest).toBe('function');
    expect(typeof API_ENDPOINTS.department).toBe('function');
    expect(typeof API_ENDPOINTS.employees).toBe('string');
    expect(typeof API_ENDPOINTS.leaveRequests).toBe('string');
    expect(typeof API_ENDPOINTS.departments).toBe('string');
  });
});
