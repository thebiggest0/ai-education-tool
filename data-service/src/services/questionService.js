import * as questionRepository from '../repositories/questionRepository.js';

/**
 * Get all questions created by an instructor
 * @param {string} instructorId
 * @returns {Promise<Array>}
 */
export async function getInstructorQuestions(instructorId) {
  return questionRepository.getQuestionsByInstructor(instructorId);
}

/**
 * Get the currently active question (with answer_key)
 * @returns {Promise<Object|null>}
 */
export async function getActiveQuestion() {
  return questionRepository.getActiveQuestion();
}

/**
 * Get active question for students (without answer_key)
 * @returns {Promise<Object|null>}
 */
export async function getActiveQuestionForStudent() {
  return questionRepository.getActiveQuestionForStudent();
}

/**
 * Get a question by ID
 * @param {string} questionId
 * @returns {Promise<Object|null>}
 */
export async function getQuestion(questionId) {
  return questionRepository.getQuestionById(questionId);
}

/**
 * Create a new question
 * @param {string} questionText
 * @param {string} answerKey
 * @param {string} instructorId
 * @returns {Promise<Object>}
 */
export async function createQuestion(questionText, answerKey, instructorId) {
  if (!questionText || !answerKey) {
    throw new Error('Question text and answer key are required');
  }

  return questionRepository.createQuestion(questionText, answerKey, instructorId);
}

/**
 * Update a question (only if it's not the active one)
 * @param {string} questionId
 * @param {string} questionText
 * @param {string} answerKey
 * @returns {Promise<Object|null>}
 * @throws {Error} if question is active
 */
export async function updateQuestion(questionId, questionText, answerKey) {
  if (!questionText || !answerKey) {
    throw new Error('Question text and answer key are required');
  }

  const question = await questionRepository.getQuestionById(questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  if (question.active) {
    throw new Error('Cannot update an active question. Deactivate it first.');
  }

  return questionRepository.updateQuestion(questionId, questionText, answerKey);
}

/**
 * Activate a question (deactivates all others)
 * @param {string} questionId
 * @returns {Promise<Object|null>}
 */
export async function activateQuestion(questionId) {
  const question = await questionRepository.getQuestionById(questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  return questionRepository.activateQuestion(questionId);
}

/**
 * Deactivate a question
 * @param {string} questionId
 * @returns {Promise<Object|null>}
 */
export async function deactivateQuestion(questionId) {
  const question = await questionRepository.getQuestionById(questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  return questionRepository.deactivateQuestion(questionId);
}

/**
 * Delete a question (only if it's not active)
 * @param {string} questionId
 * @returns {Promise<boolean>}
 * @throws {Error} if question is active
 */
export async function deleteQuestion(questionId) {
  const question = await questionRepository.getQuestionById(questionId);
  if (!question) {
    throw new Error('Question not found');
  }

  if (question.active) {
    throw new Error('Cannot delete an active question. Deactivate it first.');
  }

  return questionRepository.deleteQuestion(questionId);
}
