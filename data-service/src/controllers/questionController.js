import * as questionService from '../services/questionService.js';

/**
 * Get all questions created by the authenticated instructor
 */
export async function getInstructorQuestions(req, res) {
  try {
    const instructorId = req.headers['x-user-id'];
    if (!instructorId) {
      return res.status(400).json({ error: 'User ID required' });
    }
    const questions = await questionService.getInstructorQuestions(instructorId);
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
    res.json(question);
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
    res.json(question);
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
 * Create a new question
 */
export async function createQuestion(req, res) {
  try {
    const { questionText, answerKey } = req.body;
    const instructorId = req.headers['x-user-id'];

    if (!instructorId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    if (!questionText || !answerKey) {
      return res.status(400).json({ error: 'Question text and answer key are required' });
    }

    const question = await questionService.createQuestion(questionText, answerKey, instructorId);
    res.status(201).json(question);
  } catch (error) {
    console.error('Error creating question:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Update a question
 */
export async function updateQuestion(req, res) {
  try {
    const { id } = req.params;
    const { questionText, answerKey } = req.body;

    if (!questionText || !answerKey) {
      return res.status(400).json({ error: 'Question text and answer key are required' });
    }

    const question = await questionService.updateQuestion(id, questionText, answerKey);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error updating question:', error);
    if (error.message.includes('Cannot update an active question')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}

/**
 * Activate a question
 */
export async function activateQuestion(req, res) {
  try {
    const { id } = req.params;
    const question = await questionService.activateQuestion(id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error activating question:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Deactivate a question
 */
export async function deactivateQuestion(req, res) {
  try {
    const { id } = req.params;
    const question = await questionService.deactivateQuestion(id);
    
    if (!question) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.json(question);
  } catch (error) {
    console.error('Error deactivating question:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Delete a question
 */
export async function deleteQuestion(req, res) {
  try {
    const { id } = req.params;
    const success = await questionService.deleteQuestion(id);
    
    if (!success) {
      return res.status(404).json({ error: 'Question not found' });
    }

    res.status(204).send();
  } catch (error) {
    console.error('Error deleting question:', error);
    if (error.message.includes('Cannot delete an active question')) {
      return res.status(400).json({ error: error.message });
    }
    res.status(500).json({ error: error.message });
  }
}
