import { writePool, readPool } from '../config/database.js';

/**
 * Get all questions created by a specific instructor
 * @param {string} instructorId - The UUID of the instructor
 * @returns {Promise<Array>} Array of questions
 */
export async function getQuestionsByInstructor(instructorId) {
  const result = await readPool.query(
    `SELECT id, question_text, answer_key, active, created_by, created_at, updated_at 
     FROM question_bank 
     WHERE created_by = $1 
     ORDER BY created_at DESC`,
    [instructorId]
  );
  return result.rows;
}

/**
 * Get the currently active question
 * @returns {Promise<Object|null>} The active question or null if none exists
 */
export async function getActiveQuestion() {
  const result = await readPool.query(
    `SELECT id, question_text, answer_key, active, created_by, created_at, updated_at 
     FROM question_bank 
     WHERE active = true 
     LIMIT 1`
  );
  return result.rows[0] || null;
}

/**
 * Get a question by ID
 * @param {string} questionId - The UUID of the question
 * @returns {Promise<Object|null>} The question or null if not found
 */
export async function getQuestionById(questionId) {
  const result = await readPool.query(
    `SELECT id, question_text, answer_key, active, created_by, created_at, updated_at 
     FROM question_bank 
     WHERE id = $1`,
    [questionId]
  );
  return result.rows[0] || null;
}

/**
 * Create a new question
 * @param {string} questionText - The question text
 * @param {string} answerKey - The answer key/reference
 * @param {string} createdBy - The UUID of the instructor creating the question
 * @returns {Promise<Object>} The created question
 */
export async function createQuestion(questionText, answerKey, createdBy) {
  const result = await writePool.query(
    `INSERT INTO question_bank (question_text, answer_key, active, created_by) 
     VALUES ($1, $2, false, $3) 
     RETURNING id, question_text, answer_key, active, created_by, created_at, updated_at`,
    [questionText, answerKey, createdBy]
  );
  return result.rows[0];
}

/**
 * Update a question
 * @param {string} questionId - The UUID of the question
 * @param {string} questionText - The new question text
 * @param {string} answerKey - The new answer key
 * @returns {Promise<Object|null>} The updated question or null if not found
 */
export async function updateQuestion(questionId, questionText, answerKey) {
  const result = await writePool.query(
    `UPDATE question_bank 
     SET question_text = $1, answer_key = $2, updated_at = NOW() 
     WHERE id = $3 
     RETURNING id, question_text, answer_key, active, created_by, created_at, updated_at`,
    [questionText, answerKey, questionId]
  );
  return result.rows[0] || null;
}

/**
 * Activate a question (auto-deactivates all others)
 * @param {string} questionId - The UUID of the question to activate
 * @returns {Promise<Object|null>} The activated question or null if not found
 */
export async function activateQuestion(questionId) {
  const client = await writePool.connect();
  try {
    await client.query('BEGIN');

    // Deactivate all questions
    await client.query('UPDATE question_bank SET active = false, updated_at = NOW()');

    // Activate the specified question
    const result = await client.query(
      `UPDATE question_bank 
       SET active = true, updated_at = NOW() 
       WHERE id = $1 
       RETURNING id, question_text, answer_key, active, created_by, created_at, updated_at`,
      [questionId]
    );

    await client.query('COMMIT');
    return result.rows[0] || null;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
}

/**
 * Deactivate a question
 * @param {string} questionId - The UUID of the question to deactivate
 * @returns {Promise<Object|null>} The deactivated question or null if not found
 */
export async function deactivateQuestion(questionId) {
  const result = await writePool.query(
    `UPDATE question_bank 
     SET active = false, updated_at = NOW() 
     WHERE id = $1 
     RETURNING id, question_text, answer_key, active, created_by, created_at, updated_at`,
    [questionId]
  );
  return result.rows[0] || null;
}

/**
 * Delete a question
 * @param {string} questionId - The UUID of the question to delete
 * @returns {Promise<boolean>} True if deletion was successful, false if not found
 */
export async function deleteQuestion(questionId) {
  const result = await writePool.query(
    'DELETE FROM question_bank WHERE id = $1',
    [questionId]
  );
  return result.rowCount > 0;
}

/**
 * Get active question without answer_key (for students)
 * @returns {Promise<Object|null>} The active question without answer_key or null
 */
export async function getActiveQuestionForStudent() {
  const result = await readPool.query(
    `SELECT id, question_text, created_by, created_at 
     FROM question_bank 
     WHERE active = true 
     LIMIT 1`
  );
  return result.rows[0] || null;
}
