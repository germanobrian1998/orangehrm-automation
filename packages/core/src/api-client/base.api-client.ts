/**
 * Core framework - Base API Client
 * All API-specific clients should extend this class.
 * Provides common HTTP methods with authentication, logging and error handling.
 */

import { Page, APIRequestContext } from '@playwright/test';
import { Logger, createLogger } from '../logger/logger';
import { environment } from '../config/environment';

export class BaseApiClient {
  protected baseURL: string;
  protected authToken: string | null = null;
  protected logger: Logger;
  protected requestContext: APIRequestContext | null = null;

  constructor(protected page: Page) {
    this.baseURL = environment.baseURL;
    this.logger = createLogger(this.constructor.name);
    this.requestContext = page.request;
  }

  /** Authenticate and store the bearer token */
  async authenticate(username: string, password: string): Promise<void> {
    try {
      this.logger.step(1, `Authenticating as ${username}`);

      const response = await this.requestContext!.post(`${this.baseURL}/api/v2/auth/login`, {
        data: { username, password },
      });

      if (!response.ok()) {
        throw new Error(`Authentication failed: ${response.status()}`);
      }

      const data = await response.json();
      this.authToken = data.data?.token || data.access_token;

      this.logger.info(`✓ Authentication successful. Token: ${this.authToken?.substring(0, 20)}...`);
    } catch (error) {
      this.logger.error('Authentication failed', error);
      throw error;
    }
  }

  /** Build authorization header object */
  protected getAuthHeader(): Record<string, string> {
    if (!this.authToken) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }
    return {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
  }

  /** Generic HTTP request with logging and error handling */
  protected async request<T = unknown>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    options?: { data?: unknown; headers?: Record<string, string> }
  ): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = { ...this.getAuthHeader(), ...(options?.headers || {}) };

      this.logger.debug(`${method} ${endpoint}`);

      const response = await (
        this.requestContext as unknown as Record<string, (url: string, opts: unknown) => Promise<{ ok(): boolean; text(): Promise<string>; json(): Promise<unknown>; status(): number }>>
      )[method.toLowerCase()](url, { headers, data: options?.data });

      if (!response.ok()) {
        const errorBody = await response.text();
        throw new Error(`API Error [${response.status()}]: ${errorBody}`);
      }

      const result = await response.json();
      this.logger.info(`✓ ${method} ${endpoint} → ${response.status()}`);
      return result as T;
    } catch (error) {
      this.logger.error(`Request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  protected async get<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  protected async post<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>('POST', endpoint, { data });
  }

  protected async put<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>('PUT', endpoint, { data });
  }

  protected async delete<T = unknown>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  protected async patch<T = unknown>(endpoint: string, data?: unknown): Promise<T> {
    return this.request<T>('PATCH', endpoint, { data });
  }
}
