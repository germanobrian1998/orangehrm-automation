/**
 * Unit tests for Config
 * Covers singleton pattern, env var loading, typed getters, and reset mechanism.
 */

import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import { Config } from '../../src/config/Config';

describe('Config', () => {
  beforeEach(() => {
    Config.reset();
  });

  afterEach(() => {
    Config.reset();
    // Restore env vars to setup defaults
    process.env.ORANGEHRM_BASE_URL = 'https://test.orangehrmlive.com';
    process.env.ORANGEHRM_ADMIN_USERNAME = 'Admin';
    process.env.ORANGEHRM_ADMIN_PASSWORD = 'admin123';
    process.env.TEST_TIMEOUT = '30000';
    process.env.API_TIMEOUT = '10000';
    process.env.LOG_LEVEL = 'info';
    process.env.DEBUG = 'false';
    process.env.CI = 'false';
    process.env.NODE_ENV = 'test';
  });

  // ── Singleton Pattern ────────────────────────────────────────────────────

  it('should return a Config instance from getInstance()', () => {
    const cfg = Config.getInstance();
    expect(cfg).toBeInstanceOf(Config);
  });

  it('should return the same instance on repeated calls (singleton)', () => {
    const a = Config.getInstance();
    const b = Config.getInstance();
    expect(a).toBe(b);
  });

  it('should return a NEW instance after reset()', () => {
    const a = Config.getInstance();
    Config.reset();
    const b = Config.getInstance();
    expect(a).not.toBe(b);
  });

  // ── Environment Variable Loading ─────────────────────────────────────────

  it('should read baseURL from ORANGEHRM_BASE_URL env var', () => {
    process.env.ORANGEHRM_BASE_URL = 'https://custom.example.com';
    Config.reset();
    expect(Config.getInstance().baseURL).toBe('https://custom.example.com');
  });

  it('should fall back to demo URL when ORANGEHRM_BASE_URL is not set', () => {
    delete process.env.ORANGEHRM_BASE_URL;
    Config.reset();
    expect(Config.getInstance().baseURL).toBe('https://opensource-demo.orangehrmlive.com');
  });

  it('should read adminUsername from ORANGEHRM_ADMIN_USERNAME env var', () => {
    process.env.ORANGEHRM_ADMIN_USERNAME = 'SuperAdmin';
    Config.reset();
    expect(Config.getInstance().adminUsername).toBe('SuperAdmin');
  });

  it('should fall back to "Admin" when ORANGEHRM_ADMIN_USERNAME is not set', () => {
    delete process.env.ORANGEHRM_ADMIN_USERNAME;
    Config.reset();
    expect(Config.getInstance().adminUsername).toBe('Admin');
  });

  it('should read adminPassword from ORANGEHRM_ADMIN_PASSWORD env var', () => {
    process.env.ORANGEHRM_ADMIN_PASSWORD = 'secret!';
    Config.reset();
    expect(Config.getInstance().adminPassword).toBe('secret!');
  });

  it('should fall back to "admin123" when ORANGEHRM_ADMIN_PASSWORD is not set', () => {
    delete process.env.ORANGEHRM_ADMIN_PASSWORD;
    Config.reset();
    expect(Config.getInstance().adminPassword).toBe('admin123');
  });

  // ── Numeric Parsing ──────────────────────────────────────────────────────

  it('should parse testTimeout as an integer from TEST_TIMEOUT env var', () => {
    process.env.TEST_TIMEOUT = '60000';
    Config.reset();
    expect(Config.getInstance().testTimeout).toBe(60000);
    expect(Number.isInteger(Config.getInstance().testTimeout)).toBe(true);
  });

  it('should default testTimeout to 30000 when TEST_TIMEOUT is not set', () => {
    delete process.env.TEST_TIMEOUT;
    Config.reset();
    expect(Config.getInstance().testTimeout).toBe(30000);
  });

  it('should parse apiTimeout as an integer from API_TIMEOUT env var', () => {
    process.env.API_TIMEOUT = '5000';
    Config.reset();
    expect(Config.getInstance().apiTimeout).toBe(5000);
  });

  it('should default apiTimeout to 10000 when API_TIMEOUT is not set', () => {
    delete process.env.API_TIMEOUT;
    Config.reset();
    expect(Config.getInstance().apiTimeout).toBe(10000);
  });

  // ── Boolean Parsing ──────────────────────────────────────────────────────

  it('should parse debug as true when DEBUG=true', () => {
    process.env.DEBUG = 'true';
    Config.reset();
    expect(Config.getInstance().debug).toBe(true);
  });

  it('should parse debug as false when DEBUG is not "true"', () => {
    process.env.DEBUG = 'false';
    Config.reset();
    expect(Config.getInstance().debug).toBe(false);
  });

  it('should parse isCI as true when CI=true', () => {
    process.env.CI = 'true';
    Config.reset();
    expect(Config.getInstance().isCI).toBe(true);
  });

  it('should parse isCI as false when CI is not "true"', () => {
    process.env.CI = 'false';
    Config.reset();
    expect(Config.getInstance().isCI).toBe(false);
  });

  it('should set isDev to false when NODE_ENV=production', () => {
    process.env.NODE_ENV = 'production';
    Config.reset();
    expect(Config.getInstance().isDev).toBe(false);
  });

  it('should set isDev to true when NODE_ENV is not "production"', () => {
    process.env.NODE_ENV = 'test';
    Config.reset();
    expect(Config.getInstance().isDev).toBe(true);
  });

  // ── get() Method ─────────────────────────────────────────────────────────

  it('should return the correct value via get(key)', () => {
    const cfg = Config.getInstance();
    expect(cfg.get('adminUsername')).toBe('Admin');
  });

  it('should return baseURL via get("baseURL")', () => {
    const cfg = Config.getInstance();
    expect(cfg.get('baseURL')).toBeTruthy();
    expect(typeof cfg.get('baseURL')).toBe('string');
  });

  it('should return testTimeout via get("testTimeout")', () => {
    const cfg = Config.getInstance();
    expect(cfg.get('testTimeout')).toBeGreaterThan(0);
  });

  // ── getAll() Method ───────────────────────────────────────────────────────

  it('should return all config properties via getAll()', () => {
    const all = Config.getInstance().getAll();
    expect(all).toHaveProperty('baseURL');
    expect(all).toHaveProperty('adminUsername');
    expect(all).toHaveProperty('adminPassword');
    expect(all).toHaveProperty('testTimeout');
    expect(all).toHaveProperty('apiTimeout');
    expect(all).toHaveProperty('logLevel');
    expect(all).toHaveProperty('debug');
    expect(all).toHaveProperty('isCI');
    expect(all).toHaveProperty('isDev');
    expect(all).toHaveProperty('browser');
    expect(all).toHaveProperty('headless');
  });

  it('should return a readonly config object that matches all property getters', () => {
    const cfg = Config.getInstance();
    const all = cfg.getAll();
    expect(all.baseURL).toBe(cfg.baseURL);
    expect(all.adminUsername).toBe(cfg.adminUsername);
    expect(all.testTimeout).toBe(cfg.testTimeout);
    expect(all.browser).toBe(cfg.browser);
    expect(all.headless).toBe(cfg.headless);
  });

  // ── Browser Configuration ─────────────────────────────────────────────────

  it('should default browser to "chromium" when BROWSER is not set', () => {
    delete process.env.BROWSER;
    Config.reset();
    expect(Config.getInstance().browser).toBe('chromium');
  });

  it('should read browser from BROWSER env var', () => {
    process.env.BROWSER = 'firefox';
    Config.reset();
    expect(Config.getInstance().browser).toBe('firefox');
    delete process.env.BROWSER;
  });

  it('should default headless to true when HEADLESS is not set', () => {
    delete process.env.HEADLESS;
    Config.reset();
    expect(Config.getInstance().headless).toBe(true);
  });

  it('should set headless to false when HEADLESS=false', () => {
    process.env.HEADLESS = 'false';
    Config.reset();
    expect(Config.getInstance().headless).toBe(false);
    delete process.env.HEADLESS;
  });

  it('should set headless to true when HEADLESS is any value other than "false"', () => {
    process.env.HEADLESS = 'true';
    Config.reset();
    expect(Config.getInstance().headless).toBe(true);
    delete process.env.HEADLESS;
  });

  it('should fall back to "chromium" when BROWSER is an invalid value', () => {
    process.env.BROWSER = 'edge';
    Config.reset();
    expect(Config.getInstance().browser).toBe('chromium');
    delete process.env.BROWSER;
  });
});
