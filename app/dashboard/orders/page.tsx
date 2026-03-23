'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAuth } from '@/lib/auth';
import { useRole } from '../layout';

interface Task {
  id: number;
  subject: string;
  status: string;
  deadline: string | null;
  price: string | null;
  executor_name: string | null;
  date_add: string;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active: { label: 'Опубліковано', cls: 'dash-badge-active' },
  published: { label: 'Опубліковано', cls: 'dash-badge-active' },
  in_progress: { label: 'В роботі', cls: 'dash-badge-progress' },
  review: { label: 'На перевірці', cls: 'dash-badge-review' },
  completed: { label: 'Завершено', cls: 'dash-badge-completed' },
  expired: { label: 'Прострочено', cls: 'dash-badge-expired' },
};

type Tab = 'active' | 'completed' | 'all';
const TABS: { key: Tab; label: string }[] = [
  { key: 'active', label: 'Активні' },
  { key: 'completed', label: 'Завершені' },
  { key: 'all', label: 'Усі' },
];
const ACTIVE_STATUSES = new Set(['active', 'published', 'in_progress', 'review']);

export default function OrdersPage() {
  const { role } = useRole();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('active');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAuth<Task[]>('/tasks/my_tasks/')
      .then(setTasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tasks
    .filter(t => {
      if (tab === 'active') return ACTIVE_STATUSES.has(t.status);
      if (tab === 'completed') return t.status === 'completed' || t.status === 'expired';
      return true;
    })
    .filter(t => !search || t.subject?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-2xl font-bold text-[var(--dash-text)]">Мої замовлення</h1>
        {role !== 'executor' && (
          <Link href="/dashboard/orders/new" className="dash-btn-primary">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
            </svg>
            Нове замовлення
          </Link>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-3 sm:items-center">
        <div className="flex gap-1 bg-[var(--dash-accent-bg)] rounded-xl p-1">
          {TABS.map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${
                tab === t.key
                  ? 'bg-white text-[var(--dash-text)] shadow-sm'
                  : 'text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]'
              }`}>
              {t.label}
              {t.key === 'active' && (
                <span className="ml-1.5 text-xs opacity-60">
                  {tasks.filter(tt => ACTIVE_STATUSES.has(tt.status)).length}
                </span>
              )}
            </button>
          ))}
        </div>
        <div className="relative sm:ml-auto">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="Пошук..." value={search} onChange={e => setSearch(e.target.value)}
            className="dash-input pl-9 w-full sm:w-64" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="w-8 h-8 border-3 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
        </div>
      ) : error ? (
        <div className="dash-card p-5 border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
      ) : filtered.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <p className="text-[var(--dash-text-muted)] mb-1">Замовлень не знайдено</p>
          <p className="text-[var(--dash-text-muted)] text-sm opacity-60">
            {tab === 'active' ? 'Немає активних замовлень' : 'Спробуйте змінити фільтр'}
          </p>
        </div>
      ) : (
        <div className="dash-card overflow-hidden">
          <table className="dash-table">
            <thead>
              <tr>
                <th>Замовлення</th>
                <th className="hidden sm:table-cell">Дедлайн</th>
                <th className="hidden md:table-cell">Виконавець</th>
                <th>Бюджет</th>
                <th>Статус</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(task => {
                const st = STATUS_MAP[task.status] || { label: task.status, cls: 'dash-badge-completed' };
                return (
                  <tr key={task.id} className="cursor-pointer" onClick={() => window.location.href = `/dashboard/orders/${task.id}`}>
                    <td>
                      <div>
                        <Link href={`/dashboard/orders/${task.id}`} className="font-medium text-[var(--dash-text)] hover:text-[var(--dash-accent)] transition-colors">
                          {task.subject || `Замовлення #${task.id}`}
                        </Link>
                        <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">
                          #{task.id} · {new Date(task.date_add).toLocaleDateString('uk-UA')}
                        </p>
                      </div>
                    </td>
                    <td className="hidden sm:table-cell text-sm text-[var(--dash-text-muted)]">
                      {task.deadline ? new Date(task.deadline).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }) : '—'}
                    </td>
                    <td className="hidden md:table-cell text-sm text-[var(--dash-text-muted)]">
                      {task.executor_name || <span className="opacity-40">Не обрано</span>}
                    </td>
                    <td className="font-semibold text-sm">{task.price ? `${task.price} ₴` : '—'}</td>
                    <td><span className={`dash-badge ${st.cls}`}>{st.label}</span></td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
