import * as responseService from '../services/responseService.js';

/**
 * Saves a student's response and AI evaluation for a question.
 * Requires authentication — userId comes from the JWT.
 *
 * @param {import('express').Request} req - The request with questionId, studentAnswer, aiScore, aiFeedback in body.
 * @param {import('express').Response} res - The response with the created record.
 */
export async function saveResponse(req, res) {
  try {
    const { questionId, studentAnswer, aiScore, aiFeedback } = req.body;

    if (!questionId || !studentAnswer) {
      return res.status(400).json({ error: 'Question ID and student answer are required' });
    }

    const response = await responseService.saveResponse({
      userId: req.user.userId,
      questionId,
      studentAnswer,
      aiScore: aiScore ?? null,
      aiFeedback: aiFeedback ?? null,
    });

    return res.status(201).json(response);
  } catch (error) {
    console.error('Error saving response:', error);
    return res.status(500).json({ error: 'Failed to save response' });
  }
}

/**
 * Retrieves the chat history for the authenticated user on a specific question.
 *
 * @param {import('express').Request} req - The request with questionId as a route param.
 * @param {import('express').Response} res - The response with the array of past responses.
 */
export async function getResponseHistory(req, res) {
  try {
    const { questionId } = req.params;

    if (!questionId) {
      return res.status(400).json({ error: 'Question ID is required' });
    }

    const responses = await responseService.getResponseHistory(req.user.userId, questionId);
    return res.json(responses);
  } catch (error) {
    console.error('Error fetching response history:', error);
    return res.status(500).json({ error: 'Failed to fetch response history' });
  }
}

/**
 * Retrieves all responses submitted by the authenticated user.
 *
 * @param {import('express').Request} req - The authenticated request.
 * @param {import('express').Response} res - The response with the array of all user responses.
 */
export async function getAllUserResponses(req, res) {
  try {
    const responses = await responseService.getAllUserResponses(req.user.userId);
    return res.json(responses);
  } catch (error) {
    console.error('Error fetching user responses:', error);
    return res.status(500).json({ error: 'Failed to fetch user responses' });
  }
}

const MAX_FREE_API_CALLS = 1000;

/**
 * Returns the authenticated user's API usage and remaining free calls.
 *
 * @param {import('express').Request} req - The authenticated request.
 * @param {import('express').Response} res - The response with usage data.
 */
export async function getMyApiUsage(req, res) {
  try {
    const usage = await responseService.getUserApiCallCount(req.user.userId);
    return res.json({
      ...usage,
      maxFreeCalls: MAX_FREE_API_CALLS,
      remainingCalls: Math.max(0, MAX_FREE_API_CALLS - usage.apiCallsUsed),
    });
  } catch (error) {
    console.error('Error fetching API usage:', error);
    return res.status(500).json({ error: 'Failed to fetch API usage' });
  }
}

/**
 * Returns API usage for all users. Admin only.
 *
 * @param {import('express').Request} req - The authenticated admin request.
 * @param {import('express').Response} res - The response with all users' usage data.
 */
export async function getAllUsersApiUsage(req, res) {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    const usage = await responseService.getAllUsersApiUsage();
    const usageWithLimits = usage.map((userUsage) => ({
      ...userUsage,
      maxFreeCalls: MAX_FREE_API_CALLS,
      remainingCalls: Math.max(0, MAX_FREE_API_CALLS - userUsage.api_calls_used),
    }));

    return res.json(usageWithLimits);
  } catch (error) {
    console.error('Error fetching all users API usage:', error);
    return res.status(500).json({ error: 'Failed to fetch API usage' });
  }
}
