import { test, expect } from '@playwright/test';
import fs from 'fs';
import path from 'path';

// Function to read CSV file
function readCSV(filePath) {
    const data = fs.readFileSync(filePath, 'utf-8');
    return data.split('\n').slice(1).map(row => row.split(','));
}

// Load login data from CSV
const loginData = readCSV(path.join(__dirname, 'login-data.csv'));

// Data-driven login test
loginData.forEach(([username, password]) => {
    test(`${username} should be able to login`, async ({ page }) => {
        await page.goto('http://your-app-url.com/login');
        await page.fill('#username', username);
        await page.fill('#password', password);
        await page.click('button[type="submit"]');
        // Add your assertions here
        expect(await page.title()).toContain('Dashboard');
    });
});
