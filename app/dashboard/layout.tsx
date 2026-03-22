'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AuthProvider, useAuth } from '@/providers/AuthProvider';
import { fetchAuth } from '@/lib/auth';
import type { ReactNode } from 'react';

type ActiveRole = 'customer' | 'executor';
const RoleContext = createContext<{ role: ActiveRole; toggle: () => void }>({ role: 'customer', toggle: () => {} });
export function useRole() { return useContext(RoleContext); }

const NAV_CUSTOMER = [
  { href: '/dashboard', label: 'Огляд', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/dashboard/orders', label: 'Мої замовлення', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { href: '/dashboard/orders/new', label: 'Нове замовлення', icon: 'M12 4v16m8-8H4' },
];

const NAV_EXECUTOR = [
  { href: '/dashboard', label: 'Огляд', icon: 'M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6' },
  { href: '/dashboard/orders', label: 'Мої замовлення', icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2' },
  { href: '/dashboard/available', label: 'Доступні замовлення', icon: 'M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z' },
  { href: '/dashboard/bids', label: 'Мої заявки', icon: 'M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z' },
];

const NAV_COMMON = [
  { href: '/dashboard/profile', label: 'Профіль', icon: 'M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z' },
];

function NavLink({ href, label, icon, active, badge }: { href: string; label: string; icon: string; active: boolean; badge?: number }) {
  return (
    <Link href={href}
      className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors relative ${
        active
          ? 'bg-blue-50 text-blue-700'
          : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
      }`}
    >
      <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
        <path strokeLinecap="round" strokeLinejoin="round" d={icon} />
      </svg>
      <span className="hidden lg:inline">{label}</span>
      {badge && badge > 0 ? (
        <span className="absolute top-1 right-1 lg:static lg:ml-auto bg-red-500 text-white text-[10px] font-bold rounded-full min-w-[18px] h-[18px] flex items-center justify-center px-1">
          {badge > 99 ? '99+' : badge}
        </span>
      ) : null}
    </Link>
  );
}

function DashboardShell({ children }: { children: ReactNode }) {
  const { user, isLoading, logout } = useAuth();
  const pathname = usePathname();
  const [unreadCount, setUnreadCount] = useState(0);
  const [role, setRole] = useState<ActiveRole>('customer');

  useEffect(() => {
    if (!user) return;
    const saved = localStorage.getItem('shpargalochka_role') as ActiveRole | null;
    if (saved === 'executor' && user.is_executor) {
      setRole('executor');
    } else if (saved === 'customer') {
      setRole('customer');
    } else {
      setRole(user.is_executor ? 'executor' : 'customer');
    }
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

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Завантаження...</p>
      </div>
    );
  }

  const isExecutorView = role === 'executor';
  const canSwitchRole = user.is_executor;

  const navItems = [
    ...(isExecutorView ? NAV_EXECUTOR : NAV_CUSTOMER),
    ...NAV_COMMON,
  ];

  return (
    <RoleContext.Provider value={{ role, toggle: toggleRole }}>
    <div className="min-h-screen flex">
      {/* Sidebar — desktop */}
      <aside className="hidden md:flex flex-col w-16 lg:w-60 border-r border-gray-200 bg-gray-50/50 p-3 gap-1 shrink-0">
        <div className="px-3 py-4 mb-2 hidden lg:block">
          <p className="text-sm font-semibold text-gray-900 truncate">{user.name}</p>
          <p className="text-xs text-gray-500">{isExecutorView ? 'Виконавець' : 'Замовник'}</p>
          {canSwitchRole && (
            <button onClick={toggleRole}
              className="mt-1.5 text-[11px] text-blue-600 hover:text-blue-700 font-medium">
              {isExecutorView ? 'Режим замовника' : 'Режим виконавця'} &rarr;
            </button>
          )}
        </div>
        <nav className="flex flex-col gap-1 flex-1">
          {navItems.map(item => (
            <NavLink key={item.href} {...item}
              badge={item.href === '/dashboard/orders' ? unreadCount : undefined}
              active={
                item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href)
              } />
          ))}
        </nav>
        <button onClick={logout}
          className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-gray-500 hover:bg-red-50 hover:text-red-600 transition-colors mt-auto"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
          </svg>
          <span className="hidden lg:inline">Вийти</span>
        </button>
      </aside>

      {/* Main content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile header */}
        <header className="md:hidden flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-white">
          <div>
            <p className="font-semibold text-gray-900 text-sm">{user.name}</p>
            {canSwitchRole && (
              <button onClick={toggleRole} className="text-[11px] text-blue-600 font-medium">
                {isExecutorView ? 'Замовник' : 'Виконавець'} &rarr;
              </button>
            )}
          </div>
          <button onClick={logout} className="text-xs text-gray-500 hover:text-red-600">Вийти</button>
        </header>

        <div className="flex-1 p-4 md:p-6 lg:p-8 overflow-auto">
          {children}
        </div>

        {/* Mobile bottom nav */}
        <nav className="md:hidden flex border-t border-gray-200 bg-white">
          {navItems.slice(0, 4).map(item => {
            const active = item.href === '/dashboard' ? pathname === '/dashboard' : pathname.startsWith(item.href);
            const badge = item.href === '/dashboard/orders' ? unreadCount : 0;
            return (
              <Link key={item.href} href={item.href}
                className={`flex-1 flex flex-col items-center gap-1 py-2.5 text-xs relative ${
                  active ? 'text-blue-600' : 'text-gray-500'
                }`}
              >
                <div className="relative">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d={item.icon} />
                  </svg>
                  {badge > 0 && (
                    <span className="absolute -top-1 -right-2 bg-red-500 text-white text-[9px] font-bold rounded-full min-w-[14px] h-[14px] flex items-center justify-center px-0.5">
                      {badge > 99 ? '99+' : badge}
                    </span>
                  )}
                </div>
                {item.label.split(' ')[0]}
              </Link>
            );
          })}
        </nav>
      </div>
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
