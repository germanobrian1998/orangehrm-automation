/**
 * Winston-based structured logging service
 * Benefits:
 * - Consistent log format across console and files
 * - Log rotation to prevent huge files
 * - Different transports for different environments
 * - Easy to parse in CI/CD pipelines
 */

import * as path from 'path';
import * as winston from 'winston';
import DailyRotateFile from 'winston-daily-rotate-file';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

const LOGS_DIR = path.resolve(process.cwd(), 'logs');

/**
 * Shared Winston instance used by all Logger contexts.
 * - Console transport: colourised, human-readable.
 * - Rotating file transports: combined.log and error.log with 14-day retention.
 */
const winstonLogger = winston.createLogger({
  level: process.env.LOG_LEVEL ?? 'info',
  format: winston.format.combine(
    winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss.SSS' }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  transports: [
    // Colorized console output
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.printf(({ timestamp, level, message, context, ...meta }) => {
          const ctx = context ? ` [${context}]` : '';
          const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
          return `[${timestamp}] [${level}]${ctx} ${message}${extra}`;
        })
      ),
    }),
    // Rolling combined log – kept for 14 days, max 20 MB per file
    new DailyRotateFile({
      dirname: LOGS_DIR,
      filename: 'combined-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
    // Rolling error-only log
    new DailyRotateFile({
      dirname: LOGS_DIR,
      filename: 'error-%DATE%.log',
      datePattern: 'YYYY-MM-DD',
      level: 'error',
      maxSize: '20m',
      maxFiles: '14d',
      zippedArchive: true,
    }),
  ],
});

export class Logger {
  private context: string;

  constructor(context: string = 'Test') {
    this.context = context;
  }

  debug(message: string, data?: unknown): void {
    winstonLogger.debug(message, { context: this.context, ...this.toMeta(data) });
  }

  info(message: string, data?: unknown): void {
    winstonLogger.info(message, { context: this.context, ...this.toMeta(data) });
  }

  warn(message: string, data?: unknown): void {
    winstonLogger.warn(message, { context: this.context, ...this.toMeta(data) });
  }

  error(message: string, error?: Error | unknown): void {
    if (error instanceof Error) {
      winstonLogger.error(message, {
        context: this.context,
        error: error.message,
        stack: error.stack,
      });
    } else {
      winstonLogger.error(message, { context: this.context, ...this.toMeta(error) });
    }
  }

  /**
   * Log a numbered test step for improved readability in reports.
   */
  step(stepNumber: number, description: string): void {
    this.info(`STEP ${stepNumber}: ${description}`);
  }

  /**
   * Log an assertion outcome with a ✓/✗ prefix.
   */
  assertion(condition: boolean, message: string): void {
    const status = condition ? '✓' : '✗';
    this.info(`${status} ASSERT: ${message}`);
  }

  private toMeta(data: unknown): Record<string, unknown> {
    if (data === undefined || data === null) return {};
    if (typeof data === 'object' && !Array.isArray(data)) return data as Record<string, unknown>;
    return { data };
  }
}

export const createLogger = (context: string = 'Test'): Logger => {
  return new Logger(context);
};
