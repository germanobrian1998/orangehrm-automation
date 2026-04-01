/**
 * OrangeHRM API Suite - Auth API Client
 * Provides typed methods for OrangeHRM authentication endpoints.
 */

import { Page } from '@playwright/test';
import { BaseApiClient } from '@qa-framework/core';
import {
  AuthResponse,
  LoginCredentials,
  RefreshTokenRequest,
  VerifyTokenResponse,
} from '../schemas/Auth';

export class AuthAPIClient extends BaseApiClient {
  constructor(page: Page) {
    super(page);
  }

  /** Login with credentials and return auth token */
  async login(credentials: LoginCredentials): Promise<AuthResponse> {
    try {
      this.logger.step(1, `Logging in as ${credentials.username}`);
      const response = await this.post<AuthResponse>('/api/v1/auth/login', credentials);
      this.logger.info('✓ Login successful');
      return response;
    } catch (error) {
      this.logger.error('Login failed', error);
      throw error;
    }
  }

  /** Logout the current session */
  async logout(): Promise<void> {
    try {
      this.logger.step(1, 'Logging out');
      await this.post('/api/v1/auth/logout');
      this.logger.info('✓ Logout successful');
    } catch (error) {
      this.logger.error('Logout failed', error);
      throw error;
    }
  }

  /** Refresh the authentication token */
  async refreshToken(request: RefreshTokenRequest): Promise<AuthResponse> {
    try {
      this.logger.step(1, 'Refreshing auth token');
      const response = await this.post<AuthResponse>('/api/v1/auth/refresh-token', request);
      this.logger.info('✓ Token refreshed');
      return response;
    } catch (error) {
      this.logger.error('Token refresh failed', error);
      throw error;
    }
  }

  /** Verify the current auth token */
  async verifyToken(): Promise<VerifyTokenResponse> {
    try {
      const response = await this.get<VerifyTokenResponse>('/api/v1/auth/verify-token');
      return response;
    } catch (error) {
      this.logger.error('Token verification failed', error);
      throw error;
    }
  }
}
