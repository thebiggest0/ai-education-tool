import { api } from './api';

export interface Question {
  id: string;
  question_text: string;
  answer_key?: string; // Only present for instructors
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

export interface CreateQuestionPayload {
  questionText: string;
  answerKey: string;
}

export interface UpdateQuestionPayload {
  questionText: string;
  answerKey: string;
}

/**
 * Get all questions created by the authenticated instructor
 */
export async function getInstructorQuestions(): Promise<Question[]> {
  const { data } = await api.request<Question[]>('/questions/instructor', {
    method: 'GET',
  });
  return data;
}

/**
 * Get the currently active question with answer key (instructor view)
 */
export async function getActiveQuestion(): Promise<Question | null> {
  try {
    const { data } = await api.request<Question>('/questions/active', {
      method: 'GET',
    });
    return data;
  } catch (error) {
    console.error('Error fetching active question:', error);
    return null;
  }
}

/**
 * Get the currently active question without answer key (student view)
 */
export async function getActiveQuestionForStudent(): Promise<Omit<Question, 'answer_key'> | null> {
  try {
    const { data } = await api.request<Omit<Question, 'answer_key'>>('/questions/active-student', {
      method: 'GET',
    });
    return data;
  } catch (error) {
    console.error('Error fetching active question for student:', error);
    return null;
  }
}

/**
 * Get a specific question by ID
 */
export async function getQuestion(questionId: string): Promise<Question | null> {
  try {
    const { data } = await api.request<Question>(`/questions/${questionId}`, {
      method: 'GET',
    });
    return data;
  } catch (error) {
    console.error('Error fetching question:', error);
    return null;
  }
}

/**
 * Create a new question
 */
export async function createQuestion(payload: CreateQuestionPayload): Promise<Question> {
  const { data } = await api.request<Question>('/questions', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
  return data;
}

/**
 * Update a question
 */
export async function updateQuestion(
  questionId: string,
  payload: UpdateQuestionPayload
): Promise<Question> {
  const { data } = await api.request<Question>(`/questions/${questionId}`, {
    method: 'PUT',
    body: JSON.stringify(payload),
  });
  return data;
}

/**
 * Activate a question (deactivates all others)
 */
export async function activateQuestion(questionId: string): Promise<Question> {
  const { data } = await api.request<Question>(`/questions/${questionId}/activate`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return data;
}

/**
 * Deactivate a question
 */
export async function deactivateQuestion(questionId: string): Promise<Question> {
  const { data } = await api.request<Question>(`/questions/${questionId}/deactivate`, {
    method: 'POST',
    body: JSON.stringify({}),
  });
  return data;
}

/**
 * Delete a question
 */
export async function deleteQuestion(questionId: string): Promise<void> {
  await api.request<void>(`/questions/${questionId}`, {
    method: 'DELETE',
  });
}
