import crypto from 'crypto';
import bcrypt from 'bcrypt';
import { passwordResetRepository } from '../repositories/passwordResetRepository.js';
import { userRepository } from '../repositories/userRepository.js';

const SALT_ROUNDS = parseInt(process.env.BCRYPT_SALT_ROUNDS || '12', 10);

/**
 * Hashes a reset token using SHA-256 for secure storage.
 *
 * @param {string} token - The raw reset token.
 * @returns {string} The hex-encoded SHA-256 hash.
 */
function hashToken(token) {
  return crypto.createHash('sha256').update(token).digest('hex');
}

/**
 * Stores a password reset token for a user after clearing any existing tokens.
 *
 * @param {object} params - The storage parameters.
 * @param {string} params.userId - The UUID of the user.
 * @param {string} params.token - The raw reset token to hash and store.
 * @param {Date} params.expiresAt - When the token expires.
 * @returns {Promise<object>} The created token record.
 */
async function storeResetToken({ userId, token, expiresAt }) {
  await passwordResetRepository.deleteAllForUser(userId);
  const tokenHash = hashToken(token);
  return passwordResetRepository.store({ userId, tokenHash, expiresAt });
}

/**
 * Verifies a raw reset token is valid and returns the associated user ID.
 *
 * @param {string} token - The raw reset token to verify.
 * @returns {Promise<object|null>} The token record if valid, or null.
 */
async function verifyResetToken(token) {
  const tokenHash = hashToken(token);
  return passwordResetRepository.findByTokenHash(tokenHash);
}

/**
 * Resets a user's password using a valid reset token.
 * Invalidates the token and all other reset tokens for the user after use.
 *
 * @param {object} params - The reset parameters.
 * @param {string} params.token - The raw reset token.
 * @param {string} params.newPassword - The new plaintext password.
 * @returns {Promise<object>} The updated user record.
 * @throws {Error} If the token is invalid/expired or the user is not found.
 */
async function resetPassword({ token, newPassword }) {
  const tokenHash = hashToken(token);
  const tokenRecord = await passwordResetRepository.findByTokenHash(tokenHash);

  if (!tokenRecord) {
    const error = new Error('Invalid or expired reset token');
    error.code = 'INVALID_RESET_TOKEN';
    throw error;
  }

  const passwordHash = await bcrypt.hash(newPassword, SALT_ROUNDS);
  const user = await userRepository.updatePassword(tokenRecord.user_id, passwordHash);

  if (!user) {
    const error = new Error('User not found');
    error.code = 'USER_NOT_FOUND';
    throw error;
  }

  await passwordResetRepository.deleteAllForUser(tokenRecord.user_id);
  return user;
}

export const passwordResetService = {
  storeResetToken,
  verifyResetToken,
  resetPassword,
};
