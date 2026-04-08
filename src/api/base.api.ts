/**
 * Base API class with common functionality
 * All specific API classes inherit from this
 */

import { Page, APIRequestContext } from '@playwright/test';
import { Logger, createLogger } from '@utils/logger';
import { environment } from '@config/environment';
import { constants } from '@config/constants';

export class BaseAPI {
  protected baseURL: string;
  protected authToken: string | null = null;
  protected logger: Logger;
  protected requestContext: APIRequestContext | null = null;

  constructor(protected page: Page) {
    this.baseURL = environment.baseUrl;
    this.logger = createLogger(this.constructor.name);
    this.requestContext = page.request;
  }

  /**
   * Authenticate user and store token
   */
  async authenticate(username: string, password: string): Promise<void> {
    try {
      this.logger.step(1, `Authenticating as ${username}`);

      const response = await this.requestContext!.post(`${this.baseURL}/api/v2/auth/login`, {
        data: {
          username,
          password,
        },
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

  /**
   * Get authorization header
   */
  protected getAuthHeader(): Record<string, string> {
    if (!this.authToken) {
      throw new Error('Not authenticated. Call authenticate() first.');
    }

    return {
      Authorization: `Bearer ${this.authToken}`,
      'Content-Type': 'application/json',
    };
  }

  /**
   * Make HTTP request with proper headers and error handling
   */
  protected async request<T = any>(
    method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH',
    endpoint: string,
    options?: { data?: any; headers?: Record<string, string> }
  ): Promise<T> {
    try {
      const url = `${this.baseURL}${endpoint}`;
      const headers = {
        ...this.getAuthHeader(),
        ...(options?.headers || {}),
      };

      this.logger.debug(`${method} ${endpoint}`);

      const response = await (this.requestContext! as any)[method.toLowerCase()](url, {
        headers,
        data: options?.data,
      });

      if (!response.ok()) {
        const errorBody = await response.text();
        throw new Error(`API Error [${response.status()}]: ${errorBody}`);
      }

      const result = await response.json();
      this.logger.info(`✓ ${method} ${endpoint} → ${response.status()}`);
      return result;
    } catch (error) {
      this.logger.error(`Request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }

  /**
   * GET request
   */
  protected async get<T = any>(endpoint: string): Promise<T> {
    return this.request<T>('GET', endpoint);
  }

  /**
   * POST request
   */
  protected async post<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('POST', endpoint, { data });
  }

  /**
   * PUT request
   */
  protected async put<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('PUT', endpoint, { data });
  }

  /**
   * DELETE request
   */
  protected async delete<T = any>(endpoint: string): Promise<T> {
    return this.request<T>('DELETE', endpoint);
  }

  /**
   * PATCH request
   */
  protected async patch<T = any>(endpoint: string, data?: any): Promise<T> {
    return this.request<T>('PATCH', endpoint, { data });
  }
}