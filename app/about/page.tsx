import type { Metadata } from 'next';
import Link from 'next/link';

export const metadata: Metadata = { title: 'Про нас', description: 'Шпаргалочка — платформа, де студенти обирають автора за рейтингом, відгуками та ціною. Прозоро, надійно, зручно.' };

export default function AboutPage() {
  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-8">Про Шпаргалочку</h1>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Наша місія</h2>
        <p className="text-gray-700 leading-relaxed mb-4">Шпаргалочка — це платформа, де студенти самостійно обирають автора для своєї навчальної роботи. Ви порівнюєте рейтинги, читаєте реальні відгуки, бачите ціни — і приймаєте рішення на основі прозорої інформації.</p>
        <p className="text-gray-700 leading-relaxed">Ми не призначаємо виконавця за вас. Наша задача — дати інструменти для усвідомленого вибору: рейтингова система, верифіковані відгуки та зручний Telegram-бот для комунікації.</p>
      </section>
      <section className="mb-10">
        <h2 className="text-xl font-bold mb-3">Чому саме ми</h2>
        <div className="grid sm:grid-cols-2 gap-4">
          {[
            { title: 'Прозорі рейтинги', desc: 'Рейтинг кожного автора формується з реальних відгуків. Ви бачите якість до того, як зробите вибір.' },
            { title: 'Порівняння цін', desc: 'Автори самі пропонують ціну та терміни. Ви обираєте оптимальний варіант для себе.' },
            { title: 'Реальні відгуки', desc: 'Усі відгуки залишають реальні замовники після отримання роботи. Без накруток.' },
            { title: 'Гарантія доопрацювань', desc: 'Якщо робота потребує правок — автор доопрацює безкоштовно до вашого задоволення.' },
          ].map(item => (
            <div key={item.title} className="p-5 rounded-xl border border-gray-100">
              <h3 className="font-semibold mb-1">{item.title}</h3>
              <p className="text-sm text-gray-600">{item.desc}</p>
            </div>
          ))}
        </div>
      </section>
      <div className="bg-violet-50 rounded-2xl p-8 text-center">
        <h2 className="text-xl font-bold mb-3">Готові обрати автора?</h2>
        <p className="text-gray-600 mb-6">Перегляньте профілі авторів або опишіть завдання в Telegram</p>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer" className="bg-violet-700 hover:bg-violet-800 text-white px-8 py-3 rounded-xl font-semibold transition-colors">Telegram-бот</a>
          <Link href="/helpers" className="border-2 border-violet-700 text-violet-700 px-8 py-3 rounded-xl font-semibold hover:bg-violet-50 transition-colors">Переглянути авторів</Link>
        </div>
      </div>
    </div>
  );
}
