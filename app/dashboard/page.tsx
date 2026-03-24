'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAuth } from '@/lib/auth';
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
  { name: 'Розв\'язання задач', color: '#E8F5E9', accent: '#4CAF50', price: '100' },
  { name: 'Курсова робота', color: '#E3F2FD', accent: '#2196F3', price: '500' },
  { name: 'Контрольна робота', color: '#FFF3E0', accent: '#FF9800', price: '200' },
  { name: 'Реферат', color: '#F3E5F5', accent: '#9C27B0', price: '150' },
  { name: 'Дипломна робота', color: '#E8EAF6', accent: '#3F51B5', price: '1500' },
  { name: 'Есе', color: '#FBE9E7', accent: '#FF5722', price: '120' },
  { name: 'Програмування', color: '#E0F7FA', accent: '#00BCD4', price: '300' },
  { name: 'Презентація', color: '#FFF9C4', accent: '#FFC107', price: '100' },
];

export default function DashboardPage() {
  const { user } = useAuth();
  const { role } = useRole();
  const router = useRouter();
  const isExecutorView = role === 'executor';
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [experts, setExperts] = useState<ExpertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [heroText, setHeroText] = useState('');

  useEffect(() => {
    const promises: Promise<void>[] = [
      fetchAuth<Task[]>('/tasks/my_tasks/').then(setMyTasks).catch(() => {}),
    ];
    if (isExecutorView) {
      promises.push(fetchAuth<Task[]>('/tasks/available_tasks/').then(setAvailableTasks).catch(() => {}));
    } else {
      promises.push(
        fetch('/api/v1/public/executors/?limit=6&sort=rating').then(r => r.json())
          .then((data: { results?: ExpertData[] }) => setExperts(data.results || (Array.isArray(data) ? data as ExpertData[] : [])))
          .catch(() => {})
      );
    }
    Promise.all(promises).finally(() => setLoading(false));
  }, [isExecutorView]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  /* === EXECUTOR VIEW === */
  if (isExecutorView) {
    const counts: Record<string, number> = {};
    for (const t of myTasks) counts[t.status] = (counts[t.status] || 0) + 1;
    const newOrders = availableTasks.filter(t => (t.bids_count ?? 0) === 0);
    const fewBids = availableTasks.filter(t => (t.bids_count ?? 0) > 0 && (t.bids_count ?? 0) < 3);
    return (
      <div className="animate-slide-up space-y-5">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-bold text-[var(--dash-text)]">Замовлення для вас</h1>
          <Link href="/dashboard/available" className="text-sm text-[var(--dash-accent)] hover:underline font-medium">Уся біржа →</Link>
        </div>
        {availableTasks.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-10 text-center">
            <p className="text-[var(--dash-text-muted)]">Немає доступних замовлень</p>
          </div>
        ) : (
          <div className="space-y-3">
            {[...newOrders, ...fewBids].slice(0, 10).map(t => (
              <Link key={t.id} href={`/dashboard/orders/${t.id}`}
                className="block bg-white rounded-2xl border border-[var(--dash-border)] p-4 hover:shadow-md hover:border-[var(--dash-accent-light)] transition-all">
                <h4 className="text-sm font-semibold text-[var(--dash-text)] line-clamp-1">{t.subject}</h4>
                <div className="flex items-center gap-3 mt-2 text-xs text-[var(--dash-text-muted)]">
                  {t.price && <span className="font-semibold text-[var(--dash-text)]">{t.price} ₴</span>}
                  {t.deadline && <span>до {new Date(t.deadline).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}</span>}
                  <span>{t.bids_count ?? 0} заявок</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  /* === CUSTOMER VIEW — Author24-style === */
  const activeTasks = myTasks.filter(t => ['active', 'published', 'in_progress', 'review'].includes(t.status));

  return (
    <div className="space-y-10 animate-slide-up">
      {/* Hero — white card with textarea, like Author24 */}
      <section className="text-center">
        <h1 className="text-2xl md:text-3xl font-bold text-[var(--dash-text)] mb-6">
          <span className="text-2xl md:text-3xl">👋</span> Створи завдання
        </h1>
        <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-5 md:p-6 max-w-2xl mx-auto shadow-sm">
          <textarea
            value={heroText}
            onChange={e => setHeroText(e.target.value)}
            placeholder="Розкажи детальніше про своє завдання"
            rows={3}
            maxLength={1000}
            className="w-full border border-[var(--dash-border)] rounded-xl p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)]/20 focus:border-[var(--dash-accent)] placeholder:text-gray-400"
          />
          <div className="flex items-center justify-between mt-3">
            <span className="text-[10px] text-[var(--dash-text-muted)]">Максимум 1 000 символів</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => router.push('/dashboard/orders/new')}
                className="px-3 py-2 rounded-lg border border-[var(--dash-border)] hover:bg-gray-50 text-sm text-[var(--dash-text-muted)] flex items-center gap-1.5 transition-colors"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
                Прикріпити файл
              </button>
              <button
                onClick={() => {
                  const params = heroText.trim() ? `?desc=${encodeURIComponent(heroText.trim())}` : '';
                  router.push(`/dashboard/orders/new${params}`);
                }}
                className="px-5 py-2 rounded-lg bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] text-white text-sm font-semibold transition-colors"
              >
                Створити завдання
              </button>
            </div>
          </div>
        </div>
        <div className="flex items-center justify-center gap-6 mt-4 text-xs text-[var(--dash-text-muted)]">
          <span className="flex items-center gap-1.5">📝 Розмісти завдання</span>
          <span className="flex items-center gap-1.5">🔍 Обери експерта серед професіоналів</span>
          <span className="flex items-center gap-1.5">✅ Отримай результат з гарантією</span>
        </div>
      </section>

      {/* Active Tasks */}
      {activeTasks.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--dash-text)]">Активні завдання</h2>
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
                </div>
                <h3 className="text-sm font-semibold text-[var(--dash-text)] line-clamp-2">{task.subject}</h3>
                <div className="flex items-center justify-between mt-3 text-xs text-[var(--dash-text-muted)]">
                  {task.deadline && <span>до {new Date(task.deadline).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}</span>}
                  {task.bids_count != null && task.bids_count > 0 && (
                    <span className="font-medium text-[var(--dash-accent)]">{task.bids_count} відгуків</span>
                  )}
                </div>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Popular Services — like Author24 */}
      <section>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--dash-text)]">Популярні послуги</h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {POPULAR_SERVICES.slice(0, 8).map(s => (
            <div key={s.name} className="bg-white rounded-2xl border border-[var(--dash-border)] p-4 hover:shadow-md transition-all flex flex-col">
              <div className="w-12 h-12 rounded-xl mb-3 flex items-center justify-center" style={{ background: s.color }}>
                <div className="w-6 h-6 rounded" style={{ background: s.accent, opacity: 0.7 }} />
              </div>
              <h3 className="text-sm font-semibold text-[var(--dash-text)] mb-1">{s.name}</h3>
              <p className="text-xs text-[var(--dash-text-muted)] mb-3">від {s.price} ₴</p>
              <Link href={`/dashboard/orders/new?type=${encodeURIComponent(s.name)}`}
                className="mt-auto inline-flex items-center justify-center px-3 py-2 rounded-lg bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] text-white text-xs font-semibold transition-colors">
                Створити завдання
              </Link>
            </div>
          ))}
        </div>
      </section>

      {/* Recommended Experts — Author24-style */}
      {experts.length > 0 && (
        <section>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-[var(--dash-text)]">Рекомендовані експерти</h2>
            <Link href="/dashboard/experts" className="text-sm text-[var(--dash-accent)] hover:underline font-medium">Усі експерти →</Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {experts.slice(0, 6).map(e => (
              <ExpertCard
                key={e.id}
                expert={e}
                onProfile={() => router.push(`/dashboard/experts?id=${e.id}`)}
                onSelect={() => router.push(`/dashboard/experts?id=${e.id}`)}
                actionLabel="Запросити в завдання"
              />
            ))}
          </div>
        </section>
      )}

      {/* No Tasks CTA */}
      {myTasks.length === 0 && (
        <section className="bg-white rounded-2xl border border-[var(--dash-border)] p-10 text-center">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-[var(--dash-text)] mb-2">Ще немає завдань</h2>
          <p className="text-sm text-[var(--dash-text-muted)] mb-5 max-w-md mx-auto">Створіть перше завдання — отримайте відгуки від експертів за 5 хвилин</p>
          <Link href="/dashboard/orders/new" className="inline-flex items-center gap-2 px-6 py-3 rounded-lg bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] text-white font-semibold transition-colors">
            Створити завдання
          </Link>
        </section>
      )}
    </div>
  );
}
