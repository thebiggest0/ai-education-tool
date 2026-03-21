import { dataServiceClient } from '../utils/dataServiceClient.js';
import { tokenService } from './tokenService.js';

/**
 * Registers a new user and returns a token pair.
 *
 * @param {object} params - The registration parameters.
 * @param {string} params.username - The desired username.
 * @param {string} params.email - The user's email address.
 * @param {string} params.password - The user's password.
 * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>} The created user and tokens.
 * @throws {Error} If the data service returns an error (e.g., duplicate email/username).
 */
async function register({ username, email, password }) {
  const response = await dataServiceClient.request('/internal/users/create', {
    method: 'POST',
    body: { username, email, password },
  });

  if (response.status !== 201) {
    const error = new Error(response.data.error);
    error.code = response.data.code;
    error.status = response.status;
    throw error;
  }

  const user = response.data;
  const tokens = await tokenService.createTokenPair({
    userId: user.id,
    role: user.role,
  });

  return { user, ...tokens };
}

/**
 * Authenticates a user by identifier and password, returning a token pair on success.
 *
 * @param {object} params - The login parameters.
 * @param {string} params.identifier - The user's email or username.
 * @param {string} params.password - The user's password.
 * @returns {Promise<{user: object, accessToken: string, refreshToken: string}>} The user and tokens.
 * @throws {Error} If the user is not found or the password is incorrect.
 */
async function login({ identifier, password }) {
  const response = await dataServiceClient.request('/internal/users/find', {
    method: 'POST',
    body: { identifier },
  });

  if (response.status !== 200) {
    const error = new Error('Invalid credentials');
    error.code = 'INVALID_CREDENTIALS';
    error.status = 401;
    throw error;
  }

  const user = response.data;

  const bcryptModule = await import('bcrypt');
  const bcrypt = bcryptModule.default;
  const isPasswordValid = await bcrypt.compare(password, user.password_hash);

  if (!isPasswordValid) {
    const error = new Error('Invalid credentials');
    error.code = 'INVALID_CREDENTIALS';
    error.status = 401;
    throw error;
  }

  const tokens = await tokenService.createTokenPair({
    userId: user.id,
    role: user.role,
  });

  return {
    user: {
      id: user.id,
      username: user.username,
      email: user.email,
      role: user.role,
    },
    ...tokens,
  };
}

/**
 * Retrieves the current authenticated user's profile.
 *
 * @param {string} userId - The UUID of the authenticated user.
 * @returns {Promise<object>} The user profile.
 * @throws {Error} If the user is not found.
 */
async function getCurrentUser(userId) {
  const response = await dataServiceClient.request(`/internal/users/${userId}`);

  if (response.status !== 200) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    error.status = 404;
    throw error;
  }

  return response.data;
}

export const authService = {
  register,
  login,
  getCurrentUser,
};
