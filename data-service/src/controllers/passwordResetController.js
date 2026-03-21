import { passwordResetService } from '../services/passwordResetService.js';

/**
 * Handles requests to store a password reset token.
 *
 * @param {import('express').Request} req - The request containing userId, token, and expiresAt.
 * @param {import('express').Response} res - The response with the stored record or error.
 */
async function storeResetToken(req, res) {
  try {
    const { userId, token, expiresAt } = req.body;

    if (!userId || !token || !expiresAt) {
      return res.status(400).json({
        error: 'userId, token, and expiresAt are required',
        code: 'MISSING_FIELDS',
      });
    }

    const record = await passwordResetService.storeResetToken({
      userId,
      token,
      expiresAt: new Date(expiresAt),
    });
    return res.status(201).json(record);
  } catch (error) {
    console.error('Error storing reset token:', error);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

/**
 * Handles requests to verify a password reset token.
 *
 * @param {import('express').Request} req - The request containing the token to verify.
 * @param {import('express').Response} res - The response indicating validity.
 */
async function verifyResetToken(req, res) {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({ error: 'Token is required', code: 'MISSING_TOKEN' });
    }

    const record = await passwordResetService.verifyResetToken(token);
    if (!record) {
      return res.status(404).json({ error: 'Invalid or expired reset token', code: 'INVALID_RESET_TOKEN' });
    }

    return res.json({ valid: true, userId: record.user_id });
  } catch (error) {
    console.error('Error verifying reset token:', error);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

/**
 * Handles requests to reset a user's password using a valid token.
 *
 * @param {import('express').Request} req - The request containing token and newPassword.
 * @param {import('express').Response} res - The response with the updated user or error.
 */
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and newPassword are required',
        code: 'MISSING_FIELDS',
      });
    }

    const user = await passwordResetService.resetPassword({ token, newPassword });
    return res.json(user);
  } catch (error) {
    if (error.code === 'INVALID_RESET_TOKEN') {
      return res.status(400).json({ error: error.message, code: error.code });
    }
    if (error.code === 'USER_NOT_FOUND') {
      return res.status(404).json({ error: error.message, code: error.code });
    }
    console.error('Error resetting password:', error);
    return res.status(500).json({ error: 'Internal server error', code: 'INTERNAL_ERROR' });
  }
}

export const passwordResetController = {
  storeResetToken,
  verifyResetToken,
  resetPassword,
};
