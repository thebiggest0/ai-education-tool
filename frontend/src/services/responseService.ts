import { api } from './api';

export interface QuestionResponse {
  id: string;
  user_id: string;
  question_id: string;
  student_answer: string;
  ai_score: number | null;
  ai_feedback: string | null;
  created_at: string;
  question_text?: string;
}

/**
 * Saves a student's answer and AI evaluation for a question.
 *
 * @param questionId - The UUID of the question.
 * @param studentAnswer - The student's submitted answer.
 * @param aiScore - The AI similarity score, or null.
 * @param aiFeedback - The AI feedback text, or null.
 * @returns The created response record.
 * @throws Error if saving fails.
 */
export async function saveResponse(
  questionId: string,
  studentAnswer: string,
  aiScore: number | null,
  aiFeedback: string | null
): Promise<QuestionResponse> {
  const { data, status } = await api.request<QuestionResponse>('/responses', {
    method: 'POST',
    body: JSON.stringify({ questionId, studentAnswer, aiScore, aiFeedback }),
  });

  if (status !== 201) {
    throw new Error('Failed to save response');
  }

  return data;
}

/**
 * Retrieves the chat history for the current user on a specific question.
 *
 * @param questionId - The UUID of the question.
 * @returns Array of past responses in chronological order.
 */
export async function getResponseHistory(questionId: string): Promise<QuestionResponse[]> {
  const { data } = await api.request<QuestionResponse[]>(
    `/responses/question/${questionId}`,
    { method: 'GET' }
  );

  return data;
}

/**
 * Retrieves all responses submitted by the current user.
 *
 * @returns Array of all user responses in chronological order.
 */
export async function getAllUserResponses(): Promise<QuestionResponse[]> {
  const { data } = await api.request<QuestionResponse[]>('/responses/user', {
    method: 'GET',
  });

  return data;
}
