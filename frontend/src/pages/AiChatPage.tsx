import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { aiService } from '../services/aiService';
import * as questionService from '../services/questionService';
import * as responseService from '../services/responseService';
import type { AnswerComparisonResponse } from '../types/ai';

interface Message {
  role: 'user' | 'ai';
  content: string;
  score?: number;
  feedback?: string;
}

/**
 * AI Chat page where authenticated users can answer educational questions
 * and receive AI-powered feedback on their answers.
 * Loads previous chat history from the database so the conversation resumes
 * where the user left off.
 *
 * @returns The AI chat page content.
 */
function AiChatPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingQuestion, setIsFetchingQuestion] = useState(true);
  const [error, setError] = useState('');
  const [activeQuestionId, setActiveQuestionId] = useState<string | null>(null);
  const [questionNotFound, setQuestionNotFound] = useState(false);
  const [remainingCalls, setRemainingCalls] = useState<number | null>(null);
  const [maxFreeCalls, setMaxFreeCalls] = useState<number>(1000);
  const chatEndRef = useRef<HTMLDivElement>(null);

  /**
   * Scrolls the chat area to the bottom so the latest message is visible.
   */
  function scrollToBottom() {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    /**
     * Loads the active question and any previous chat history for the user.
     */
    async function loadQuestionAndHistory() {
      try {
        setIsFetchingQuestion(true);
        const question = await questionService.getActiveQuestionForStudent();

        if (!question) {
          setQuestionNotFound(true);
          setMessages([
            {
              role: 'ai',
              content: 'No active question available at the moment. Please check back later.',
            },
          ]);
          return;
        }

        setActiveQuestionId(question.id);

        const chatMessages: Message[] = [
          { role: 'ai', content: question.question_text },
        ];

        const pastResponses = await responseService.getResponseHistory(question.id);

        for (const response of pastResponses) {
          chatMessages.push({
            role: 'user',
            content: response.student_answer,
          });

          if (response.ai_feedback) {
            chatMessages.push({
              role: 'ai',
              content: response.ai_feedback,
              score: response.ai_score ?? undefined,
              feedback: response.ai_feedback,
            });
          }
        }

        setMessages(chatMessages);

        const usage = await responseService.getMyApiUsage();
        setRemainingCalls(usage.remainingCalls);
        setMaxFreeCalls(usage.maxFreeCalls);
      } catch (err) {
        console.error('Error loading question:', err);
        setError('Failed to load the question. Please refresh the page.');
        setMessages([
          {
            role: 'ai',
            content: 'Failed to load the question. Please try again.',
          },
        ]);
      } finally {
        setIsFetchingQuestion(false);
      }
    }

    loadQuestionAndHistory();
  }, []);

  /**
   * Handles the logout action, clearing auth state and redirecting to login.
   */
  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  /**
   * Sends the student answer to the AI service for evaluation, then saves
   * both the answer and AI response to the database.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || isLoading || questionNotFound || !activeQuestionId || remainingCalls === 0) return;

    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setPrompt('');
    setIsLoading(true);

    try {
      const activeQuestion = await questionService.getActiveQuestion();
      if (!activeQuestion) {
        setError('The question is no longer active. Please try again.');
        return;
      }

      const aiResponse: AnswerComparisonResponse = await aiService.evaluateAnswer(
        trimmed,
        activeQuestion.answer_key || ''
      );

      setMessages((prev) => [
        ...prev,
        {
          role: 'ai',
          content: aiResponse.feedback,
          score: aiResponse.score,
          feedback: aiResponse.feedback,
        },
      ]);

      await responseService.saveResponse(
        activeQuestionId,
        trimmed,
        aiResponse.score,
        aiResponse.feedback
      );

      setRemainingCalls((prev) => (prev !== null ? Math.max(0, prev - 1) : prev));
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Something went wrong';
      setError(message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-slate-900 tracking-tight">AI Education</span>
            <nav className="hidden sm:flex items-center gap-2 ml-4">
              <button
                onClick={() => navigate('/dashboard')}
                className="px-3 py-1.5 text-sm font-medium text-slate-500 hover:text-slate-700 rounded-md hover:bg-slate-100 transition-colors"
              >
                Dashboard
              </button>
              <span className="px-3 py-1.5 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-md">
                AI Chat
              </span>
            </nav>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-indigo-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-indigo-600">
                  {user?.username?.charAt(0).toUpperCase()}
                </span>
              </div>
              <span className="text-sm font-medium text-slate-700 hidden sm:block">{user?.username}</span>
            </div>
            <button
              onClick={handleLogout}
              className="px-3.5 py-2 text-sm font-medium text-slate-600 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors"
            >
              Log out
            </button>
          </div>
        </div>
      </header>

      {/* Chat area */}
      <main className="flex-1 max-w-3xl w-full mx-auto px-6 py-6 flex flex-col">
        {isFetchingQuestion ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4">
                <div className="inline-block animate-spin">
                  <div className="text-4xl">&#8987;</div>
                </div>
              </div>
              <h2 className="text-xl font-semibold text-slate-900 mb-2">Loading question...</h2>
              <p className="text-slate-600">Please wait while we fetch your question.</p>
            </div>
          </div>
        ) : questionNotFound ? (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <div className="mb-4 text-5xl">&#128221;</div>
              <h2 className="text-2xl font-bold text-slate-900 mb-2">No Active Question</h2>
              <p className="text-slate-600 mb-6">There's no active question at the moment.</p>
              <p className="text-sm text-slate-500">Please check back later or ask your instructor to activate a question.</p>
            </div>
          </div>
        ) : (
          <>
            <div className="flex-1 overflow-y-auto space-y-4 mb-4">
              {messages.map((msg, i) => (
                <div
                  key={i}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[80%] rounded-xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-indigo-600 text-white'
                        : 'bg-white border border-slate-200 text-slate-800'
                    }`}
                  >
                    {msg.content}
                    {msg.score !== undefined && (
                      <div className="mt-3 pt-3 border-t border-slate-200">
                        <div className="text-xs font-semibold text-indigo-600">
                          Similarity Score: {(msg.score * 100).toFixed(1)}%
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-400">
                    Evaluating your answer...
                  </div>
                </div>
              )}

              <div ref={chatEndRef} />
            </div>

            {error && (
              <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
                {error}
              </div>
            )}

            {/* Usage indicator */}
            {remainingCalls !== null && (
              <div className={`mb-3 flex items-center justify-between px-4 py-2 rounded-lg text-xs font-medium ${
                remainingCalls === 0
                  ? 'bg-red-50 border border-red-200 text-red-600'
                  : remainingCalls <= 100
                    ? 'bg-amber-50 border border-amber-200 text-amber-700'
                    : 'bg-slate-50 border border-slate-200 text-slate-500'
              }`}>
                <span>
                  {remainingCalls === 0
                    ? 'You have reached your free API call limit.'
                    : `${remainingCalls} of ${maxFreeCalls} free calls remaining`}
                </span>
                <div className="w-24 bg-slate-200 rounded-full h-1.5 ml-3">
                  <div
                    className={`h-1.5 rounded-full ${
                      remainingCalls === 0 ? 'bg-red-500' : remainingCalls <= 100 ? 'bg-amber-500' : 'bg-indigo-500'
                    }`}
                    style={{ width: `${((maxFreeCalls - remainingCalls) / maxFreeCalls) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex gap-3">
              <input
                type="text"
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder={remainingCalls === 0 ? 'API call limit reached' : 'Type your answer...'}
                className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white disabled:bg-slate-50"
                disabled={isLoading || remainingCalls === 0}
              />
              <button
                type="submit"
                disabled={isLoading || !prompt.trim() || remainingCalls === 0}
                className="px-5 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Submit
              </button>
            </form>
          </>
        )}
      </main>
    </div>
  );
}

export { AiChatPage };
