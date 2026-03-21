import { api } from './api';
import type { User, AuthResponse, ErrorResponse } from '../types/auth';

/**
 * Registers a new user account and stores the resulting tokens.
 *
 * @param username - The desired username.
 * @param email - The user's email address.
 * @param password - The user's password.
 * @returns The created user record.
 * @throws Error if registration fails.
 */
async function register(
  username: string,
  email: string,
  password: string
): Promise<User> {
  const { data, status } = await api.request<AuthResponse | ErrorResponse>(
    '/auth/register',
    {
      method: 'POST',
      body: JSON.stringify({ username, email, password }),
    }
  );

  if (status !== 201) {
    throw new Error((data as ErrorResponse).error || 'Registration failed');
  }

  const authData = data as AuthResponse;
  localStorage.setItem('accessToken', authData.accessToken);
  localStorage.setItem('refreshToken', authData.refreshToken);
  return authData.user;
}

/**
 * Authenticates a user and stores the resulting tokens.
 *
 * @param identifier - The user's email or username.
 * @param password - The user's password.
 * @returns The authenticated user record.
 * @throws Error if login fails.
 */
async function login(identifier: string, password: string): Promise<User> {
  const { data, status } = await api.request<AuthResponse | ErrorResponse>(
    '/auth/login',
    {
      method: 'POST',
      body: JSON.stringify({ identifier, password }),
    }
  );

  if (status !== 200) {
    throw new Error((data as ErrorResponse).error || 'Login failed');
  }

  const authData = data as AuthResponse;
  localStorage.setItem('accessToken', authData.accessToken);
  localStorage.setItem('refreshToken', authData.refreshToken);
  return authData.user;
}

/**
 * Logs out the current user by revoking the refresh token and clearing local storage.
 */
async function logout(): Promise<void> {
  const refreshToken = localStorage.getItem('refreshToken');

  try {
    await api.request('/auth/logout', {
      method: 'POST',
      body: JSON.stringify({ refreshToken }),
    });
  } finally {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
  }
}

/**
 * Retrieves the current authenticated user's profile.
 *
 * @returns The user record, or null if not authenticated.
 */
async function getCurrentUser(): Promise<User | null> {
  const accessToken = localStorage.getItem('accessToken');
  if (!accessToken) return null;

  const { data, status } = await api.request<User | ErrorResponse>('/auth/me');

  if (status !== 200) return null;

  return data as User;
}

export const authService = { register, login, logout, getCurrentUser };
