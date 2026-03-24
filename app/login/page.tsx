'use client';

import { Suspense, useEffect, useRef, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';
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
    if (!isLoading && user) router.replace(next);
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
    script.setAttribute('data-radius', '12');
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
        <div className="w-8 h-8 border-3 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--dash-bg)] flex">
      {/* Left decorative panel */}
      <div className="hidden lg:flex flex-col justify-between w-[480px] bg-gradient-to-br from-[#134E4A] to-[#0F172A] p-10 text-white relative overflow-hidden shrink-0">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-64 h-64 rounded-full bg-[var(--dash-accent-light)] blur-3xl" />
          <div className="absolute bottom-10 right-10 w-80 h-80 rounded-full bg-[var(--dash-accent)] blur-3xl" />
        </div>

        <div className="relative">
          <Link href="/" className="flex items-center gap-3 text-white no-underline mb-16">
            <div className="w-10 h-10 rounded-xl bg-[var(--dash-accent)] flex items-center justify-center text-white font-bold text-lg">
              Ш
            </div>
            <span className="font-bold text-xl tracking-tight">Шпаргалочка</span>
          </Link>

          <h1 className="text-3xl font-bold leading-tight mb-4">
            Платформа для студентських<br />робіт від перевірених<br />виконавців
          </h1>
          <p className="text-white/60 text-lg leading-relaxed">
            Створіть замовлення та отримайте<br />пропозиції від досвідчених авторів<br />вже через кілька хвилин
          </p>
        </div>

        <div className="relative space-y-5">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-[var(--dash-accent-light)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75m-3-7.036A11.959 11.959 0 013.598 6 11.99 11.99 0 003 9.749c0 5.592 3.824 10.29 9 11.623 5.176-1.332 9-6.03 9-11.622 0-1.31-.21-2.571-.598-3.751h-.152c-3.196 0-6.1-1.248-8.25-3.285z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Безпечні угоди</p>
              <p className="text-sm text-white/50">Гроші на рахунку до підтвердження якості</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Швидкий результат</p>
              <p className="text-sm text-white/50">Перші відгуки за 10 хвилин</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
              <svg className="w-6 h-6 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.48 3.499a.562.562 0 011.04 0l2.125 5.111a.563.563 0 00.475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 00-.182.557l1.285 5.385a.562.562 0 01-.84.61l-4.725-2.885a.563.563 0 00-.586 0L6.982 20.54a.562.562 0 01-.84-.61l1.285-5.386a.562.562 0 00-.182-.557l-4.204-3.602a.563.563 0 01.321-.988l5.518-.442a.563.563 0 00.475-.345L11.48 3.5z" />
              </svg>
            </div>
            <div>
              <p className="font-semibold">Перевірені автори</p>
              <p className="text-sm text-white/50">Рейтинг, відгуки та підтверджена кваліфікація</p>
            </div>
          </div>
        </div>
      </div>

      {/* Right — Login form */}
      <div className="flex-1 flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md">
          <div className="lg:hidden flex items-center justify-center gap-3 mb-10">
            <div className="w-10 h-10 rounded-xl bg-[var(--dash-accent)] flex items-center justify-center text-white font-bold text-lg">
              Ш
            </div>
            <span className="font-bold text-xl text-[var(--dash-text)] tracking-tight">Шпаргалочка</span>
          </div>

          <div className="dash-card p-8 text-center">
            <div className="w-16 h-16 rounded-2xl bg-[var(--dash-accent-bg)] flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-[var(--dash-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
              </svg>
            </div>

            <h1 className="text-2xl font-bold text-[var(--dash-text)] mb-2">Вхід до кабінету</h1>
            <p className="text-[var(--dash-text-muted)] mb-8">
              Увійдіть через Telegram, щоб перейти до особистого кабінету
            </p>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl text-red-700 text-sm">
                {error}
              </div>
            )}

            {loggingIn ? (
              <div className="flex items-center justify-center gap-3 py-6">
                <div className="w-5 h-5 border-2 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
                <span className="text-[var(--dash-text-muted)] text-sm">Входимо...</span>
              </div>
            ) : (
              <div ref={widgetRef} className="flex justify-center mb-6" />
            )}

            <div className="mt-8 pt-6 border-t border-[var(--dash-border)]">
              <p className="text-xs text-[var(--dash-text-muted)]">
                Ще не маєте акаунту?{' '}
                <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer"
                  className="text-[var(--dash-accent)] hover:underline font-medium">
                  Зареєструйтесь через бота
                </a>
              </p>
            </div>
          </div>

          <p className="text-center text-xs text-[var(--dash-text-muted)] mt-6">
            <Link href="/" className="hover:text-[var(--dash-text)] transition-colors">← На головну</Link>
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <AuthProvider>
      <Suspense fallback={
        <div className="min-h-screen flex items-center justify-center bg-[var(--dash-bg)]">
          <div className="w-8 h-8 border-3 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      }>
        <LoginForm />
      </Suspense>
    </AuthProvider>
  );
}
