import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

const csvPath = path.join(__dirname, 'login-data.csv');
const csvData = fs.readFileSync(csvPath, 'utf-8');
const [, ...rows] = csvData.trim().split('\n');

rows.forEach((row) => {
  const [username, password, expectedResult] = row.split(',').map(v => v.trim());

  test(`Login with ${username} should ${expectedResult}`, async ({ page }) => {
    await page.goto('http://localhost:9323/web/index.php/auth/login');
    
    await page.fill('input[name="username"]', username);
    await page.fill('input[name="password"]', password);
    await page.click('button[type="submit"]');
    
    if (expectedResult === 'success') {
      await expect(page).toHaveURL(/.*dashboard.*/);
    } else {
      await expect(page.locator('.oxd-alert')).toBeVisible();
    }
  });
});
