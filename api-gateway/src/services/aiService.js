import { aiServiceClient } from '../utils/aiServiceClient.js';

/**
 * Sends a user prompt or answer comparison to the AI microservice.
 * Handles both legacy prompt mode and new answer comparison mode.
 *
 * @param {object} params - The request parameters.
 * @param {string} [params.prompt] - The user's input text (legacy mode).
 * @param {string} [params.student_answer] - The student's answer (answer comparison mode).
 * @param {string} [params.correct_answer] - The correct answer (answer comparison mode).
 * @param {string} params.userId - The authenticated user's ID (for context/logging).
 * @returns {Promise<object>} The AI service response data.
 * @throws {Error} If the AI service returns an error or is unreachable.
 */
async function sendPrompt({ prompt, student_answer, correct_answer, userId }) {
  let body;

  // Determine which mode this is based on the parameters provided
  if (student_answer && correct_answer) {
    // Answer comparison mode
    body = { student_answer, correct_answer };
  } else if (prompt) {
    // Legacy prompt mode
    body = { text: prompt };
  } else {
    throw new Error('Invalid request: must provide either prompt or student_answer/correct_answer');
  }

  const response = await aiServiceClient.request('/analyze', {
    method: 'POST',
    body,
  });

  if (response.status !== 200) {
    const error = new Error(response.data.error || 'AI service request failed');
    error.code = 'AI_SERVICE_ERROR';
    error.status = response.status;
    throw error;
  }

  console.log('AI service response:', response.data);
  return response.data;
}

export const aiService = {
  sendPrompt,
};
