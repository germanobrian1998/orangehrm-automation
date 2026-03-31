/**
 * @qa-framework/shared-utils - Configuration Loader
 * Loads environment variables, validates required keys, and provides typed access.
 */

import dotenv from 'dotenv';
import path from 'path';

// ─── Types ────────────────────────────────────────────────────────────────────

export type BrowserName = 'chromium' | 'firefox' | 'webkit';
export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface SharedConfig {
  /** Base URL of the OrangeHRM instance under test. */
  baseUrl: string;
  /** Admin username. */
  adminUsername: string;
  /** Admin password. */
  adminPassword: string;
  /** Default browser for Playwright tests. */
  browser: BrowserName;
  /** Whether to run in headless mode. */
  headless: boolean;
  /** Test-level action timeout in ms. */
  testTimeout: number;
  /** API request timeout in ms. */
  apiTimeout: number;
  /** Minimum log level. */
  logLevel: LogLevel;
  /** Enable verbose debug output. */
  debug: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

const VALID_BROWSERS: BrowserName[] = ['chromium', 'firefox', 'webkit'];
const VALID_LOG_LEVELS: LogLevel[] = ['debug', 'info', 'warn', 'error'];

function parseBrowser(value: string | undefined): BrowserName {
  if (value && (VALID_BROWSERS as string[]).includes(value)) {
    return value as BrowserName;
  }
  return 'chromium';
}

function parseLogLevel(value: string | undefined): LogLevel {
  if (value && (VALID_LOG_LEVELS as string[]).includes(value)) {
    return value as LogLevel;
  }
  return 'info';
}

function parsePositiveInt(value: string | undefined, fallback: number): number {
  const n = parseInt(value ?? '', 10);
  return isNaN(n) || n <= 0 ? fallback : n;
}

// ─── Config class ─────────────────────────────────────────────────────────────

/**
 * Singleton configuration loader.
 * Reads from `process.env` (after loading the appropriate `.env` file once).
 * Call `ConfigLoader.getInstance()` to get the shared instance.
 */
export class ConfigLoader {
  private static instance: ConfigLoader | null = null;
  private readonly _cfg: SharedConfig;

  private constructor() {
    // Load .env.local for tests, .env otherwise (silently skip if missing)
    const envFile = process.env['NODE_ENV'] === 'test' ? '.env.local' : '.env';
    dotenv.config({ path: path.resolve(process.cwd(), envFile) });

    this._cfg = {
      baseUrl:
        process.env['ORANGEHRM_BASE_URL'] ??
        'https://opensource-demo.orangehrmlive.com',
      adminUsername: process.env['ORANGEHRM_ADMIN_USERNAME'] ?? 'Admin',
      adminPassword: process.env['ORANGEHRM_ADMIN_PASSWORD'] ?? 'admin123',
      browser: parseBrowser(process.env['BROWSER']),
      headless: process.env['HEADLESS'] !== 'false',
      testTimeout: parsePositiveInt(process.env['TEST_TIMEOUT'], 30000),
      apiTimeout: parsePositiveInt(process.env['API_TIMEOUT'], 10000),
      logLevel: parseLogLevel(process.env['LOG_LEVEL']),
      debug: process.env['DEBUG'] === 'true',
    };
  }

  /** Returns the shared ConfigLoader instance (lazy singleton). */
  static getInstance(): ConfigLoader {
    if (!ConfigLoader.instance) {
      ConfigLoader.instance = new ConfigLoader();
    }
    return ConfigLoader.instance;
  }

  // ─── Typed accessors ──────────────────────────────────────────────────────

  get baseUrl(): string { return this._cfg.baseUrl; }
  get adminUsername(): string { return this._cfg.adminUsername; }
  get adminPassword(): string { return this._cfg.adminPassword; }
  get browser(): BrowserName { return this._cfg.browser; }
  get headless(): boolean { return this._cfg.headless; }
  get testTimeout(): number { return this._cfg.testTimeout; }
  get apiTimeout(): number { return this._cfg.apiTimeout; }
  get logLevel(): LogLevel { return this._cfg.logLevel; }
  get debug(): boolean { return this._cfg.debug; }

  /** Return the entire config object as a plain record. */
  getAll(): Readonly<SharedConfig> {
    return Object.freeze({ ...this._cfg });
  }

  /**
   * Assert that all of the listed environment variable names are set and non-empty.
   * Throws a descriptive error listing every missing variable.
   */
  static requireEnv(...names: string[]): void {
    const missing = names.filter((n) => !process.env[n]);
    if (missing.length > 0) {
      throw new Error(
        `Missing required environment variable${missing.length > 1 ? 's' : ''}: ${missing.join(', ')}`,
      );
    }
  }

  /**
   * Read a single environment variable, returning `defaultValue` when absent.
   */
  static getEnv(name: string, defaultValue: string = ''): string {
    return process.env[name] ?? defaultValue;
  }
}

/** Shared singleton config instance. */
export const sharedConfig = ConfigLoader.getInstance();
