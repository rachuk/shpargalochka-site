import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = {
  title: 'Автори-виконавці',
  description: 'Каталог перевірених авторів-виконавців на платформі Шпаргалочка.',
};

export default function HelpersPage() {
  return (
    <div className="max-w-3xl mx-auto px-4 py-24 text-center">
      <h1 className="text-3xl font-bold mb-4">Автори-виконавці</h1>
      <p className="text-gray-500 mb-8 text-lg">
        Каталог авторів з рейтингами, відгуками та цінами доступний через наш Telegram-бот.
      </p>
      <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer"
        className="inline-block bg-violet-700 hover:bg-violet-800 text-white font-semibold px-8 py-3.5 rounded-lg transition-colors text-lg">
        Знайти автора в Telegram
      </a>
      <p className="mt-6 text-sm text-gray-400">
        Хочете стати автором? <Link href="/authors" className="text-violet-700 hover:underline">Заповніть анкету</Link>
      </p>
    </div>
  );
}
