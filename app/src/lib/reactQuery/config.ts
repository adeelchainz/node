// src/lib/api/client.ts

// Custom error type without using classes
export type ApiError = Error & {
  status: number;
  statusText: string;
};

// Create an API error
export const createApiError = (status: number, statusText: string, message: string): ApiError => {
  const error = new Error(message) as ApiError;
  error.status = status;
  error.statusText = statusText;
  error.name = 'ApiError';
  return error;
};

// Base API URL
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// Parse API response based on content type
export const parseResponse = async <T>(response: Response): Promise<T> => {
  const contentType = response.headers.get('Content-Type') || '';
  
  if (contentType.includes('application/json')) {
    return response.json();
  } else if (contentType.includes('text/')) {
    return response.text() as unknown as T;
  } else if (contentType.includes('form-data')) {
    return response.formData() as unknown as T;
  } else {
    return response.blob() as unknown as T;
  }
};

// Handle API responses and errors
export const handleResponse = async <T>(response: Response): Promise<T> => {
  if (!response.ok) {
    let errorMessage: string;
    
    try {
      const errorData = await response.json();
      errorMessage = errorData.message || errorData.error || `API error: ${response.status} ${response.statusText}`;
    } catch {
      errorMessage = `API error: ${response.status} ${response.statusText}`;
    }
    
    throw createApiError(response.status, response.statusText, errorMessage);
  }
  
  return parseResponse<T>(response);
};

// Refresh authentication token
export const refreshAuthToken = async (): Promise<string | null> => {
  if (typeof window === 'undefined') {
    return null;
  }
  
  const refreshToken = localStorage.getItem('refresh_token');
  if (!refreshToken) {
    return null;
  }
  
  try {
    const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });
    
    if (!response.ok) {
      throw createApiError(response.status, response.statusText, 'Failed to refresh token');
    }
    
    const data = await response.json();
    localStorage.setItem('auth_token', data.token);
    return data.token;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  } catch (error) {
    localStorage.removeItem('auth_token');
    localStorage.removeItem('refresh_token');
    if (typeof window !== 'undefined') {
      window.location.href = '/login?session_expired=true';
    }
    return null;
  }
};

// Main fetch client function
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const fetchClient = async <T = any>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> => {
  const url = endpoint.startsWith('http') ? endpoint : `${API_BASE_URL}${endpoint}`;
  
  // Prepare headers
  const headers = new Headers(options.headers || {});
  
  if (!headers.has('Content-Type') && !(options.body instanceof FormData)) {
    headers.set('Content-Type', 'application/json');
  }
  
  // Add auth token if available (client-side only)
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('auth_token');
    if (token && !headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  
  // Prepare the request
  const config: RequestInit = {
    ...options,
    headers,
  };
  
  try {
    const response = await fetch(url, config);
    
    // Handle token expiration (401 errors)
    if (response.status === 401 && typeof window !== 'undefined') {
      const newToken = await refreshAuthToken();
      
      if (newToken) {
        // Retry the original request with new token
        headers.set('Authorization', `Bearer ${newToken}`);
        const retryResponse = await fetch(url, { ...config, headers });
        return handleResponse<T>(retryResponse);
      }
    }
    
    return handleResponse<T>(response);
  } catch (error) {
    if (error instanceof Error && 'status' in error) {
      throw error; // Re-throw API errors
    }
    throw createApiError(500, 'Request Failed', error instanceof Error ? error.message : 'Network request failed');
  }
};