/**
 * BaseApiClient — abstract base class for API testing clients.
 *
 * Uses `axios` under the hood and provides typed GET / POST / PUT / DELETE helpers
 * with integrated logging and error handling.
 *
 * Usage:
 *   import { BaseApiClient } from '@qa-framework/core';
 *
 *   export class EmployeeApiClient extends BaseApiClient {
 *     async getEmployee(id: number) {
 *       return this.get<Employee>(`/employees/${id}`);
 *     }
 *   }
 */

import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { Logger } from '../logger/Logger';
import type { APIRequestOptions, LoginRequest } from '../types';

export abstract class BaseApiClient {
  protected readonly baseUrl: string;
  protected headers: Record<string, string>;
  protected readonly logger: Logger;
  private readonly client: AxiosInstance;
  private authToken: string | null = null;

  constructor(baseUrl: string, defaultHeaders: Record<string, string> = {}) {
    this.baseUrl = baseUrl;
    this.headers = {
      'Content-Type': 'application/json',
      Accept: 'application/json',
      ...defaultHeaders,
    };
    this.logger = new Logger(this.constructor.name);
    this.client = axios.create({
      baseURL: this.baseUrl,
      headers: this.headers,
    });

    this.client.interceptors.request.use((config) => {
      if (this.authToken) {
        config.headers['Authorization'] = `Bearer ${this.authToken}`;
      }
      return config;
    });

    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        const status = error.response?.status ?? 'N/A';
        const message = error.response?.data?.message ?? error.message;
        this.logger.error(`HTTP ${status}: ${message}`);
        return Promise.reject(error);
      },
    );
  }

  // ─── Authentication ───────────────────────────────────────────────────────

  /**
   * Authenticate against a login endpoint and store the bearer token.
   * Override this method if the target API uses a different auth scheme.
   */
  async authenticate(credentials: LoginRequest, loginEndpoint = '/auth/login'): Promise<void> {
    try {
      this.logger.step(1, `Authenticating as ${credentials.username}`);
      const response = await this.client.post<{ access_token: string }>(loginEndpoint, credentials);
      this.authToken = response.data.access_token;
      this.logger.info('✓ Authentication successful');
    } catch (error) {
      this.logger.error('Authentication failed', error);
      throw error;
    }
  }

  /**
   * Manually set the bearer token (e.g. when the token is obtained externally).
   */
  setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Clear the stored bearer token.
   */
  clearAuthToken(): void {
    this.authToken = null;
  }

  // ─── HTTP verbs ───────────────────────────────────────────────────────────

  /**
   * Perform a GET request.
   */
  async get<T = unknown>(endpoint: string, options?: APIRequestOptions): Promise<AxiosResponse<T>> {
    return this.request<T>('GET', endpoint, undefined, options);
  }

  /**
   * Perform a POST request.
   */
  async post<T = unknown>(endpoint: string, body?: unknown, options?: APIRequestOptions): Promise<AxiosResponse<T>> {
    return this.request<T>('POST', endpoint, body, options);
  }

  /**
   * Perform a PUT request.
   */
  async put<T = unknown>(endpoint: string, body?: unknown, options?: APIRequestOptions): Promise<AxiosResponse<T>> {
    return this.request<T>('PUT', endpoint, body, options);
  }

  /**
   * Perform a DELETE request.
   */
  async delete<T = unknown>(endpoint: string, options?: APIRequestOptions): Promise<AxiosResponse<T>> {
    return this.request<T>('DELETE', endpoint, undefined, options);
  }

  /**
   * Perform a PATCH request.
   */
  async patch<T = unknown>(endpoint: string, body?: unknown, options?: APIRequestOptions): Promise<AxiosResponse<T>> {
    return this.request<T>('PATCH', endpoint, body, options);
  }

  // ─── Internal ─────────────────────────────────────────────────────────────

  private async request<T>(
    method: string,
    endpoint: string,
    data?: unknown,
    options?: APIRequestOptions,
  ): Promise<AxiosResponse<T>> {
    try {
      this.logger.debug(`${method} ${endpoint}`);
      const config: AxiosRequestConfig = {
        method,
        url: endpoint,
        data,
        headers: options?.headers,
        timeout: options?.timeout,
      };
      const response = await this.client.request<T>(config);
      this.logger.info(`✓ ${method} ${endpoint} → ${response.status}`);
      return response;
    } catch (error) {
      this.logger.error(`Request failed: ${method} ${endpoint}`, error);
      throw error;
    }
  }
}
