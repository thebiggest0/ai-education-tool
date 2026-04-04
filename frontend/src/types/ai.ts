export interface AiPromptRequest {
  prompt: string;
}

export interface AiPromptResponse {
  /** The AI model's response text. Shape depends on the partner's microservice. */
  [key: string]: unknown;
}

export interface AnswerComparisonRequest {
  studentAnswer: string;
  correctAnswer: string;
}

export interface AnswerComparisonResponse {
  score: number;
  feedback: string;
}

export interface AiErrorResponse {
  error: string;
  code: string;
}
