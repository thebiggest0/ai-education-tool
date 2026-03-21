import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from 'react';
import { authService } from '../services/authService';
import type { User, AuthContextType } from '../types/auth';

const AuthContext = createContext<AuthContextType | null>(null);

/**
 * Provides authentication state and methods to all child components.
 *
 * @param props.children - The child components to wrap with auth context.
 * @returns The AuthContext provider wrapping the children.
 */
function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    /**
     * Loads the current user from the API on mount.
     */
    async function loadUser() {
      try {
        const currentUser = await authService.getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setIsLoading(false);
      }
    }

    loadUser();
  }, []);

  /**
   * Authenticates with email/username and password, updating the auth state.
   *
   * @param identifier - The email or username.
   * @param password - The user's password.
   * @returns The authenticated user.
   */
  const login = useCallback(async (identifier: string, password: string) => {
    const loggedInUser = await authService.login(identifier, password);
    setUser(loggedInUser);
    return loggedInUser;
  }, []);

  /**
   * Registers a new account, updating the auth state.
   *
   * @param username - The desired username.
   * @param email - The email address.
   * @param password - The password.
   * @returns The newly created user.
   */
  const register = useCallback(
    async (username: string, email: string, password: string) => {
      const newUser = await authService.register(username, email, password);
      setUser(newUser);
      return newUser;
    },
    []
  );

  /**
   * Logs out the current user and clears the auth state.
   */
  const logout = useCallback(async () => {
    await authService.logout();
    setUser(null);
  }, []);

  const isAuthenticated = user !== null;

  return (
    <AuthContext.Provider
      value={{ user, isLoading, isAuthenticated, login, register, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

/**
 * Hook to access the authentication context.
 *
 * @returns The current authentication state and methods.
 * @throws Error if used outside of AuthProvider.
 */
function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export { AuthProvider, useAuth };
