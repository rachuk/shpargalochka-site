'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAuth, getAccessToken } from '@/lib/auth';
import { useAuth } from '@/providers/AuthProvider';
import { useRole } from './layout';
import ExpertCard, { type ExpertData } from '@/components/dashboard/ExpertCard';

interface Task {
  id: number;
  subject: string;
  status: string;
  deadline: string | null;
  price: string | null;
  date_add: string;
  executor_name: string | null;
  bids_count?: number;
  more?: string;
}

const POPULAR_SERVICES = [
  { name: 'Курсова робота', icon: '📄', price: '500' },
  { name: 'Дипломна робота', icon: '🎓', price: '1500' },
  { name: 'Контрольна робота', icon: '✍️', price: '200' },
  { name: 'Реферат', icon: '📋', price: '150' },
  { name: 'Задачі / Вправи', icon: '🧮', price: '100' },
  { name: 'Програмування', icon: '💻', price: '300' },
  { name: 'Есе', icon: '📝', price: '120' },
  { name: 'Презентація', icon: '🖥️', price: '100' },
];

const TRUST_STATS = [
  { value: '1 000+', label: 'Перевірених експертів', icon: '👨‍🏫' },
  { value: '5 років', label: 'На ринку освіти', icon: '🏆' },
  { value: '4.8 з 5', label: 'Середня оцінка', icon: '⭐' },
  { value: '100%', label: 'Гарантія результату', icon: '🛡️' },
];

