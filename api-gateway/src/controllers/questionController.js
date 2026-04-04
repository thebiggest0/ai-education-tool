import * as questionService from '../services/questionService.js';

/**
 * Get all questions created by the authenticated instructor
 */
export async function getInstructorQuestions(req, res) {
  try {
    const userId = req.user.userId;
    const questions = await questionService.getInstructorQuestions({ userId });
    res.json(questions);
  } catch (error) {
    console.error('Error fetching instructor questions:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get the currently active question (with answer_key for instructors only)
 */
export async function getActiveQuestion(req, res) {
  try {
    const question = await questionService.getActiveQuestion();
    res.json(question || null);
  } catch (error) {
    console.error('Error fetching active question:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get the currently active question for students (without answer_key)
 */
export async function getActiveQuestionForStudent(req, res) {
  try {
    const question = await questionService.getActiveQuestionForStudent();
    res.json(question || null);
  } catch (error) {
    console.error('Error fetching active question for student:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Get a specific question by ID
 */
export async function getQuestion(req, res) {
  try {
    const { id } = req.params;
    const question = await questionService.getQuestion(id);

    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error fetching question:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Create a new question (instructor only)
 */
export async function createQuestion(req, res) {
  try {
    const { questionText, answerKey } = req.body;
    const userId = req.user.userId;

    if (!questionText || !answerKey) {
      return res.status(400).json({ error: 'Question text and answer key are required' });
    }

    const question = await questionService.createQuestion({
      questionText,
      answerKey,
      userId,
    });

    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update a question (instructor only)
 */
export async function updateQuestion(req, res) {
  try {
    const { id } = req.params;
    const { questionText, answerKey } = req.body;

    if (!questionText || !answerKey) {
      return res.status(400).json({ error: 'Question text and answer key are required' });
    }

    const question = await questionService.updateQuestion({
      questionId: id,
      questionText,
      answerKey,
    });

    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

/**
 * Activate a question (instructor only)
 */
export async function activateQuestion(req, res) {
  try {
    const { id } = req.params;
    const question = await questionService.activateQuestion(id);
    res.json(question);
  } catch (error) {
    console.error('Error activating question:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

/**
 * Deactivate a question (instructor only)
 */
export async function deactivateQuestion(req, res) {
  try {
    const { id } = req.params;
    const question = await questionService.deactivateQuestion(id);
    res.json(question);
  } catch (error) {
    console.error('Error deactivating question:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete a question (instructor only)
 */
export async function deleteQuestion(req, res) {
  try {
    const { id } = req.params;
    await questionService.deleteQuestion(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting question:', error);
    if (error.message.includes('not found')) {
      return res.status(404).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}
