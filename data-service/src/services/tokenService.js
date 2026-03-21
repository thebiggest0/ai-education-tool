import crypto from 'crypto';
import { tokenRepository } from '../repositories/tokenRepository.js';

/**
 * Hashes a refresh token using SHA-256 for secure storage.
 *
 * @param {string} token - The raw refresh token to hash.
 * @returns {string} The hex-encoded SHA-256 hash of the token.
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Stores a refresh token hash associated with a user.
 *
 * @param {object} params - The storage parameters.
 * @param {string} params.userId - The UUID of the token owner.
 * @param {string} params.token - The raw refresh token to hash and store.
 * @param {Date} params.expiresAt - The expiration date for the token.
 * @returns {Promise<object>} The created token record.
 */
async function storeToken({ userId, token, expiresAt }) {
  const tokenHash = hashToken(token);
  return tokenRepository.store({ userId, tokenHash, expiresAt });
}

/**
 * Verifies that a raw refresh token exists in storage and has not expired.
 *
 * @param {string} token - The raw refresh token to verify.
 * @returns {Promise<object|null>} The token record if valid, or null otherwise.
 */
async function verifyToken(token) {
  const tokenHash = hashToken(token);
  return tokenRepository.verify(tokenHash);
}

/**
 * Rotates a refresh token by invalidating the old one and storing a new one.
 *
 * @param {object} params - The rotation parameters.
 * @param {string} params.oldToken - The raw old refresh token to invalidate.
 * @param {string} params.newToken - The raw new refresh token to store.
 * @param {string} params.userId - The UUID of the token owner.
 * @param {Date} params.expiresAt - The expiration date for the new token.
 * @returns {Promise<object>} The newly created token record.
 */
async function rotateToken({ oldToken, newToken, userId, expiresAt }) {
  const oldTokenHash = hashToken(oldToken);
  const newTokenHash = hashToken(newToken);
  return tokenRepository.rotate({
    oldTokenHash,
    newTokenHash,
    userId,
    expiresAt,
  });
}

/**
 * Revokes a specific refresh token or all tokens for a user.
 *
 * @param {object} params - The revocation parameters.
 * @param {string} [params.token] - The raw refresh token to revoke. If omitted, all user tokens are revoked.
 * @param {string} params.userId - The UUID of the user.
 * @returns {Promise<number>} The number of tokens revoked.
 */
async function revokeToken({ token, userId }) {
  const tokenHash = token ? hashToken(token) : undefined;
  return tokenRepository.revoke({ tokenHash, userId });
}

export const tokenService = {
  storeToken,
  verifyToken,
  rotateToken,
  revokeToken,
};
