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
  executor_name: string | null;
  bids_count?: number;
  more?: string;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active: { label: 'Опубліковано', cls: 'dash-badge-active' },
  published: { label: 'Опубліковано', cls: 'dash-badge-active' },
  in_progress: { label: 'В роботі', cls: 'dash-badge-progress' },
  review: { label: 'На перевірці', cls: 'dash-badge-review' },
  completed: { label: 'Завершено', cls: 'dash-badge-completed' },
  expired: { label: 'Прострочено', cls: 'dash-badge-expired' },
};

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
        <div className="p-4 space-y-3">
          {children}
        </div>
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
            <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
            </svg>
            {new Date(task.deadline).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
          </span>
        )}
        {task.bids_count !== undefined && (
          <span>{task.bids_count} заявок</span>
        )}
      </div>
    </Link>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const { role } = useRole();
  const isExecutorView = role === 'executor';
  const [myTasks, setMyTasks] = useState<Task[]>([]);
  const [availableTasks, setAvailableTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const promises: Promise<void>[] = [
      fetchAuth<Task[]>('/tasks/my_tasks/').then(setMyTasks).catch(e => setError(e.message)),
    ];
    if (isExecutorView) {
      promises.push(
        fetchAuth<Task[]>('/tasks/available_tasks/').then(setAvailableTasks).catch(() => {})
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

  if (error) {
    return <div className="dash-card p-5 border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>;
  }

  const counts: Record<string, number> = {};
  for (const t of myTasks) counts[t.status] = (counts[t.status] || 0) + 1;

  if (isExecutorView) {
    const newOrders = availableTasks.filter(t => (t.bids_count ?? 0) === 0);
    const fewBids = availableTasks.filter(t => (t.bids_count ?? 0) > 0 && (t.bids_count ?? 0) < 3);
    const moreBids = availableTasks.filter(t => (t.bids_count ?? 0) >= 3);

    return (
      <div className="animate-slide-up">
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Profile sidebar */}
          <div className="dash-profile-sidebar hidden lg:block">
            <div className="profile-card">
              {user?.avatar ? (
                <img src={user.avatar} alt="" className="w-20 h-20 rounded-full object-cover mx-auto mb-3" />
              ) : (
                <div className="w-20 h-20 rounded-full bg-[var(--dash-accent)] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                  {(user?.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
              <h3 className="font-bold text-[var(--dash-text)] text-base">{user?.name}</h3>
              <p className="text-xs text-[var(--dash-text-muted)] mt-0.5">Виконавець</p>

              <div className="mt-4 space-y-2.5 text-left">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--dash-text-muted)]">Виконано</span>
                  <span className="font-semibold text-[var(--dash-text)]">{counts['completed'] || 0}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span className="text-[var(--dash-text-muted)]">В роботі</span>
                  <span className="font-semibold text-[var(--dash-text)]">{counts['in_progress'] || 0}</span>
                </div>
                {user?.balance && Number(user.balance) > 0 && (
                  <div className="flex items-center justify-between text-sm pt-2 border-t border-[var(--dash-border)]">
                    <span className="text-[var(--dash-text-muted)]">Баланс</span>
                    <span className="font-semibold text-[var(--dash-success)]">{user.balance} ₴</span>
                  </div>
                )}
              </div>

              <Link href="/dashboard/profile" className="mt-4 block text-center text-xs text-[var(--dash-accent)] hover:underline">
                Редагувати профіль
              </Link>
            </div>
          </div>

          {/* Orders feed */}
          <div className="flex-1 space-y-4">
            <div className="flex items-center justify-between">
              <h1 className="text-xl font-bold text-[var(--dash-text)]">Замовлення для вас</h1>
              <Link href="/dashboard/available" className="text-sm text-[var(--dash-accent)] hover:underline font-medium">
                Уся біржа →
              </Link>
            </div>

            {availableTasks.length === 0 ? (
              <div className="dash-card p-10 text-center">
                <p className="text-[var(--dash-text-muted)]">Немає доступних замовлень</p>
              </div>
            ) : (
              <>
                {newOrders.length > 0 && (
                  <Accordion title="Нові замовлення" count={newOrders.length} defaultOpen>
                    {newOrders.map(t => <OrderCard key={t.id} task={t} />)}
                  </Accordion>
                )}
                {fewBids.length > 0 && (
                  <Accordion title="Менше 3 заявок" count={fewBids.length} defaultOpen>
                    {fewBids.map(t => <OrderCard key={t.id} task={t} />)}
                  </Accordion>
                )}
                {moreBids.length > 0 && (
                  <Accordion title="3+ заявок" count={moreBids.length}>
                    {moreBids.map(t => <OrderCard key={t.id} task={t} />)}
                  </Accordion>
                )}
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  /* === CUSTOMER VIEW === */
  const statCards = [
    { label: 'Усього', value: myTasks.length, color: 'bg-[var(--dash-accent-bg)]', textColor: 'text-[var(--dash-accent)]' },
    { label: 'Активні', value: (counts['active'] || 0) + (counts['published'] || 0), color: 'bg-emerald-50', textColor: 'text-emerald-600' },
    { label: 'В роботі', value: counts['in_progress'] || 0, color: 'bg-violet-50', textColor: 'text-violet-600' },
    { label: 'На перевірці', value: counts['review'] || 0, color: 'bg-amber-50', textColor: 'text-amber-600' },
    { label: 'Завершені', value: counts['completed'] || 0, color: 'bg-slate-100', textColor: 'text-slate-600' },
  ];
  const recentOrders = myTasks.slice(0, 5);

  return (
    <div className="space-y-8 animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dash-text)]">
            Вітаємо, {user?.name || 'Користувач'}!
          </h1>
          <p className="text-[var(--dash-text-muted)] mt-1 text-sm">
            Панель замовника — створюйте замовлення та отримуйте результат
          </p>
        </div>
        <Link href="/dashboard/orders/new" className="dash-btn-primary">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          Нове замовлення
        </Link>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map(card => (
          <div key={card.label} className="dash-stat-card">
            <div className={`w-11 h-11 rounded-xl ${card.color} flex items-center justify-center shrink-0`}>
              <span className={`text-lg font-bold ${card.textColor}`}>{card.value}</span>
            </div>
            <div>
              <p className="text-xs text-[var(--dash-text-muted)]">{card.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-bold text-[var(--dash-text)]">Останні замовлення</h2>
          <Link href="/dashboard/orders" className="text-sm text-[var(--dash-accent)] hover:underline font-medium">
            Показати всі →
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <div className="dash-card p-10 text-center">
            <p className="text-[var(--dash-text-muted)] text-sm mb-3">Замовлень поки немає</p>
            <Link href="/dashboard/orders/new" className="dash-btn-primary text-sm">
              Створити перше замовлення
            </Link>
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
                {recentOrders.map(task => {
                  const st = STATUS_MAP[task.status] || { label: task.status, cls: 'dash-badge-completed' };
                  return (
                    <tr key={task.id} className="cursor-pointer" onClick={() => window.location.href = `/dashboard/orders/${task.id}`}>
                      <td>
                        <Link href={`/dashboard/orders/${task.id}`} className="font-medium text-[var(--dash-text)] hover:text-[var(--dash-accent)] transition-colors">
                          {task.subject || `Замовлення #${task.id}`}
                        </Link>
                      </td>
                      <td className="hidden sm:table-cell text-[var(--dash-text-muted)] text-sm">
                        {task.deadline ? new Date(task.deadline).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' }) : '—'}
                      </td>
                      <td className="hidden md:table-cell text-sm text-[var(--dash-text-muted)]">
                        {task.executor_name || '—'}
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
    </div>
  );
}
