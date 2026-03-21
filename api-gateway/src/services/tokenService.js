import jwt from 'jsonwebtoken';
import crypto from 'crypto';
import { config } from '../config/env.js';
import { dataServiceClient } from '../utils/dataServiceClient.js';

const ACCESS_TOKEN_EXPIRY = '15m';
const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

/**
 * Generates a JWT access token containing the user's ID and role.
 *
 * @param {object} params - The token payload parameters.
 * @param {string} params.userId - The UUID of the user.
 * @param {string} params.role - The user's role.
 * @returns {string} The signed JWT access token.
 */
function generateAccessToken({ userId, role }) {
  return jwt.sign({ userId, role }, config.accessTokenSecret, {
    expiresIn: ACCESS_TOKEN_EXPIRY,
  });
}

/**
 * Generates a cryptographically random refresh token string.
 *
 * @returns {string} A hex-encoded random token.
 */
function generateRefreshToken() {
  return crypto.randomBytes(64).toString('hex');
}

/**
 * Verifies and decodes a JWT access token.
 *
 * @param {string} token - The JWT access token to verify.
 * @returns {object} The decoded token payload.
 * @throws {jwt.JsonWebTokenError} If the token is invalid or expired.
 */
function verifyAccessToken(token) {
  return jwt.verify(token, config.accessTokenSecret);
}

/**
 * Creates a new token pair (access + refresh) and stores the refresh token in the data service.
 *
 * @param {object} params - The user parameters.
 * @param {string} params.userId - The UUID of the user.
 * @param {string} params.role - The user's role.
 * @returns {Promise<{accessToken: string, refreshToken: string}>} The generated token pair.
 */
async function createTokenPair({ userId, role }) {
  const accessToken = generateAccessToken({ userId, role });
  const refreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await dataServiceClient.request('/internal/tokens/store', {
    method: 'POST',
    body: { userId, token: refreshToken, expiresAt: expiresAt.toISOString() },
  });

  return { accessToken, refreshToken };
}

/**
 * Rotates a refresh token by verifying the old one, creating a new pair, and invalidating the old token.
 *
 * @param {string} oldRefreshToken - The current refresh token to rotate.
 * @returns {Promise<{accessToken: string, refreshToken: string}>} The new token pair.
 * @throws {Error} If the old refresh token is invalid or expired.
 */
async function rotateTokens(oldRefreshToken) {
  const verifyResponse = await dataServiceClient.request('/internal/tokens/verify', {
    method: 'POST',
    body: { token: oldRefreshToken },
  });

  if (verifyResponse.status !== 200) {
    const error = new Error('Invalid or expired refresh token');
    error.code = 'INVALID_REFRESH_TOKEN';
    throw error;
  }

  const { userId } = verifyResponse.data;

  const userResponse = await dataServiceClient.request(`/internal/users/${userId}`);
  if (userResponse.status !== 200) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  const { role } = userResponse.data;
  const newRefreshToken = generateRefreshToken();
  const expiresAt = new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS);

  await dataServiceClient.request('/internal/tokens/rotate', {
    method: 'POST',
    body: {
      oldToken: oldRefreshToken,
      newToken: newRefreshToken,
      userId,
      expiresAt: expiresAt.toISOString(),
    },
  });

  const accessToken = generateAccessToken({ userId, role });
  return { accessToken, refreshToken: newRefreshToken };
}

/**
 * Revokes a refresh token via the data service.
 *
 * @param {object} params - The revocation parameters.
 * @param {string} [params.token] - The specific refresh token to revoke.
 * @param {string} params.userId - The UUID of the user.
 * @returns {Promise<void>}
 */
async function revokeRefreshToken({ token, userId }) {
  await dataServiceClient.request('/internal/tokens/revoke', {
    method: 'DELETE',
    body: { token, userId },
  });
}

export const tokenService = {
  generateAccessToken,
  verifyAccessToken,
  createTokenPair,
  rotateTokens,
  revokeRefreshToken,
};
