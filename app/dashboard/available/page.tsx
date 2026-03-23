'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchAuth } from '@/lib/auth';

interface Task {
  id: number;
  subject: string;
  more: string;
  deadline: string;
  price: string | number;
  date_add: string;
  bids_count?: number;
}

export default function AvailableOrdersPage() {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');

  const [modalTask, setModalTask] = useState<Task | null>(null);
  const [bidMessage, setBidMessage] = useState('');
  const [bidPrice, setBidPrice] = useState('');
  const [bidSubmitting, setBidSubmitting] = useState(false);
  const [toast, setToast] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchAuth<Task[]>('/tasks/available_tasks/')
      .then(setTasks)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(null), 3500);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(
    () => search ? tasks.filter(t => t.subject.toLowerCase().includes(search.toLowerCase())) : tasks,
    [tasks, search],
  );

  async function submitBid() {
    if (!modalTask) return;
    setBidSubmitting(true);
    try {
      await fetchAuth('/feedbacks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ task: modalTask.id, question: bidMessage, price_one: Number(bidPrice) }),
      });
      setModalTask(null);
      setBidMessage('');
      setBidPrice('');
      setToast({ text: 'Заявку успішно подано!', type: 'success' });
    } catch (e: unknown) {
      setToast({ text: e instanceof Error ? e.message : 'Помилка при поданні заявки', type: 'error' });
    } finally {
      setBidSubmitting(false);
    }
  }

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

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dash-text)]">Біржа замовлень</h1>
          <p className="text-sm text-[var(--dash-text-muted)] mt-1">
            {tasks.length} {tasks.length === 1 ? 'замовлення доступне' : 'замовлень доступно'}
          </p>
        </div>
        <div className="relative">
          <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          <input type="text" placeholder="Пошук за предметом..." value={search} onChange={e => setSearch(e.target.value)}
            className="dash-input pl-9 w-full sm:w-72" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <p className="text-[var(--dash-text-muted)]">Замовлень не знайдено</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
          {filtered.map(task => (
            <div key={task.id} className="dash-card p-5 flex flex-col gap-3 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between gap-2">
                <h3 className="font-semibold text-[var(--dash-text)] text-sm leading-snug line-clamp-2 flex-1">
                  {task.subject}
                </h3>
                {task.bids_count !== undefined && task.bids_count > 0 && (
                  <span className="text-xs text-[var(--dash-text-muted)] bg-[var(--dash-accent-bg)] rounded-full px-2 py-0.5 shrink-0">
                    {task.bids_count} заявок
                  </span>
                )}
              </div>

              {task.more && (
                <p className="text-[var(--dash-text-muted)] text-xs leading-relaxed line-clamp-3">{task.more}</p>
              )}

              <div className="flex items-center justify-between text-xs mt-auto pt-3 border-t border-[var(--dash-border)]">
                <div className="flex items-center gap-1 text-[var(--dash-text-muted)]">
                  <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 3v2.25M17.25 3v2.25M3 18.75V7.5a2.25 2.25 0 012.25-2.25h13.5A2.25 2.25 0 0121 7.5v11.25m-18 0A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75m-18 0v-7.5A2.25 2.25 0 015.25 9h13.5A2.25 2.25 0 0121 11.25v7.5" />
                  </svg>
                  {new Date(task.deadline).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' })}
                </div>
                <span className="font-bold text-[var(--dash-text)] text-base">{task.price} ₴</span>
              </div>

              <button onClick={() => { setModalTask(task); setBidPrice(String(task.price)); }}
                className="dash-btn-primary w-full justify-center text-sm py-2.5">
                Подати заявку
              </button>
            </div>
          ))}
        </div>
      )}

      {modalTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4" onClick={() => setModalTask(null)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 flex flex-col gap-5 animate-slide-up" onClick={e => e.stopPropagation()}>
            <div>
              <h2 className="text-lg font-bold text-[var(--dash-text)]">Подати заявку</h2>
              <p className="text-sm text-[var(--dash-text-muted)] mt-1 line-clamp-2">{modalTask.subject}</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">Ваше повідомлення</label>
              <textarea rows={3} value={bidMessage} onChange={e => setBidMessage(e.target.value)}
                className="dash-input resize-none" placeholder="Розкажіть, чому ви підходите для цього замовлення..." />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">Ваша ціна (₴)</label>
              <input type="number" min={0} value={bidPrice} onChange={e => setBidPrice(e.target.value)} className="dash-input" />
            </div>
            <div className="flex gap-3 mt-1">
              <button onClick={() => setModalTask(null)} className="dash-btn-secondary flex-1 justify-center">Скасувати</button>
              <button onClick={submitBid} disabled={bidSubmitting || !bidMessage.trim() || !bidPrice}
                className="dash-btn-primary flex-1 justify-center">
                {bidSubmitting ? 'Надсилання...' : 'Надіслати'}
              </button>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div className={`fixed bottom-6 right-6 z-50 rounded-xl px-5 py-3.5 text-sm font-medium shadow-lg animate-slide-up ${
          toast.type === 'success' ? 'bg-[var(--dash-success)] text-white' : 'bg-[var(--dash-danger)] text-white'
        }`}>
          {toast.text}
        </div>
      )}
    </div>
  );
}
