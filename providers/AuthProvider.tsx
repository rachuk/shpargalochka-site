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

const ALLOWED_CHAT_IDS = ['229956339', '5609072359'];

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
      .then(u => {
        if (ALLOWED_CHAT_IDS.length > 0 && !ALLOWED_CHAT_IDS.includes(String(u.chat_id))) {
          clearTokens();
          setUser(null);
        } else {
          setUser(u);
        }
      })
      .catch(() => clearTokens())
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(async (data: TelegramLoginData) => {
    const userInfo = await loginWithTelegram(data);
    const full = await fetchMe();
    if (ALLOWED_CHAT_IDS.length > 0 && !ALLOWED_CHAT_IDS.includes(String(full.chat_id))) {
      clearTokens();
      throw new Error('Платформа тимчасово закрита для нових користувачів. Слідкуйте за оновленнями!');
    }
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
