import type { ApiResponse } from '../types/api';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3009';

/**
 * Sends an HTTP request to the API gateway with automatic token handling.
 * Automatically retries with a refreshed token on 401 responses.
 *
 * @param path - The API endpoint path (e.g., '/auth/login').
 * @param options - Fetch configuration options.
 * @returns The parsed response data and status code.
 */
async function request<T>(
  path: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const accessToken = localStorage.getItem('accessToken');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };

  if (accessToken) {
    headers['Authorization'] = `Bearer ${accessToken}`;
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...options,
    headers,
  });

  if (response.status === 401 && accessToken) {
    const refreshed = await attemptTokenRefresh();
    if (refreshed) {
      const newAccessToken = localStorage.getItem('accessToken');
      headers['Authorization'] = `Bearer ${newAccessToken}`;
      const retryResponse = await fetch(`${API_URL}${path}`, {
        ...options,
        headers,
      });
      const retryData = await retryResponse.json();
      return { data: retryData as T, status: retryResponse.status };
    }

    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
    return { data: {} as T, status: 401 };
  }

  const data = await response.json();
  return { data: data as T, status: response.status };
}

/**
 * Attempts to refresh the access token using the stored refresh token.
 *
 * @returns True if the refresh succeeded and new tokens were stored, false otherwise.
 */
async function attemptTokenRefresh(): Promise<boolean> {
  const refreshToken = localStorage.getItem('refreshToken');
  if (!refreshToken) return false;

  try {
    const response = await fetch(`${API_URL}/auth/refresh`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refreshToken }),
    });

    if (!response.ok) return false;

    const data = await response.json();
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('refreshToken', data.refreshToken);
    return true;
  } catch {
    return false;
  }
}

export const api = { request };
