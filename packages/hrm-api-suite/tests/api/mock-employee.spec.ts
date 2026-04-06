/**
 * HRM API Suite - Mock Employee Tests
 * Validates Employee API behavior using MSW (Mock Service Worker) for offline testing.
 * No real network requests are made; all HTTP calls are intercepted by the MSW server.
 */

import { test, expect } from '@playwright/test';
import { server } from '../../src/mocks/server';
import { handlers } from '../../src/mocks/handlers';
import { http, HttpResponse } from 'msw';
import { TestApiClient } from '../fixtures/test-api-client';

// ─── MSW lifecycle ────────────────────────────────────────────────────────────

test.beforeAll(() => server.listen({ onUnhandledRequest: 'warn' }));
test.afterEach(() => server.resetHandlers());
test.afterAll(() => server.close());

// ─── Tests ───────────────────────────────────────────────────────────────────

test.describe('@mock Employee API - Mock Server', () => {
  test('should get list of employees', async ({ baseURL }) => {
    const client = new TestApiClient(baseURL!);
    await client.authenticate();

    const employees = await client.getEmployees();

    expect(employees.data).toBeDefined();
    expect(Array.isArray(employees.data)).toBe(true);
    expect(employees.data.length).toBeGreaterThan(0);
  });

  test('should return correct employee count from mock data', async ({ baseURL }) => {
    const client = new TestApiClient(baseURL!);
    await client.authenticate();

    const employees = await client.getEmployees();

    expect(employees.data).toHaveLength(2);
    expect(employees.meta).toBeDefined();
  });

  test('should get single employee by ID', async ({ baseURL }) => {
    const client = new TestApiClient(baseURL!);
    await client.authenticate();

    const employee = await client.getEmployee(1);

    expect(employee.data).toBeDefined();
    expect(employee.data.firstName).toBe('Employee');
    expect(employee.data.lastName).toBe('Name');
  });

  test('should create new employee', async ({ baseURL }) => {
    const client = new TestApiClient(baseURL!);
    await client.authenticate();

    const newEmployee = await client.createEmployee({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
    });

    expect(newEmployee.data.id).toBeDefined();
    expect(newEmployee.data.firstName).toBe('Test');
    expect(newEmployee.data.lastName).toBe('User');
  });

  test('should update existing employee', async ({ baseURL }) => {
    const client = new TestApiClient(baseURL!);
    await client.authenticate();

    const updated = await client.updateEmployee(1, {
      firstName: 'Updated',
      lastName: 'Employee',
    });

    expect(updated.data).toBeDefined();
    expect(updated.data.firstName).toBe('Updated');
  });

  test('should handle 404 errors gracefully', async ({ baseURL }) => {
    const client = new TestApiClient(baseURL!);
    await client.authenticate();

    let thrownError: Error | null = null;
    try {
      await client.getEmployee(99999);
    } catch (error) {
      thrownError = error as Error;
    }

    expect(thrownError).not.toBeNull();
    expect(thrownError!.message).toContain('404');
  });

  test('should handle 401 unauthorized', async ({ baseURL }) => {
    const client = new TestApiClient(baseURL!);
    // Intentionally skip authentication

    let thrownError: Error | null = null;
    try {
      await client.request('GET', '/api/v2/protected');
    } catch (error) {
      thrownError = error as Error;
    }

    expect(thrownError).not.toBeNull();
    expect(thrownError!.message).toContain('401');
  });

  test('should allow overriding handlers for specific test scenarios', async ({ baseURL }) => {
    // Override the employees endpoint to simulate an empty list
    server.use(
      http.get(`${baseURL}/api/v2/employees`, () => {
        return HttpResponse.json({ data: [], meta: { total: 0, offset: 0, limit: 50 } });
      })
    );

    const client = new TestApiClient(baseURL!);
    await client.authenticate();

    const employees = await client.getEmployees();

    expect(employees.data).toHaveLength(0);
    expect(employees.meta).toBeDefined();
  });

  test('should reset handler overrides between tests', async ({ baseURL }) => {
    // After the override test, resetHandlers() should restore original handlers
    const client = new TestApiClient(baseURL!);
    await client.authenticate();

    const employees = await client.getEmployees();

    // Back to original mock data with 2 employees
    expect(employees.data.length).toBeGreaterThan(0);
  });

  test('handlers export contains expected route handlers', () => {
    expect(Array.isArray(handlers)).toBe(true);
    expect(handlers.length).toBeGreaterThan(0);
  });
});
