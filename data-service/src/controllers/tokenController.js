import { tokenService } from '../services/tokenService.js';

/**
 * Handles requests to store a new refresh token.
 *
 * @param {import('express').Request} req - The request containing userId, token, and expiresAt.
 * @param {import('express').Response} res - The response with the stored token record or error.
 */
async function storeToken(req, res) {
  try {
    const { userId, token, expiresAt } = req.body;

    if (!userId || !token || !expiresAt) {
      return res.status(400).json({
        error: 'userId, token, and expiresAt are required',
        code: 'MISSING_FIELDS',
      });
    }

    const record = await tokenService.storeToken({
      userId,
      token,
      expiresAt: new Date(expiresAt),
    });
    return res.status(201).json(record);
  } catch (error) {
    console.error('Error storing token:', error);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

/**
 * Handles requests to verify a refresh token.
 *
 * @param {import('express').Request} req - The request containing the token to verify.
 * @param {import('express').Response} res - The response indicating validity.
 */
async function verifyToken(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required', code: 'MISSING_TOKEN' });
    }

    const record = await tokenService.verifyToken(token);
    if (!record) {
      return res.status(404).json({ error: 'Token not found or expired', code: 'TOKEN_INVALID' });
    }

    return res.json({ valid: true, userId: record.user_id });
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

/**
 * Handles requests to rotate a refresh token (invalidate old, store new).
 *
 * @param {import('express').Request} req - The request containing oldToken, newToken, userId, and expiresAt.
 * @param {import('express').Response} res - The response with the new token record or error.
 */
async function rotateToken(req, res) {
  try {
    const { oldToken, newToken, userId, expiresAt } = req.body;

    if (!oldToken || !newToken || !userId || !expiresAt) {
      return res.status(400).json({
        error: 'oldToken, newToken, userId, and expiresAt are required',
        code: 'MISSING_FIELDS',
      });
    }

    const record = await tokenService.rotateToken({
      oldToken,
      newToken,
      userId,
      expiresAt: new Date(expiresAt),
    });
    return res.json(record);
  } catch (error) {
    console.error('Error rotating token:', error);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

/**
 * Handles requests to revoke one or all refresh tokens for a user.
 *
 * @param {import('express').Request} req - The request containing userId and optional token.
 * @param {import('express').Response} res - The response indicating how many tokens were revoked.
 */
async function revokeToken(req, res) {
  try {
    const { token, userId } = req.body;

    if (!userId) {
      return res.status(400).json({ error: 'userId is required', code: 'MISSING_USER_ID' });
    }

    const revokedCount = await tokenService.revokeToken({ token, userId });
    return res.json({ revoked: revokedCount });
  } catch (error) {
    console.error('Error revoking token:', error);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

export const tokenController = {
  storeToken,
  verifyToken,
  rotateToken,
  revokeToken,
};
