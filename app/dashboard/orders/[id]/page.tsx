'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { fetchAuth } from '@/lib/auth';
import { useAuth } from '@/providers/AuthProvider';
import { Chat } from '@/components/chat/Chat';

interface TaskFile {
  id: number;
  file: string;
  name: string;
}

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

export default function OrderDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [task, setTask] = useState<Task | null>(null);
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    fetchAuth<Task>(`/tasks/${id}/`)
      .then((t) => {
        setTask(t);
        if (t.status === 'active') {
          return fetchAuth<Bid[]>(`/feedbacks/?task_id=${id}`).then(setBids).catch(() => {});
        }
      })
      .catch((e) => setError(e.message))
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

  const [paymentUrl, setPaymentUrl] = useState('');

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
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (error && !task) {
    return (
      <div className="space-y-4">
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
        <Link href="/dashboard/orders" className="text-sm text-blue-600 hover:underline">
          &larr; Назад до замовлень
        </Link>
      </div>
    );
  }

  if (!task) return null;

  const isTaskCustomer = task.client_id === user?.id;
  const isTaskExecutor = task.executor_id === user?.id;

  return (
    <div className="max-w-3xl space-y-6">
      <Link href="/dashboard/orders" className="inline-flex items-center gap-1.5 text-sm text-gray-500 hover:text-gray-700 transition-colors">
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
        </svg>
        Назад до замовлень
      </Link>

      {error && (
        <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
          {error}
        </div>
      )}

      <div className="rounded-xl border border-gray-200 p-5 space-y-4">
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-xl font-bold text-gray-900">{task.subject}</h1>
          <span className={`text-xs px-2.5 py-1 rounded-full font-medium shrink-0 ${STATUS_COLORS[task.status] || 'bg-gray-100 text-gray-600'}`}>
            {STATUS_LABELS[task.status] || task.status}
          </span>
        </div>

        {task.more && (
          <p className="text-sm text-gray-600 whitespace-pre-wrap">{task.more}</p>
        )}

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
          {task.deadline && (
            <div>
              <p className="text-xs text-gray-500">Дедлайн</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">
                {new Date(task.deadline).toLocaleDateString('uk-UA', { day: 'numeric', month: 'long', year: 'numeric' })}
              </p>
            </div>
          )}
          {task.price && (
            <div>
              <p className="text-xs text-gray-500">Бюджет</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{task.price} грн</p>
            </div>
          )}
          {task.work_type && (
            <div>
              <p className="text-xs text-gray-500">Тип роботи</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{task.work_type}</p>
            </div>
          )}
          {task.executor_name && (
            <div>
              <p className="text-xs text-gray-500">Виконавець</p>
              <p className="text-sm font-medium text-gray-900 mt-0.5">{task.executor_name}</p>
            </div>
          )}
        </div>

        {task.files && task.files.length > 0 && (
          <div className="pt-2">
            <p className="text-xs text-gray-500 mb-2">Файли</p>
            <div className="flex flex-wrap gap-2">
              {task.files.map((f) => (
                <a
                  key={f.id}
                  href={f.file}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 rounded-lg bg-gray-50 border border-gray-200 px-3 py-1.5 text-xs text-gray-700 hover:bg-gray-100 transition-colors"
                >
                  <svg className="w-3.5 h-3.5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  {f.name}
                </a>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Action buttons */}
      {(isTaskCustomer && task.status === 'review') && (
        <div className="flex flex-wrap gap-3">
          <button
            onClick={() => handleAction('accept_task')}
            disabled={actionLoading}
            className="bg-green-600 hover:bg-green-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Прийняти роботу
          </button>
          <button
            onClick={() => handleAction('revision_task')}
            disabled={actionLoading}
            className="border border-yellow-300 bg-yellow-50 hover:bg-yellow-100 disabled:opacity-60 text-yellow-700 px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Доопрацювання
          </button>
        </div>
      )}

      {(isTaskExecutor && task.status === 'in_progress') && (
        <div>
          <button
            onClick={() => handleAction('finish_task')}
            disabled={actionLoading}
            className="bg-blue-600 hover:bg-blue-700 disabled:opacity-60 text-white px-5 py-2.5 rounded-lg text-sm font-medium transition-colors"
          >
            Здати роботу
          </button>
        </div>
      )}

      {/* Bids section (active orders) */}
      {task.status === 'active' && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">
            Заявки {bids.length > 0 && <span className="text-sm font-normal text-gray-500">({bids.length})</span>}
          </h2>
          {bids.length === 0 ? (
            <p className="text-sm text-gray-500">Заявок поки немає.</p>
          ) : (
            <div className="space-y-2">
              {bids.map((bid) => (
                <div key={bid.id} className="rounded-xl border border-gray-200 p-4 space-y-2">
                  <div className="flex items-center justify-between gap-3">
                    <p className="text-sm font-medium text-gray-900">{bid.client_name}</p>
                    {bid.price_one && (
                      <span className="text-sm font-semibold text-green-700">{bid.price_one} грн</span>
                    )}
                  </div>
                  {bid.question && (
                    <p className="text-sm text-gray-600">{bid.question}</p>
                  )}
                  <div className="flex items-center justify-between pt-1">
                    <p className="text-xs text-gray-400">
                      {new Date(bid.date_add).toLocaleDateString('uk-UA')}
                    </p>
                    {isTaskCustomer && (
                      <button
                        onClick={() => handleAcceptBid(bid.id)}
                        disabled={actionLoading}
                        className="bg-green-600 hover:bg-green-700 disabled:opacity-50 text-white text-xs px-4 py-1.5 rounded-lg font-medium transition-colors"
                      >
                        Обрати виконавця
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Chat (when executor assigned) */}
      {task.executor_name && (task.status === 'in_progress' || task.status === 'review') && (
        <div className="space-y-3">
          <h2 className="text-lg font-semibold text-gray-900">Чат з {task.executor_name}</h2>
          <Chat taskId={Number(id)} className="h-[500px]" />
        </div>
      )}

      {/* Payment modal */}
      {paymentUrl && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl max-w-md w-full p-6 space-y-4">
            <h3 className="text-lg font-bold text-gray-900">Оплата</h3>
            <p className="text-sm text-gray-600">Для підтвердження замовлення потрібно поповнити баланс.</p>
            <a
              href={paymentUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block w-full text-center bg-green-600 hover:bg-green-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Оплатити через LiqPay
            </a>
            <button
              onClick={() => setPaymentUrl('')}
              className="block w-full text-center text-gray-500 text-sm hover:underline"
            >
              Скасувати
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
