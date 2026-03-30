/**
 * Environment and configuration manager.
 *
 * Reads values from `process.env` (populated by dotenv in consuming projects)
 * and exposes them through a strongly-typed, validated interface.
 *
 * Usage:
 *   import { Config } from '@qa-framework/core';
 *   const cfg = Config.getInstance();
 *   const url = cfg.get('BASE_URL');
 */

import * as dotenv from 'dotenv';
import type { Environment, EnvironmentConfig, LogLevel } from '../types';

dotenv.config();

export class Config {
  private static instance: Config;
  private readonly env: Record<string, string>;

  private constructor() {
    this.env = process.env as Record<string, string>;
  }

  /**
   * Returns the singleton Config instance.
   */
  static getInstance(): Config {
    if (!Config.instance) {
      Config.instance = new Config();
    }
    return Config.instance;
  }

  /**
   * Retrieve a single environment variable.
   * Throws if the variable is required but not set.
   */
  get(key: string, defaultValue?: string): string {
    const value = this.env[key] ?? defaultValue;
    if (value === undefined) {
      throw new Error(`Required environment variable "${key}" is not set.`);
    }
    return value;
  }

  /**
   * Retrieve a numeric environment variable.
   */
  getNumber(key: string, defaultValue?: number): number {
    const raw = this.env[key];
    if (raw === undefined) {
      if (defaultValue !== undefined) return defaultValue;
      throw new Error(`Required environment variable "${key}" is not set.`);
    }
    const parsed = Number(raw);
    if (Number.isNaN(parsed)) {
      throw new Error(`Environment variable "${key}" must be a number, got: "${raw}"`);
    }
    return parsed;
  }

  /**
   * Retrieve a boolean environment variable.
   * Accepts "true" / "1" / "yes" (case-insensitive) as truthy.
   */
  getBoolean(key: string, defaultValue?: boolean): boolean {
    const raw = this.env[key];
    if (raw === undefined) {
      if (defaultValue !== undefined) return defaultValue;
      throw new Error(`Required environment variable "${key}" is not set.`);
    }
    return ['true', '1', 'yes'].includes(raw.toLowerCase());
  }

  /**
   * Build a full EnvironmentConfig object from env vars with sensible defaults.
   */
  getEnvironmentConfig(): EnvironmentConfig {
    return {
      baseUrl: this.get('BASE_URL', 'https://opensource-demo.orangehrmlive.com'),
      apiUrl: this.get('API_URL', 'https://opensource-demo.orangehrmlive.com/api/v2'),
      timeout: this.getNumber('TIMEOUT', 30000),
      retries: this.getNumber('RETRIES', 2),
      logLevel: (this.get('LOG_LEVEL', 'info') as LogLevel),
      environment: (this.get('ENVIRONMENT', 'test') as Environment),
    };
  }
}
