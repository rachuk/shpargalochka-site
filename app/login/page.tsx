'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import type { TelegramLoginData } from '@/lib/auth';

function LoginForm() {
  const { user, isLoading, login } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const widgetRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  const next = searchParams.get('next') || '/dashboard';

  useEffect(() => {
    if (!isLoading && user) {
      router.replace(next);
    }
  }, [user, isLoading, router, next]);

  useEffect(() => {
    if (isLoading || user) return;

    (window as any).onTelegramAuth = async (data: TelegramLoginData) => {
      setError('');
      setLoggingIn(true);
      try {
        await login(data);
        router.replace(next);
      } catch (e: any) {
        setError(e.message || 'Помилка авторизації');
        setLoggingIn(false);
      }
    };

    const script = document.createElement('script');
    script.src = 'https://telegram.org/js/telegram-widget.js?22';
    script.setAttribute('data-telegram-login', 'Shpargalochka_bot');
    script.setAttribute('data-size', 'large');
    script.setAttribute('data-radius', '8');
    script.setAttribute('data-onauth', 'onTelegramAuth(user)');
    script.setAttribute('data-request-access', 'write');
    script.async = true;

    if (widgetRef.current) {
      widgetRef.current.innerHTML = '';
      widgetRef.current.appendChild(script);
    }
  }, [isLoading, user, login, router, next]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-8 text-center">
          <div className="w-16 h-16 bg-blue-50 rounded-2xl flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
            </svg>
          </div>

          <h1 className="text-2xl font-heading font-bold text-gray-900 mb-2">
            Вхід до кабінету
          </h1>
          <p className="text-gray-500 mb-8">
            Увійдіть через Telegram, щоб перейти до особистого кабінету
          </p>

          {error && (
            <div className="mb-6 p-3 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">
              {error}
            </div>
          )}

          {loggingIn ? (
            <div className="flex items-center justify-center gap-3 py-4">
              <div className="animate-spin rounded-full h-5 w-5 border-2 border-blue-600 border-t-transparent" />
              <span className="text-gray-600">Входимо...</span>
            </div>
          ) : (
            <div ref={widgetRef} className="flex justify-center mb-6" />
          )}

          <div className="mt-8 pt-6 border-t border-gray-100">
            <p className="text-xs text-gray-400">
              Ще не маєте акаунту?{' '}
              <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer"
                className="text-blue-600 hover:underline">
                Зареєструйтесь через бота
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </AuthProvider>
  );
}
