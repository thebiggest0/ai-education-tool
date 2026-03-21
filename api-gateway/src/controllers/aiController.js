import { aiService } from '../services/aiService.js';

/**
 * Handles requests to send a prompt to the AI service.
 * Requires authentication — the user's ID is forwarded to the AI service.
 *
 * @param {import('express').Request} req - The request containing the prompt.
 * @param {import('express').Response} res - The response with the AI output.
 */
async function sendPrompt(req, res) {
  try {
    const { prompt } = req.body;

    if (!prompt || typeof prompt !== 'string' || prompt.trim().length === 0) {
      return res.status(400).json({
        error: 'Prompt is required',
        code: 'MISSING_PROMPT',
      });
    }

    const result = await aiService.sendPrompt({
      prompt: prompt.trim(),
      userId: req.user.userId,
    });

    return res.json(result);
  } catch (error) {
    if (error.code === 'AI_SERVICE_ERROR') {
      return res.status(error.status || 502).json({
        error: error.message,
        code: 'AI_SERVICE_ERROR',
      });
    }

    // AI service is down or unreachable
    if (error.cause?.code === 'ECONNREFUSED' || error.message?.includes('fetch failed')) {
      return res.status(503).json({
        error: 'AI service is currently unavailable',
        code: 'AI_SERVICE_UNAVAILABLE',
      });
    }

    console.error('Error calling AI service:', error);
    return res.status(500).json({
      error: 'Internal server error',
      code: 'INTERNAL_ERROR',
    });
  }
}

export const aiController = {
  sendPrompt,
};
