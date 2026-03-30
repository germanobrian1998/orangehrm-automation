/**
 * Unit tests for the Config class.
 */

import { Config } from '../../src/config/Config';

describe('Config', () => {
  const originalEnv = { ...process.env };

  beforeEach(() => {
    // Reset the singleton before each test
    // @ts-expect-error: accessing private static for test purposes
    Config.instance = undefined;
  });

  afterEach(() => {
    process.env = { ...originalEnv };
  });

  it('should return a singleton instance', () => {
    const a = Config.getInstance();
    const b = Config.getInstance();
    expect(a).toBe(b);
  });

  describe('get', () => {
    it('should read an environment variable', () => {
      process.env['MY_VAR'] = 'hello';
      expect(Config.getInstance().get('MY_VAR')).toBe('hello');
    });

    it('should return the default value when the variable is not set', () => {
      delete process.env['MISSING_VAR'];
      expect(Config.getInstance().get('MISSING_VAR', 'fallback')).toBe('fallback');
    });

    it('should throw when a required variable is missing and no default is provided', () => {
      delete process.env['REQUIRED_VAR'];
      expect(() => Config.getInstance().get('REQUIRED_VAR')).toThrow(/REQUIRED_VAR/);
    });
  });

  describe('getNumber', () => {
    it('should parse a numeric string', () => {
      process.env['TIMEOUT'] = '5000';
      expect(Config.getInstance().getNumber('TIMEOUT')).toBe(5000);
    });

    it('should return the default value when the variable is not set', () => {
      delete process.env['PORT'];
      expect(Config.getInstance().getNumber('PORT', 3000)).toBe(3000);
    });

    it('should throw for non-numeric values', () => {
      process.env['BAD_NUM'] = 'abc';
      expect(() => Config.getInstance().getNumber('BAD_NUM')).toThrow(/number/);
    });
  });

  describe('getBoolean', () => {
    it.each([['true'], ['TRUE'], ['1'], ['yes'], ['YES']])('should treat "%s" as true', (val) => {
      process.env['FLAG'] = val;
      expect(Config.getInstance().getBoolean('FLAG')).toBe(true);
    });

    it.each([['false'], ['0'], ['no'], ['off']])('should treat "%s" as false', (val) => {
      process.env['FLAG'] = val;
      expect(Config.getInstance().getBoolean('FLAG')).toBe(false);
    });

    it('should return the default when the variable is not set', () => {
      delete process.env['FLAG'];
      expect(Config.getInstance().getBoolean('FLAG', true)).toBe(true);
    });
  });

  describe('getEnvironmentConfig', () => {
    it('should return an EnvironmentConfig with sensible defaults', () => {
      delete process.env['BASE_URL'];
      delete process.env['API_URL'];
      delete process.env['TIMEOUT'];
      delete process.env['RETRIES'];
      delete process.env['LOG_LEVEL'];
      delete process.env['ENVIRONMENT'];
      const cfg = Config.getInstance().getEnvironmentConfig();
      expect(cfg.baseUrl).toBe('https://opensource-demo.orangehrmlive.com');
      expect(cfg.timeout).toBe(30000);
      expect(cfg.retries).toBe(2);
      expect(cfg.logLevel).toBe('info');
      expect(cfg.environment).toBe('test');
    });
  });
});
