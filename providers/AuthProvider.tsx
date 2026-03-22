'use client';

import { createContext, useContext, useEffect, useState, useCallback, type ReactNode } from 'react';
import { fetchMe, clearTokens, getAccessToken, type UserInfo, type TelegramLoginData, loginWithTelegram } from '@/lib/auth';

interface AuthContextType {
  user: UserInfo | null;
  isLoading: boolean;
  login: (data: TelegramLoginData) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  isLoading: true,
  login: async () => {},
  logout: () => {},
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const token = getAccessToken();
    if (!token) {
      setIsLoading(false);
      return;
    }
    fetchMe()
      .then(setUser)
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (data: TelegramLoginData) => {
    const userInfo = await loginWithTelegram(data);
    const full = await fetchMe();
    setUser(full);
  }, []);

  const logout = useCallback(() => {
    clearTokens();
    setUser(null);
    window.location.href = '/login';
  }, []);

  return (
    <AuthContext.Provider value={{ user, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
