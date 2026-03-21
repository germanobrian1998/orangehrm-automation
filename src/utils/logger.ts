/**
 * Structured logging utility
 * Benefits:
 * - Consistent log format
 * - Easy to parse in CI/CD
 * - Different levels for different severity
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export class Logger {
  private context: string;
  private isDev: boolean;

  constructor(context: string = 'Test', isDev: boolean = process.env.NODE_ENV !== 'production') {
    this.context = context;
    this.isDev = isDev;
  }

  private formatMessage(level: LogLevel, message: string, data?: any): string {
    const timestamp = new Date().toISOString();
    const prefix = `[${timestamp}] [${level.toUpperCase()}] [${this.context}]`;
    
    if (data) {
      return `${prefix} ${message} ${JSON.stringify(data)}`;
    }
    return `${prefix} ${message}`;
  }

  debug(message: string, data?: any): void {
    if (this.isDev) {
      console.log(this.formatMessage('debug', message, data));
    }
  }

  info(message: string, data?: any): void {
    console.log(this.formatMessage('info', message, data));
  }

  warn(message: string, data?: any): void {
    console.warn(this.formatMessage('warn', message, data));
  }

  error(message: string, error?: Error | any): void {
    console.error(this.formatMessage('error', message, error?.message || error));
    if (error instanceof Error && error.stack) {
      console.error(error.stack);
    }
  }

  /**
   * Log test step for better readability
   */
  step(stepNumber: number, description: string): void {
    this.info(`STEP ${stepNumber}: ${description}`);
  }

  /**
   * Log assertion result
   */
  assertion(condition: boolean, message: string): void {
    const status = condition ? '✓' : '✗';
    this.info(`${status} ASSERT: ${message}`);
  }
}

export const createLogger = (context: string = 'Test'): Logger => {
  return new Logger(context);
};