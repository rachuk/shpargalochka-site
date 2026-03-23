'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { fetchAuth } from '@/lib/auth';
import { useRole } from '../layout';
import TaskStatusBadge from '@/components/dashboard/TaskStatusBadge';
import QuickCreateForm from '@/components/dashboard/QuickCreateForm';

interface Task {
  id: number;
  subject: string;
  status: string;
  deadline: string | null;
  price: string | null;
  executor_name: string | null;
  date_add: string;
  bids_count?: number;
  work_type?: string;
}

type Tab = 'all' | 'selecting' | 'in_progress' | 'review' | 'completed';

const TABS: { key: Tab; label: string; match: (s: string) => boolean }[] = [
  { key: 'all', label: 'Усі завдання', match: () => true },
  { key: 'selecting', label: 'Вибір експерта', match: s => s === 'active' || s === 'published' },
  { key: 'in_progress', label: 'В роботі', match: s => s === 'in_progress' },
  { key: 'review', label: 'На перевірці', match: s => s === 'review' || s === 'guarantee' },
  { key: 'completed', label: 'Завершені', match: s => s === 'completed' || s === 'refunded' },
];

export default function OrdersPage() {
  const { role } = useRole();
  const router = useRouter();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('all');
  const [search, setSearch] = useState('');

  useEffect(() => {
    fetchAuth<Task[]>('/tasks/my_tasks/')
      .then(setTasks)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const tabCounts: Record<Tab, number> = { all: 0, selecting: 0, in_progress: 0, review: 0, completed: 0 };
  for (const t of tasks) {
    tabCounts.all++;
    for (const tb of TABS) { if (tb.key !== 'all' && tb.match(t.status)) tabCounts[tb.key]++; }
  }

  const filtered = tasks
    .filter(t => TABS.find(tb => tb.key === tab)?.match(t.status) ?? true)
    .filter(t => !search || t.subject?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl font-bold text-[var(--dash-text)]">
            {tasks.length > 0 ? `У тебе ${tasks.length} завдань` : 'Мої завдання'}
          </h1>
        </div>
        <div className="relative sm:w-64">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="Пошук..." value={search} onChange={e => setSearch(e.target.value)}
            className="dash-input pl-9 w-full" />
        </div>
      </div>

      {/* Tab filters */}
      <div className="flex gap-1 mb-5 overflow-x-auto pb-1 scrollbar-hide">
        {TABS.map(t => (
          <button key={t.key} onClick={() => setTab(t.key)}
            className={`shrink-0 px-4 py-2 text-sm font-medium rounded-xl transition-all ${
              tab === t.key
                ? 'bg-[var(--dash-accent)] text-white shadow-sm'
                : 'bg-white border border-[var(--dash-border)] text-[var(--dash-text-muted)] hover:text-[var(--dash-text)] hover:border-gray-300'
            }`}>
            {t.label}
            <span className={`ml-1.5 text-xs ${tab === t.key ? 'text-white/70' : 'opacity-50'}`}>{tabCounts[t.key]}</span>
          </button>
        ))}
      </div>

      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : error ? (
            <div className="rounded-2xl p-5 border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
          ) : filtered.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-12 text-center">
              <div className="text-5xl mb-4">📋</div>
              <h3 className="text-lg font-bold text-[var(--dash-text)] mb-2">
                {tasks.length === 0 ? 'Ще немає завдань' : 'Нічого не знайдено'}
              </h3>
              <p className="text-sm text-[var(--dash-text-muted)] mb-4">
                {tasks.length === 0 ? 'Створіть перше завдання' : 'Спробуйте змінити фільтр або пошуковий запит'}
              </p>
              {tasks.length === 0 && (
                <Link href="/dashboard/orders/new" className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[var(--dash-accent)] text-white font-semibold text-sm">
                  Створити завдання
                </Link>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {filtered.map(task => (
                <div key={task.id}
                  onClick={() => router.push(`/dashboard/orders/${task.id}`)}
                  className="bg-white rounded-2xl border border-[var(--dash-border)] p-4 hover:shadow-md hover:border-[var(--dash-accent-light)] transition-all cursor-pointer">
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1.5">
                        <TaskStatusBadge status={task.status} />
                        {task.work_type && (
                          <span className="text-[10px] text-[var(--dash-text-muted)]">{task.work_type}</span>
                        )}
                        <span className="text-[10px] text-[var(--dash-text-muted)]">#{task.id}</span>
                      </div>
                      <h3 className="text-sm font-semibold text-[var(--dash-text)] line-clamp-1 hover:text-[var(--dash-accent)] transition-colors">
                        {task.subject || `Завдання #${task.id}`}
                      </h3>
                    </div>
                    {task.price && (
                      <span className="text-base font-bold text-[var(--dash-text)] shrink-0">{task.price} ₴</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-3 text-xs text-[var(--dash-text-muted)]">
                    {task.deadline && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
                        до {new Date(task.deadline).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                      </span>
                    )}
                    {task.executor_name && (
                      <span className="flex items-center gap-1">
                        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
                        {task.executor_name}
                      </span>
                    )}
                    {task.bids_count != null && task.bids_count > 0 && (
                      <span className="text-[var(--dash-accent)] font-medium">{task.bids_count} відгуків</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Right sidebar */}
        {role !== 'executor' && (
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-20">
              <QuickCreateForm compact />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
