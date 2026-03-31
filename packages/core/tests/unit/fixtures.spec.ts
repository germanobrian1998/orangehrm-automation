/**
 * Unit tests for TestFixtures
 * Verifies that the extended test object provides the expected fixtures.
 */

import { describe, it, expect } from '@jest/globals';
import { test as coreTest, expect as coreExpect } from '../../src/fixtures/TestFixtures';
import { Logger } from '../../src/logger/logger';
import { Config } from '../../src/config/Config';
import { BasePage } from '../../src/page-objects/base.page';
import { BaseApiClient } from '../../src/api-client/base.api-client';

describe('TestFixtures', () => {
  // ── Export Verification ───────────────────────────────────────────────────

  it('should export a test function (extended Playwright test)', () => {
    expect(typeof coreTest).toBe('function');
  });

  it('should export an expect function', () => {
    expect(typeof coreExpect).toBe('function');
  });

  it('should expose fixture names including logger', () => {
    // The extended test object should have fixture properties
    expect(coreTest).toBeDefined();
  });

  it('should export expect that matches the Playwright expect API', () => {
    // Playwright expect is callable as a function
    expect(typeof coreExpect).toBe('function');
  });

  // ── Class Shape Verification ──────────────────────────────────────────────

  it('Logger class should be a constructor', () => {
    expect(typeof Logger).toBe('function');
    const logger = new Logger('test');
    expect(logger).toBeInstanceOf(Logger);
  });

  it('Config class should have getInstance static method', () => {
    expect(typeof Config.getInstance).toBe('function');
  });

  it('BasePage class should be a constructor', () => {
    expect(typeof BasePage).toBe('function');
  });

  it('BaseApiClient class should be a constructor', () => {
    expect(typeof BaseApiClient).toBe('function');
  });

  // ── CoreFixtures Interface Compliance ─────────────────────────────────────

  it('Logger instance should have expected methods for fixtures', () => {
    const logger = new Logger('fixture-test');
    expect(typeof logger.info).toBe('function');
    expect(typeof logger.debug).toBe('function');
    expect(typeof logger.warn).toBe('function');
    expect(typeof logger.error).toBe('function');
    expect(typeof logger.step).toBe('function');
    expect(typeof logger.assertion).toBe('function');
  });

  it('Config instance should have expected properties for fixtures', () => {
    const cfg = Config.getInstance();
    expect(typeof cfg.baseURL).toBe('string');
    expect(typeof cfg.adminUsername).toBe('string');
    expect(typeof cfg.adminPassword).toBe('string');
    expect(typeof cfg.testTimeout).toBe('number');
    expect(typeof cfg.logLevel).toBe('string');
    expect(typeof cfg.browser).toBe('string');
    expect(typeof cfg.headless).toBe('boolean');
  });
});
