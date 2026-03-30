/**
 * Core framework - Configuration manager
 * Centralises all environment variable access with typed defaults.
 */

import dotenv from 'dotenv';
import path from 'path';
import type { EnvironmentConfig } from '../types';

// Load the correct .env file depending on NODE_ENV
const envFile =
  process.env.NODE_ENV === 'test' ? '.env.local' : '.env';
dotenv.config({ path: path.resolve(process.cwd(), envFile) });

export class Config {
  private static instance: Config;

  private constructor(private readonly _config: Readonly<EnvironmentConfig>) {}

  /** Return the singleton Config instance */
  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config({
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
}

export const config = Config.getInstance();
