'use client';

export interface BidData {
  id: number;
  client_id?: number;
  client_name?: string;
  executor_name?: string;
  executor_rating?: number | null;
  executor_reviews_count?: number;
  executor_verified?: boolean;
  executor_avatar?: string | null;
  question?: string;
  price_one?: number | null;
  price_two?: number | null;
  date_add?: string;
  status?: string;
  completed_tasks?: number;
}

interface BidCardProps {
  bid: BidData;
  onAccept?: (bid: BidData) => void;
  onChat?: (bid: BidData) => void;
}

export default function BidCard({ bid, onAccept, onChat }: BidCardProps) {
  const name = bid.executor_name || bid.client_name || 'Експерт';
  const initials = name.split(' ').filter(Boolean).map(w => w[0]).join('').slice(0, 2).toUpperCase();
  const price = bid.price_one || bid.price_two;
  const hasDiscount = bid.price_two && bid.price_one && bid.price_two < bid.price_one;
  const timeAgo = bid.date_add ? formatTimeAgo(bid.date_add) : '';

  return (
    <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-4 hover:shadow-md hover:border-[var(--dash-accent-light)] transition-all">
      <div className="flex gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          {bid.executor_avatar ? (
            <img src={bid.executor_avatar} alt={name} className="w-12 h-12 rounded-full object-cover" />
          ) : (
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--dash-accent)] to-[var(--dash-accent-light)] flex items-center justify-center text-white font-bold text-sm">{initials}</div>
          )}
          {bid.executor_verified && (
            <div className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-[var(--dash-accent)] rounded-full flex items-center justify-center ring-2 ring-white">
              <svg className="w-2.5 h-2.5 text-white" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <h4 className="font-bold text-sm text-[var(--dash-text)] truncate">{name}</h4>
                {timeAgo && <span className="text-[10px] text-[var(--dash-text-muted)] shrink-0">{timeAgo}</span>}
              </div>
              <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                {bid.executor_rating != null && bid.executor_rating > 0 && (
                  <div className="flex items-center gap-0.5">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="text-xs font-semibold text-[var(--dash-text)]">{bid.executor_rating.toFixed(1)}</span>
                  </div>
                )}
                {bid.executor_reviews_count != null && bid.executor_reviews_count > 0 && (
                  <span className="text-[10px] text-[var(--dash-text-muted)]">{bid.executor_reviews_count} відгуків</span>
                )}
                {bid.completed_tasks != null && bid.completed_tasks > 0 && (
                  <span className="text-[10px] text-[var(--dash-text-muted)]">{bid.completed_tasks} робіт</span>
                )}
              </div>
            </div>

            {/* Price block */}
            {price != null && price > 0 && (
              <div className="text-right shrink-0">
                {hasDiscount && (
                  <span className="text-xs text-[var(--dash-text-muted)] line-through mr-1">{bid.price_one} ₴</span>
                )}
                <span className="text-lg font-bold text-[var(--dash-accent)]">{hasDiscount ? bid.price_two : price} ₴</span>
              </div>
            )}
          </div>

          {/* Question text */}
          {bid.question && (
            <p className="text-sm text-[var(--dash-text)] mt-2 leading-relaxed">{bid.question}</p>
          )}

          {/* Actions */}
          <div className="flex items-center gap-2 mt-3">
            {onAccept && (
              <button onClick={() => onAccept(bid)} className="px-4 py-2 rounded-full bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] text-white text-xs font-semibold transition-colors">
                Обрати експерта
              </button>
            )}
            {onChat && (
              <button onClick={() => onChat(bid)} className="px-4 py-2 rounded-full border border-[var(--dash-accent)] text-[var(--dash-accent)] hover:bg-[var(--dash-accent-bg)] text-xs font-semibold transition-colors">
                Написати
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

function formatTimeAgo(dateStr: string): string {
  const d = new Date(dateStr);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const mins = Math.floor(diffMs / 60000);
  if (mins < 1) return 'щойно';
  if (mins < 60) return `${mins} хв тому`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs} год тому`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `${days} дн тому`;
  return d.toLocaleDateString('uk-UA', { day: 'numeric', month: 'short' });
}
