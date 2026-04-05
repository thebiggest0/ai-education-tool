import { dataServiceClient } from '../utils/dataServiceClient.js';

/**
 * Saves a student's response and AI evaluation by forwarding to the data service.
 *
 * @param {object} params - The response data.
 * @param {string} params.userId - The UUID of the student.
 * @param {string} params.questionId - The UUID of the question.
 * @param {string} params.studentAnswer - The student's submitted answer.
 * @param {number|null} params.aiScore - The AI similarity score, or null.
 * @param {string|null} params.aiFeedback - The AI feedback text, or null.
 * @returns {Promise<object>} The created response record from the data service.
 * @throws {Error} If the data service returns an error.
 */
export async function saveResponse({ userId, questionId, studentAnswer, aiScore, aiFeedback }) {
  const { status, data } = await dataServiceClient.request('/internal/responses', {
    method: 'POST',
    body: { questionId, studentAnswer, aiScore, aiFeedback },
    headers: { 'x-user-id': userId },
  });

  if (status !== 201) {
    throw new Error(data.error || 'Failed to save response');
  }

  return data;
}

/**
 * Retrieves the chat history for a user on a specific question.
 *
 * @param {string} userId - The UUID of the student.
 * @param {string} questionId - The UUID of the question.
 * @returns {Promise<Array>} Array of response records in chronological order.
 * @throws {Error} If the data service returns an error.
 */
export async function getResponseHistory(userId, questionId) {
  const { status, data } = await dataServiceClient.request(
    `/internal/responses/question/${questionId}`,
    {
      method: 'GET',
      headers: { 'x-user-id': userId },
    }
  );

  if (status !== 200) {
    throw new Error(data.error || 'Failed to fetch response history');
  }

  return data;
}

/**
 * Retrieves all responses submitted by a user across all questions.
 *
 * @param {string} userId - The UUID of the student.
 * @returns {Promise<Array>} Array of response records in chronological order.
 * @throws {Error} If the data service returns an error.
 */
export async function getAllUserResponses(userId) {
  const { status, data } = await dataServiceClient.request('/internal/responses/user', {
    method: 'GET',
    headers: { 'x-user-id': userId },
  });

  if (status !== 200) {
    throw new Error(data.error || 'Failed to fetch user responses');
  }

  return data;
}
