'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAuth } from '@/lib/auth';
import { useAuth } from '@/providers/AuthProvider';
import { useRole } from '../layout';

interface Task {
  id: number;
  subject: string;
  status: string;
  deadline: string | null;
  price: string | null;
  date_add: string;
}

const STATUS_LABELS: Record<string, string> = {
  active: 'Опубліковано',
  in_progress: 'В роботі',
  review: 'На перевірці',
  completed: 'Завершено',
  expired: 'Прострочено',
};

const STATUS_COLORS: Record<string, string> = {
  active: 'bg-green-100 text-green-700',
  in_progress: 'bg-blue-100 text-blue-700',
  review: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-gray-100 text-gray-600',
  expired: 'bg-red-100 text-red-700',
};

type Tab = 'active' | 'completed' | 'all';

const TABS: { key: Tab; label: string }[] = [
  { key: 'active', label: 'Активні' },
  { key: 'completed', label: 'Завершені' },
  { key: 'all', label: 'Усі' },
];

const ACTIVE_STATUSES = new Set(['active', 'in_progress', 'review']);

export default function OrdersPage() {
  const { user } = useAuth();
  const { role } = useRole();
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<Tab>('active');

  useEffect(() => {
    fetchAuth<Task[]>('/tasks/my_tasks/')
      .then(setTasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  const filtered = tasks.filter((t) => {
    if (tab === 'active') return ACTIVE_STATUSES.has(t.status);
    if (tab === 'completed') return t.status === 'completed' || t.status === 'expired';
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4 flex-wrap">
        <h1 className="text-2xl font-bold text-gray-900">Мої замовлення</h1>
        {role !== 'executor' && (
          <Link
            href="/dashboard/orders/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Нове замовлення
          </Link>
        )}
      </div>

      <div className="flex gap-1 bg-gray-100 rounded-lg p-1 w-fit">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`px-4 py-2 text-sm font-medium rounded-md transition-colors ${
              tab === t.key
                ? 'bg-white text-gray-900 shadow-sm'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-16">
          <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
        </div>
      ) : error ? (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      ) : filtered.length === 0 ? (
        <div className="text-center py-16">
          <p className="text-gray-500">Замовлень не знайдено.</p>
        </div>
      ) : (
        <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
          {filtered.map((task) => (
            <Link
              key={task.id}
              href={`/dashboard/orders/${task.id}`}
              className="flex items-center justify-between gap-4 px-4 py-4 hover:bg-gray-50 transition-colors"
            >
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900 truncate">{task.subject}</p>
                <div className="flex items-center gap-3 mt-1">
                  {task.deadline && (
                    <span className="text-xs text-gray-500">
                      до {new Date(task.deadline).toLocaleDateString('uk-UA')}
                    </span>
                  )}
                  {task.price && (
                    <span className="text-xs text-gray-500">{task.price} грн</span>
                  )}
                </div>
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-600'}`}>
                {STATUS_LABELS[task.status] || task.status}
              </span>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
