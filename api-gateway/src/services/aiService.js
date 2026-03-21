import { aiServiceClient } from '../utils/aiServiceClient.js';

/**
 * Sends a user prompt to the AI microservice and returns the response.
 * This is the main integration point — your partner should update the
 * endpoint path and request/response shape to match their AI service API.
 *
 * @param {object} params - The request parameters.
 * @param {string} params.prompt - The user's input text.
 * @param {string} params.userId - The authenticated user's ID (for context/logging).
 * @returns {Promise<object>} The AI service response data.
 * @throws {Error} If the AI service returns an error or is unreachable.
 */
async function sendPrompt({ prompt, userId }) {
  // ──────────────────────────────────────────────────────────
  // TODO (partner): Update the path and body to match your AI service API.
  // e.g., '/predict', '/chat', '/generate', '/completions'
  // The body shape should match what your model endpoint expects.
  // ──────────────────────────────────────────────────────────
  const response = await aiServiceClient.request('/predict', {
    method: 'POST',
    body: { prompt, userId },
  });

  if (response.status !== 200) {
    const error = new Error(response.data.error || 'AI service request failed');
    error.code = 'AI_SERVICE_ERROR';
    error.status = response.status;
    throw error;
  }

  return response.data;
}

export const aiService = {
  sendPrompt,
};
