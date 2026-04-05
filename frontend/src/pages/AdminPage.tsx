import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { QuestionManager } from '../components/QuestionManager';
import * as responseService from '../services/responseService';
import type { UserApiUsage } from '../services/responseService';

/**
 * Admin dashboard page displaying admin user info and admin-specific status.
 * Provides a logout button to end the session.
 *
 * @returns The admin dashboard content.
 */
function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [usageData, setUsageData] = useState<UserApiUsage[]>([]);
  const [isLoadingUsage, setIsLoadingUsage] = useState(true);

  useEffect(() => {
    /**
     * Fetches API usage data for all users from the server.
     */
    async function loadUsageData() {
      try {
        setIsLoadingUsage(true);
        const data = await responseService.getAllUsersApiUsage();
        setUsageData(data);
      } catch (error) {
        console.error('Error loading usage data:', error);
      } finally {
        setIsLoadingUsage(false);
      }
    }

    loadUsageData();
  }, []);

  /**
   * Handles the logout action, clearing auth state and redirecting to login.
   */
  async function handleLogout() {
    await logout();
    navigate('/login', { replace: true });
  }

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Top bar */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <span className="text-lg font-bold text-slate-900 tracking-tight">AI Education</span>
            <span className="px-2 py-0.5 text-xs font-semibold text-purple-700 bg-purple-100 rounded-full">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-purple-100 flex items-center justify-center">
                <span className="text-sm font-semibold text-purple-600">
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

      {/* Content */}
      <main className="max-w-5xl mx-auto px-6 py-10">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-slate-900">Admin Dashboard</h1>
          <p className="mt-1 text-sm text-slate-500">Manage your platform</p>
        </div>

        <div className="grid gap-4 sm:grid-cols-3">
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Username</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{user?.username}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Email</p>
            <p className="mt-2 text-lg font-semibold text-slate-900">{user?.email}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-5">
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Role</p>
            <div className="mt-2 flex items-center gap-2">
              <span className="text-lg font-semibold text-slate-900 capitalize">{user?.role}</span>
              <span className="h-2 w-2 rounded-full bg-green-500" />
            </div>
          </div>
        </div>

        {/* API Usage Monitoring */}
        <div className="mt-10">
          <h2 className="text-xl font-bold text-slate-900 mb-4">API Usage Monitoring</h2>
          {isLoadingUsage ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              Loading usage data...
            </div>
          ) : usageData.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-8 text-center text-slate-500">
              No users found.
            </div>
          ) : (
            <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Username</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Email</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Role</th>
                    <th className="px-5 py-3 text-right font-semibold text-slate-600">Used</th>
                    <th className="px-5 py-3 text-right font-semibold text-slate-600">Limit</th>
                    <th className="px-5 py-3 text-right font-semibold text-slate-600">Remaining</th>
                    <th className="px-5 py-3 text-left font-semibold text-slate-600">Usage</th>
                  </tr>
                </thead>
                <tbody>
                  {usageData.map((userUsage) => {
                    const usagePercent = Math.min(100, (userUsage.api_calls_used / userUsage.maxFreeCalls) * 100);
                    const isNearLimit = usagePercent >= 80;
                    const isAtLimit = userUsage.remainingCalls === 0;

                    return (
                      <tr key={userUsage.id} className="border-b border-slate-100 last:border-0">
                        <td className="px-5 py-3 font-medium text-slate-900">{userUsage.username}</td>
                        <td className="px-5 py-3 text-slate-600">{userUsage.email}</td>
                        <td className="px-5 py-3">
                          <span className={`px-2 py-0.5 text-xs font-semibold rounded-full ${
                            userUsage.role === 'admin'
                              ? 'text-purple-700 bg-purple-100'
                              : 'text-slate-600 bg-slate-100'
                          }`}>
                            {userUsage.role}
                          </span>
                        </td>
                        <td className="px-5 py-3 text-right font-mono text-slate-900">{userUsage.api_calls_used}</td>
                        <td className="px-5 py-3 text-right font-mono text-slate-500">{userUsage.maxFreeCalls}</td>
                        <td className={`px-5 py-3 text-right font-mono ${
                          isAtLimit ? 'text-red-600 font-semibold' : isNearLimit ? 'text-amber-600' : 'text-slate-900'
                        }`}>
                          {userUsage.remainingCalls}
                        </td>
                        <td className="px-5 py-3 w-32">
                          <div className="w-full bg-slate-100 rounded-full h-2">
                            <div
                              className={`h-2 rounded-full transition-all ${
                                isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-amber-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${usagePercent}%` }}
                            />
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        <QuestionManager />
      </main>
    </div>
  );
}

export { AdminPage };
