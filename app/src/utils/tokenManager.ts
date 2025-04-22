import axios from 'axios';
import { AUTH } from '@/constants/apis';

export const TOKEN_KEYS = {
  ACCESS_TOKEN: 'access_token',
  REFRESH_TOKEN: 'refresh_token',
  EXPIRES_AT: 'expires_at',
} as const;

interface TokenResponse {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
}

class TokenManager {
  private static instance: TokenManager;
  private refreshPromise: Promise<string> | null = null;

  private constructor() {
    // Private constructor for singleton
  }

  public static getInstance(): TokenManager {
    if (!TokenManager.instance) {
      TokenManager.instance = new TokenManager();
    }
    return TokenManager.instance;
  }

  public setTokens({ accessToken, refreshToken, expiresIn }: TokenResponse): void {
    const expiresAt = Date.now() + expiresIn * 1000;
    
    localStorage.setItem(TOKEN_KEYS.ACCESS_TOKEN, accessToken);
    localStorage.setItem(TOKEN_KEYS.REFRESH_TOKEN, refreshToken);
    localStorage.setItem(TOKEN_KEYS.EXPIRES_AT, expiresAt.toString());
  }

  public getAccessToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.ACCESS_TOKEN);
  }

  public getRefreshToken(): string | null {
    return localStorage.getItem(TOKEN_KEYS.REFRESH_TOKEN);
  }

  public removeTokens(): void {
    localStorage.removeItem(TOKEN_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.REFRESH_TOKEN);
    localStorage.removeItem(TOKEN_KEYS.EXPIRES_AT);
  }

  public isAuthenticated(): boolean {
    return !!this.getAccessToken() && !this.isTokenExpired();
  }

  public isTokenExpired(): boolean {
    const expiresAt = localStorage.getItem(TOKEN_KEYS.EXPIRES_AT);
    if (!expiresAt) return true;
    return Date.now() >= parseInt(expiresAt);
  }

  public async refreshAccessToken(): Promise<string> {
    // If there's already a refresh in progress, return that promise
    if (this.refreshPromise) {
      return this.refreshPromise;
    }

    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      throw new Error('No refresh token available');
    }

    this.refreshPromise = axios
      .post<TokenResponse>(AUTH.REFRESH, { refreshToken })
      .then((response) => {
        this.setTokens(response.data);
        return response.data.accessToken;
      })
      .catch((error) => {
        this.removeTokens();
        throw error;
      })
      .finally(() => {
        this.refreshPromise = null;
      });

    return this.refreshPromise;
  }
}

export const tokenManager = TokenManager.getInstance(); 