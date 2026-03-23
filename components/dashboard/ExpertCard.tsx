'use client';

export interface ExpertData {
  id: number;
  name?: string;
  str_name?: string;
  avatar?: string | null;
  rating?: number | null;
  average_rating?: number | null;
  reviews_count?: number;
  total_reviews?: number;
  completed_jobs?: number;
  total_tasks?: number;
  level?: string;
  subjects?: { id?: number; name: string; slug?: string }[];
  bio?: string | null;
  about?: string | null;
  education?: string | null;
  experience_years?: number | null;
  min_price?: number | null;
  verified?: boolean;
}

interface ExpertCardProps {
  expert: ExpertData;
  onSelect?: (expert: ExpertData) => void;
  onProfile?: (expert: ExpertData) => void;
  actionLabel?: string;
  compact?: boolean;
}

export default function ExpertCard({ expert, onSelect, onProfile, actionLabel = 'Обрати', compact }: ExpertCardProps) {
  const name = expert.name || expert.str_name || '?';
  const rating = expert.average_rating ?? expert.rating;
  const reviews = expert.total_reviews ?? expert.reviews_count ?? 0;
  const tasks = expert.total_tasks ?? expert.completed_jobs ?? 0;
  const initials = (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const subjects = expert.subjects?.slice(0, 2) || [];
  const expYears = expert.experience_years;

  if (compact) {
    return (
      <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-3 flex flex-col items-center text-center hover:shadow-md hover:border-[var(--dash-accent-light)] transition-all cursor-pointer" onClick={() => onProfile?.(expert)}>
        <div className="relative mb-2">
          {expert.avatar ? (
            <img src={expert.avatar} alt={name} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--dash-accent)] to-[var(--dash-accent-light)] flex items-center justify-center text-white font-bold text-base">{initials}</div>
          )}
          {rating != null && rating > 0 && (
            <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white border border-[var(--dash-border)] rounded-full px-1.5 py-px flex items-center gap-0.5 shadow-sm text-[10px]">
              <svg className="w-3 h-3 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span className="font-bold text-[var(--dash-text)]">{rating.toFixed(1)}</span>
            </div>
          )}
        </div>
        <h3 className="font-semibold text-xs text-[var(--dash-text)] leading-tight mt-1 line-clamp-1">{name}</h3>
        <span className="text-[10px] text-[var(--dash-text-muted)] mt-0.5">{tasks} робіт</span>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-4 flex flex-col hover:shadow-lg hover:border-[var(--dash-accent-light)] transition-all group">
      {/* Top row: avatar + info */}
      <div className="flex gap-3 mb-3">
        <div className="relative shrink-0 cursor-pointer" onClick={() => onProfile?.(expert)}>
          {expert.avatar ? (
            <img src={expert.avatar} alt={name} className="w-14 h-14 rounded-full object-cover" />
          ) : (
            <div className="w-14 h-14 rounded-full bg-gradient-to-br from-[var(--dash-accent)] to-[var(--dash-accent-light)] flex items-center justify-center text-white font-bold text-lg">{initials}</div>
          )}
          {expert.verified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 bg-[var(--dash-accent)] rounded-full flex items-center justify-center ring-2 ring-white">
              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </div>
          )}
        </div>
        <div className="min-w-0 flex-1">
          <h3 className="font-bold text-sm text-[var(--dash-text)] cursor-pointer group-hover:text-[var(--dash-accent)] transition-colors line-clamp-1" onClick={() => onProfile?.(expert)}>{name}</h3>
          {rating != null && rating > 0 && (
            <div className="flex items-center gap-1 mt-0.5">
              <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
              <span className="text-xs font-bold text-[var(--dash-text)]">{rating.toFixed(1)}</span>
              <span className="text-[10px] text-[var(--dash-text-muted)]">· {reviews} відгуків</span>
            </div>
          )}
          <div className="flex items-center gap-2 mt-1 text-[11px] text-[var(--dash-text-muted)]">
            {expYears && <span>{expYears} р. досвіду</span>}
            {tasks > 0 && <span>{tasks} виконаних робіт</span>}
          </div>
        </div>
      </div>

      {/* Subjects */}
      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {subjects.map((s, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-[var(--dash-accent-bg)] text-[var(--dash-accent)] text-[10px] font-medium">{s.name}</span>
          ))}
          {(expert.subjects?.length || 0) > 2 && (
            <span className="px-2 py-0.5 rounded-full bg-gray-100 text-[var(--dash-text-muted)] text-[10px]">+{(expert.subjects?.length || 0) - 2}</span>
          )}
        </div>
      )}

      {/* Bottom row: price + action */}
      <div className="mt-auto flex items-center justify-between gap-2 pt-2 border-t border-[var(--dash-border)]">
        {expert.min_price ? (
          <span className="text-sm font-bold text-[var(--dash-text)]">від {expert.min_price} ₴</span>
        ) : (
          <span className="text-xs text-[var(--dash-text-muted)]">{expert.level || 'Експерт'}</span>
        )}
        {onSelect && (
          <button onClick={() => onSelect(expert)} className="px-3.5 py-1.5 rounded-full bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] text-white text-xs font-semibold transition-colors">
            {actionLabel}
          </button>
        )}
      </div>
    </div>
  );
}
