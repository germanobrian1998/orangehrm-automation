/**
 * @qa-framework/shared-utils - Logger Service
 * Lightweight structured logger with configurable log levels
 * and both console and optional file output.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  timestamp: string;
  level: LogLevel;
  context: string;
  message: string;
  data?: unknown;
}

export interface LoggerOptions {
  /** Minimum level to emit. Default: 'info' */
  level?: LogLevel;
  /** Context label to prefix all messages. Default: 'App' */
  context?: string;
  /** Write log entries to this callback in addition to console. */
  sink?: (entry: LogEntry) => void;
}

const LEVEL_ORDER: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const LEVEL_LABELS: Record<LogLevel, string> = {
  debug: 'DEBUG',
  info: 'INFO ',
  warn: 'WARN ',
  error: 'ERROR',
};

/** ANSI colour codes for terminal output. */
const COLOURS: Record<LogLevel, string> = {
  debug: '\x1b[36m', // cyan
  info: '\x1b[32m',  // green
  warn: '\x1b[33m',  // yellow
  error: '\x1b[31m', // red
};
const RESET = '\x1b[0m';

function timestamp(): string {
  return new Date().toISOString().replace('T', ' ').substring(0, 23);
}

function isTTY(): boolean {
  return process.stdout.isTTY === true;
}

export class Logger {
  private readonly minLevel: number;
  private readonly context: string;
  private readonly sink?: (entry: LogEntry) => void;

  constructor(options: LoggerOptions = {}) {
    const envLevel = process.env['LOG_LEVEL'];
    const rawLevel: LogLevel =
      options.level ??
      ((LEVEL_ORDER[envLevel as LogLevel] !== undefined ? envLevel : 'info') as LogLevel);
    this.minLevel = LEVEL_ORDER[rawLevel] ?? LEVEL_ORDER['info'];
    this.context = options.context ?? 'App';
    this.sink = options.sink;
  }

  // ─── Public API ─────────────────────────────────────────────────────────────

  debug(message: string, data?: unknown): void {
    this.emit('debug', message, data);
  }

  info(message: string, data?: unknown): void {
    this.emit('info', message, data);
  }

  warn(message: string, data?: unknown): void {
    this.emit('warn', message, data);
  }

  error(message: string, data?: unknown): void {
    this.emit('error', message, data);
  }

  /** Log a numbered test step at the INFO level. */
  step(stepNumber: number, description: string): void {
    this.info(`STEP ${stepNumber}: ${description}`);
  }

  /** Log an assertion outcome (✓ pass / ✗ fail) at the INFO level. */
  assertion(passed: boolean, message: string): void {
    const prefix = passed ? '✓' : '✗';
    this.info(`${prefix} ASSERT: ${message}`);
  }

  /**
   * Return a child logger that shares the same options but uses a different context label.
   */
  child(context: string): Logger {
    return new Logger({ level: this.levelName(), context, sink: this.sink });
  }

  // ─── Internals ──────────────────────────────────────────────────────────────

  private levelName(): LogLevel {
    const entry = Object.entries(LEVEL_ORDER).find(([, v]) => v === this.minLevel);
    return (entry ? entry[0] : 'info') as LogLevel;
  }

  private emit(level: LogLevel, message: string, data?: unknown): void {
    if (LEVEL_ORDER[level] < this.minLevel) return;

    const entry: LogEntry = {
      timestamp: timestamp(),
      level,
      context: this.context,
      message,
      data,
    };

    this.writeToConsole(entry);

    if (this.sink) {
      this.sink(entry);
    }
  }

  private writeToConsole(entry: LogEntry): void {
    const colour = isTTY() ? COLOURS[entry.level] : '';
    const reset = isTTY() ? RESET : '';
    const label = LEVEL_LABELS[entry.level];
    const dataStr =
      entry.data !== undefined ? ` ${JSON.stringify(entry.data)}` : '';
    const line = `${colour}[${entry.timestamp}] [${label}] [${entry.context}] ${entry.message}${dataStr}${reset}`;

    if (entry.level === 'error' || entry.level === 'warn') {
      console.error(line);
    } else {
      console.log(line);
    }
  }
}

/** Create a new Logger instance with the given options. */
export function createLogger(options: LoggerOptions = {}): Logger {
  return new Logger(options);
}
