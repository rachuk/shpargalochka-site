import Link from 'next/link';
import { getStats, getWorkTypes } from '@/lib/api';
import { StarRating } from '@/components/StarRating';
import { getBlogPosts } from '@/lib/blog-data';

const TELEGRAM_BOT = 'https://t.me/shpargalochka_bot';

const TESTIMONIALS = [
  { name: 'Анна К.', subject: 'Курсова з менеджменту', rating: 5, text: 'Курсову прийняли з першого разу, викладач похвалив оформлення. Дуже задоволена!' },
  { name: 'Олексій М.', subject: 'Дипломна з економіки', rating: 5, text: 'Дипломну здав на відмінно. Автор був на зв\'язку, правки вносив швидко.' },
  { name: 'Марія Д.', subject: 'Реферат з психології', rating: 5, text: 'Реферат зробили за два дні. Оформлення за методичкою, унікальність висока.' },
  { name: 'Дмитро С.', subject: 'Контрольна з математики', rating: 5, text: 'Задачі розв\'язані правильно, з поясненнями. Контрольну написав на 5.' },
  { name: 'Ірина В.', subject: 'Магістерська з права', rating: 4, text: 'Автор впорався з великою роботою. Правки після перевірки виправив оперативно.' },
  { name: 'Сергій Т.', subject: 'Есе з філософії', rating: 5, text: 'Цікаве есе з нестандартними аргументами. Викладач оцінив оригінальність.' },
];

export default async function HomePage() {
  const [stats, workTypes] = await Promise.all([
    getStats().catch(() => null),
    getWorkTypes().catch(() => []),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="bg-gray-950 text-white">
        <div className="max-w-5xl mx-auto px-4 py-24 sm:py-32">
          <p className="text-sm font-medium text-violet-400 mb-4 tracking-wide uppercase">Платформа студентської допомоги</p>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] mb-6 max-w-3xl">
            Обирайте автора<br className="hidden sm:block" />
            <span className="text-violet-400">за рейтингом, відгуками та ціною</span>
          </h1>
          <p className="text-lg text-gray-400 max-w-xl mb-10 leading-relaxed">
            Порівнюйте профілі авторів, читайте реальні відгуки, дивіться рейтинг і ціни — та обирайте того, хто підходить саме вам.
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <a href={TELEGRAM_BOT} target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-violet-600 hover:bg-violet-500 text-white font-semibold px-7 py-3.5 rounded-lg transition-colors">
              Знайти автора
              <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </a>
            <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer"
              className="inline-flex items-center justify-center border border-gray-700 hover:border-gray-500 text-gray-300 hover:text-white font-semibold px-7 py-3.5 rounded-lg transition-colors">
              Переглянути авторів
            </a>
          </div>
        </div>
      </section>

      {/* Stats strip */}
      {stats && (
        <section className="border-b border-gray-100 py-8">
          <div className="max-w-5xl mx-auto px-4 grid grid-cols-2 md:grid-cols-4 gap-6 text-center">
            <div><p className="text-3xl font-bold text-gray-900">{stats.total_orders.toLocaleString('uk-UA')}</p><p className="text-gray-500 text-sm mt-1">виконаних замовлень</p></div>
            <div><p className="text-3xl font-bold text-gray-900">{stats.total_executors.toLocaleString('uk-UA')}</p><p className="text-gray-500 text-sm mt-1">авторів-виконавців</p></div>
            <div><p className="text-3xl font-bold text-gray-900">{stats.average_rating.toFixed(1)}</p><p className="text-gray-500 text-sm mt-1">середній рейтинг</p></div>
            <div><p className="text-3xl font-bold text-gray-900">{stats.total_reviews.toLocaleString('uk-UA')}</p><p className="text-gray-500 text-sm mt-1">відгуків клієнтів</p></div>
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-4">Як це працює</h2>
          <p className="text-gray-500 text-center mb-14 max-w-lg mx-auto">Чотири кроки від завдання до готової роботи</p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-10">
            {[
              { step: '01', title: 'Опишіть завдання', desc: 'Тип роботи, предмет, вимоги та бажані терміни.' },
              { step: '02', title: 'Порівняйте авторів', desc: 'Перегляньте рейтинги, відгуки, ціни та спеціалізації.' },
              { step: '03', title: 'Оберіть виконавця', desc: 'Домовтеся про ціну та строки з автором, який підходить.' },
              { step: '04', title: 'Отримайте результат', desc: 'Перевірте роботу, залиште відгук — це допоможе іншим.' },
            ].map(item => (
              <div key={item.step}>
                <span className="text-sm font-bold text-violet-600 mb-3 block">{item.step}</span>
                <h3 className="font-semibold text-lg mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Popular services */}
      {workTypes.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <h2 className="text-3xl font-bold text-center mb-14">Популярні послуги</h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {workTypes.slice(0, 12).map(wt => (
                <Link key={wt.id} href={`/services/${wt.slug}`}
                  className="block px-5 py-4 rounded-lg bg-white border border-gray-200 hover:border-violet-300 hover:shadow-sm transition-all font-medium text-gray-800 hover:text-violet-700 text-sm">
                  {wt.name}
                </Link>
              ))}
            </div>
            <div className="text-center mt-10"><Link href="/services" className="text-violet-700 font-semibold hover:underline text-sm">Усі послуги &rarr;</Link></div>
          </div>
        </section>
      )}

      {/* Testimonials (static) */}
      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-14">Відгуки клієнтів</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
                <StarRating rating={t.rating} />
                <p className="text-gray-700 text-sm mt-3 mb-4 leading-relaxed">{t.text}</p>
                <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                <p className="text-xs text-gray-400 mt-0.5">{t.subject}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10"><Link href="/reviews" className="text-violet-700 font-semibold hover:underline text-sm">Усі відгуки &rarr;</Link></div>
        </div>
      </section>

      {/* Blog preview */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-14">Корисні статті</h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {getBlogPosts().slice(0, 3).map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="block bg-white rounded-xl p-6 border border-gray-100 shadow-sm hover:shadow-md hover:border-violet-200 transition-all">
                <span className="text-xs font-medium text-violet-700 bg-violet-50 px-2 py-0.5 rounded">{post.category}</span>
                <h3 className="font-semibold text-gray-900 mt-3 mb-2">{post.title}</h3>
                <p className="text-gray-500 text-sm line-clamp-2">{post.description}</p>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10"><Link href="/blog" className="text-violet-700 font-semibold hover:underline text-sm">Усі статті &rarr;</Link></div>
        </div>
      </section>

      {/* CTA */}
      <section className="bg-gray-950 text-white py-16">
        <div className="max-w-3xl mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">Потрібна допомога з роботою?</h2>
          <p className="text-gray-400 mb-8 text-lg">Знайдіть автора з найкращим рейтингом для вашого завдання.</p>
          <a href={TELEGRAM_BOT} target="_blank" rel="noopener noreferrer"
            className="inline-block bg-violet-600 hover:bg-violet-500 text-white font-semibold px-10 py-4 rounded-lg transition-colors text-lg">Знайти автора</a>
        </div>
      </section>
    </>
  );
}
