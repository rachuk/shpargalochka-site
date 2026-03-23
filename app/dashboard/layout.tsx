'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useCallback, useRef } from 'react';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { fetchAuth } from '@/lib/auth';
import type { ReactNode } from 'react';

type ActiveRole = 'customer' | 'executor';
const RoleContext = createContext<{ role: ActiveRole; toggle: () => void }>({ role: 'customer', toggle: () => {} });
export function useRole() { return useContext(RoleContext); }

const NAV_CUSTOMER = [
  { href: '/dashboard', label: 'Головна', exact: true },
  { href: '/dashboard/orders', label: 'Мої замовлення' },
  { href: '/dashboard/orders/new', label: 'Створити замовлення' },
];
const NAV_EXECUTOR = [
  { href: '/dashboard', label: 'Головна', exact: true },
  { href: '/dashboard/available', label: 'Біржа замовлень' },
  { href: '/dashboard/orders', label: 'Мої замовлення' },
  { href: '/dashboard/bids', label: 'Мої відгуки' },
];

const MOBILE_NAV_CUSTOMER = [
  { href: '/dashboard', label: 'Головна', icon: 'home' as const, exact: true },
  { href: '/dashboard/orders', label: 'Замовлення', icon: 'orders' as const },
  { href: '/dashboard/chats', label: 'Чати', icon: 'chat' as const },
  { href: '/dashboard/profile', label: 'Профіль', icon: 'profile' as const },
];
const MOBILE_NAV_EXECUTOR = [
  { href: '/dashboard', label: 'Головна', icon: 'home' as const, exact: true },
  { href: '/dashboard/available', label: 'Біржа', icon: 'search' as const },
  { href: '/dashboard/chats', label: 'Чати', icon: 'chat' as const },
  { href: '/dashboard/profile', label: 'Профіль', icon: 'profile' as const },
];

function MobileIcon({ name }: { name: 'home' | 'orders' | 'chat' | 'profile' | 'search' }) {
  const p = { className: 'w-5 h-5', fill: 'none', viewBox: '0 0 24 24', stroke: 'currentColor', strokeWidth: 1.5 };
  switch (name) {
    case 'home': return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M2.25 12l8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" /></svg>;
    case 'orders': return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>;
    case 'chat': return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" /></svg>;
    case 'profile': return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" /></svg>;
    case 'search': return <svg {...p}><path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" /></svg>;
  }
}

