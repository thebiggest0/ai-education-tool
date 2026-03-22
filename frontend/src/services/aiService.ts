import { api } from './api';
import type { AiPromptResponse, AiErrorResponse } from '../types/ai';

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

export const aiService = { sendPrompt };
