import { test, expect } from '@playwright/test';

test.describe('Employee API Tests', () => {
  const baseURL = 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2';

  test('should get employees list successfully', async ({ request }) => {
    const response = await request.get(`${baseURL}/pim/employees`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
    expect(Array.isArray(data.data)).toBe(true);
  });

  test('should get employee details', async ({ request }) => {
    const response = await request.get(`${baseURL}/pim/employees/1`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should handle invalid employee ID', async ({ request }) => {
    const response = await request.get(`${baseURL}/pim/employees/99999`);
    
    // Should either return 404 or empty data
    expect([404, 200]).toContain(response.status());
  });
});

test.describe('Leave API Tests', () => {
  const baseURL = 'https://opensource-demo.orangehrmlive.com/web/index.php/api/v2';

  test('should get leave types', async ({ request }) => {
    const response = await request.get(`${baseURL}/leave/leave-types`);
    
    expect(response.status()).toBe(200);
    
    const data = await response.json();
    expect(data).toHaveProperty('data');
  });

  test('should get leave requests', async ({ request }) => {
    const response = await request.get(`${baseURL}/leave/leave-requests`);
    
    expect([200, 401]).toContain(response.status());
  });
});
