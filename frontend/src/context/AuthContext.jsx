import { createContext, useContext, useState, useCallback } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem('user');
    return stored ? JSON.parse(stored) : null;
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const login = useCallback(async (email, password) => {
    setLoading(true);
    setError(null);

    let lastError;

    try {
      for (let attempt = 1; attempt <= 3; attempt += 1) {
        try {
          const { data } = await api.post('/auth/login', { email, password });
          const { user: loggedInUser, accessToken, refreshToken } = data.data;
          localStorage.setItem('accessToken', accessToken);
          localStorage.setItem('refreshToken', refreshToken);
          localStorage.setItem('user', JSON.stringify(loggedInUser));
          setUser(loggedInUser);
          return loggedInUser;
        } catch (err) {
          lastError = err;
          const isTransient = err.code === 'ERR_NETWORK' || !err.response || err.response?.status >= 500;

          if (attempt < 3 && isTransient) {
            await new Promise((resolve) => setTimeout(resolve, attempt * 1000));
            continue;
          }

          throw err;
        }
      }
    } catch (err) {
      const message = err.code === 'ERR_NETWORK' || !err.response
        ? 'The server is warming up. Please wait a moment and try again.'
        : err.response?.data?.error?.message || 'Unable to sign in. Please try again.';
      setError(message);
      throw new Error(message);
    } finally {
      setLoading(false);
    }

    throw lastError;
  }, []);

  const logout = useCallback(async () => {
    try {
      await api.post('/auth/logout');
    } catch {
      // ignore network errors on logout
    }
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('user');
    setUser(null);
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, loading, error }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
