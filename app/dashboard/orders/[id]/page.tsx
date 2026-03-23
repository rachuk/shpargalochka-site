'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { fetchAuth } from '@/lib/auth';
import { useAuth } from '@/providers/AuthProvider';
import { Chat } from '@/components/chat/Chat';

interface TaskFile { id: number; file: string; name: string; }

interface Task {
  id: number;
  subject: string;
  more: string;
  status: string;
  deadline: string | null;
  price: string | null;
  price_one: string | null;
  work_type?: string;
  files: TaskFile[];
  executor_name: string | null;
  executor_id: number | null;
  client_name: string | null;
  client_id: number | null;
  date_add: string;
}

interface Bid {
  id: number;
  executor_id: number;
  client_name: string;
  price_one: string | number | null;
  question: string;
  date_add: string;
  executor_rating?: number;
  executor_reviews_count?: number;
  executor_avatar?: string | null;
}

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  active: { label: 'Опубліковано', cls: 'dash-badge-active' },
  published: { label: 'Опубліковано', cls: 'dash-badge-active' },
  in_progress: { label: 'В роботі', cls: 'dash-badge-progress' },
  review: { label: 'На перевірці', cls: 'dash-badge-review' },
  completed: { label: 'Завершено', cls: 'dash-badge-completed' },
  expired: { label: 'Прострочено', cls: 'dash-badge-expired' },
};

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');

  useEffect(() => {
    setLoading(true);
    fetchAuth<Task>(`/tasks/${id}/`)
      .then(t => {
        setTask(t);
        if (t.status === 'active' || t.status === 'published') {
          return fetchAuth<Bid[]>(`/feedbacks/?task_id=${id}`).then(setBids).catch(() => {});
        }
      })
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, [id]);

  async function handleAction(endpoint: string) {
    setActionLoading(true);
    try {
      await fetchAuth(`/tasks/${id}/${endpoint}/`, { method: 'POST' });
      const updated = await fetchAuth<Task>(`/tasks/${id}/`);
      setTask(updated);
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Помилка');
    } finally {
      setActionLoading(false);
    }
  }

  async function handleAcceptBid(bidId: number) {
    setActionLoading(true);
    setError('');
    try {
      await fetchAuth(`/feedbacks/${bidId}/accept/`, { method: 'POST' });
      const updated = await fetchAuth<Task>(`/tasks/${id}/`);
      setTask(updated);
    } catch (e: any) {
      if (e.message?.includes('402') || e.message?.includes('Недостатньо')) {
        try {
          const payRes = await fetchAuth<{ payment_url: string; amount: number }>(`/feedbacks/${bidId}/payment/`, { method: 'POST' });
          setPaymentUrl(payRes.payment_url);
        } catch (pe: any) {
          setError(pe.message || 'Помилка оплати');
        }
      } else {
        setError(e.message || 'Помилка');
      }
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="space-y-4 animate-slide-up">
        <div className="dash-card p-5 border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        <Link href="/dashboard/orders" className="text-sm text-[var(--dash-accent)] hover:underline">← Назад до замовлень</Link>
      </div>
    );
  }

  if (!task) return null;

  const isTaskCustomer = task.client_id === user?.id;
  const isTaskExecutor = task.executor_id === user?.id;
  const st = STATUS_MAP[task.status] || { label: task.status, cls: 'dash-badge-completed' };
  const showChat = task.executor_name && (task.status === 'in_progress' || task.status === 'review');

  return (
    <div className="animate-slide-up">
      <div className="flex items-center gap-2 text-sm text-[var(--dash-text-muted)] mb-6">
        <Link href="/dashboard/orders" className="hover:text-[var(--dash-accent)] transition-colors">Мої замовлення</Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-[var(--dash-text)] font-medium">#{task.id}</span>
      </div>

      {error && <div className="dash-card p-4 border-red-200 bg-red-50 text-red-700 text-sm mb-6">{error}</div>}

      <div className={`grid gap-6 ${showChat ? 'lg:grid-cols-[1fr,400px]' : ''}`}>
        <div className="space-y-6">
          <div className="dash-card p-6">
            <div className="flex items-start justify-between gap-4 mb-5">
              <div className="min-w-0">
                <h1 className="text-xl font-bold text-[var(--dash-text)] mb-1">{task.subject}</h1>
                <p className="text-sm text-[var(--dash-text-muted)]">
                  Створено {new Date(task.date_add).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
                </p>
              </div>
              <span className={`dash-badge ${st.cls} shrink-0`}>{st.label}</span>
            </div>

            {task.more && (
              <div className="mb-5 p-4 rounded-xl bg-[var(--dash-accent-bg)]/50 border border-[var(--dash-border)]">
                <p className="text-sm text-[var(--dash-text)] whitespace-pre-wrap leading-relaxed">{task.more}</p>
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
              {task.deadline && (
                <div className="p-3 rounded-xl bg-[var(--dash-accent-bg)]/40">
                  <p className="text-[11px] font-medium text-[var(--dash-text-muted)] uppercase tracking-wide mb-1">Дедлайн</p>
                  <p className="text-sm font-semibold text-[var(--dash-text)]">
                    {new Date(task.deadline).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })}
                  </p>
                </div>
              )}
              {task.price && (
                <div className="p-3 rounded-xl bg-[var(--dash-accent-bg)]/40">
                  <p className="text-[11px] font-medium text-[var(--dash-text-muted)] uppercase tracking-wide mb-1">Бюджет</p>
                  <p className="text-sm font-semibold text-[var(--dash-text)]">{task.price} ₴</p>
                </div>
              )}
              {task.work_type && (
                <div className="p-3 rounded-xl bg-[var(--dash-accent-bg)]/40">
                  <p className="text-[11px] font-medium text-[var(--dash-text-muted)] uppercase tracking-wide mb-1">Тип роботи</p>
                  <p className="text-sm font-semibold text-[var(--dash-text)]">{task.work_type}</p>
                </div>
              )}
              {task.executor_name && (
                <div className="p-3 rounded-xl bg-[var(--dash-accent-bg)]/40">
                  <p className="text-[11px] font-medium text-[var(--dash-text-muted)] uppercase tracking-wide mb-1">Виконавець</p>
                  <p className="text-sm font-semibold text-[var(--dash-text)]">{task.executor_name}</p>
                </div>
              )}
            </div>

            {task.files && task.files.length > 0 && (
              <div className="mt-5 pt-5 border-t border-[var(--dash-border)]">
                <p className="text-[11px] font-medium text-[var(--dash-text-muted)] uppercase tracking-wide mb-3">
                  Прикріплені файли ({task.files.length})
                </p>
                <div className="flex flex-wrap gap-2">
                  {task.files.map(f => (
                    <a key={f.id} href={f.file} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-lg bg-white border border-[var(--dash-border)] px-3.5 py-2 text-sm text-[var(--dash-text)] hover:border-[var(--dash-accent-light)] hover:text-[var(--dash-accent)] transition-colors">
                      <svg className="w-4 h-4 text-[var(--dash-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                        <path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" />
                      </svg>
                      {f.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {isTaskCustomer && task.status === 'review' && (
            <div className="dash-card p-5">
              <p className="text-sm font-medium text-[var(--dash-text)] mb-3">Робота здана на перевірку</p>
              <div className="flex flex-wrap gap-3">
                <button onClick={() => handleAction('accept_task')} disabled={actionLoading}
                  className="dash-btn-primary bg-[var(--dash-success)] hover:bg-emerald-600">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                  </svg>
                  Прийняти роботу
                </button>
                <button onClick={() => handleAction('revision_task')} disabled={actionLoading}
                  className="dash-btn-secondary text-amber-700 border-amber-200 hover:bg-amber-50">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                  </svg>
                  На доопрацювання
                </button>
              </div>
            </div>
          )}

          {isTaskExecutor && task.status === 'in_progress' && (
            <div className="dash-card p-5">
              <button onClick={() => handleAction('finish_task')} disabled={actionLoading} className="dash-btn-primary">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Здати роботу
              </button>
            </div>
          )}

          {(task.status === 'active' || task.status === 'published') && (
            <div className="dash-card overflow-hidden">
              <div className="px-6 py-4 border-b border-[var(--dash-border)] flex items-center justify-between">
                <h2 className="font-bold text-[var(--dash-text)]">
                  Заявки від виконавців
                  {bids.length > 0 && <span className="ml-2 text-sm font-normal text-[var(--dash-text-muted)]">({bids.length})</span>}
                </h2>
              </div>
              {bids.length === 0 ? (
                <div className="p-8 text-center">
                  <p className="text-[var(--dash-text-muted)] text-sm">Заявок поки немає. Виконавці побачать ваше замовлення на біржі.</p>
                </div>
              ) : (
                <div className="divide-y divide-[var(--dash-border)]">
                  {bids.map(bid => (
                    <div key={bid.id} className="p-5 hover:bg-[var(--dash-accent-bg)]/30 transition-colors">
                      <div className="flex items-start gap-3">
                        {bid.executor_avatar ? (
                          <img src={bid.executor_avatar} alt="" className="w-10 h-10 rounded-full object-cover shrink-0" />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-[var(--dash-accent-bg)] flex items-center justify-center text-[var(--dash-accent)] font-semibold text-sm shrink-0">
                            {(bid.client_name || '?')[0]}
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between gap-2">
                            <div>
                              <p className="text-sm font-semibold text-[var(--dash-text)]">{bid.client_name}</p>
                              {bid.executor_rating && bid.executor_rating > 0 && (
                                <div className="flex items-center gap-1 mt-0.5">
                                  <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20">
                                    <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                                  </svg>
                                  <span className="text-xs text-[var(--dash-text-muted)]">
                                    {bid.executor_rating.toFixed(1)}
                                    {bid.executor_reviews_count ? ` (${bid.executor_reviews_count})` : ''}
                                  </span>
                                </div>
                              )}
                            </div>
                            {bid.price_one && (
                              <span className="text-lg font-bold text-[var(--dash-success)]">{bid.price_one} ₴</span>
                            )}
                          </div>
                          {bid.question && (
                            <p className="text-sm text-[var(--dash-text-muted)] mt-2 leading-relaxed">{bid.question}</p>
                          )}
                          <div className="flex items-center justify-between mt-3">
                            <p className="text-xs text-[var(--dash-text-muted)] opacity-60">
                              {new Date(bid.date_add).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            </p>
                            {isTaskCustomer && (
                              <button onClick={() => handleAcceptBid(bid.id)} disabled={actionLoading}
                                className="dash-btn-primary text-xs py-2 px-4">
                                Обрати виконавця
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {showChat && (
          <div className="lg:sticky lg:top-0 lg:self-start">
            <Chat taskId={Number(id)} className="h-[calc(100vh-120px)] lg:h-[calc(100vh-80px)]" />
          </div>
        )}
      </div>

      {paymentUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPaymentUrl('')}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="w-14 h-14 rounded-2xl bg-amber-50 flex items-center justify-center mx-auto">
              <svg className="w-7 h-7 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 8.25h19.5M2.25 9h19.5m-16.5 5.25h6m-6 2.25h3m-3.75 3h15a2.25 2.25 0 002.25-2.25V6.75A2.25 2.25 0 0019.5 4.5h-15a2.25 2.25 0 00-2.25 2.25v10.5A2.25 2.25 0 004.5 19.5z" />
              </svg>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-[var(--dash-text)]">Оплата замовлення</h3>
              <p className="text-sm text-[var(--dash-text-muted)] mt-1">Для підтвердження потрібно поповнити баланс</p>
            </div>
            <a href={paymentUrl} target="_blank" rel="noopener noreferrer"
              className="dash-btn-primary w-full justify-center bg-[var(--dash-success)] hover:bg-emerald-600 py-3">
              Оплатити через LiqPay
            </a>
            <button onClick={() => setPaymentUrl('')}
              className="w-full text-center text-[var(--dash-text-muted)] text-sm hover:text-[var(--dash-text)] transition-colors">
              Скасувати
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
