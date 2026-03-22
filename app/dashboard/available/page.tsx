'use client';

import { useEffect, useState, useMemo } from 'react';
import { fetchAuth } from '@/lib/auth';

interface Task {
  id: number;
  subject: string;
  more: string;
  deadline: string;
  price: string | number;
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
  const [toast, setToast] = useState('');

  useEffect(() => {
    fetchAuth<Task[]>('/tasks/available_tasks/')
      .then(setTasks)
      .catch(e => setError(e.message))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!toast) return;
    const t = setTimeout(() => setToast(''), 3000);
    return () => clearTimeout(t);
  }, [toast]);

  const filtered = useMemo(
    () =>
      search
        ? tasks.filter(t => t.subject.toLowerCase().includes(search.toLowerCase()))
        : tasks,
    [tasks, search],
  );

  async function submitBid() {
    if (!modalTask) return;
    setBidSubmitting(true);
    try {
      await fetchAuth('/feedbacks/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          task: modalTask.id,
          question: bidMessage,
          price_one: Number(bidPrice),
        }),
      });
      setModalTask(null);
      setBidMessage('');
      setBidPrice('');
      setToast('Заявку успішно подано!');
    } catch (e: unknown) {
      setToast(e instanceof Error ? e.message : 'Помилка при поданні заявки');
    } finally {
      setBidSubmitting(false);
    }
  }

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

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Доступні замовлення</h1>

      <input
        type="text"
        placeholder="Пошук за предметом…"
        value={search}
        onChange={e => setSearch(e.target.value)}
        className="w-full sm:w-80 mb-6 px-4 py-2.5 rounded-lg border border-gray-300 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
      />

      {filtered.length === 0 ? (
        <p className="text-gray-500 text-sm">Замовлень не знайдено.</p>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map(task => (
            <div
              key={task.id}
              className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col gap-3 shadow-sm"
            >
              <h3 className="font-semibold text-gray-900 text-sm leading-snug line-clamp-2">
                {task.subject}
              </h3>
              <p className="text-gray-500 text-xs leading-relaxed line-clamp-3">
                {task.more}
              </p>
              <div className="flex items-center justify-between text-xs text-gray-500 mt-auto pt-2 border-t border-gray-100">
                <span>
                  Дедлайн:{' '}
                  {new Date(task.deadline).toLocaleDateString('uk-UA', {
                    day: 'numeric',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <span className="font-semibold text-gray-900">
                  {task.price} грн
                </span>
              </div>
              <button
                onClick={() => {
                  setModalTask(task);
                  setBidPrice(String(task.price));
                }}
                className="w-full mt-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors cursor-pointer"
              >
                Подати заявку
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Bid modal */}
      {modalTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4"
          onClick={() => setModalTask(null)}
        >
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 flex flex-col gap-4"
            onClick={e => e.stopPropagation()}
          >
            <h2 className="font-bold text-gray-900">Подати заявку</h2>
            <p className="text-sm text-gray-500 line-clamp-2">{modalTask.subject}</p>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Повідомлення</span>
              <textarea
                rows={3}
                value={bidMessage}
                onChange={e => setBidMessage(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Напишіть, чому ви підходите…"
              />
            </label>

            <label className="flex flex-col gap-1 text-sm">
              <span className="font-medium text-gray-700">Ваша ціна (грн)</span>
              <input
                type="number"
                min={0}
                value={bidPrice}
                onChange={e => setBidPrice(e.target.value)}
                className="rounded-lg border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </label>

            <div className="flex gap-3 mt-2">
              <button
                onClick={() => setModalTask(null)}
                className="flex-1 py-2 rounded-lg border border-gray-300 text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors cursor-pointer"
              >
                Скасувати
              </button>
              <button
                onClick={submitBid}
                disabled={bidSubmitting || !bidMessage.trim() || !bidPrice}
                className="flex-1 py-2 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
              >
                {bidSubmitting ? 'Надсилання…' : 'Надіслати'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 rounded-lg bg-gray-900 text-white px-5 py-3 text-sm shadow-lg animate-[fadeIn_0.2s_ease-out]">
          {toast}
        </div>
      )}
    </>
  );
}
