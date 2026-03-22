'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const SERVICES = [
  { to: '/services', label: 'Усі послуги' },
  { to: '/blog', label: 'Блог' },
  { to: '/reviews', label: 'Відгуки' },
];
const AUTHORS = [{ to: '/authors', label: 'Стати автором' }];
const INFO = [
  { to: '/about', label: 'Про нас' },
  { to: '/contacts', label: 'Контакти' },
  { to: '/privacy', label: 'Політика конфіденційності' },
  { to: '/terms', label: 'Умови використання' },
];

export function Footer() {
  const pathname = usePathname();
  if (pathname.startsWith('/dashboard') || pathname.startsWith('/login')) return null;

  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="flex items-center gap-2 text-xl font-bold text-white">
            <span className="w-7 h-7 bg-violet-600 rounded-lg flex items-center justify-center text-white text-xs font-bold">Ш</span>
            Шпаргалочка
          </Link>
          <p className="mt-4 text-sm leading-relaxed text-gray-400">
            Професійна допомога студентам з курсовими, дипломними та іншими навчальними роботами. Якість, терміни, конфіденційність.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Послуги</h3>
          <ul className="space-y-2.5">
            {SERVICES.map(l => <li key={l.to}><Link href={l.to} className="text-sm hover:text-white transition-colors">{l.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Для авторів</h3>
          <ul className="space-y-2.5">
            {AUTHORS.map(l => <li key={l.to}><Link href={l.to} className="text-sm hover:text-white transition-colors">{l.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-4">Інформація</h3>
          <ul className="space-y-2.5">
            {INFO.map(l => <li key={l.to}><Link href={l.to} className="text-sm hover:text-white transition-colors">{l.label}</Link></li>)}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-5 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <span>&copy; 2026 Шпаргалочка. Усі права захищені.</span>
          <div className="flex items-center gap-5">
            <a href="https://studservice.net" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">studservice.net</a>
            <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 hover:text-white transition-colors">
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z" /></svg>
              Telegram-бот
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
