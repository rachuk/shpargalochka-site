import Link from 'next/link';

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
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-6xl mx-auto px-4 py-12 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
        <div>
          <Link href="/" className="text-xl font-bold text-white">Шпаргалочка</Link>
          <p className="mt-3 text-sm leading-relaxed text-gray-400">
            Професійна допомога студентам з курсовими, дипломними та іншими навчальними роботами. Якість, терміни, конфіденційність.
          </p>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Послуги</h3>
          <ul className="space-y-2">
            {SERVICES.map(l => <li key={l.to}><Link href={l.to} className="text-sm hover:text-white transition-colors">{l.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Для авторів</h3>
          <ul className="space-y-2">
            {AUTHORS.map(l => <li key={l.to}><Link href={l.to} className="text-sm hover:text-white transition-colors">{l.label}</Link></li>)}
          </ul>
        </div>
        <div>
          <h3 className="text-sm font-semibold text-white uppercase tracking-wider mb-3">Інформація</h3>
          <ul className="space-y-2">
            {INFO.map(l => <li key={l.to}><Link href={l.to} className="text-sm hover:text-white transition-colors">{l.label}</Link></li>)}
          </ul>
        </div>
      </div>
      <div className="border-t border-gray-800">
        <div className="max-w-6xl mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-gray-500">
          <span>&copy; 2026 Шпаргалочка. Усі права захищені.</span>
          <div className="flex items-center gap-4">
            <a href="https://studservice.net" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">studservice.net</a>
            <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer" className="hover:text-white transition-colors">Telegram-бот</a>
          </div>
        </div>
      </div>
    </footer>
  );
}
