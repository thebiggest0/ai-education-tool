import { passwordResetService } from '../services/passwordResetService.js';

/**
 * Handles forgot-password requests. Sends a reset email if the account exists.
 * Always returns success to prevent user enumeration.
 *
 * @param {import('express').Request} req - The request containing the email address.
 * @param {import('express').Response} res - The response confirming the request was processed.
 */
async function forgotPassword(req, res) {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        error: 'Email is required',
        code: 'MISSING_EMAIL',
      });
    }

    await passwordResetService.requestPasswordReset(email);

    return res.json({
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  } catch (error) {
    console.error('Error in forgot password:', error);
    return res.json({
      message: 'If an account with that email exists, a reset link has been sent.',
    });
  }
}

/**
 * Handles password reset requests with a valid token and new password.
 *
 * @param {import('express').Request} req - The request containing token and newPassword.
 * @param {import('express').Response} res - The response confirming the password was reset.
 */
async function resetPassword(req, res) {
  try {
    const { token, newPassword } = req.body;

    if (!token || !newPassword) {
      return res.status(400).json({
        error: 'Token and new password are required',
        code: 'MISSING_FIELDS',
      });
    }

    if (newPassword.length < 8) {
      return res.status(400).json({
        error: 'Password must be at least 8 characters',
        code: 'WEAK_PASSWORD',
      });
    }

    await passwordResetService.resetPassword({ token, newPassword });

    return res.json({ message: 'Password has been reset successfully' });
  } catch (error) {
    if (error.code === 'INVALID_RESET_TOKEN') {
      return res.status(400).json({
        error: 'Invalid or expired reset link. Please request a new one.',
        code: 'INVALID_RESET_TOKEN',
      });
    }
    console.error('Error resetting password:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export const passwordResetController = {
  forgotPassword,
  resetPassword,
};
