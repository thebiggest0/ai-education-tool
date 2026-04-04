import { api } from './api';
import type { AiPromptResponse, AiErrorResponse, AnswerComparisonRequest, AnswerComparisonResponse } from '../types/ai';

/**
 * Sends a prompt to the AI microservice via the API gateway.
 *
 * @param prompt - The user's input text.
 * @returns The AI service response data.
 * @throws Error if the request fails.
 */
async function sendPrompt(prompt: string): Promise<AiPromptResponse> {
  const { data, status } = await api.request<AiPromptResponse | AiErrorResponse>(
    '/ai/prompt',
    {
      method: 'POST',
      body: JSON.stringify({ prompt }),
    }
  );

  if (status !== 200) {
    throw new Error((data as AiErrorResponse).error || 'AI request failed');
  }

  return data as AiPromptResponse;
}

/**
 * Sends a student answer and correct answer to the AI microservice for evaluation.
 *
 * @param studentAnswer - The student's answer.
 * @param correctAnswer - The correct answer.
 * @returns The AI evaluation response with score and feedback.
 * @throws Error if the request fails.
 */
async function evaluateAnswer(studentAnswer: string, correctAnswer: string): Promise<AnswerComparisonResponse> {
  const { data, status } = await api.request<AnswerComparisonResponse | AiErrorResponse>(
    '/ai/prompt',
    {
      method: 'POST',
      body: JSON.stringify({ studentAnswer, correctAnswer } as AnswerComparisonRequest),
    }
  );

  if (status !== 200) {
    throw new Error((data as AiErrorResponse).error || 'AI request failed');
  }

  return data as AnswerComparisonResponse;
}

export const aiService = { sendPrompt, evaluateAnswer };
