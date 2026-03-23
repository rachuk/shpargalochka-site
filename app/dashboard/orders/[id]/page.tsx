'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAuth } from '@/lib/auth';
import { useAuth } from '@/providers/AuthProvider';
import { Chat } from '@/components/chat/Chat';
import TaskStatusBadge from '@/components/dashboard/TaskStatusBadge';
import BidCard, { type BidData } from '@/components/dashboard/BidCard';
import SlideOver from '@/components/dashboard/SlideOver';

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
  completed_tasks?: number;
}

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const router = useRouter();
  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);
  const [paymentUrl, setPaymentUrl] = useState('');
  const [chatBid, setChatBid] = useState<Bid | null>(null);
  const [detailsOpen, setDetailsOpen] = useState(false);

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

  async function handleAcceptBid(bid: BidData) {
    setActionLoading(true);
    setError('');
    try {
      await fetchAuth(`/feedbacks/${bid.id}/accept/`, { method: 'POST' });
      const updated = await fetchAuth<Task>(`/tasks/${id}/`);
      setTask(updated);
    } catch (e: any) {
      if (e.message?.includes('402') || e.message?.includes('Недостатньо')) {
        try {
          const payRes = await fetchAuth<{ payment_url: string }>(`/feedbacks/${bid.id}/payment/`, { method: 'POST' });
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
        <div className="rounded-2xl p-5 border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>
        <Link href="/dashboard/orders" className="text-sm text-[var(--dash-accent)] hover:underline">← Назад</Link>
      </div>
    );
  }

  if (!task) return null;

  const isTaskCustomer = task.client_id === user?.id;
  const isTaskExecutor = task.executor_id === user?.id;
  const showChat = task.executor_name && (task.status === 'in_progress' || task.status === 'review');
  const isSelecting = task.status === 'active' || task.status === 'published';

  const bidCards: BidData[] = bids.map(b => ({
    id: b.id,
    executor_name: b.client_name,
    executor_rating: b.executor_rating || null,
    executor_reviews_count: b.executor_reviews_count,
    executor_avatar: b.executor_avatar,
    price_one: typeof b.price_one === 'string' ? Number(b.price_one) : b.price_one,
    question: b.question,
    date_add: b.date_add,
    completed_tasks: b.completed_tasks,
  }));

  return (
    <div className="animate-slide-up">
      {/* Header */}
      <div className="flex items-center gap-2 text-sm text-[var(--dash-text-muted)] mb-5">
        <Link href="/dashboard/orders" className="hover:text-[var(--dash-accent)] transition-colors">Мої завдання</Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" /></svg>
        <span className="text-[var(--dash-text)] font-medium">#{task.id}</span>
      </div>

      {error && <div className="rounded-2xl p-4 border border-red-200 bg-red-50 text-red-700 text-sm mb-5">{error}</div>}

      {/* Task header card */}
      <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-5 mb-5">
        <div className="flex items-start justify-between gap-4 mb-3">
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2 mb-2">
              <TaskStatusBadge status={task.status} />
              {task.work_type && <span className="text-xs text-[var(--dash-text-muted)]">{task.work_type}</span>}
            </div>
            <h1 className="text-lg font-bold text-[var(--dash-text)]">{task.subject}</h1>
          </div>
          <button onClick={() => setDetailsOpen(!detailsOpen)}
            className="text-sm text-[var(--dash-accent)] font-medium shrink-0">
            {detailsOpen ? 'Сховати' : 'Деталі'}
          </button>
        </div>

        {/* Quick info row */}
        <div className="flex flex-wrap items-center gap-4 text-sm text-[var(--dash-text-muted)]">
          {task.deadline && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" /></svg>
              до {new Date(task.deadline).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
            </span>
          )}
          {task.price && (
            <span className="font-semibold text-[var(--dash-text)]">{task.price} ₴</span>
          )}
          {task.executor_name && (
            <span className="flex items-center gap-1.5">
              <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 6a3.75 3.75 0 11-7.5 0 3.75 3.75 0 017.5 0zM4.501 20.118a7.5 7.5 0 0114.998 0" /></svg>
              {task.executor_name}
            </span>
          )}
        </div>

        {/* Collapsible details */}
        {detailsOpen && (
          <div className="mt-4 pt-4 border-t border-[var(--dash-border)] space-y-4 animate-slide-up">
            {task.more && (
              <div className="rounded-xl bg-gray-50 p-4">
                <p className="text-sm text-[var(--dash-text)] whitespace-pre-wrap leading-relaxed">{task.more}</p>
              </div>
            )}
            {task.files && task.files.length > 0 && (
              <div>
                <p className="text-xs font-medium text-[var(--dash-text-muted)] uppercase mb-2">Файли ({task.files.length})</p>
                <div className="flex flex-wrap gap-2">
                  {task.files.map(f => (
                    <a key={f.id} href={f.file} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 rounded-lg bg-white border border-[var(--dash-border)] px-3 py-1.5 text-sm text-[var(--dash-text)] hover:border-[var(--dash-accent-light)] transition-colors">
                      📄 {f.name}
                    </a>
                  ))}
                </div>
              </div>
            )}
            <p className="text-xs text-[var(--dash-text-muted)]">
              Створено {new Date(task.date_add).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
            </p>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {isTaskCustomer && task.status === 'review' && (
        <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-5 mb-5">
          <p className="text-sm font-medium text-[var(--dash-text)] mb-3">Робота здана на перевірку</p>
          <div className="flex flex-wrap gap-3">
            <button onClick={() => handleAction('accept_task')} disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl bg-[var(--dash-success)] hover:bg-emerald-600 text-white font-semibold text-sm transition-colors">
              Прийняти роботу
            </button>
            <button onClick={() => handleAction('revision_task')} disabled={actionLoading}
              className="px-5 py-2.5 rounded-xl border border-amber-200 text-amber-700 hover:bg-amber-50 font-semibold text-sm transition-colors">
              На доопрацювання
            </button>
          </div>
        </div>
      )}

      {isTaskExecutor && task.status === 'in_progress' && (
        <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-5 mb-5">
          <button onClick={() => handleAction('finish_task')} disabled={actionLoading}
            className="px-5 py-2.5 rounded-xl bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] text-white font-semibold text-sm transition-colors">
            Здати роботу
          </button>
        </div>
      )}

      <div className={`grid gap-6 ${showChat ? 'lg:grid-cols-[1fr,400px]' : ''}`}>
        <div className="space-y-5">
          {/* Bids section */}
          {isSelecting && (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-base font-bold text-[var(--dash-text)]">
                  Обери експерта
                  {bids.length > 0 && <span className="ml-2 text-sm font-normal text-[var(--dash-text-muted)]">({bids.length} відгуків)</span>}
                </h2>
              </div>

              {bids.length === 0 ? (
                <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-10 text-center">
                  <div className="text-4xl mb-3">⏳</div>
                  <h3 className="font-bold text-[var(--dash-text)] mb-1">Очікуємо відгуків</h3>
                  <p className="text-sm text-[var(--dash-text-muted)]">Експерти побачать ваше завдання на біржі та запропонують ціну</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {bidCards.map(bid => (
                    <BidCard
                      key={bid.id}
                      bid={bid}
                      onAccept={isTaskCustomer ? () => handleAcceptBid(bid) : undefined}
                      onChat={() => setChatBid(bids.find(b => b.id === bid.id) || null)}
                    />
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Chat sidebar for in-progress tasks */}
        {showChat && (
          <div className="lg:sticky lg:top-20 lg:self-start">
            <Chat taskId={Number(id)} className="h-[calc(100vh-120px)] lg:h-[calc(100vh-100px)]" />
          </div>
        )}
      </div>

      {/* Chat SlideOver for bids */}
      <SlideOver
        open={!!chatBid}
        onClose={() => setChatBid(null)}
        title={chatBid ? `Чат з ${chatBid.client_name}` : ''}
      >
        {chatBid && (
          <div className="p-4">
            <div className="flex items-center gap-3 mb-4 p-3 bg-[var(--dash-accent-bg)] rounded-xl">
              <div className="flex-1">
                <p className="text-sm font-semibold text-[var(--dash-text)]">{chatBid.client_name}</p>
                {chatBid.price_one && (
                  <p className="text-xs text-[var(--dash-accent)] font-medium">{chatBid.price_one} ₴</p>
                )}
              </div>
              {isTaskCustomer && (
                <button
                  onClick={() => { handleAcceptBid(bidCards.find(b => b.id === chatBid.id) || chatBid as unknown as BidData); setChatBid(null); }}
                  disabled={actionLoading}
                  className="px-4 py-2 rounded-xl bg-[var(--dash-accent)] text-white text-xs font-semibold">
                  Обрати
                </button>
              )}
            </div>
            <Chat taskId={Number(id)} className="h-[60vh]" />
          </div>
        )}
      </SlideOver>

      {/* Payment modal */}
      {paymentUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4" onClick={() => setPaymentUrl('')}>
          <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-7 space-y-5" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="text-4xl mb-3">💳</div>
              <h3 className="text-lg font-bold text-[var(--dash-text)]">Оплата замовлення</h3>
              <p className="text-sm text-[var(--dash-text-muted)] mt-1">Для підтвердження потрібно поповнити баланс</p>
            </div>
            <a href={paymentUrl} target="_blank" rel="noopener noreferrer"
              className="block w-full text-center py-3 rounded-xl bg-[var(--dash-success)] hover:bg-emerald-600 text-white font-semibold transition-colors">
              Оплатити через LiqPay
            </a>
            <button onClick={() => setPaymentUrl('')}
              className="w-full text-center text-sm text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]">
              Скасувати
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
