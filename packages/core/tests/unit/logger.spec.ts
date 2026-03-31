/**
 * Unit tests for Logger
 * Covers Logger initialization, log level methods, step/assertion helpers, and integration with Winston.
 */

import { describe, it, expect, beforeEach, jest } from '@jest/globals';
import { Logger, createLogger } from '../../src/logger/logger';

describe('Logger', () => {
  let logger: Logger;

  beforeEach(() => {
    logger = createLogger('TestContext');
    jest.clearAllMocks();
  });

  // ── Initialization ────────────────────────────────────────────────────────

  it('should create a Logger instance via constructor', () => {
    const instance = new Logger();
    expect(instance).toBeInstanceOf(Logger);
  });

  it('should create a Logger instance via createLogger factory', () => {
    const instance = createLogger('TestCtx');
    expect(instance).toBeInstanceOf(Logger);
  });

  it('should create a Logger with no context argument', () => {
    expect(() => new Logger()).not.toThrow();
  });

  it('should create a Logger with empty string context', () => {
    expect(() => createLogger('')).not.toThrow();
  });

  it('should return a different instance per createLogger call', () => {
    const a = createLogger('A');
    const b = createLogger('B');
    expect(a).not.toBe(b);
  });

  // ── Log Level Methods ────────────────────────────────────────────────────

  it('should call info() without throwing', () => {
    expect(() => logger.info('info message')).not.toThrow();
  });

  it('should call debug() without throwing', () => {
    expect(() => logger.debug('debug message')).not.toThrow();
  });

  it('should call warn() without throwing', () => {
    expect(() => logger.warn('warn message')).not.toThrow();
  });

  it('should call error() with string message without throwing', () => {
    expect(() => logger.error('error message')).not.toThrow();
  });

  it('should call error() with Error object without throwing', () => {
    expect(() => logger.error('error message', new Error('oops'))).not.toThrow();
  });

  it('should call error() with arbitrary data without throwing', () => {
    expect(() => logger.error('error message', { code: 500 })).not.toThrow();
  });

  // ── Extra Data / Metadata ────────────────────────────────────────────────

  it('should call info() with metadata object without throwing', () => {
    expect(() => logger.info('info with meta', { key: 'value' })).not.toThrow();
  });

  it('should call debug() with an array without throwing', () => {
    expect(() => logger.debug('debug with array', [1, 2, 3])).not.toThrow();
  });

  it('should call warn() with a primitive value without throwing', () => {
    expect(() => logger.warn('warn with primitive', 42)).not.toThrow();
  });

  // ── step() Helper ────────────────────────────────────────────────────────

  it('should call step() without throwing', () => {
    expect(() => logger.step(1, 'Test step description')).not.toThrow();
  });

  it('should call step() with step number 0 without throwing', () => {
    expect(() => logger.step(0, 'Initial step')).not.toThrow();
  });

  it('should call step() with large step numbers without throwing', () => {
    expect(() => logger.step(999, 'Last step')).not.toThrow();
  });

  // ── assertion() Helper ───────────────────────────────────────────────────

  it('should call assertion() with true condition without throwing', () => {
    expect(() => logger.assertion(true, 'Assertion passed')).not.toThrow();
  });

  it('should call assertion() with false condition without throwing', () => {
    expect(() => logger.assertion(false, 'Assertion failed')).not.toThrow();
  });

  it('should call assertion() with complex message without throwing', () => {
    expect(() => logger.assertion(true, 'Element "button" is visible on /login page')).not.toThrow();
  });
});
