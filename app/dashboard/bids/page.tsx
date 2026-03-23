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
  date_add?: string;
}

function bidStatus(state: number): { label: string; cls: string; icon: React.ReactNode } {
  if (state === 1) return {
    label: 'Прийнято',
    cls: 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };
  if (state === -1 || state === -2) return {
    label: 'Відхилено',
    cls: 'bg-red-50 text-red-700 border border-red-200',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M9.75 9.75l4.5 4.5m0-4.5l-4.5 4.5M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };
  return {
    label: 'Очікує',
    cls: 'bg-amber-50 text-amber-700 border border-amber-200',
    icon: <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6h4.5m4.5 0a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>,
  };
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
        <div className="w-8 h-8 border-3 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return <div className="dash-card p-5 border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>;
  }

  return (
    <div className="animate-slide-up">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--dash-text)]">Мої відгуки</h1>
          <p className="text-sm text-[var(--dash-text-muted)] mt-1">{bids.length} заявок подано</p>
        </div>
        <Link href="/dashboard/available" className="dash-btn-primary text-sm">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
          </svg>
          Біржа замовлень
        </Link>
      </div>

      {bids.length === 0 ? (
        <div className="dash-card p-12 text-center">
          <p className="text-[var(--dash-text-muted)] mb-1">У вас ще немає заявок</p>
          <p className="text-[var(--dash-text-muted)] text-sm opacity-60">Перейдіть на біржу замовлень, щоб знайти роботу</p>
        </div>
      ) : (
        <div className="space-y-3">
          {bids.map(bid => {
            const st = bidStatus(bid.state);
            return (
              <div key={bid.id} className="dash-card p-5 flex flex-col sm:flex-row sm:items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <Link href={`/dashboard/orders/${bid.task_id}`}
                      className="font-semibold text-[var(--dash-text)] hover:text-[var(--dash-accent)] transition-colors truncate">
                      Замовлення #{bid.task_id}
                    </Link>
                    <span className={`dash-badge ${st.cls} gap-1`}>
                      {st.icon}
                      {st.label}
                    </span>
                  </div>
                  {bid.question && (
                    <p className="text-sm text-[var(--dash-text-muted)] mt-1.5 line-clamp-2">{bid.question}</p>
                  )}
                  {bid.date_add && (
                    <p className="text-xs text-[var(--dash-text-muted)] mt-1 opacity-60">
                      {new Date(bid.date_add).toLocaleDateString('uk-UA', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-4 shrink-0">
                  <span className="text-lg font-bold text-[var(--dash-text)]">{bid.price_one} ₴</span>
                  {bid.state === 1 && (
                    <Link href={`/dashboard/orders/${bid.task_id}`} className="dash-btn-primary text-xs py-2 px-4">
                      Перейти до замовлення
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
