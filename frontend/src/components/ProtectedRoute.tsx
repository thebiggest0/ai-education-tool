import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';

export interface ProtectedRouteProps {
  children: React.ReactNode;
  requiredRole?: string;
}

/**
 * Route wrapper that redirects unauthenticated users to login.
 * Optionally enforces a required role, redirecting to the appropriate dashboard if the role doesn't match.
 *
 * @param props.children - The protected content to render.
 * @param props.requiredRole - The role required to access the route.
 * @returns The children if authorized, or a redirect.
 */
function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole === 'admin' && user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  if (!requiredRole && user?.role === 'admin') {
    return <Navigate to="/admin" replace />;
  }

  return <>{children}</>;
}

export { ProtectedRoute };
