import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { clearTokens, getAccessToken, persistTokens } from './tokenStorage';
import { isJwtValid } from './jwt';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  const refreshAuthState = () => {
    const token = getAccessToken();
    const valid = Boolean(token) && isJwtValid(token);

    if (!valid) {
      clearTokens();
    }

    setIsAuthenticated(valid);
    return valid;
  };

  useEffect(() => {
    refreshAuthState();
    setIsLoading(false);
  }, []);

  const login = ({ accessToken, refreshToken, remember = true }) => {
    persistTokens({ accessToken, refreshToken, remember });
    setIsAuthenticated(true);
  };

  const logout = () => {
    clearTokens();
    setIsAuthenticated(false);
  };

  const value = useMemo(
    () => ({
      isAuthenticated,
      isLoading,
      login,
      logout,
      refreshAuthState
    }),
    [isAuthenticated, isLoading]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  return context;
}
