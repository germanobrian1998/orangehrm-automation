"use strict";
/**
 * Unit tests for Config, Logger, and TestHelpers
 * 40+ tests covering the core framework utilities.
 */
Object.defineProperty(exports, "__esModule", { value: true });
const test_1 = require("@playwright/test");
const Config_1 = require("../../src/config/Config");
const logger_1 = require("../../src/logger/logger");
const constants_1 = require("../../src/config/constants");
const environment_1 = require("../../src/config/environment");
const TestHelpers_1 = require("../../src/utils/TestHelpers");
// ─── Config ──────────────────────────────────────────────────────────────────
test_1.test.describe('@core Config', () => {
    test_1.test.beforeEach(() => {
        Config_1.Config.reset();
    });
    (0, test_1.test)('getInstance returns a Config instance', () => {
        const cfg = Config_1.Config.getInstance();
        (0, test_1.expect)(cfg).toBeInstanceOf(Config_1.Config);
    });
    (0, test_1.test)('getInstance is a singleton', () => {
        const a = Config_1.Config.getInstance();
        const b = Config_1.Config.getInstance();
        (0, test_1.expect)(a).toBe(b);
    });
    (0, test_1.test)('baseURL has a value', () => {
        const cfg = Config_1.Config.getInstance();
        (0, test_1.expect)(cfg.baseURL).toBeTruthy();
        (0, test_1.expect)(typeof cfg.baseURL).toBe('string');
    });
    (0, test_1.test)('adminUsername defaults to Admin', () => {
        const cfg = Config_1.Config.getInstance();
        (0, test_1.expect)(cfg.adminUsername).toBe('Admin');
    });
    (0, test_1.test)('adminPassword defaults to admin123', () => {
        const cfg = Config_1.Config.getInstance();
        (0, test_1.expect)(cfg.adminPassword).toBe('admin123');
    });
    (0, test_1.test)('testTimeout is a positive integer', () => {
        const cfg = Config_1.Config.getInstance();
        (0, test_1.expect)(cfg.testTimeout).toBeGreaterThan(0);
        (0, test_1.expect)(Number.isInteger(cfg.testTimeout)).toBe(true);
    });
    (0, test_1.test)('apiTimeout is a positive integer', () => {
        const cfg = Config_1.Config.getInstance();
        (0, test_1.expect)(cfg.apiTimeout).toBeGreaterThan(0);
        (0, test_1.expect)(Number.isInteger(cfg.apiTimeout)).toBe(true);
    });
    (0, test_1.test)('logLevel is a non-empty string', () => {
        const cfg = Config_1.Config.getInstance();
        (0, test_1.expect)(typeof cfg.logLevel).toBe('string');
        (0, test_1.expect)(cfg.logLevel.length).toBeGreaterThan(0);
    });
    (0, test_1.test)('debug is a boolean', () => {
        const cfg = Config_1.Config.getInstance();
        (0, test_1.expect)(typeof cfg.debug).toBe('boolean');
    });
    (0, test_1.test)('isCI is a boolean', () => {
        const cfg = Config_1.Config.getInstance();
        (0, test_1.expect)(typeof cfg.isCI).toBe('boolean');
    });
    (0, test_1.test)('isDev is a boolean', () => {
        const cfg = Config_1.Config.getInstance();
        (0, test_1.expect)(typeof cfg.isDev).toBe('boolean');
    });
    (0, test_1.test)('get() returns the correct value for a key', () => {
        const cfg = Config_1.Config.getInstance();
        (0, test_1.expect)(cfg.get('adminUsername')).toBe('Admin');
    });
    (0, test_1.test)('getAll() returns all config values', () => {
        const cfg = Config_1.Config.getInstance();
        const all = cfg.getAll();
        (0, test_1.expect)(all.baseURL).toBeTruthy();
        (0, test_1.expect)(all.adminUsername).toBe('Admin');
    });
    (0, test_1.test)('reset() forces a new instance', () => {
        const a = Config_1.Config.getInstance();
        Config_1.Config.reset();
        const b = Config_1.Config.getInstance();
        (0, test_1.expect)(a).not.toBe(b);
    });
});
// ─── Logger ───────────────────────────────────────────────────────────────────
test_1.test.describe('@core Logger', () => {
    (0, test_1.test)('createLogger returns a Logger instance', () => {
        const logger = (0, logger_1.createLogger)('TestCtx');
        (0, test_1.expect)(logger).toBeInstanceOf(logger_1.Logger);
    });
    (0, test_1.test)('Logger instantiates without context', () => {
        const logger = new logger_1.Logger();
        (0, test_1.expect)(logger).toBeInstanceOf(logger_1.Logger);
    });
    (0, test_1.test)('logger.info does not throw', () => {
        const logger = (0, logger_1.createLogger)('Test');
        (0, test_1.expect)(() => logger.info('info message')).not.toThrow();
    });
    (0, test_1.test)('logger.debug does not throw', () => {
        const logger = (0, logger_1.createLogger)('Test');
        (0, test_1.expect)(() => logger.debug('debug message')).not.toThrow();
    });
    (0, test_1.test)('logger.warn does not throw', () => {
        const logger = (0, logger_1.createLogger)('Test');
        (0, test_1.expect)(() => logger.warn('warn message')).not.toThrow();
    });
    (0, test_1.test)('logger.error does not throw with string', () => {
        const logger = (0, logger_1.createLogger)('Test');
        (0, test_1.expect)(() => logger.error('error message')).not.toThrow();
    });
    (0, test_1.test)('logger.error does not throw with Error object', () => {
        const logger = (0, logger_1.createLogger)('Test');
        (0, test_1.expect)(() => logger.error('err', new Error('boom'))).not.toThrow();
    });
    (0, test_1.test)('logger.step does not throw', () => {
        const logger = (0, logger_1.createLogger)('Test');
        (0, test_1.expect)(() => logger.step(1, 'step description')).not.toThrow();
    });
    (0, test_1.test)('logger.assertion does not throw for true condition', () => {
        const logger = (0, logger_1.createLogger)('Test');
        (0, test_1.expect)(() => logger.assertion(true, 'passed')).not.toThrow();
    });
    (0, test_1.test)('logger.assertion does not throw for false condition', () => {
        const logger = (0, logger_1.createLogger)('Test');
        (0, test_1.expect)(() => logger.assertion(false, 'failed')).not.toThrow();
    });
    (0, test_1.test)('createLogger with empty string context does not throw', () => {
        (0, test_1.expect)(() => (0, logger_1.createLogger)('')).not.toThrow();
    });
});
// ─── Constants ────────────────────────────────────────────────────────────────
test_1.test.describe('@core Constants', () => {
    (0, test_1.test)('TIMEOUTS.SHORT is 3000', () => {
        (0, test_1.expect)(constants_1.constants.TIMEOUTS.SHORT).toBe(3000);
    });
    (0, test_1.test)('TIMEOUTS.MEDIUM is 5000', () => {
        (0, test_1.expect)(constants_1.constants.TIMEOUTS.MEDIUM).toBe(5000);
    });
    (0, test_1.test)('TIMEOUTS.LONG is 10000', () => {
        (0, test_1.expect)(constants_1.constants.TIMEOUTS.LONG).toBe(10000);
    });
    (0, test_1.test)('TIMEOUTS.VERY_LONG is 30000', () => {
        (0, test_1.expect)(constants_1.constants.TIMEOUTS.VERY_LONG).toBe(30000);
    });
    (0, test_1.test)('DEFAULT_CREDENTIALS.username is Admin', () => {
        (0, test_1.expect)(constants_1.constants.DEFAULT_CREDENTIALS.username).toBe('Admin');
    });
});
// ─── Environment ──────────────────────────────────────────────────────────────
test_1.test.describe('@core Environment', () => {
    (0, test_1.test)('environment.baseURL is a valid URL string', () => {
        (0, test_1.expect)(environment_1.environment.baseURL).toMatch(/^https?:\/\//);
    });
    (0, test_1.test)('environment.adminUsername is a non-empty string', () => {
        (0, test_1.expect)(environment_1.environment.adminUsername.length).toBeGreaterThan(0);
    });
});
// ─── TestHelpers ─────────────────────────────────────────────────────────────
test_1.test.describe('@core TestHelpers', () => {
    (0, test_1.test)('sleep resolves after the given delay', async () => {
        const start = Date.now();
        await (0, TestHelpers_1.sleep)(50);
        (0, test_1.expect)(Date.now() - start).toBeGreaterThanOrEqual(40);
    });
    (0, test_1.test)('randomInt returns a value within [min, max]', () => {
        for (let i = 0; i < 20; i++) {
            const val = (0, TestHelpers_1.randomInt)(1, 10);
            (0, test_1.expect)(val).toBeGreaterThanOrEqual(1);
            (0, test_1.expect)(val).toBeLessThanOrEqual(10);
        }
    });
    (0, test_1.test)('randomInt with equal min/max returns that value', () => {
        (0, test_1.expect)((0, TestHelpers_1.randomInt)(5, 5)).toBe(5);
    });
    (0, test_1.test)('randomString returns a string of the correct length', () => {
        (0, test_1.expect)((0, TestHelpers_1.randomString)(12)).toHaveLength(12);
    });
    (0, test_1.test)('randomString defaults to length 8', () => {
        (0, test_1.expect)((0, TestHelpers_1.randomString)()).toHaveLength(8);
    });
    (0, test_1.test)('randomString contains only alphanumeric characters', () => {
        (0, test_1.expect)((0, TestHelpers_1.randomString)(20)).toMatch(/^[A-Za-z0-9]+$/);
    });
    (0, test_1.test)('randomEmail returns a valid-looking email', () => {
        const email = (0, TestHelpers_1.randomEmail)();
        (0, test_1.expect)(email).toMatch(/^[^@]+@[^@]+\.[^@]+$/);
    });
    (0, test_1.test)('randomEmail uses the provided domain', () => {
        const email = (0, TestHelpers_1.randomEmail)('example.com');
        (0, test_1.expect)(email).toMatch(/@example\.com$/);
    });
    (0, test_1.test)('today returns a date in YYYY-MM-DD format', () => {
        (0, test_1.expect)((0, TestHelpers_1.today)()).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    });
    (0, test_1.test)('formatDate formats a Date correctly', () => {
        const d = new Date(2024, 0, 15); // 2024-01-15
        (0, test_1.expect)((0, TestHelpers_1.formatDate)(d)).toBe('2024-01-15');
    });
    (0, test_1.test)('addDays adds positive days', () => {
        const base = new Date(2024, 0, 1);
        const result = (0, TestHelpers_1.addDays)(base, 5);
        (0, test_1.expect)(result.getDate()).toBe(6);
    });
    (0, test_1.test)('addDays subtracts with negative days', () => {
        const base = new Date(2024, 0, 10);
        const result = (0, TestHelpers_1.addDays)(base, -3);
        (0, test_1.expect)(result.getDate()).toBe(7);
    });
    (0, test_1.test)('addDays does not mutate the original date', () => {
        const base = new Date(2024, 0, 1);
        (0, TestHelpers_1.addDays)(base, 10);
        (0, test_1.expect)(base.getDate()).toBe(1);
    });
    (0, test_1.test)('retry succeeds on first attempt', async () => {
        let calls = 0;
        const result = await (0, TestHelpers_1.retry)(async () => {
            calls++;
            return 42;
        });
        (0, test_1.expect)(result).toBe(42);
        (0, test_1.expect)(calls).toBe(1);
    });
    (0, test_1.test)('retry retries on failure then succeeds', async () => {
        let calls = 0;
        const result = await (0, TestHelpers_1.retry)(async () => {
            calls++;
            if (calls < 3)
                throw new Error('not yet');
            return 'done';
        }, 3, 10);
        (0, test_1.expect)(result).toBe('done');
        (0, test_1.expect)(calls).toBe(3);
    });
    (0, test_1.test)('retry throws after exhausting attempts', async () => {
        await (0, test_1.expect)((0, TestHelpers_1.retry)(async () => { throw new Error('always fails'); }, 2, 10)).rejects.toThrow('always fails');
    });
    (0, test_1.test)('deepClone returns an equal but different object', () => {
        const original = { a: 1, b: { c: 2 } };
        const clone = (0, TestHelpers_1.deepClone)(original);
        (0, test_1.expect)(clone).toEqual(original);
        (0, test_1.expect)(clone).not.toBe(original);
        (0, test_1.expect)(clone.b).not.toBe(original.b);
    });
    (0, test_1.test)('trimObjectValues trims string values', () => {
        const input = { name: '  Alice  ', age: 30 };
        const result = (0, TestHelpers_1.trimObjectValues)(input);
        (0, test_1.expect)(result.name).toBe('Alice');
        (0, test_1.expect)(result.age).toBe(30);
    });
    (0, test_1.test)('isNonEmptyString returns true for non-empty string', () => {
        (0, test_1.expect)((0, TestHelpers_1.isNonEmptyString)('hello')).toBe(true);
    });
    (0, test_1.test)('isNonEmptyString returns false for empty string', () => {
        (0, test_1.expect)((0, TestHelpers_1.isNonEmptyString)('')).toBe(false);
    });
    (0, test_1.test)('isNonEmptyString returns false for whitespace-only string', () => {
        (0, test_1.expect)((0, TestHelpers_1.isNonEmptyString)('   ')).toBe(false);
    });
    (0, test_1.test)('isNonEmptyString returns false for non-string', () => {
        (0, test_1.expect)((0, TestHelpers_1.isNonEmptyString)(42)).toBe(false);
    });
    (0, test_1.test)('capitalise capitalises the first letter', () => {
        (0, test_1.expect)((0, TestHelpers_1.capitalise)('hello world')).toBe('Hello world');
    });
    (0, test_1.test)('capitalise handles already-capitalised string', () => {
        (0, test_1.expect)((0, TestHelpers_1.capitalise)('Hello')).toBe('Hello');
    });
    (0, test_1.test)('camelToLabel converts camelCase to readable label', () => {
        (0, test_1.expect)((0, TestHelpers_1.camelToLabel)('firstName')).toBe('First Name');
    });
    (0, test_1.test)('toQueryString builds a query string', () => {
        (0, test_1.expect)((0, TestHelpers_1.toQueryString)({ page: 1, size: 10 })).toBe('?page=1&size=10');
    });
    (0, test_1.test)('toQueryString returns empty string for empty object', () => {
        (0, test_1.expect)((0, TestHelpers_1.toQueryString)({})).toBe('');
    });
    (0, test_1.test)('parseQueryString parses a query string', () => {
        const result = (0, TestHelpers_1.parseQueryString)('?foo=bar&baz=qux');
        (0, test_1.expect)(result).toEqual({ foo: 'bar', baz: 'qux' });
    });
    (0, test_1.test)('parseQueryString handles string without leading ?', () => {
        const result = (0, TestHelpers_1.parseQueryString)('a=1&b=2');
        (0, test_1.expect)(result).toEqual({ a: '1', b: '2' });
    });
    (0, test_1.test)('truncate shortens long strings', () => {
        (0, test_1.expect)((0, TestHelpers_1.truncate)('Hello World', 5)).toBe('Hello…');
    });
    (0, test_1.test)('truncate leaves short strings intact', () => {
        (0, test_1.expect)((0, TestHelpers_1.truncate)('Hi', 10)).toBe('Hi');
    });
    (0, test_1.test)('arraysEqual returns true for equal arrays', () => {
        (0, test_1.expect)((0, TestHelpers_1.arraysEqual)([1, 2, 3], [3, 1, 2])).toBe(true);
    });
    (0, test_1.test)('arraysEqual returns false for different arrays', () => {
        (0, test_1.expect)((0, TestHelpers_1.arraysEqual)([1, 2], [1, 3])).toBe(false);
    });
    (0, test_1.test)('arraysEqual returns false for different lengths', () => {
        (0, test_1.expect)((0, TestHelpers_1.arraysEqual)([1, 2, 3], [1, 2])).toBe(false);
    });
    (0, test_1.test)('flattenObject flattens nested objects', () => {
        const result = (0, TestHelpers_1.flattenObject)({ a: { b: { c: 1 } } });
        (0, test_1.expect)(result).toEqual({ 'a.b.c': 1 });
    });
    (0, test_1.test)('flattenObject leaves flat objects unchanged', () => {
        const result = (0, TestHelpers_1.flattenObject)({ x: 1, y: 2 });
        (0, test_1.expect)(result).toEqual({ x: 1, y: 2 });
    });
});
//# sourceMappingURL=core-unit.spec.js.map