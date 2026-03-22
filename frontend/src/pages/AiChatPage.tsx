import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { aiService } from '../services/aiService';

interface Message {
  role: 'user' | 'ai';
  content: string;
}

/**
 * Converts AI service response payloads into readable chat text.
 * Handles sentiment prediction arrays like [{ label, score }].
 */
function formatAiResponse(response: Record<string, unknown>): string {
  const predictionValue = response.prediction;

  if (Array.isArray(predictionValue) && predictionValue.length > 0) {
    const firstPrediction = predictionValue[0];

    if (firstPrediction && typeof firstPrediction === 'object') {
      const prediction = firstPrediction as Record<string, unknown>;
      const label = prediction.label;
      const score = prediction.score;

      if (typeof label === 'string' && typeof score === 'number') {
        return `Sentiment: ${label}\nScore: ${score.toFixed(6)}`;
      }
    }

    return JSON.stringify(predictionValue, null, 2);
  }

  const preferredText = response.response ?? response.message ?? response.text;
  if (typeof preferredText === 'string') {
    return preferredText;
  }

  return JSON.stringify(response, null, 2);
}

/**
 * AI Chat page where authenticated users can send prompts to the AI microservice
 * and view the responses in a conversational interface.
 *
 * @returns The AI chat page content.
 */
function AiChatPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  /**
   * Handles the logout action, clearing auth state and redirecting to login.
   */
  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  /**
   * Sends the current prompt to the AI service and appends both
   * the user message and AI response to the conversation.
   */
  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = prompt.trim();
    if (!trimmed || isLoading) return;

    setError('');
    setMessages((prev) => [...prev, { role: 'user', content: trimmed }]);
    setPrompt('');
    setIsLoading(true);

    try {
      const response = await aiService.sendPrompt(trimmed);
      const aiText = formatAiResponse(response as Record<string, unknown>);
      setMessages((prev) => [...prev, { role: 'ai', content: aiText }]);
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
        <div className="flex-1 overflow-y-auto space-y-4 mb-4">
          {messages.length === 0 && (
            <div className="text-center py-20">
              <h2 className="text-xl font-semibold text-slate-700">Ask AI to analyze sentiment</h2>
              <p className="mt-2 text-sm text-slate-400">
                Type a prompt below to get started.
              </p>
            </div>
          )}

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
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white border border-slate-200 rounded-xl px-4 py-3 text-sm text-slate-400">
                Thinking...
              </div>
            </div>
          )}
        </div>

        {error && (
          <div className="mb-3 px-4 py-2.5 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Input */}
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder="Type your prompt..."
            className="flex-1 px-4 py-3 border border-slate-300 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent bg-white"
            disabled={isLoading}
          />
          <button
            type="submit"
            disabled={isLoading || !prompt.trim()}
            className="px-5 py-3 bg-indigo-600 text-white text-sm font-medium rounded-xl hover:bg-indigo-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </main>
    </div>
  );
}

export { AiChatPage };
