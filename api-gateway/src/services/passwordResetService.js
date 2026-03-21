import crypto from 'crypto';
import { dataServiceClient } from '../utils/dataServiceClient.js';
import { emailService } from './emailService.js';

const RESET_TOKEN_EXPIRY_MS = 60 * 60 * 1000; // 1 hour

/**
 * Initiates a password reset by generating a token, storing it, and emailing the user.
 * Silently succeeds even if the email is not found to prevent user enumeration.
 *
 * @param {string} email - The email address of the user requesting the reset.
 * @returns {Promise<void>}
 */
async function requestPasswordReset(email) {
  const userResponse = await dataServiceClient.request('/internal/users/find', {
    method: 'POST',
    body: { identifier: email },
  });

  if (userResponse.status !== 200) {
    return;
  }

  const user = userResponse.data;
  const resetToken = crypto.randomBytes(64).toString('hex');
  const expiresAt = new Date(Date.now() + RESET_TOKEN_EXPIRY_MS);

  await dataServiceClient.request('/internal/password-reset/store', {
    method: 'POST',
    body: {
      userId: user.id,
      token: resetToken,
      expiresAt: expiresAt.toISOString(),
    },
  });

  await emailService.sendPasswordResetEmail({
    toEmail: user.email,
    username: user.username,
    resetToken,
  });
}

/**
 * Resets a user's password using a valid reset token.
 *
 * @param {object} params - The reset parameters.
 * @param {string} params.token - The raw reset token from the email link.
 * @param {string} params.newPassword - The new password.
 * @returns {Promise<object>} The response from the data service.
 * @throws {Error} If the token is invalid or the reset fails.
 */
async function resetPassword({ token, newPassword }) {
  const response = await dataServiceClient.request('/internal/password-reset/reset', {
    method: 'POST',
    body: { token, newPassword },
  });

  if (response.status !== 200) {
    const error = new Error(response.data.error || 'Password reset failed');
    error.code = response.data.code || 'RESET_FAILED';
    error.status = response.status;
    throw error;
  }

  return response.data;
}

export const passwordResetService = {
  requestPasswordReset,
  resetPassword,
};
