'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV = [
  { to: '/services', label: 'Послуги' },
  { to: '/blog', label: 'Блог' },
  { to: '/reviews', label: 'Відгуки' },
  { to: '/authors', label: 'Стати автором' },
  { to: '/about', label: 'Про нас' },
  { to: '/contacts', label: 'Контакти' },
];

export function Header() {
  const [open, setOpen] = useState(false);
  const pathname = usePathname();

  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login')) return null;

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur border-b border-gray-100">
      <div className="max-w-6xl mx-auto px-4 flex items-center justify-between h-16">
        <Link href="/" className="flex items-center gap-2 text-xl font-bold text-violet-700">
          <span className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center text-white text-sm font-bold">Ш</span>
          Шпаргалочка
        </Link>
        <nav className="hidden md:flex items-center gap-6">
          {NAV.map(n => (
            <Link key={n.to} href={n.to}
              className={`text-sm font-medium transition-colors ${pathname.startsWith(n.to) ? 'text-violet-700' : 'text-gray-600 hover:text-gray-900'}`}>
              {n.label}
            </Link>
          ))}
          <Link href="/login"
            className="border border-violet-200 hover:border-violet-300 text-violet-700 px-4 py-2 rounded-xl text-sm font-semibold transition-colors">
            Увійти
          </Link>
          <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer"
            className="bg-violet-700 hover:bg-violet-800 text-white px-5 py-2.5 rounded-xl text-sm font-semibold transition-colors shadow-sm shadow-violet-200">
            Замовити роботу
          </a>
        </nav>
        <button onClick={() => setOpen(!open)} className="md:hidden p-2" aria-label="Menu">
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {open ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                   : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />}
          </svg>
        </button>
      </div>
      {open && (
        <div className="md:hidden border-t border-gray-100 bg-white px-4 pb-4">
          {NAV.map(n => (
            <Link key={n.to} href={n.to} onClick={() => setOpen(false)}
              className="block py-2.5 text-sm font-medium text-gray-700 hover:text-violet-700">{n.label}</Link>
          ))}
          <Link href="/login" onClick={() => setOpen(false)}
            className="block mt-3 text-center border border-violet-200 text-violet-700 px-5 py-2.5 rounded-xl text-sm font-semibold">
            Увійти
          </Link>
          <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer"
            className="block mt-2 text-center bg-violet-700 text-white px-5 py-2.5 rounded-xl text-sm font-semibold">
            Замовити роботу
          </a>
        </div>
      )}
    </header>
  );
}
