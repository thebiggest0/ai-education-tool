import { Resend } from 'resend';
import { config } from '../config/env.js';

const resend = new Resend(config.resendApiKey);

/**
 * Sends a password reset email containing a link with the reset token.
 *
 * @param {object} params - The email parameters.
 * @param {string} params.toEmail - The recipient's email address.
 * @param {string} params.username - The recipient's username for personalization.
 * @param {string} params.resetToken - The raw reset token to include in the link.
 * @returns {Promise<object>} The Resend API response.
 */
async function sendPasswordResetEmail({ toEmail, username, resetToken }) {
  const resetUrl = `${config.frontendUrl}/ai-education-tool/reset-password?token=${resetToken}`;

  const { data, error } = await resend.emails.send({
    from: config.resendFromEmail,
    to: toEmail,
    subject: 'Reset your password — AI Education Tool',
    html: `
      <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 480px; margin: 0 auto; padding: 40px 20px;">
        <h2 style="color: #1e293b; margin-bottom: 16px;">Password Reset</h2>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          Hi <strong>${username}</strong>,
        </p>
        <p style="color: #475569; font-size: 15px; line-height: 1.6;">
          We received a request to reset your password. Click the button below to choose a new one. This link expires in 1 hour.
        </p>
        <a href="${resetUrl}" style="display: inline-block; margin: 24px 0; padding: 12px 32px; background-color: #4f46e5; color: #ffffff; text-decoration: none; border-radius: 8px; font-weight: 600; font-size: 14px;">
          Reset Password
        </a>
        <p style="color: #94a3b8; font-size: 13px; line-height: 1.6;">
          If you didn't request this, you can safely ignore this email.
        </p>
        <hr style="border: none; border-top: 1px solid #e2e8f0; margin: 32px 0 16px;" />
        <p style="color: #94a3b8; font-size: 12px;">AI Education Tool</p>
      </div>
    `,
  });

  if (error) {
    console.error('Failed to send reset email:', error);
    throw new Error('Failed to send reset email');
  }

  return data;
}

export const emailService = {
  sendPasswordResetEmail,
};
