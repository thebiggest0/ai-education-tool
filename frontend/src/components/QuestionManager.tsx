import { useState, useEffect } from 'react';
import * as questionService from '../services/questionService';

interface QuestionData {
  id: string;
  question_text: string;
  answer_key?: string;
  active: boolean;
  created_by: string;
  created_at: string;
  updated_at: string;
}

function QuestionManager() {
  const [questions, setQuestions] = useState<QuestionData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    questionText: '',
    answerKey: '',
  });

  useEffect(() => {
    loadQuestions();
  }, []);

  async function loadQuestions() {
    try {
      setLoading(true);
      setError(null);
      const data = await questionService.getInstructorQuestions();
      setQuestions(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load questions');
      console.error('Error loading questions:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();

    if (!formData.questionText.trim() || !formData.answerKey.trim()) {
      setError('Both question and answer key are required');
      return;
    }

    try {
      setLoading(true);
      setError(null);

      if (editingId) {
        await questionService.updateQuestion(editingId, {
          questionText: formData.questionText,
          answerKey: formData.answerKey,
        });
      } else {
        await questionService.createQuestion({
          questionText: formData.questionText,
          answerKey: formData.answerKey,
        });
      }

      await loadQuestions();
      setFormData({ questionText: '', answerKey: '' });
      setEditingId(null);
      setShowForm(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to save question');
      console.error('Error saving question:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleEdit(question: QuestionData) {
    if (question.active) {
      setError('Cannot edit an active question. Deactivate it first.');
      return;
    }
    setEditingId(question.id);
    setFormData({
      questionText: question.question_text,
      answerKey: question.answer_key || '',
    });
    setShowForm(true);
  }

  async function handleDelete(questionId: string) {
    const question = questions.find((q) => q.id === questionId);
    if (question?.active) {
      setError('Cannot delete an active question. Deactivate it first.');
      return;
    }

    if (window.confirm('Are you sure you want to delete this question?')) {
      try {
        setLoading(true);
        setError(null);
        await questionService.deleteQuestion(questionId);
        await loadQuestions();
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to delete question');
        console.error('Error deleting question:', err);
      } finally {
        setLoading(false);
      }
    }
  }

  async function handleActivate(questionId: string) {
    try {
      setLoading(true);
      setError(null);
      await questionService.activateQuestion(questionId);
      await loadQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to activate question');
      console.error('Error activating question:', err);
    } finally {
      setLoading(false);
    }
  }

  async function handleDeactivate(questionId: string) {
    try {
      setLoading(true);
      setError(null);
      await questionService.deactivateQuestion(questionId);
      await loadQuestions();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to deactivate question');
      console.error('Error deactivating question:', err);
    } finally {
      setLoading(false);
    }
  }

  function handleCancel() {
    setShowForm(false);
    setEditingId(null);
    setFormData({ questionText: '', answerKey: '' });
  }

  return (
    <div className="mt-9 bg-white rounded-xl border border-slate-200 p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-slate-900">Question Bank</h2>
          <p className="mt-1 text-sm text-slate-500">Create and manage classroom questions</p>
        </div>
        {!showForm && (
          <button
            onClick={() => setShowForm(true)}
            className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={loading}
          >
            + New Question
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      {showForm && (
        <div className="mb-6 p-4 bg-slate-50 rounded-lg border border-slate-200">
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Question</label>
              <textarea
                value={formData.questionText}
                onChange={(e) => setFormData({ ...formData, questionText: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="Enter the question..."
                disabled={loading}
              />
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">Answer Key</label>
              <textarea
                value={formData.answerKey}
                onChange={(e) => setFormData({ ...formData, answerKey: e.target.value })}
                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                rows={3}
                placeholder="Enter the answer key/reference..."
                disabled={loading}
              />
            </div>
            <div className="flex gap-2">
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                {editingId ? 'Update Question' : 'Create Question'}
              </button>
              <button
                type="button"
                onClick={handleCancel}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 rounded-lg hover:bg-slate-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={loading}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {loading && !showForm ? (
        <div className="text-center py-8">
          <p className="text-slate-500">Loading...</p>
        </div>
      ) : questions.length === 0 ? (
        <div className="text-center py-8">
          <p className="text-slate-500">No questions yet. Create one to get started!</p>
        </div>
      ) : (
        <div className="space-y-3">
          {questions.map((question) => (
            <div
              key={question.id}
              className={`p-4 border rounded-lg ${
                question.active
                  ? 'bg-green-50 border-green-200'
                  : 'bg-slate-50 border-slate-200 hover:bg-slate-100'
              }`}
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {question.active && (
                    <div className="mb-2 inline-block px-2 py-1 text-xs font-semibold text-green-700 bg-green-100 rounded-full">
                      Active
                    </div>
                  )}
                  <p className="text-sm font-medium text-slate-900 break-words">{question.question_text}</p>
                  <p className="mt-2 text-xs text-slate-600">
                    Answer key: <span className="text-slate-700">{question.answer_key}</span>
                  </p>
                </div>
                <div className="flex flex-col gap-2 flex-shrink-0">
                  {!question.active ? (
                    <button
                      onClick={() => handleActivate(question.id)}
                      className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded hover:bg-green-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      disabled={loading}
                    >
                      Activate
                    </button>
                  ) : (
                    <button
                      onClick={() => handleDeactivate(question.id)}
                      className="px-3 py-1 text-xs font-medium text-white bg-orange-600 rounded hover:bg-orange-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                      disabled={loading}
                    >
                      Deactivate
                    </button>
                  )}
                  <button
                    onClick={() => handleEdit(question)}
                    className="px-3 py-1 text-xs font-medium text-slate-700 bg-slate-200 rounded hover:bg-slate-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    disabled={loading || question.active}
                  >
                    Edit
                  </button>
                  <button
                    onClick={() => handleDelete(question.id)}
                    className="px-3 py-1 text-xs font-medium text-red-700 bg-red-100 rounded hover:bg-red-200 transition-colors disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
                    disabled={loading || question.active}
                  >
                    Delete
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export { QuestionManager };
