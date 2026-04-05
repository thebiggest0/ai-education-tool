import { writePool, readPool } from '../config/database.js';

/**
 * Saves a student's answer and the corresponding AI evaluation for a question.
 *
 * @param {string} userId - The UUID of the student.
 * @param {string} questionId - The UUID of the question being answered.
 * @param {string} studentAnswer - The student's submitted answer text.
 * @param {number|null} aiScore - The similarity score returned by the AI (0-1), or null.
 * @param {string|null} aiFeedback - The AI-generated feedback text, or null.
 * @returns {Promise<object>} The created response record.
 */
export async function saveResponse(userId, questionId, studentAnswer, aiScore, aiFeedback) {
  const result = await writePool.query(
    `INSERT INTO question_responses (user_id, question_id, student_answer, ai_score, ai_feedback)
     VALUES ($1, $2, $3, $4, $5)
     RETURNING id, user_id, question_id, student_answer, ai_score, ai_feedback, created_at`,
    [userId, questionId, studentAnswer, aiScore, aiFeedback]
  );
  return result.rows[0];
}

/**
 * Retrieves all responses a specific user has submitted for a given question,
 * ordered chronologically so the chat can be reconstructed.
 *
 * @param {string} userId - The UUID of the student.
 * @param {string} questionId - The UUID of the question.
 * @returns {Promise<Array>} Array of response records ordered by creation time ascending.
 */
export async function findByUserAndQuestion(userId, questionId) {
  const result = await readPool.query(
    `SELECT id, user_id, question_id, student_answer, ai_score, ai_feedback, created_at
     FROM question_responses
     WHERE user_id = $1 AND question_id = $2
     ORDER BY created_at ASC`,
    [userId, questionId]
  );
  return result.rows;
}

/**
 * Retrieves all responses a specific user has submitted across all questions.
 *
 * @param {string} userId - The UUID of the student.
 * @returns {Promise<Array>} Array of response records ordered by creation time ascending.
 */
export async function findAllByUser(userId) {
  const result = await readPool.query(
    `SELECT r.id, r.user_id, r.question_id, r.student_answer, r.ai_score, r.ai_feedback, r.created_at,
            q.question_text
     FROM question_responses r
     JOIN question_bank q ON q.id = r.question_id
     WHERE r.user_id = $1
     ORDER BY r.created_at ASC`,
    [userId]
  );
  return result.rows;
}
