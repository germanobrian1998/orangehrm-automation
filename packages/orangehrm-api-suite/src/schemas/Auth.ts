/**
 * OrangeHRM API Suite - Authentication TypeScript interfaces
 */

export interface LoginCredentials {
  username: string;
  password: string;
}

export interface AuthToken {
  token: string;
  tokenType?: string;
  expiresIn?: number;
}

export interface AuthResponse {
  data: {
    token: string;
    tokenType?: string;
    expiresIn?: number;
  };
}

export interface RefreshTokenRequest {
  refreshToken: string;
}

export interface VerifyTokenResponse {
  data: {
    valid: boolean;
    username?: string;
    expiresAt?: string;
  };
}
