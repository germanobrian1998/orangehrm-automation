"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
(0, test_1.test)('Example test @smoke', async ({ page }) => {
    await page.goto('https://example.com');
    const title = await page.title();
    (0, test_1.expect)(title).toBeTruthy();
});
//# sourceMappingURL=example.spec.js.map