function DashboardShell({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [unreadCount, setUnreadCount] = useState(0);
  const [role, setRole] = useState<ActiveRole>('customer');
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem('shpargalochka_role') as ActiveRole | null;
    if (saved === 'executor' && user.is_executor) setRole('executor');
    else if (saved === 'customer') setRole('customer');
    else setRole(user.is_executor ? 'executor' : 'customer');
  }, [user]);

  const toggleRole = useCallback(() => {
    setRole(prev => {
      const next = prev === 'customer' ? 'executor' : 'customer';
      localStorage.setItem('shpargalochka_role', next);
      return next;
    });
  }, []);

  const pollUnread = useCallback(async () => {
    try {
      const data = await fetchAuth<{ total_unread: number }>('/chats/unread_active/');
      setUnreadCount(data.total_unread || 0);
    } catch { /* ignore */ }
  }, []);

  useEffect(() => {
    if (!user) return;
    pollUnread();
    const interval = setInterval(pollUnread, 30000);
    return () => clearInterval(interval);
  }, [user, pollUnread]);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => { setDropdownOpen(false); }, [pathname]);

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--dash-bg)]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-10 h-10 border-3 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
          <p className="text-sm text-[var(--dash-text-muted)]">Завантаження...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--dash-bg)]">
        <p className="text-[var(--dash-text-muted)]">Перенаправлення...</p>
      </div>
    );
  }

  const isExecutorView = role === 'executor';
  const canSwitchRole = user.is_executor;
  const navItems = isExecutorView ? NAV_EXECUTOR : NAV_CUSTOMER;
  const mobileNavItems = isExecutorView ? MOBILE_NAV_EXECUTOR : MOBILE_NAV_CUSTOMER;
  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <RoleContext.Provider value={{ role, toggle: toggleRole }}>
    <div className="min-h-screen bg-[var(--dash-bg)] flex flex-col">
      {/* === HEADER === */}
      <header className="dash-header">
        {/* Top bar */}
        <div className="dash-topbar">
          {/* Logo */}
          <Link href="/dashboard" className="flex items-center gap-2.5 text-[var(--dash-text)] no-underline shrink-0">
            <div className="w-8 h-8 rounded-lg bg-[var(--dash-accent)] flex items-center justify-center text-white font-bold text-sm">
              Ш
            </div>
            <span className="font-bold text-[15px] tracking-tight hidden sm:inline">Шпаргалочка</span>
          </Link>

          {/* Center — Messenger button */}
          <div className="flex-1 hidden md:flex justify-center">
            <Link href="/dashboard/chats" className="dash-btn-messenger">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8.625 12a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H8.25m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0H12m4.125 0a.375.375 0 11-.75 0 .375.375 0 01.75 0zm0 0h-.375M21 12c0 4.556-4.03 8.25-9 8.25a9.764 9.764 0 01-2.555-.337A5.972 5.972 0 015.41 20.97a5.969 5.969 0 01-.474-.065 4.48 4.48 0 00.978-2.025c.09-.457-.133-.901-.467-1.226C3.93 16.178 3 14.189 3 12c0-4.556 4.03-8.25 9-8.25s9 3.694 9 8.25z" />
              </svg>
              Мессенджер
              {unreadCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
            </Link>
          </div>

          {/* Right — Balance + Avatar dropdown */}
          <div className="flex items-center gap-3 ml-auto">
            {isExecutorView && user.balance && Number(user.balance) > 0 && (
              <div className="hidden sm:flex items-center gap-1.5 text-sm text-[var(--dash-text-muted)]">
                <span className="font-semibold text-[var(--dash-text)]">{user.balance} ₴</span>
              </div>
            )}

            {/* Avatar dropdown */}
            <div className="relative" ref={dropdownRef}>
              <button
                onClick={() => setDropdownOpen(v => !v)}
                className="flex items-center gap-2 rounded-full hover:bg-gray-50 p-1 pr-2 transition-colors"
              >
                {user.avatar ? (
                  <img src={user.avatar} alt="" className="w-8 h-8 rounded-full object-cover" />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-[var(--dash-accent)] flex items-center justify-center text-white font-semibold text-xs">
                    {initials}
                  </div>
                )}
                <svg className={`w-4 h-4 text-[var(--dash-text-muted)] transition-transform ${dropdownOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
                </svg>
              </button>

              {dropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-56 bg-white rounded-xl border border-[var(--dash-border)] shadow-lg py-2 z-50 animate-slide-up">
                  <div className="px-4 py-2.5 border-b border-[var(--dash-border)]">
                    <p className="text-sm font-semibold text-[var(--dash-text)] truncate">{user.name}</p>
                    <p className="text-xs text-[var(--dash-text-muted)]">
                      {isExecutorView ? 'Виконавець' : 'Замовник'}
                    </p>
                  </div>
                  <Link href="/dashboard/profile" className="flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--dash-text)] hover:bg-[var(--dash-accent-bg)] transition-colors">
                    <svg className="w-4 h-4 text-[var(--dash-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0A17.933 17.933 0 0112 21.75c-2.676 0-5.216-.584-7.499-1.632z" />
                    </svg>
                    Профіль
                  </Link>
                  {canSwitchRole && (
                    <button onClick={() => { toggleRole(); setDropdownOpen(false); }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-[var(--dash-text)] hover:bg-[var(--dash-accent-bg)] transition-colors">
                      <svg className="w-4 h-4 text-[var(--dash-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                      </svg>
                      {isExecutorView ? 'Режим замовника' : 'Режим виконавця'}
                    </button>
                  )}
                  <div className="border-t border-[var(--dash-border)] mt-1 pt-1">
                    <button onClick={logout}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition-colors">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
                      </svg>
                      Вийти
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Nav tabs — desktop */}
        <nav className="dash-nav-tabs hidden md:flex">
          {navItems.map(item => {
            const isActive = item.exact
              ? pathname === item.href
              : item.href === '/dashboard/orders'
                ? pathname.startsWith('/dashboard/orders')
                : pathname.startsWith(item.href);
            return (
              <Link key={item.href} href={item.href} className={`dash-nav-tab ${isActive ? 'active' : ''}`}>
                {item.label}
              </Link>
            );
          })}
        </nav>
      </header>

      {/* Page content */}
      <main className="flex-1 p-4 md:p-6 lg:p-8 max-w-7xl w-full mx-auto">
        {children}
      </main>

      {/* Mobile bottom nav */}
      <nav className="md:hidden flex border-t border-[var(--dash-border)] bg-white sticky bottom-0 z-30">
        {mobileNavItems.map(item => {
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href);
          const isChatTab = item.href === '/dashboard/chats';
          return (
            <Link key={item.href} href={item.href}
              className={`flex-1 flex flex-col items-center justify-center gap-0.5 py-2.5 text-[10px] font-medium relative transition-colors ${
                isActive ? 'text-[var(--dash-accent)]' : 'text-[var(--dash-text-muted)]'
              }`}>
              <div className="relative">
                <MobileIcon name={item.icon} />
                {isChatTab && unreadCount > 0 && (
                  <span className="absolute -top-1 -right-2.5 bg-red-500 text-white text-[8px] font-bold rounded-full min-w-[14px] h-3.5 flex items-center justify-center px-0.5">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </div>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </div>
    </RoleContext.Provider>
  );
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <DashboardShell>{children}</DashboardShell>
    </AuthProvider>
  );
}
