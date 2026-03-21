/**
 * Generic API types and response structures
 */

export interface APIResponse<T = any> {
  data?: T;
  success: boolean;
  message?: string;
  errors?: APIError[];
  status?: number;
}

export interface APIError {
  code: string;
  message: string;
  field?: string;
  details?: any;
}

export interface APIRequestOptions {
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export interface PaginatedResponse<T> {
  data: T[];
  meta: {
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
  };
}

export interface AuthToken {
  access_token: string;
  token_type: string;
  expires_in?: number;
  refresh_token?: string;
}

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
}

/**
 * Generic validation error response from OrangeHRM API
 */
export interface ValidationError {
  field: string;
  message: string;
}

/**
 * HTTP Methods
 */
export type HTTPMethod = 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';

/**
 * Request/Response interceptor types
 */
export interface RequestInterceptor {
  (request: any): any;
}

export interface ResponseInterceptor<T = any> {
  (response: APIResponse<T>): APIResponse<T>;
}