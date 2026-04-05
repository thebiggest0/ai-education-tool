import { dataServiceClient } from '../utils/dataServiceClient.js';

/**
 * Get all questions created by an instructor
 * @param {object} params
 * @param {string} params.userId - The instructor's user ID
 * @returns {Promise<Array>}
 */
export async function getInstructorQuestions({ userId }) {
  const response = await dataServiceClient.request('/internal/questions/instructor', {
    method: 'GET',
    headers: { 'x-user-id': userId },
  });

  if (response.status !== 200) {
    throw new Error(response.data.error || 'Failed to fetch instructor questions');
  }

  return response.data;
}

/**
 * Get the currently active question (with answer_key for instructors)
 * @returns {Promise<Object|null>}
 */
export async function getActiveQuestion() {
  const response = await dataServiceClient.request('/internal/questions/active', {
    method: 'GET',
  });

  if (response.status !== 200) {
    throw new Error(response.data.error || 'Failed to fetch active question');
  }

  return response.data;
}

/**
 * Get the currently active question for students (without answer_key)
 * @returns {Promise<Object|null>}
 */
export async function getActiveQuestionForStudent() {
  const response = await dataServiceClient.request('/internal/questions/active-student', {
    method: 'GET',
  });

  if (response.status !== 200) {
    throw new Error(response.data.error || 'Failed to fetch active question');
  }

  return response.data;
}

/**
 * Get a specific question by ID
 * @param {string} questionId
 * @returns {Promise<Object|null>}
 */
export async function getQuestion(questionId) {
  const response = await dataServiceClient.request(`/internal/questions/${questionId}`, {
    method: 'GET',
  });

  if (response.status === 404) {
    return null;
  }

  if (response.status !== 200) {
    throw new Error(response.data.error || 'Failed to fetch question');
  }

  return response.data;
}

/**
 * Create a new question
 * @param {object} params
 * @param {string} params.questionText
 * @param {string} params.answerKey
 * @param {string} params.userId - The instructor's user ID
 * @returns {Promise<Object>}
 */
export async function createQuestion({ questionText, answerKey, userId }) {
  const response = await dataServiceClient.request('/internal/questions', {
    method: 'POST',
    body: { questionText, answerKey },
    headers: { 'x-user-id': userId },
  });

  if (response.status !== 201) {
    throw new Error(response.data.error || 'Failed to create question');
  }

  return response.data;
}

/**
 * Update a question
 * @param {object} params
 * @param {string} params.questionId
 * @param {string} params.questionText
 * @param {string} params.answerKey
 * @returns {Promise<Object>}
 */
export async function updateQuestion({ questionId, questionText, answerKey }) {
  const response = await dataServiceClient.request(`/internal/questions/${questionId}`, {
    method: 'PUT',
    body: { questionText, answerKey },
  });

  if (response.status === 404) {
    throw new Error('Question not found');
  }

  if (response.status !== 200) {
    throw new Error(response.data.error || 'Failed to update question');
  }

  return response.data;
}

/**
 * Activate a question
 * @param {string} questionId
 * @returns {Promise<Object>}
 */
export async function activateQuestion(questionId) {
  const response = await dataServiceClient.request(`/internal/questions/${questionId}/activate`, {
    method: 'POST',
  });

  if (response.status === 404) {
    throw new Error('Question not found');
  }

  if (response.status !== 200) {
    throw new Error(response.data.error || 'Failed to activate question');
  }

  return response.data;
}

/**
 * Deactivate a question
 * @param {string} questionId
 * @returns {Promise<Object>}
 */
export async function deactivateQuestion(questionId) {
  const response = await dataServiceClient.request(`/internal/questions/${questionId}/deactivate`, {
    method: 'POST',
  });

  if (response.status === 404) {
    throw new Error('Question not found');
  }

  if (response.status !== 200) {
    throw new Error(response.data.error || 'Failed to deactivate question');
  }

  return response.data;
}

/**
 * Delete a question
 * @param {string} questionId
 * @returns {Promise<void>}
 */
export async function deleteQuestion(questionId) {
  const response = await dataServiceClient.request(`/internal/questions/${questionId}`, {
    method: 'DELETE',
  });

  if (response.status === 404) {
    throw new Error('Question not found');
  }

  if (response.status !== 204) {
    throw new Error(response.data.error || 'Failed to delete question');
  }
}
