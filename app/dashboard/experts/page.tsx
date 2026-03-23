'use client';

import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'next/navigation';
import ExpertCard, { type ExpertData } from '@/components/dashboard/ExpertCard';
import QuickCreateForm from '@/components/dashboard/QuickCreateForm';
import SlideOver from '@/components/dashboard/SlideOver';

interface Review {
  id: number;
  rating: number | null;
  text: string | null;
  client_name: string | null;
  date: string;
}

const WORK_TYPES = [
  'Курсова робота', 'Дипломна робота', 'Реферат', 'Контрольна робота',
  'Есе', 'Програмування', 'Задачі / Вправи',
];

export default function ExpertsPage() {
  const searchParams = useSearchParams();
  const [experts, setExperts] = useState<ExpertData[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [workType, setWorkType] = useState('');
  const [searchQ, setSearchQ] = useState('');

  const [profileOpen, setProfileOpen] = useState(false);
  const [selectedExpert, setSelectedExpert] = useState<ExpertData | null>(null);
  const [reviews, setReviews] = useState<Review[]>([]);
  const [reviewsLoading, setReviewsLoading] = useState(false);

  const fetchExperts = useCallback(async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '12' });
      if (workType) params.set('work_type', workType);
      if (searchQ) params.set('search', searchQ);
      const res = await fetch(`/api/v1/public/executors/?${params}`);
      const data = await res.json();
      if (data.results) {
        setExperts(data.results);
        setTotalPages(Math.ceil((data.count || data.results.length) / 12));
      } else if (Array.isArray(data)) {
        setExperts(data);
        setTotalPages(1);
      }
    } catch { setExperts([]); }
    finally { setLoading(false); }
  }, [page, workType, searchQ]);

  useEffect(() => { fetchExperts(); }, [fetchExperts]);

  useEffect(() => {
    const id = searchParams.get('id');
    if (id && experts.length > 0) {
      const e = experts.find(ex => ex.id === Number(id));
      if (e) openProfile(e);
    }
  }, [searchParams, experts]);

  const openProfile = async (expert: ExpertData) => {
    setSelectedExpert(expert);
    setProfileOpen(true);
    setReviewsLoading(true);
    try {
      const res = await fetch(`/api/v1/public/executors/${expert.id}/reviews/?limit=10`);
      const data = await res.json();
      setReviews(data.results || (Array.isArray(data) ? data : []));
    } catch { setReviews([]); }
    finally { setReviewsLoading(false); }
  };

  return (
    <div className="animate-slide-up">
      <div className="flex flex-col lg:flex-row gap-6">
        {/* Main content */}
        <div className="flex-1 min-w-0">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 mb-5">
            <h1 className="text-xl font-bold text-[var(--dash-text)]">Каталог експертів</h1>
            <div className="relative sm:w-64">
              <svg className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[var(--dash-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
              </svg>
              <input type="text" placeholder="Пошук експертів..." value={searchQ}
                onChange={e => { setSearchQ(e.target.value); setPage(1); }}
                className="w-full pl-9 pr-3 py-2 rounded-xl border border-[var(--dash-border)] text-sm focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)]/20 focus:border-[var(--dash-accent)]" />
            </div>
          </div>

          {/* Filters */}
          <div className="flex gap-2 mb-5 overflow-x-auto pb-1 scrollbar-hide">
            <button onClick={() => { setWorkType(''); setPage(1); }}
              className={`shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                !workType ? 'bg-[var(--dash-accent)] text-white' : 'bg-white border border-[var(--dash-border)] text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]'
              }`}>
              Усі
            </button>
            {WORK_TYPES.map(wt => (
              <button key={wt} onClick={() => { setWorkType(wt); setPage(1); }}
                className={`shrink-0 px-4 py-2 text-sm font-medium rounded-full transition-all ${
                  workType === wt ? 'bg-[var(--dash-accent)] text-white' : 'bg-white border border-[var(--dash-border)] text-[var(--dash-text-muted)] hover:text-[var(--dash-text)]'
                }`}>
                {wt}
              </button>
            ))}
          </div>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <div className="w-8 h-8 border-3 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
            </div>
          ) : experts.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <h3 className="text-lg font-bold text-[var(--dash-text)] mb-2">Експертів не знайдено</h3>
              <p className="text-sm text-[var(--dash-text-muted)]">Спробуйте змінити фільтри</p>
            </div>
          ) : (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-4">
                {experts.map(e => (
                  <ExpertCard
                    key={e.id}
                    expert={e}
                    onProfile={() => openProfile(e)}
                    onSelect={() => openProfile(e)}
                  />
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-center gap-2 mt-6">
                  <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1}
                    className="px-3 py-1.5 rounded-lg border border-[var(--dash-border)] text-sm disabled:opacity-30 hover:bg-gray-50">
                    ←
                  </button>
                  {Array.from({ length: Math.min(totalPages, 7) }, (_, i) => {
                    const p = i + 1;
                    return (
                      <button key={p} onClick={() => setPage(p)}
                        className={`px-3 py-1.5 rounded-lg text-sm font-medium ${
                          page === p ? 'bg-[var(--dash-accent)] text-white' : 'border border-[var(--dash-border)] hover:bg-gray-50'
                        }`}>
                        {p}
                      </button>
                    );
                  })}
                  <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages}
                    className="px-3 py-1.5 rounded-lg border border-[var(--dash-border)] text-sm disabled:opacity-30 hover:bg-gray-50">
                    →
                  </button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Right sidebar */}
        <div className="hidden lg:block w-80 shrink-0">
          <div className="sticky top-20">
            <QuickCreateForm compact />
          </div>
        </div>
      </div>

      {/* Expert Profile SlideOver */}
      <SlideOver open={profileOpen} onClose={() => setProfileOpen(false)} title={selectedExpert?.name || selectedExpert?.str_name || 'Експерт'}>
        {selectedExpert && (
          <div className="p-5 space-y-5">
            {/* Profile header */}
            <div className="text-center">
              {selectedExpert.avatar ? (
                <img src={selectedExpert.avatar} alt="" className="w-24 h-24 rounded-full object-cover mx-auto mb-3" />
              ) : (
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[var(--dash-accent)] to-[var(--dash-accent-light)] flex items-center justify-center text-white font-bold text-2xl mx-auto mb-3">
                  {(selectedExpert.name || selectedExpert.str_name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                </div>
              )}
              <h3 className="text-lg font-bold text-[var(--dash-text)]">{selectedExpert.name || selectedExpert.str_name}</h3>

              {(selectedExpert.average_rating ?? selectedExpert.rating) != null && (
                <div className="flex items-center justify-center gap-1 mt-1">
                  <svg className="w-4 h-4 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                  <span className="text-sm font-bold text-[var(--dash-text)]">{(selectedExpert.average_rating ?? selectedExpert.rating ?? 0).toFixed(1)}</span>
                  <span className="text-xs text-[var(--dash-text-muted)]">
                    ({selectedExpert.total_reviews ?? selectedExpert.reviews_count ?? 0} відгуків)
                  </span>
                </div>
              )}

              <div className="flex items-center justify-center gap-4 mt-2 text-xs text-[var(--dash-text-muted)]">
                <span>{selectedExpert.total_tasks ?? selectedExpert.completed_jobs ?? 0} робіт</span>
              </div>
            </div>

            {/* Bio */}
            {(selectedExpert.bio || selectedExpert.about) && (
              <div className="bg-gray-50 rounded-xl p-4">
                <h4 className="text-sm font-semibold text-[var(--dash-text)] mb-1">Про себе</h4>
                <p className="text-sm text-[var(--dash-text-muted)] leading-relaxed">{selectedExpert.bio || selectedExpert.about}</p>
              </div>
            )}

            {/* Subjects */}
            {selectedExpert.subjects && selectedExpert.subjects.length > 0 && (
              <div>
                <h4 className="text-sm font-semibold text-[var(--dash-text)] mb-2">Предмети</h4>
                <div className="flex flex-wrap gap-1.5">
                  {selectedExpert.subjects.map((s, i) => (
                    <span key={i} className="px-2.5 py-1 rounded-full bg-[var(--dash-accent-bg)] text-[var(--dash-accent)] text-xs font-medium">
                      {s.name}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Reviews */}
            <div>
              <h4 className="text-sm font-semibold text-[var(--dash-text)] mb-3">
                Відгуки ({selectedExpert.total_reviews ?? selectedExpert.reviews_count ?? 0})
              </h4>
              {reviewsLoading ? (
                <div className="flex justify-center py-4">
                  <div className="w-6 h-6 border-2 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
                </div>
              ) : reviews.length === 0 ? (
                <p className="text-sm text-[var(--dash-text-muted)]">Відгуків поки немає</p>
              ) : (
                <div className="space-y-3">
                  {reviews.map(r => (
                    <div key={r.id} className="bg-gray-50 rounded-xl p-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-medium text-[var(--dash-text)]">{r.client_name || 'Клієнт'}</span>
                        {r.rating != null && (
                          <div className="flex items-center gap-0.5">
                            {Array.from({ length: 5 }).map((_, i) => (
                              <svg key={i} className={`w-3 h-3 ${i < (r.rating || 0) ? 'text-amber-400' : 'text-gray-200'}`} fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                            ))}
                          </div>
                        )}
                      </div>
                      <p className="text-xs text-[var(--dash-text-muted)] leading-relaxed">
                        {r.text || 'Клієнт не залишив текстовий відгук'}
                      </p>
                      <p className="text-[10px] text-[var(--dash-text-muted)] mt-1 opacity-60">{r.date}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}
      </SlideOver>
    </div>
  );
}
