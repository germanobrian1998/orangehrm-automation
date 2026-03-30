/**
 * Unit tests for the Logger class.
 */

import { Logger, createLogger } from '../../src/logger/Logger';

describe('Logger', () => {
  let warnSpy: jest.SpyInstance;
  let errorSpy: jest.SpyInstance;
  let infoSpy: jest.SpyInstance;
  let debugSpy: jest.SpyInstance;

  beforeEach(() => {
    // Suppress actual Winston output during tests
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const winston = require('winston');
    const { transports } = winston;
    warnSpy = jest.spyOn(transports.Console.prototype, 'log').mockImplementation(() => {});
    errorSpy = jest.fn();
    infoSpy = jest.fn();
    debugSpy = jest.fn();
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('should construct with a default context', () => {
    const logger = new Logger();
    expect(logger).toBeInstanceOf(Logger);
    // No throw — basic sanity check
  });

  it('createLogger should return a Logger instance', () => {
    const logger = createLogger('TestContext');
    expect(logger).toBeInstanceOf(Logger);
  });

  it('should call step() without throwing', () => {
    const logger = createLogger('StepTest');
    expect(() => logger.step(1, 'Opening login page')).not.toThrow();
  });

  it('should call assertion() without throwing', () => {
    const logger = createLogger('AssertTest');
    expect(() => logger.assertion(true, 'Login succeeded')).not.toThrow();
    expect(() => logger.assertion(false, 'Login failed')).not.toThrow();
  });

  it('should call info() without throwing', () => {
    const logger = createLogger('InfoTest');
    expect(() => logger.info('Hello world')).not.toThrow();
  });

  it('should call warn() without throwing', () => {
    const logger = createLogger('WarnTest');
    expect(() => logger.warn('Something may be wrong')).not.toThrow();
  });

  it('should call error() with an Error instance without throwing', () => {
    const logger = createLogger('ErrorTest');
    expect(() => logger.error('An error occurred', new Error('Boom!'))).not.toThrow();
  });

  it('should call error() with a plain object without throwing', () => {
    const logger = createLogger('ErrorTest');
    expect(() => logger.error('Context error', { code: 500 })).not.toThrow();
  });

  it('should call debug() without throwing', () => {
    const logger = createLogger('DebugTest');
    expect(() => logger.debug('debug message', { detail: 'x' })).not.toThrow();
  });

  // Suppress unused spy warning
  afterAll(() => {
    warnSpy.mockRestore();
    errorSpy;
    infoSpy;
    debugSpy;
  });
});
