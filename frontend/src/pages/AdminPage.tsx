import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

/**
 * Admin dashboard page displaying admin user info and admin-specific status.
 * Provides a logout button to end the session.
 *
 * @returns The admin dashboard content.
 */
function AdminPage() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

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
      </main>
    </div>
  );
}

export { AdminPage };
