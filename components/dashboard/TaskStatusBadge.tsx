'use client';

const STATUS_MAP: Record<string, { label: string; cls: string }> = {
  draft:      { label: 'Чернетка',       cls: 'bg-gray-100 text-gray-600' },
  published:  { label: 'Вибір експерта', cls: 'bg-[var(--dash-accent-bg)] text-[var(--dash-accent)]' },
  confirming: { label: 'Підтвердження', cls: 'bg-amber-50 text-amber-700' },
  in_work:    { label: 'В роботі',       cls: 'bg-blue-50 text-blue-700' },
  in_progress:{ label: 'В роботі',       cls: 'bg-blue-50 text-blue-700' },
  guarantee:  { label: 'На перевірці',   cls: 'bg-orange-50 text-orange-700' },
  review:     { label: 'На перевірці',   cls: 'bg-orange-50 text-orange-700' },
  completed:  { label: 'Завершено',      cls: 'bg-green-50 text-green-700' },
  refunded:   { label: 'Завершено',      cls: 'bg-green-50 text-green-700' },
  cancelled:  { label: 'Скасовано',      cls: 'bg-red-50 text-red-600' },
  expired:    { label: 'Прострочено',    cls: 'bg-red-50 text-red-600' },
};

export default function TaskStatusBadge({ status }: { status: string }) {
  const s = STATUS_MAP[status] || { label: status, cls: 'bg-gray-100 text-gray-600' };
  return (
    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${s.cls}`}>
      {s.label}
    </span>
  );
}
