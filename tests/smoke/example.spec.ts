import { test, expect } from '@playwright/test';

test('Example test @smoke', async ({ page }) => {
  await page.goto('https://example.com');
  const title = await page.title();
  expect(title).toBeTruthy();
});
