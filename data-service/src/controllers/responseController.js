import * as responseService from '../services/responseService.js';

/**
 * Saves a student's response and AI evaluation for a question.
 * Expects x-user-id header and body with questionId, studentAnswer, aiScore, aiFeedback.
 *
 * @param {import('express').Request} req - The incoming request.
 * @param {import('express').Response} res - The outgoing response.
 */
export async function saveResponse(req, res) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const { questionId, studentAnswer, aiScore, aiFeedback } = req.body;

    if (!questionId || !studentAnswer) {
      return res.status(400).json({ error: 'Question ID and student answer are required' });
    }

    const response = await responseService.saveResponse(
      userId,
      questionId,
      studentAnswer,
      aiScore ?? null,
      aiFeedback ?? null
    );

    res.status(201).json(response);
  } catch (error) {
    console.error('Error saving response:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Retrieves the chat history for a user on a specific question.
 * Expects x-user-id header and questionId query parameter.
 *
 * @param {import('express').Request} req - The incoming request.
 * @param {import('express').Response} res - The outgoing response.
 */
export async function getResponseHistory(req, res) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const { questionId } = req.params;
    if (!questionId) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    const responses = await responseService.getResponseHistory(userId, questionId);
    res.json(responses);
  } catch (error) {
    console.error('Error fetching response history:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Retrieves all responses submitted by a user across all questions.
 * Expects x-user-id header.
 *
 * @param {import('express').Request} req - The incoming request.
 * @param {import('express').Response} res - The outgoing response.
 */
export async function getAllUserResponses(req, res) {
  try {
    const userId = req.headers['x-user-id'];
    if (!userId) {
      return res.status(400).json({ error: 'User ID required' });
    }

    const responses = await responseService.getAllUserResponses(userId);
    res.json(responses);
  } catch (error) {
    console.error('Error fetching user responses:', error);
    res.status(500).json({ error: error.message });
  }
}
