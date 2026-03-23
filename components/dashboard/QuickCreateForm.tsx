'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';

interface QuickCreateFormProps {
  compact?: boolean;
  onCreated?: (taskId: number) => void;
}

export default function QuickCreateForm({ compact, onCreated }: QuickCreateFormProps) {
  const [text, setText] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [loading, setLoading] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  const handleSubmit = async () => {
    if (!text.trim() && files.length === 0) return;
    setLoading(true);
    try {
      const token = getAccessToken();
      if (!token) { router.push('/login'); return; }
      const fd = new FormData();
      fd.append('subject', text.trim().slice(0, 110) || 'Нове завдання');
      fd.append('more', text.trim());
      files.forEach(f => fd.append('files', f));
      const res = await fetch('/miniapp/api/v1/tasks/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });
      if (res.ok) {
        const data = await res.json();
        setText(''); setFiles([]);
        if (onCreated) onCreated(data.id);
        else router.push('/dashboard/orders');
      }
    } finally { setLoading(false); }
  };

  return (
    <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-5">
      <h3 className="font-bold text-base text-[var(--dash-text)] mb-3">
        {compact ? 'Нове завдання' : 'Створи завдання'}
      </h3>
      <textarea
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Розкажи детальніше про своє завдання"
        className="w-full border border-[var(--dash-border)] rounded-xl p-3 text-sm resize-none h-24 focus:outline-none focus:ring-2 focus:ring-[var(--dash-accent)]/20 focus:border-[var(--dash-accent)] placeholder:text-[var(--dash-text-muted)]"
        maxLength={1000}
      />
      <div className="flex items-center justify-between mt-2">
        <span className="text-[10px] text-[var(--dash-text-muted)]">{text.length}/1000</span>
        <button onClick={() => fileRef.current?.click()} className="p-1.5 rounded-full hover:bg-gray-100 text-[var(--dash-accent)] transition-colors">
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M18.375 12.739l-7.693 7.693a4.5 4.5 0 01-6.364-6.364l10.94-10.94A3 3 0 1119.5 7.372L8.552 18.32m.009-.01l-.01.01m5.699-9.941l-7.81 7.81a1.5 1.5 0 002.112 2.13" /></svg>
        </button>
      </div>
      <input ref={fileRef} type="file" multiple className="hidden" onChange={e => setFiles(prev => [...prev, ...Array.from(e.target.files || [])])} />
      {files.length > 0 && (
        <div className="flex flex-wrap gap-1 mt-2">
          {files.map((f, i) => (
            <span key={i} className="text-[10px] bg-[var(--dash-accent-bg)] text-[var(--dash-accent)] px-2 py-0.5 rounded-full flex items-center gap-1">
              {f.name}
              <button onClick={() => setFiles(prev => prev.filter((_, j) => j !== i))} className="opacity-60 hover:opacity-100">&times;</button>
            </span>
          ))}
        </div>
      )}
      <button
        onClick={handleSubmit}
        disabled={loading || (!text.trim() && files.length === 0)}
        className="mt-3 w-full py-2.5 rounded-full bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] disabled:opacity-50 text-white text-sm font-semibold transition-colors"
      >
        {loading ? 'Створюємо...' : 'Створити завдання'}
      </button>
      <div className="mt-4 space-y-2">
        {['Безпечна угода', 'Зручні способи оплати', 'Безкоштовні доопрацювання'].map((t, i) => (
          <div key={i} className="flex items-center gap-2 text-xs text-[var(--dash-text-muted)]">
            <svg className="w-4 h-4 text-[var(--dash-success)] shrink-0" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" /></svg>
            {t}
          </div>
        ))}
      </div>
    </div>
  );
}
