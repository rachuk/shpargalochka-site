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
}

interface ExpertCardProps {
  expert: ExpertData;
  onSelect?: (expert: ExpertData) => void;
  onProfile?: (expert: ExpertData) => void;
  actionLabel?: string;
  compact?: boolean;
}

export default function ExpertCard({ expert, onSelect, onProfile, actionLabel = 'Обрати експерта', compact }: ExpertCardProps) {
  const name = expert.name || expert.str_name || '?';
  const rating = expert.average_rating ?? expert.rating;
  const reviews = expert.total_reviews ?? expert.reviews_count ?? 0;
  const tasks = expert.total_tasks ?? expert.completed_jobs ?? 0;
  const initials = (name || '?').split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const subjects = expert.subjects?.slice(0, 3) || [];

  return (
    <div className={`bg-white rounded-2xl border border-[var(--dash-border)] p-5 flex flex-col items-center text-center transition-shadow hover:shadow-lg ${compact ? 'p-3' : ''}`}>
      <div className="relative mb-3 cursor-pointer" onClick={() => onProfile?.(expert)}>
        {expert.avatar ? (
          <img src={expert.avatar} alt={name} className="w-20 h-20 rounded-full object-cover" />
        ) : (
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-[var(--dash-accent)] to-[var(--dash-accent-light)] flex items-center justify-center text-white font-bold text-xl">
            {initials}
          </div>
        )}
        {rating != null && rating > 0 && (
          <div className="absolute -bottom-1 left-1/2 -translate-x-1/2 bg-white border border-[var(--dash-border)] rounded-full px-2 py-0.5 flex items-center gap-0.5 shadow-sm">
            <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
            <span className="text-xs font-bold text-[var(--dash-text)]">{rating.toFixed(1)}</span>
          </div>
        )}
      </div>

      <h3 className="font-bold text-sm text-[var(--dash-text)] cursor-pointer hover:text-[var(--dash-accent)] transition-colors" onClick={() => onProfile?.(expert)}>
        {name}
      </h3>

      {expert.level && (
        <span className="text-[10px] text-[var(--dash-text-muted)] mt-0.5">{expert.level}</span>
      )}

      <div className="flex items-center gap-3 mt-2 text-[10px] text-[var(--dash-text-muted)]">
        {tasks > 0 && <span>{tasks} робіт</span>}
        {reviews > 0 && <span>{reviews} відгуків</span>}
      </div>

      {subjects.length > 0 && (
        <div className="flex flex-wrap gap-1 justify-center mt-2">
          {subjects.map((s, i) => (
            <span key={i} className="px-2 py-0.5 rounded-full bg-[var(--dash-accent-bg)] text-[var(--dash-accent)] text-[10px] font-medium">
              {s.name}
            </span>
          ))}
        </div>
      )}

      {onSelect && (
        <button
          onClick={() => onSelect(expert)}
          className="mt-3 w-full py-2 rounded-xl bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] text-white text-sm font-semibold transition-colors"
        >
          {actionLabel}
        </button>
      )}
    </div>
  );
}
