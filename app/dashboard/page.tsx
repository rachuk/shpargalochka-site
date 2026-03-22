'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAuth } from '@/lib/auth';
import { useAuth } from '@/providers/AuthProvider';
import { useRole } from './layout';

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
  published: 'Опубліковано',
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

export default function DashboardPage() {
  const { user } = useAuth();
  const { role } = useRole();
  const isExecutorView = role === 'executor';
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuth<Task[]>('/tasks/my_tasks/')
      .then(setTasks)
      .catch((e) => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
        {error}
      </div>
    );
  }

  const counts: Record<string, number> = {};
  for (const t of tasks) {
    counts[t.status] = (counts[t.status] || 0) + 1;
  }

  const recentOrders = tasks.slice(0, 5);

  const statCards = [
    { label: 'Усього', value: tasks.length, color: 'bg-blue-50 text-blue-700' },
    { label: 'Активні', value: counts['active'] || 0, color: 'bg-green-50 text-green-700' },
    { label: 'В роботі', value: counts['in_progress'] || 0, color: 'bg-indigo-50 text-indigo-700' },
    { label: 'На перевірці', value: counts['review'] || 0, color: 'bg-yellow-50 text-yellow-700' },
    { label: 'Завершені', value: counts['completed'] || 0, color: 'bg-gray-100 text-gray-600' },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Вітаємо, {user?.name || 'Користувач'}!
        </h1>
        <p className="text-gray-500 mt-1">
          {isExecutorView ? 'Панель виконавця' : 'Панель замовника'}
        </p>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {statCards.map((card) => (
          <div key={card.label} className={`rounded-xl p-4 ${card.color}`}>
            <p className="text-2xl font-bold">{card.value}</p>
            <p className="text-sm mt-1 opacity-80">{card.label}</p>
          </div>
        ))}
      </div>

      <div className="flex flex-wrap gap-3">
        {isExecutorView ? (
          <Link
            href="/dashboard/available"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Доступні замовлення
          </Link>
        ) : (
          <Link
            href="/dashboard/orders/new"
            className="inline-flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            Нове замовлення
          </Link>
        )}
        <Link
          href="/dashboard/orders"
          className="inline-flex items-center gap-2 border border-gray-200 hover:border-gray-300 text-gray-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
        >
          Мої замовлення
        </Link>
      </div>

      <div>
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Останні замовлення</h2>
        {recentOrders.length === 0 ? (
          <p className="text-gray-500 text-sm">Замовлень поки немає.</p>
        ) : (
          <div className="rounded-xl border border-gray-200 divide-y divide-gray-100 overflow-hidden">
            {recentOrders.map((task) => (
              <Link
                key={task.id}
                href={`/dashboard/orders/${task.id}`}
                className="flex items-center justify-between gap-4 px-4 py-3.5 hover:bg-gray-50 transition-colors"
              >
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">{task.subject}</p>
                  {task.deadline && (
                    <p className="text-xs text-gray-500 mt-0.5">
                      до {new Date(task.deadline).toLocaleDateString('uk-UA')}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-3 shrink-0">
                  {task.price && (
                    <span className="text-sm font-medium text-gray-700">{task.price} грн</span>
                  )}
                  <span className={`text-xs px-2.5 py-1 rounded-full font-medium ${STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-600'}`}>
                    {STATUS_LABELS[task.status] || task.status}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
