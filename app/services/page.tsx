import type { Metadata } from 'next';
import Link from 'next/link';
import { getWorkTypes } from '@/lib/api';

export const metadata: Metadata = {
  title: 'Послуги',
  description: 'Оберіть тип навчальної роботи та знайдіть автора з найкращим рейтингом і ціною. Курсові, дипломні, реферати та інші.',
};

export default async function ServicesPage() {
  const workTypes = await getWorkTypes().catch(() => []);

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-4">Наші послуги</h1>

      <div className="max-w-3xl mb-10 space-y-3 text-gray-600 leading-relaxed">
        <p>
          Оберіть тип роботи — і ми покажемо авторів, які спеціалізуються саме на ньому. Кожен автор має рейтинг, відгуки реальних замовників та власні ціни — ви порівнюєте і обираєте самостійно.
        </p>
        <p>
          Або одразу опишіть завдання в нашому
          <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer" className="text-teal-700 font-medium hover:underline ml-1">Telegram-боті</a> — і отримайте пропозиції від авторів з рейтингом.
        </p>
      </div>

      {workTypes.length > 0 && (
        <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
          {workTypes.map(wt => (
            <Link key={wt.id} href={`/services/${wt.slug}`}
              className="block px-5 py-4 rounded-lg bg-white border border-gray-200 hover:border-teal-300 hover:shadow-sm transition-all">
              <h2 className="font-medium text-gray-800 hover:text-teal-700 text-sm">{wt.name}</h2>
            </Link>
          ))}
        </div>
      )}

      <div className="mt-16 max-w-3xl">
        <h2 className="text-2xl font-bold mb-6">Чому студенти обирають Шпаргалочку</h2>
        <div className="space-y-4">
          {[
            { title: 'Рейтинг і відгуки', desc: 'Кожен автор має прозорий рейтинг на основі реальних відгуків. Ви бачите якість до замовлення.' },
            { title: 'Порівняння цін', desc: 'Автори самі пропонують ціну — ви обираєте оптимальний варіант без прихованих доплат.' },
            { title: 'Ваш вибір', desc: 'Ви самостійно обираєте виконавця — ми не призначаємо автора за вас.' },
            { title: 'Гарантія доопрацювань', desc: 'Якщо робота потребує правок — автор доопрацює безкоштовно. Ваше задоволення — пріоритет.' },
          ].map(item => (
            <div key={item.title}>
              <h3 className="font-semibold text-gray-900 mb-1">{item.title}</h3>
              <p className="text-gray-600 text-sm">{item.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
