import Link from 'next/link';
import Image from 'next/image';
import { getStats, getWorkTypes } from '@/lib/api';
import { StarRating } from '@/components/StarRating';
import { getBlogPosts } from '@/lib/blog-data';

const TELEGRAM_BOT = 'https://t.me/shpargalochka_bot';

const TESTIMONIALS = [
  { name: 'Анна К.', subject: 'Курсова з менеджменту', rating: 5, text: 'Курсову прийняли з першого разу, викладач похвалив оформлення. Дуже задоволена!', avatar: '/images/avatar-anna.png' },
  { name: 'Олексій М.', subject: 'Дипломна з економіки', rating: 5, text: 'Дипломну здав на відмінно. Автор був на зв\'язку, правки вносив швидко.', avatar: '/images/avatar-oleksiy.png' },
  { name: 'Марія Д.', subject: 'Реферат з психології', rating: 5, text: 'Реферат зробили за два дні. Оформлення за методичкою, унікальність висока.', avatar: '/images/avatar-maria.png' },
  { name: 'Дмитро С.', subject: 'Контрольна з математики', rating: 5, text: 'Задачі розв\'язані правильно, з поясненнями. Контрольну написав на 5.', avatar: '/images/avatar-dmytro.png' },
  { name: 'Ірина В.', subject: 'Магістерська з права', rating: 4, text: 'Автор впорався з великою роботою. Правки після перевірки виправив оперативно.', avatar: '/images/avatar-iryna.png' },
  { name: 'Сергій Т.', subject: 'Есе з філософії', rating: 5, text: 'Цікаве есе з нестандартними аргументами. Викладач оцінів оригінальність.', avatar: '/images/avatar-serhiy.png' },
];

const SERVICE_ICONS: Record<string, string> = {
  'course-works': '📝', 'diploma-works': '🎓', 'module-works': '📋', 'control-works': '✅',
  'tasks': '🧮', 'essays': '✍️', 'presentations': '📊', 'abstracts': '📄',
  'lab-works': '🔬', 'master-works': '🏆', 'articles': '📰', 'business-plans': '💼',
};

