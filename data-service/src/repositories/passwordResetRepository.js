import { writePool, readPool } from '../config/database.js';

/**
 * Stores a hashed password reset token for a user.
 *
 * @param {object} params - The storage parameters.
 * @param {string} params.userId - The UUID of the user requesting the reset.
 * @param {string} params.tokenHash - The SHA-256 hash of the reset token.
 * @param {Date} params.expiresAt - The expiration date for the token.
 * @returns {Promise<object>} The created token record.
 */
async function store({ userId, tokenHash, expiresAt }) {
  const result = await writePool.query(
    `INSERT INTO password_reset_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, expires_at, created_at`,
    [userId, tokenHash, expiresAt]
  );
  return result.rows[0];
}

/**
 * Finds a valid (non-expired) password reset token by its hash.
 *
 * @param {string} tokenHash - The SHA-256 hash of the reset token.
 * @returns {Promise<object|null>} The token record if valid, or null if not found or expired.
 */
async function findByTokenHash(tokenHash) {
  const result = await readPool.query(
    `SELECT id, user_id, token_hash, expires_at, created_at
     FROM password_reset_tokens
     WHERE token_hash = $1 AND expires_at > NOW()`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

/**
 * Deletes a specific password reset token by its hash.
 *
 * @param {string} tokenHash - The hash of the token to delete.
 * @returns {Promise<number>} The number of rows deleted.
 */
async function deleteByTokenHash(tokenHash) {
  const result = await writePool.query(
    `DELETE FROM password_reset_tokens WHERE token_hash = $1`,
    [tokenHash]
  );
  return result.rowCount;
}

/**
 * Deletes all password reset tokens for a given user.
 *
 * @param {string} userId - The UUID of the user.
 * @returns {Promise<number>} The number of rows deleted.
 */
async function deleteAllForUser(userId) {
  const result = await writePool.query(
    `DELETE FROM password_reset_tokens WHERE user_id = $1`,
    [userId]
  );
  return result.rowCount;
}

export const passwordResetRepository = {
  store,
  findByTokenHash,
  deleteByTokenHash,
  deleteAllForUser,
};
