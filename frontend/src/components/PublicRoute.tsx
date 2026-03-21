import { Navigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { LoadingScreen } from './LoadingScreen';

export interface PublicRouteProps {
  children: React.ReactNode;
}

/**
 * Route wrapper that redirects authenticated users to their role-appropriate dashboard.
 * Used for pages like login and register that should not be accessible when logged in.
 *
 * @param props.children - The public content to render.
 * @returns The children if not authenticated, or a redirect to the appropriate dashboard.
 */
function PublicRoute({ children }: PublicRouteProps) {
  const { isAuthenticated, isLoading, user } = useAuth();

  if (isLoading) {
    return <LoadingScreen />;
  }

  if (isAuthenticated) {
    const redirectPath = user?.role === 'admin' ? '/admin' : '/dashboard';
    return <Navigate to={redirectPath} replace />;
  }

  return <>{children}</>;
}

export { PublicRoute };
