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

  return (
    <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-4 hover:shadow-md transition-shadow">
      <div className="flex gap-3">
        {bid.executor_avatar ? (
          <img src={bid.executor_avatar} alt={name} className="w-12 h-12 rounded-full object-cover shrink-0" />
        ) : (
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-[var(--dash-accent)] to-[var(--dash-accent-light)] flex items-center justify-center text-white font-bold text-sm shrink-0">
            {initials}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="font-bold text-sm text-[var(--dash-text)]">{name}</h4>
              <div className="flex items-center gap-2 mt-0.5">
                {bid.executor_rating != null && bid.executor_rating > 0 && (
                  <div className="flex items-center gap-0.5">
                    <svg className="w-3.5 h-3.5 text-amber-400" fill="currentColor" viewBox="0 0 20 20"><path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" /></svg>
                    <span className="text-xs font-semibold text-[var(--dash-text)]">{bid.executor_rating.toFixed(1)}</span>
                  </div>
                )}
                {bid.completed_tasks != null && bid.completed_tasks > 0 && (
                  <span className="text-[10px] text-[var(--dash-text-muted)]">{bid.completed_tasks} робіт</span>
                )}
                {bid.executor_reviews_count != null && bid.executor_reviews_count > 0 && (
                  <span className="text-[10px] text-[var(--dash-text-muted)]">{bid.executor_reviews_count} відгуків</span>
                )}
              </div>
            </div>
            {price != null && price > 0 && (
              <div className="text-right shrink-0">
                <span className="text-lg font-bold text-[var(--dash-accent)]">{price} ₴</span>
              </div>
            )}
          </div>

          {bid.question && (
            <p className="text-sm text-[var(--dash-text-muted)] mt-2 line-clamp-2">{bid.question}</p>
          )}

          <div className="flex items-center gap-2 mt-3">
            {onAccept && (
              <button
                onClick={() => onAccept(bid)}
                className="px-4 py-1.5 rounded-xl bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] text-white text-xs font-semibold transition-colors"
              >
                Обрати експерта
              </button>
            )}
            {onChat && (
              <button
                onClick={() => onChat(bid)}
                className="px-4 py-1.5 rounded-xl border border-[var(--dash-border)] hover:bg-gray-50 text-[var(--dash-text)] text-xs font-semibold transition-colors"
              >
                Відповісти
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
