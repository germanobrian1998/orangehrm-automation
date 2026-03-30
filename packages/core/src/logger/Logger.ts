/**
 * Centralized logging service using Winston.
 *
 * Usage:
 *   import { Logger } from '@qa-framework/core';
 *   const logger = new Logger('MyTest');
 *   logger.info('Starting test run');
 */

import * as path from 'path';
import * as winston from 'winston';
import type { LogLevel } from '../types';

const LOGS_DIR = path.resolve(process.cwd(), 'logs');

const winstonInstance = winston.createLogger({
  level: (process.env.LOG_LEVEL ?? 'info') as LogLevel,
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.json(),
  ),
  transports: [
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          const ctx = context ? ` [${context}]` : '';
          const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `[${timestamp}] [${level}]${ctx} ${message}${extra}`;
        }),
      ),
    }),
    new winston.transports.File({
      dirname: LOGS_DIR,
      filename: 'combined.log',
      maxsize: 20 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
    new winston.transports.File({
      dirname: LOGS_DIR,
      filename: 'error.log',
      level: 'error',
      maxsize: 20 * 1024 * 1024,
      maxFiles: 5,
      tailable: true,
    }),
  ],
});

export class Logger {
  private context: string;

  constructor(context: string = 'Framework') {
    this.context = context;
  }

  debug(message: string, data?: unknown): void {
    winstonInstance.debug(message, { context: this.context, ...this.toMeta(data) });
  }

  info(message: string, data?: unknown): void {
    winstonInstance.info(message, { context: this.context, ...this.toMeta(data) });
  }

  warn(message: string, data?: unknown): void {
    winstonInstance.warn(message, { context: this.context, ...this.toMeta(data) });
  }

  error(message: string, error?: Error | unknown): void {
    if (error instanceof Error) {
      winstonInstance.error(message, {
        context: this.context,
        error: error.message,
        stack: error.stack,
      });
    } else {
      winstonInstance.error(message, { context: this.context, ...this.toMeta(error) });
    }
  }

  /**
   * Log a numbered test step — improves readability in CI reports.
   */
  step(stepNumber: number, description: string): void {
    this.info(`STEP ${stepNumber}: ${description}`);
  }

  /**
   * Log an assertion result with a ✓/✗ prefix.
   */
  assertion(condition: boolean, message: string): void {
    const symbol = condition ? '✓' : '✗';
    this.info(`${symbol} ASSERT: ${message}`);
  }

  private toMeta(data: unknown): Record<string, unknown> {
    if (data === undefined || data === null) return {};
    if (typeof data === 'object' && !Array.isArray(data)) return data as Record<string, unknown>;
    return { data };
  }
}

export const createLogger = (context: string = 'Framework'): Logger => new Logger(context);
