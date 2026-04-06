/**
 * Core framework - Configuration manager
 * Centralises all environment variable access with typed defaults.
 * Supports multi-environment loading via the ENVIRONMENT variable.
 */

import dotenv from 'dotenv';
import fs from 'fs';
import path from 'path';
import type { EnvironmentConfig, BrowserName } from '../types';

/**
 * Load the appropriate .env file based on the ENVIRONMENT variable.
 * Priority: ENVIRONMENT-specific file > .env > built-in defaults.
 * In Jest (NODE_ENV=test) .env.local is tried first so unit tests can
 * override values without touching committed env files.
 */
function loadEnvFile(): void {
  const cwd = process.cwd();

  if (process.env.NODE_ENV === 'test') {
    const localFile = path.resolve(cwd, '.env.local');
    if (fs.existsSync(localFile)) {
      dotenv.config({ path: localFile });
      return;
    }
  }

  const environment = process.env.ENVIRONMENT;
  if (environment) {
    const envSpecific = path.resolve(cwd, `.env.${environment}`);
    if (fs.existsSync(envSpecific)) {
      dotenv.config({ path: envSpecific });
      return;
    }
    console.warn(
      `[Config] .env.${environment} not found – falling back to .env`,
    );
  }

  dotenv.config({ path: path.resolve(cwd, '.env') });
}

loadEnvFile();

const VALID_BROWSERS: BrowserName[] = ['chromium', 'firefox', 'webkit'];

function parseBrowser(value: string | undefined): BrowserName {
  const browser = value || 'chromium';
  if (VALID_BROWSERS.includes(browser as BrowserName)) {
    return browser as BrowserName;
  }
  console.warn(`[Config] Invalid BROWSER value "${browser}". Falling back to "chromium".`);
  return 'chromium';
}

export class Config {
  private static instance: Config;

  private constructor(private readonly _config: Readonly<EnvironmentConfig>) {}

  /** Return the singleton Config instance */
  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config({
        environment: process.env.ENVIRONMENT || 'development',
        baseURL:
          process.env.ORANGEHRM_BASE_URL ||
          'https://opensource-demo.orangehrmlive.com',
        adminUsername:
          process.env.ORANGEHRM_ADMIN_USERNAME || 'Admin',
        adminPassword:
          process.env.ORANGEHRM_ADMIN_PASSWORD || 'admin123',
        testTimeout: parseInt(process.env.TEST_TIMEOUT || '30000', 10),
        apiTimeout: parseInt(process.env.API_TIMEOUT || '10000', 10),
        logLevel: process.env.LOG_LEVEL || 'info',
        debug: process.env.DEBUG === 'true',
        isCI: process.env.CI === 'true',
        isDev: process.env.NODE_ENV !== 'production',
        browser: parseBrowser(process.env.BROWSER),
        headless: process.env.HEADLESS !== 'false',
      });
    }
    return Config.instance;
  }

  /** Reset the singleton (useful in tests) */
  static reset(): void {
    Config.instance = undefined as unknown as Config;
  }

  get<K extends keyof EnvironmentConfig>(key: K): EnvironmentConfig[K] {
    return this._config[key];
  }

  getAll(): Readonly<EnvironmentConfig> {
    return this._config;
  }

  get baseURL(): string {
    return this._config.baseURL;
  }

  get environment(): string {
    return this._config.environment;
  }

  /** Provides method-based access to the current environment name (e.g. "development", "staging", "ci"). */
  getEnvironment(): string {
    return this._config.environment;
  }

  get adminUsername(): string {
    return this._config.adminUsername;
  }

  get adminPassword(): string {
    return this._config.adminPassword;
  }

  get testTimeout(): number {
    return this._config.testTimeout;
  }

  get apiTimeout(): number {
    return this._config.apiTimeout;
  }

  get logLevel(): string {
    return this._config.logLevel;
  }

  get debug(): boolean {
    return this._config.debug;
  }

  get isCI(): boolean {
    return this._config.isCI;
  }

  get isDev(): boolean {
    return this._config.isDev;
  }

  get browser(): BrowserName {
    return this._config.browser;
  }

  get headless(): boolean {
    return this._config.headless;
  }
}

export const config = Config.getInstance();