function Accordion({ title, count, children, defaultOpen = false }: {
  title: string; count: number; children: React.ReactNode; defaultOpen?: boolean;
}) {
  const [open, setOpen] = useState(defaultOpen);
  return (
    <div className="dash-card overflow-hidden">
      <div className="dash-accordion-header" onClick={() => setOpen(v => !v)}>
        <span>{title} <span className="text-sm font-normal text-[var(--dash-text-muted)] ml-1">({count})</span></span>
        <svg className={`w-5 h-5 text-[var(--dash-text-muted)] transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" />
        </svg>
      </div>
      <div className={`dash-accordion-body ${open ? 'open' : ''}`}>
        <div className="p-4 space-y-3">{children}</div>
      </div>
    </div>
  );
}

function OrderCard({ task }: { task: Task }) {
  return (
    <Link href={`/dashboard/orders/${task.id}`} className="block p-4 rounded-xl border border-[var(--dash-border)] hover:border-[var(--dash-accent-light)] hover:shadow-sm transition-all bg-white">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <h4 className="text-sm font-semibold text-[var(--dash-text)] line-clamp-1">{task.subject}</h4>
          {task.more && <p className="text-xs text-[var(--dash-text-muted)] mt-1 line-clamp-2">{task.more}</p>}
        </div>
        {task.price && <span className="text-base font-bold text-[var(--dash-text)] shrink-0">{task.price} ₴</span>}
      </div>
      <div className="flex items-center gap-3 mt-2.5 text-xs text-[var(--dash-text-muted)]">
        {task.deadline && (
          <span className="flex items-center gap-1">
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
            {new Date(task.deadline).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
          </span>
        )}
        {task.bids_count !== undefined && <span>{task.bids_count} заявок</span>}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { role } = useRole();
  const router = useRouter();
  const isExecutorView = role === 'executor';
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [experts, setExperts] = useState<ExpertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [heroText, setHeroText] = useState('');
  const [heroSubmitting, setHeroSubmitting] = useState(false);

  useEffect(() => {
    const promises: Promise<void>[] = [
      fetchAuth<Task[]>('/tasks/my_tasks/').then(setMyTasks).catch(e => setError(e.message)),
    ];
    if (isExecutorView) {
      promises.push(fetchAuth<Task[]>('/tasks/available_tasks/').then(setAvailableTasks).catch(() => {}));
    } else {
      promises.push(
        fetch('/api/v1/public/executors/?limit=8&sort=rating').then(r => r.json())
          .then((data: { results?: ExpertData[] }) => setExperts(data.results || (Array.isArray(data) ? data as ExpertData[] : [])))
          .catch(() => {})
      );
    }
    Promise.all(promises).finally(() => setLoading(false));
  }, [isExecutorView]);

  const handleHeroSubmit = async () => {
    if (!heroText.trim()) { router.push('/dashboard/orders/new'); return; }
    setHeroSubmitting(true);
    try {
      const token = getAccessToken();
      if (!token) { router.push('/login'); return; }
      const fd = new FormData();
      fd.append('subject', heroText.trim().slice(0, 110) || 'Нове завдання');
      fd.append('more', heroText.trim());
      const res = await fetch('/miniapp/api/v1/tasks/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) { setHeroText(''); router.push('/dashboard/orders'); }
    } finally { setHeroSubmitting(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="dash-card p-5 border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>;
  }

  const counts: Record<string, number> = {};
  for (const t of myTasks) counts[t.status] = (counts[t.status] || 0) + 1;

  /* === EXECUTOR VIEW === */
  if (isExecutorView) {
    const newOrders = availableTasks.filter(t => (t.bids_count ?? 0) === 0);
    const fewBids = availableTasks.filter(t => (t.bids_count ?? 0) > 0 && (t.bids_count ?? 0) < 3);
    const moreBids = availableTasks.filter(t => (t.bids_count ?? 0) >= 3);
    return (
      <div className="animate-slide-up">
        <div className="flex flex-col lg:flex-row gap-6">
          <div className="dash-profile-sidebar hidden lg:block">
            <div className="profile-card">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[var(--dash-accent)] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                  {(user?.name || 'U').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
              <h3 className="font-bold text-[var(--dash-text)] text-base">{user?.name}</h3>
              <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">Виконавець</p>
              <div className="mt-4 space-y-2.5 text-left">
                <div className="flex items-center justify-between text-sm"><span className="text-[var(--dash-text-muted)]">Виконано</span><span className="font-semibold text-[var(--dash-text)]">{counts['completed'] || 0}</span></div>
                <div className="flex items-center justify-between text-sm"><span className="text-[var(--dash-text-muted)]">В роботі</span><span className="font-semibold text-[var(--dash-text)]">{counts['in_progress'] || 0}</span></div>
                {user?.balance && Number(user.balance) > 0 && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-[var(--dash-border)]"><span className="text-[var(--dash-text-muted)]">Баланс</span><span className="font-semibold text-[var(--dash-success)]">{user.balance} ₴</span></div>
                )}
              </div>
              <Link href="/dashboard/profile" className="mt-4 block text-center text-xs text-[var(--dash-accent)] hover:underline">Редагувати профіль</Link>
            </div>
          </div>
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-[var(--dash-text)]">Замовлення для вас</h1>
              <Link href="/dashboard/available" className="text-sm text-[var(--dash-accent)] hover:underline font-medium">Уся біржа →</Link>
            </div>
            {availableTasks.length === 0 ? (
              <div className="dash-card p-10 text-center"><p className="text-[var(--dash-text-muted)]">Немає доступних замовлень</p></div>
            ) : (
              <>
                {newOrders.length > 0 && <Accordion title="Нові замовлення" count={newOrders.length} defaultOpen>{newOrders.map(t => <OrderCard key={t.id} task={t} />)}</Accordion>}
                {fewBids.length > 0 && <Accordion title="Менше 3 заявок" count={fewBids.length} defaultOpen>{fewBids.map(t => <OrderCard key={t.id} task={t} />)}</Accordion>}
                {moreBids.length > 0 && <Accordion title="3+ заявок" count={moreBids.length}>{moreBids.map(t => <OrderCard key={t.id} task={t} />)}</Accordion>}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* === CUSTOMER VIEW — Author24-style === */
  const activeTasks = myTasks.filter(t => ['active', 'published', 'in_progress', 'review'].includes(t.status));

  return (
    <div className="space-y-10 animate-slide-up">
      {/* Hero banner — Author24-style */}
      <section className="relative bg-gradient-to-br from-[#6c5ce7] via-[#7c6cf0] to-[#8b7bef] rounded-3xl p-6 md:p-10 overflow-hidden">
        <div className="absolute top-0 right-0 w-72 h-72 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/5 rounded-full translate-y-1/3 -translate-x-1/4" />
        <div className="relative z-10 max-w-2xl">
          <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">Перевірені експерти. Реальний результат.</h1>
          <p className="text-white/75 text-sm md:text-base mb-6">Без помилок, плагіату та нейромереж</p>
          <div className="bg-white rounded-2xl p-1.5 flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={heroText}
              onChange={e => setHeroText(e.target.value)}
              placeholder="Опишіть, що потрібно зробити..."
              className="flex-1 px-4 py-3 text-sm text-[var(--dash-text)] placeholder:text-gray-400 outline-none rounded-xl"
              onKeyDown={e => e.key === 'Enter' && handleHeroSubmit()}
            />
            <button
              onClick={handleHeroSubmit}
              disabled={heroSubmitting}
              className="px-6 py-3 rounded-xl bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] text-white font-semibold text-sm transition-colors whitespace-nowrap disabled:opacity-50"
            >
              {heroSubmitting ? 'Створюємо...' : 'Розмістити завдання'}
            </button>
          </div>
        </div>
      </section>

      {/* Trust stats */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {TRUST_STATS.map((s, i) => (
          <div key={i} className="bg-white rounded-2xl border border-[var(--dash-border)] p-4 text-center hover:shadow-md transition-shadow">
            <div className="text-2xl mb-1">{s.icon}</div>
            <div className="text-lg font-bold text-[var(--dash-text)]">{s.value}</div>
            <div className="text-xs text-[var(--dash-text-muted)] mt-0.5">{s.label}</div>
          </div>
        ))}
      </section>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--dash-text)]">Активні завдання <span className="text-sm font-normal text-[var(--dash-text-muted)]">({activeTasks.length})</span></h2>
            <Link href="/dashboard/orders" className="text-sm text-[var(--dash-accent)] hover:underline font-medium">Показати всі →</Link>
          </div>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {activeTasks.slice(0, 6).map(task => (
              <Link key={task.id} href={`/dashboard/orders/${task.id}`}
                className="bg-white rounded-2xl border border-[var(--dash-border)] p-4 hover:shadow-md hover:border-[var(--dash-accent-light)] transition-all">
                <div className="flex items-center gap-2 mb-2">
                  <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                    task.status === 'in_progress' ? 'bg-blue-50 text-blue-700' :
                    task.status === 'review' ? 'bg-orange-50 text-orange-700' :
                    'bg-[var(--dash-accent-bg)] text-[var(--dash-accent)]'
                  }`}>
                    {task.status === 'in_progress' ? 'В роботі' : task.status === 'review' ? 'На перевірці' : 'Вибір експерта'}
                  </span>
                  <span className="text-[10px] text-[var(--dash-text-muted)]">#{task.id}</span>
                </div>
                <h3 className="text-sm font-semibold text-[var(--dash-text)] line-clamp-2">{task.subject}</h3>
                <div className="flex items-center justify-between mt-3">
                  {task.deadline && (
                    <span className="text-xs text-[var(--dash-text-muted)]">до {new Date(task.deadline).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}</span>
                  )}
                  {task.bids_count != null && task.bids_count > 0 && (
                    <span className="text-xs font-medium text-[var(--dash-accent)]">{task.bids_count} відгуків</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Services Grid */}
      <section>
        <h2 className="text-lg font-bold text-[var(--dash-text)] mb-4">Популярні послуги</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {POPULAR_SERVICES.map(s => (
            <Link key={s.name} href={`/dashboard/orders/new?type=${encodeURIComponent(s.name)}`}
              className="bg-white rounded-2xl border border-[var(--dash-border)] p-4 text-center hover:shadow-md hover:border-[var(--dash-accent-light)] transition-all group">
              <div className="text-3xl mb-2">{s.icon}</div>
              <h3 className="text-sm font-semibold text-[var(--dash-text)] group-hover:text-[var(--dash-accent)] transition-colors">{s.name}</h3>
              <p className="text-xs text-[var(--dash-text-muted)] mt-1">від {s.price} ₴</p>
            </Link>
          ))}
        </div>
      </section>

      {/* No Tasks CTA */}
      {myTasks.length === 0 && (
        <section className="bg-white rounded-2xl border border-[var(--dash-border)] p-10 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-[var(--dash-text)] mb-2">Ще немає завдань</h2>
          <p className="text-sm text-[var(--dash-text-muted)] mb-5 max-w-md mx-auto">Створіть перше завдання — отримайте відгуки від експертів за 5 хвилин</p>
          <Link href="/dashboard/orders/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-full bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] text-white font-semibold transition-colors">
            Створити завдання
          </Link>
        </section>
      )}

      {/* Recommended Experts */}
      {experts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--dash-text)]">Більше 1 000 перевірених експертів</h2>
            <Link href="/dashboard/experts" className="text-sm text-[var(--dash-accent)] hover:underline font-medium">Усі експерти →</Link>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
            {experts.slice(0, 8).map(e => (
              <ExpertCard
                key={e.id}
                expert={e}
                onProfile={() => router.push(`/dashboard/experts?id=${e.id}`)}
                onSelect={() => router.push(`/dashboard/experts?id=${e.id}`)}
                actionLabel="Обрати"
              />
            ))}
          </div>
        </section>
      )}

      {/* How it works */}
      <section className="bg-white rounded-2xl border border-[var(--dash-border)] p-6 md:p-8">
        <h2 className="text-lg font-bold text-[var(--dash-text)] mb-6 text-center">Підбери ідеального експерта для своєї задачі</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { step: '1', title: 'Опиши своє завдання', desc: 'Обери предмет та вкажи, до якого терміну потрібно виконати завдання' },
            { step: '2', title: 'Обери експерта', desc: 'Обговори деталі та формат виконання завдання, терміни та умови' },
            { step: '3', title: 'Отримай готову роботу', desc: 'А якщо викладач вимагатиме доопрацювань — експерт допоможе безкоштовно' },
          ].map(s => (
            <div key={s.step} className="text-center">
              <div className="w-10 h-10 rounded-full bg-[var(--dash-accent)] text-white flex items-center justify-center font-bold text-lg mx-auto mb-3">{s.step}</div>
              <h3 className="font-bold text-sm text-[var(--dash-text)] mb-1">{s.title}</h3>
              <p className="text-xs text-[var(--dash-text-muted)] leading-relaxed">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}
