import type { Metadata } from 'next';
import { getStats } from '@/lib/api';
import { StarRating } from '@/components/StarRating';

export const metadata: Metadata = {
  title: 'Відгуки клієнтів',
  description: 'Відгуки студентів про досвід роботи з авторами на платформі Шпаргалочка.',
};

const TESTIMONIALS = [
  { name: 'Анна К.', subject: 'Курсова робота з менеджменту', rating: 5, text: 'Автор виконав роботу дуже якісно та вчасно. Курсову прийняли з першого разу, викладач навіть похвалив оформлення. Дуже задоволена!' },
  { name: 'Олексій М.', subject: 'Дипломна робота з економіки', rating: 5, text: 'Дипломну здав на відмінно. Автор був на зв\'язку протягом усього часу, вносив правки швидко. Рекомендую платформу.' },
  { name: 'Марія Д.', subject: 'Реферат з психології', rating: 5, text: 'Реферат зробили за два дні, хоча я думала що це нереально. Все оформлено за методичкою мого ВНЗ, унікальність висока.' },
  { name: 'Дмитро С.', subject: 'Контрольна з вищої математики', rating: 5, text: 'Задачі розв\'язані правильно, з поясненнями кожного кроку. Контрольну написав на 5. Буду звертатися ще.' },
  { name: 'Ірина В.', subject: 'Магістерська робота з права', rating: 4, text: 'Велика робота, але автор впорався. Були невеликі правки після перевірки викладачем — автор оперативно все виправив. Загалом дуже задоволена.' },
  { name: 'Сергій Т.', subject: 'Есе з філософії', rating: 5, text: 'Написали цікаве есе з нестандартними аргументами. Викладач оцінив оригінальність думки. Швидко та якісно.' },
  { name: 'Катерина Л.', subject: 'Звіт з практики', rating: 5, text: 'Звіт оформили ідеально за вимогами кафедри. Все було готово раніше дедлайну. Приємно працювати з відповідальними людьми.' },
  { name: 'Богдан Р.', subject: 'Презентація для захисту', rating: 5, text: 'Презентація вийшла дуже професійною. Слайди структуровані, графіки зрозумілі. Захист пройшов чудово, дякую!' },
  { name: 'Юлія Н.', subject: 'Курсова робота з бухгалтерського обліку', rating: 4, text: 'Робота якісна, але довелося чекати трохи довше ніж очікувалося. Зате результат порадував — оцінка 5.' },
  { name: 'Артем Г.', subject: 'Лабораторні роботи з фізики', rating: 5, text: 'Замовляв серію лабораторних. Всі виконані коректно, з графіками та висновками. Економить купу часу.' },
];

export default async function ReviewsPage() {
  const stats = await getStats().catch(() => null);

  const jsonLd = stats ? {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'Шпаргалочка',
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: stats.average_rating.toFixed(1),
      reviewCount: stats.total_reviews,
      bestRating: '5',
      worstRating: '1',
    },
  } : null;

  return (
    <div className="max-w-5xl mx-auto px-4 py-12">
      <h1 className="text-3xl font-bold mb-2">Відгуки клієнтів</h1>
      <p className="text-gray-500 mb-10">
        Що кажуть студенти про роботу з нашими авторами
        {stats && <span> · Середній рейтинг <strong className="text-gray-700">{stats.average_rating.toFixed(1)}</strong> на основі {stats.total_reviews} відгуків</span>}
      </p>

      <div className="space-y-4">
        {TESTIMONIALS.map((t, i) => (
          <div key={i} className="bg-white rounded-xl p-6 border border-gray-100 shadow-sm">
            <div className="flex items-center justify-between mb-2">
              <StarRating rating={t.rating} />
              <span className="text-xs text-gray-400">{t.subject}</span>
            </div>
            <p className="text-gray-700 mb-3">{t.text}</p>
            <p className="text-sm font-semibold text-gray-900">{t.name}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 text-center bg-gray-50 rounded-2xl p-8">
        <h2 className="text-xl font-bold mb-3">Потрібна допомога з навчальною роботою?</h2>
        <p className="text-gray-500 mb-6">Напишіть у наш Telegram-бот — підберемо автора за рейтингом та відгуками</p>
        <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer"
          className="inline-block bg-violet-700 hover:bg-violet-800 text-white font-semibold px-8 py-3 rounded-lg transition-colors">
          Написати в Telegram
        </a>
      </div>

      {jsonLd && <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />}
    </div>
  );
}
