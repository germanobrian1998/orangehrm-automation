"use strict";
/**
 * Core package - sanity test
 * Verifies that core exports are importable.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const constants_1 = require("../src/config/constants");
const logger_1 = require("../src/logger/logger");
test_1.test.describe('@core Logger', () => {
    (0, test_1.test)('createLogger returns a Logger instance', () => {
        const logger = (0, logger_1.createLogger)('TestContext');
        (0, test_1.expect)(logger).toBeInstanceOf(logger_1.Logger);
    });
    (0, test_1.test)('constants.TIMEOUTS are defined', () => {
        (0, test_1.expect)(constants_1.constants.TIMEOUTS.SHORT).toBe(3000);
        (0, test_1.expect)(constants_1.constants.TIMEOUTS.MEDIUM).toBe(5000);
        (0, test_1.expect)(constants_1.constants.TIMEOUTS.LONG).toBe(10000);
    });
});
//# sourceMappingURL=core.spec.js.map