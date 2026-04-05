import * as responseRepository from '../repositories/responseRepository.js';

/**
 * Saves a student's answer along with the AI evaluation results for a question.
 *
 * @param {string} userId - The UUID of the student.
 * @param {string} questionId - The UUID of the question.
 * @param {string} studentAnswer - The student's submitted answer text.
 * @param {number|null} aiScore - The AI similarity score (0-1), or null if unavailable.
 * @param {string|null} aiFeedback - The AI feedback text, or null if unavailable.
 * @returns {Promise<object>} The created response record.
 */
export async function saveResponse(userId, questionId, studentAnswer, aiScore, aiFeedback) {
  return responseRepository.saveResponse(userId, questionId, studentAnswer, aiScore, aiFeedback);
}

/**
 * Retrieves the chat history for a user on a specific question.
 *
 * @param {string} userId - The UUID of the student.
 * @param {string} questionId - The UUID of the question.
 * @returns {Promise<Array>} Array of response records in chronological order.
 */
export async function getResponseHistory(userId, questionId) {
  return responseRepository.findByUserAndQuestion(userId, questionId);
}

/**
 * Retrieves all responses submitted by a user across all questions.
 *
 * @param {string} userId - The UUID of the student.
 * @returns {Promise<Array>} Array of response records in chronological order.
 */
export async function getAllUserResponses(userId) {
  return responseRepository.findAllByUser(userId);
}

/**
 * Returns the number of AI API calls a user has consumed.
 *
 * @param {string} userId - The UUID of the student.
 * @returns {Promise<number>} The total API calls used.
 */
export async function getUserApiCallCount(userId) {
  return responseRepository.countByUser(userId);
}

/**
 * Returns API usage statistics for all users (admin view).
 *
 * @returns {Promise<Array>} Array of user records with their api_calls_used count.
 */
export async function getAllUsersApiUsage() {
  return responseRepository.getUsageForAllUsers();
}
