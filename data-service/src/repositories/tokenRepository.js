import { writePool, readPool } from '../config/database.js';

/**
 * Stores a hashed refresh token for a user.
 *
 * @param {object} params - The token storage parameters.
 * @param {string} params.userId - The UUID of the user who owns the token.
 * @param {string} params.tokenHash - The hashed refresh token.
 * @param {Date} params.expiresAt - The expiration date of the token.
 * @returns {Promise<object>} The created token record.
 */
async function store({ userId, tokenHash, expiresAt }) {
  const result = await writePool.query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id, token_hash, expires_at, created_at`,
    [userId, tokenHash, expiresAt]
  );
  return result.rows[0];
}

/**
 * Verifies that a refresh token hash exists and has not expired.
 *
 * @param {string} tokenHash - The hashed refresh token to verify.
 * @returns {Promise<object|null>} The token record if valid, or null if not found or expired.
 */
async function verify(tokenHash) {
  const result = await readPool.query(
    `SELECT id, user_id, token_hash, expires_at, created_at
     FROM refresh_tokens
     WHERE token_hash = $1 AND expires_at > NOW()`,
    [tokenHash]
  );
  return result.rows[0] || null;
}

/**
 * Rotates a refresh token by deleting the old one and storing a new one.
 *
 * @param {object} params - The rotation parameters.
 * @param {string} params.oldTokenHash - The hash of the token to invalidate.
 * @param {string} params.newTokenHash - The hash of the new token to store.
 * @param {string} params.userId - The UUID of the token owner.
 * @param {Date} params.expiresAt - The expiration date of the new token.
 * @returns {Promise<object>} The newly created token record.
 */
async function rotate({ oldTokenHash, newTokenHash, userId, expiresAt }) {
  const client = await writePool.connect();
  try {
    await client.query('BEGIN');
    await client.query(
      `DELETE FROM refresh_tokens WHERE token_hash = $1`,
      [oldTokenHash]
    );
    const result = await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
       VALUES ($1, $2, $3)
       RETURNING id, user_id, token_hash, expires_at, created_at`,
      [userId, newTokenHash, expiresAt]
    );
    await client.query('COMMIT');
    return result.rows[0];
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Revokes a specific refresh token or all tokens for a user.
 *
 * @param {object} params - The revocation parameters.
 * @param {string} [params.tokenHash] - The specific token hash to revoke. If omitted, all user tokens are revoked.
 * @param {string} params.userId - The UUID of the user whose tokens to revoke.
 * @returns {Promise<number>} The number of tokens revoked.
 */
async function revoke({ tokenHash, userId }) {
  if (tokenHash) {
    const result = await writePool.query(
      `DELETE FROM refresh_tokens WHERE token_hash = $1 AND user_id = $2`,
      [tokenHash, userId]
    );
    return result.rowCount;
  }
  const result = await writePool.query(
    `DELETE FROM refresh_tokens WHERE user_id = $1`,
    [userId]
  );
  return result.rowCount;
}

export const tokenRepository = {
  store,
  verify,
  rotate,
  revoke,
};
