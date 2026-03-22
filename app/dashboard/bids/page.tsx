'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { fetchAuth } from '@/lib/auth';

interface Bid {
  id: number;
  task_id: number;
  question: string;
  price_one: string | number;
  state: number;
  client_name: string;
}

function bidStatusLabel(state: number): { label: string; cls: string } {
  if (state === 1) return { label: 'Прийнято', cls: 'bg-green-100 text-green-800' };
  if (state === -1 || state === -2) return { label: 'Відхилено', cls: 'bg-red-100 text-red-800' };
  return { label: 'Очікує', cls: 'bg-yellow-100 text-yellow-800' };
}

export default function MyBidsPage() {
  const [bids, setBids] = useState<Bid[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchAuth<Bid[]>('/feedbacks/my/')
      .then(setBids)
      .catch(e => setError(e.message))
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

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Мої заявки</h1>

      {bids.length === 0 ? (
        <p className="text-gray-500 text-sm">У вас ще немає заявок.</p>
      ) : (
        <div className="flex flex-col gap-3">
          {bids.map(bid => {
            const st = bidStatusLabel(bid.state);
            return (
              <div
                key={bid.id}
                className="rounded-xl border border-gray-200 bg-white p-5 flex flex-col sm:flex-row sm:items-center gap-3 shadow-sm"
              >
                <div className="flex-1 min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm truncate">
                    Замовлення #{bid.task_id}
                  </h3>
                  <p className="text-xs text-gray-500 mt-1 line-clamp-2">{bid.question}</p>
                </div>

                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-sm font-semibold text-gray-900 whitespace-nowrap">
                    {bid.price_one} грн
                  </span>
                  <span
                    className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${st.cls}`}
                  >
                    {st.label}
                  </span>
                  {bid.state === 1 && (
                    <Link
                      href={`/dashboard/orders/${bid.task_id}`}
                      className="text-xs font-medium text-blue-600 hover:text-blue-700 whitespace-nowrap"
                    >
                      Переглянути →
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </>
  );
}