export default async function HomePage() {
  const [stats, workTypes] = await Promise.all([
    getStats().catch(() => null),
    getWorkTypes().catch(() => []),
  ]);

  return (
    <>
      {/* Hero */}
      <section className="hero-gradient hero-glow text-white relative overflow-hidden">
        <div className="max-w-6xl mx-auto px-4 py-20 sm:py-28 relative z-10">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <div className="flex flex-wrap gap-2 mb-6">
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-teal-500/20 text-teal-300 px-3 py-1.5 rounded-full border border-teal-500/20">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                  Перевірені автори
                </span>
                <span className="inline-flex items-center gap-1.5 text-xs font-medium bg-amber-500/20 text-amber-300 px-3 py-1.5 rounded-full border border-amber-500/20">
                  <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  Реальні відгуки
                </span>
              </div>
              <h1 className="text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold leading-[1.08] mb-6">
                Перевірені експерти.{' '}
                <span className="gradient-text">Реальний результат.</span>
              </h1>
              <p className="text-lg text-gray-400 max-w-md mb-8 leading-relaxed">
                Порівнюйте профілі авторів, читайте відгуки, обирайте за рейтингом і ціною — без посередників.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 mb-10">
                <a href={TELEGRAM_BOT} target="_blank" rel="noopener noreferrer"
                  className="btn-glow inline-flex items-center justify-center bg-teal-600 hover:bg-teal-500 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-colors">
                  Знайти автора
                  <svg className="w-5 h-5 ml-2" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
                </a>
                <Link href="/authors"
                  className="inline-flex items-center justify-center border border-white/20 hover:border-white/40 bg-white/5 hover:bg-white/10 text-white font-semibold px-8 py-4 rounded-xl text-lg transition-all">
                  Стати автором
                </Link>
              </div>
              {stats && (
                <div className="flex flex-wrap gap-6 text-sm">
                  <div><span className="text-2xl font-bold text-white">{stats.total_orders.toLocaleString('uk-UA')}</span><span className="text-gray-500 ml-1.5">замовлень</span></div>
                  <div><span className="text-2xl font-bold text-white">{stats.total_executors}</span><span className="text-gray-500 ml-1.5">авторів</span></div>
                  <div><span className="text-2xl font-bold text-amber-400">{stats.average_rating.toFixed(1)}</span><span className="text-gray-500 ml-1.5">рейтинг</span></div>
                </div>
              )}
            </div>

            {/* Right: student photo with floating badges */}
            <div className="hidden lg:block relative">
              <div className="relative rounded-2xl overflow-hidden shadow-2xl">
                <Image src="/images/hero-student.png" alt="Студентка з ноутбуком" width={560} height={380} className="w-full h-auto object-cover" priority />
              </div>
              <div className="absolute top-4 -right-2 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg z-20 animate-float">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-amber-100 rounded-lg flex items-center justify-center text-amber-600 text-sm">⭐</div>
                  <div>
                    <p className="text-xs text-gray-500">Середній рейтинг</p>
                    <p className="text-sm font-bold text-gray-900">{stats?.average_rating.toFixed(1) || '4.9'}/5</p>
                  </div>
                </div>
              </div>
              <div className="absolute -bottom-3 left-4 bg-white/95 backdrop-blur-sm rounded-xl px-4 py-2.5 shadow-lg z-20 animate-float-delayed">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 bg-emerald-100 rounded-lg flex items-center justify-center text-emerald-600 text-sm">✅</div>
                  <div>
                    <p className="text-xs text-gray-500">Виконано робіт</p>
                    <p className="text-sm font-bold text-gray-900">{stats?.total_orders.toLocaleString('uk-UA') || '3 500'}+</p>
                  </div>
                </div>
              </div>
              <div className="absolute -top-4 -right-4 w-32 h-32 bg-teal-500/10 rounded-full blur-3xl"></div>
              <div className="absolute -bottom-8 -left-8 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl"></div>
            </div>
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-16">
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">Простий процес</span>
            <h2 className="text-3xl font-bold mt-2">Як це працює</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-0">
            {[
              { num: '1', title: 'Опишіть завдання', desc: 'Тип роботи, предмет, вимоги та терміни', color: 'bg-teal-600' },
              { num: '2', title: 'Порівняйте авторів', desc: 'Рейтинги, відгуки, ціни та спеціалізації', color: 'bg-blue-600' },
              { num: '3', title: 'Оберіть виконавця', desc: 'Домовтеся про ціну та строки напряму', color: 'bg-emerald-600' },
              { num: '4', title: 'Отримайте результат', desc: 'Перевірте роботу та залиште відгук', color: 'bg-amber-500' },
            ].map((item, i) => (
              <div key={i} className="relative text-center px-6 py-8">
                {i < 3 && <div className="hidden lg:block absolute top-12 left-[60%] w-[80%] h-px bg-gray-200 z-0"></div>}
                <div className={`w-10 h-10 ${item.color} rounded-full flex items-center justify-center text-white font-bold text-sm mx-auto mb-4 relative z-10`}>{item.num}</div>
                <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-500 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Services */}
      {workTypes.length > 0 && (
        <section className="py-20 bg-gray-50">
          <div className="max-w-5xl mx-auto px-4">
            <div className="text-center mb-14">
              <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">55+ типів робіт</span>
              <h2 className="text-3xl font-bold mt-2">Популярні послуги</h2>
            </div>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {workTypes.slice(0, 12).map(wt => (
                <Link key={wt.id} href={`/services/${wt.slug}`}
                  className="group flex items-center gap-3 px-5 py-4 rounded-xl bg-white border border-gray-100 hover:border-teal-300 hover:shadow-lg transition-all card-hover">
                  <span className="text-xl shrink-0">{SERVICE_ICONS[wt.slug] || '📎'}</span>
                  <span className="font-medium text-gray-700 group-hover:text-teal-700 text-sm transition-colors">{wt.name}</span>
                </Link>
              ))}
            </div>
            <div className="text-center mt-10">
              <Link href="/services" className="inline-flex items-center gap-2 text-teal-700 font-semibold hover:underline text-sm">
                Усі послуги
                <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
              </Link>
            </div>
          </div>
        </section>
      )}

      {/* Guarantee */}
      <section className="bg-teal-700 text-white py-16">
        <div className="max-w-5xl mx-auto px-4">
          <div className="grid sm:grid-cols-3 gap-8">
            {[
              { title: 'Безкоштовні правки', desc: 'Якщо викладач вимагає доопрацювання — автор внесе правки безкоштовно.', icon: '🔄' },
              { title: 'Конфіденційність', desc: 'Автори не бачать вашу особисту інформацію. Спілкування через захищений бот.', icon: '🔒' },
              { title: 'Перевірені автори', desc: 'Рейтинг формується з реальних відгуків замовників — без накруток.', icon: '✓' },
            ].map((item, i) => (
              <div key={i} className="flex gap-4">
                <div className="w-12 h-12 bg-white/15 rounded-xl flex items-center justify-center text-2xl shrink-0">{item.icon}</div>
                <div>
                  <h3 className="font-bold text-lg mb-1">{item.title}</h3>
                  <p className="text-teal-200 text-sm leading-relaxed">{item.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials with real photos */}
      <section className="py-20 bg-white">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">Реальні відгуки</span>
            <h2 className="text-3xl font-bold mt-2">Що кажуть наші клієнти</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {TESTIMONIALS.map((t, i) => (
              <div key={i} className="bg-gray-50 rounded-2xl p-6 card-hover relative">
                <svg className="absolute top-4 right-4 w-8 h-8 text-teal-100" fill="currentColor" viewBox="0 0 24 24"><path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10H14.017zM0 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151C7.546 6.068 5.983 8.789 5.983 11h4v10H0z" /></svg>
                <div className="flex items-center gap-3 mb-4">
                  <Image src={t.avatar} alt={t.name} width={44} height={44} className="w-11 h-11 rounded-full object-cover shrink-0" />
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{t.name}</p>
                    <p className="text-xs text-gray-400">{t.subject}</p>
                  </div>
                </div>
                <StarRating rating={t.rating} />
                <p className="text-gray-600 text-sm mt-3 leading-relaxed">{t.text}</p>
              </div>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/reviews" className="inline-flex items-center gap-2 text-teal-700 font-semibold hover:underline text-sm">
              Усі відгуки
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Blog */}
      <section className="py-20 bg-gray-50">
        <div className="max-w-5xl mx-auto px-4">
          <div className="text-center mb-14">
            <span className="text-sm font-semibold text-teal-600 uppercase tracking-wider">Блог</span>
            <h2 className="text-3xl font-bold mt-2">Корисні статті для студентів</h2>
          </div>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {getBlogPosts().slice(0, 3).map(post => (
              <Link key={post.slug} href={`/blog/${post.slug}`}
                className="group block bg-white rounded-2xl overflow-hidden border border-gray-100 card-hover">
                <div className="h-2 bg-gradient-to-r from-teal-500 to-blue-500"></div>
                <div className="p-6">
                  <span className="text-xs font-medium text-teal-700 bg-teal-50 px-2.5 py-1 rounded-full">{post.category}</span>
                  <h3 className="font-semibold text-gray-900 mt-3 mb-2 group-hover:text-teal-700 transition-colors">{post.title}</h3>
                  <p className="text-gray-500 text-sm line-clamp-2">{post.description}</p>
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center mt-10">
            <Link href="/blog" className="inline-flex items-center gap-2 text-teal-700 font-semibold hover:underline text-sm">
              Усі статті
              <svg className="w-4 h-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" d="M13.5 4.5L21 12m0 0l-7.5 7.5M21 12H3" /></svg>
            </Link>
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="cta-gradient text-white py-20 relative overflow-hidden">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-teal-400 blur-[100px]"></div>
          <div className="absolute bottom-1/4 right-1/4 w-48 h-48 rounded-full bg-blue-400 blur-[80px]"></div>
        </div>
        <div className="max-w-3xl mx-auto px-4 text-center relative z-10">
          <h2 className="text-3xl sm:text-4xl font-bold mb-4">Потрібна допомога з роботою?</h2>
          <p className="text-gray-400 mb-10 text-lg max-w-md mx-auto">Опишіть завдання у Telegram-боті та отримайте пропозиції від авторів за хвилину</p>
          <a href={TELEGRAM_BOT} target="_blank" rel="noopener noreferrer"
            className="btn-glow inline-flex items-center justify-center bg-teal-600 hover:bg-teal-500 text-white font-semibold px-10 py-4 rounded-xl text-lg transition-colors">
            Написати в Telegram
            <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24"><path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221l-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.446 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.334-.373-.121l-6.871 4.326-2.962-.924c-.643-.204-.657-.643.136-.953l11.57-4.461c.537-.194 1.006.131.832.942z" /></svg>
          </a>
        </div>
      </section>
    </>
  );
}
