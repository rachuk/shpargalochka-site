'use client';

import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';

const WORK_TYPES = [
  'Курсова робота', 'Дипломна робота', 'Реферат', 'Контрольна робота',
  'Есе', 'Звіт з практики', 'Лабораторна робота', 'Презентація',
  'Задачі / Вправи', 'Програмування', 'Креслення', 'Інше',
];

export default function NewOrderPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const [subject, setSubject] = useState('');
  const [more, setMore] = useState('');
  const [deadline, setDeadline] = useState('');
  const [price, setPrice] = useState('');
  const [workType, setWorkType] = useState('');
  const [files, setFiles] = useState<File[]>([]);

  useEffect(() => {
    const t = searchParams.get('type');
    if (t) setWorkType(t);
  }, [searchParams]);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    setFiles(prev => [...prev, ...Array.from(newFiles)]);
  }
  function removeFile(idx: number) { setFiles(prev => prev.filter((_, i) => i !== idx)); }
  function handleDrop(e: DragEvent) { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) { addFiles(e.target.files); e.target.value = ''; }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    if (!subject.trim()) { setError('Вкажіть тему завдання'); return; }

    setSubmitting(true);
    try {
      const token = getAccessToken();
      if (!token) throw new Error('Not authenticated');

      const fd = new FormData();
      fd.append('subject', subject.trim());
      if (more.trim()) fd.append('more', more.trim());
      if (deadline) fd.append('deadline', deadline);
      if (price) fd.append('price', price);
      if (workType.trim()) fd.append('work_type', workType.trim());
      for (const file of files) fd.append('files', file);

      const res = await fetch('/miniapp/api/v1/tasks/', {
        method: 'POST',
        headers: { Authorization: `Bearer ${token}` },
        body: fd,
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
        throw new Error(err.error || err.detail || `HTTP ${res.status}`);
      }

      router.push('/dashboard/orders');
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : 'Помилка створення');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="animate-slide-up">
      {/* Purple hero */}
      <div className="relative bg-gradient-to-br from-[#6c5ce7] via-[#7c6cf0] to-[#8b7bef] rounded-3xl p-6 md:p-8 mb-6 text-white overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/5 rounded-full -translate-y-1/3 translate-x-1/3" />
        <h1 className="text-2xl font-bold mb-1 relative z-10">Розмісти завдання</h1>
        <p className="text-white/75 text-sm relative z-10">Отримай відгуки від перевірених експертів за 5 хвилин</p>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left: form */}
          <div className="flex-1 space-y-4">
            {error && <div className="rounded-2xl p-4 border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

            {/* Subject */}
            <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-5">
              <label className="block text-sm font-semibold text-[var(--dash-text)] mb-2">Тема роботи <span className="text-red-500">*</span></label>
              <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                placeholder="Наприклад: Курсова з програмування на C++"
                maxLength={110} className="dash-input" autoFocus />
              <div className="flex justify-end mt-1"><span className="text-[10px] text-[var(--dash-text-muted)]">{subject.length}/110</span></div>
            </div>

            {/* Work type chips */}
            <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-5">
              <label className="block text-sm font-semibold text-[var(--dash-text)] mb-3">Тип роботи</label>
              <div className="flex flex-wrap gap-2">
                {WORK_TYPES.map(wt => (
                  <button key={wt} type="button" onClick={() => setWorkType(wt === workType ? '' : wt)}
                    className={`px-3.5 py-2 rounded-full text-sm transition-all border ${
                      workType === wt
                        ? 'border-[var(--dash-accent)] bg-[var(--dash-accent)] text-white font-medium shadow-sm'
                        : 'border-[var(--dash-border)] bg-white text-[var(--dash-text-muted)] hover:border-[var(--dash-accent-light)] hover:text-[var(--dash-text)]'
                    }`}>
                    {wt}
                  </button>
                ))}
              </div>
            </div>

            {/* Description */}
            <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-5">
              <label className="block text-sm font-semibold text-[var(--dash-text)] mb-2">Опис</label>
              <textarea value={more} onChange={e => setMore(e.target.value)}
                rows={5} maxLength={1000}
                placeholder="Детальний опис роботи, вимоги, побажання..."
                className="dash-input resize-y" />
              <div className="flex justify-end mt-1"><span className="text-[10px] text-[var(--dash-text-muted)]">{more.length}/1000</span></div>
            </div>

            {/* Deadline + Budget */}
            <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-5">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-[var(--dash-text)] mb-2">Здати до</label>
                  <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="dash-input" />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[var(--dash-text)] mb-2">Бюджет, грн</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} min={0} placeholder="0" className="dash-input" />
                </div>
              </div>
            </div>

            {/* Files */}
            <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-5">
              <label className="block text-sm font-semibold text-[var(--dash-text)] mb-2">Прикріпити файли</label>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-2xl p-8 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-bg)]' : 'border-gray-200 bg-gray-50 hover:border-[var(--dash-accent-light)]'
                }`}>
                <svg className="w-8 h-8 mx-auto mb-2 text-[var(--dash-text-muted)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.233-2.33 3 3 0 013.758 3.848A3.752 3.752 0 0118 19.5H6.75z" /></svg>
                <p className="text-sm text-[var(--dash-text-muted)]">Перетягніть файли або <span className="text-[var(--dash-accent)] font-medium">натисніть</span></p>
                <p className="text-xs text-[var(--dash-text-muted)] mt-1 opacity-60">PDF, DOC, DOCX, JPG, PNG до 50 МБ</p>
                <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
              </div>
              {files.length > 0 && (
                <div className="space-y-2 mt-3">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--dash-accent-bg)] px-4 py-2.5">
                      <div className="flex items-center gap-2 min-w-0">
                        <svg className="w-4 h-4 text-[var(--dash-accent)] shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" /></svg>
                        <span className="text-sm text-[var(--dash-text)] truncate">{f.name}</span>
                        <span className="text-xs text-[var(--dash-text-muted)] shrink-0">{(f.size / 1024).toFixed(0)} КБ</span>
                      </div>
                      <button type="button" onClick={() => removeFile(i)} className="text-[var(--dash-text-muted)] hover:text-red-500 transition-colors shrink-0">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Mobile submit */}
            <div className="lg:hidden">
              <button type="submit" disabled={submitting || !subject.trim()}
                className="w-full py-3.5 rounded-full bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] disabled:opacity-50 text-white font-semibold text-base transition-colors">
                {submitting ? 'Створюємо...' : 'Розмістити завдання'}
              </button>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="hidden lg:block w-80 shrink-0">
            <div className="sticky top-20 space-y-4">
              <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-5">
                <h3 className="font-bold text-base text-[var(--dash-text)] mb-3">Отримай відгуки за 5 хвилин</h3>
                <button type="submit" disabled={submitting || !subject.trim()}
                  className="w-full py-3 rounded-full bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] disabled:opacity-50 text-white font-semibold transition-colors">
                  {submitting ? 'Створюємо...' : 'Розмістити завдання'}
                </button>
                <div className="mt-4 space-y-2.5">
                  {[
                    { icon: '🛡️', text: 'Безпечна угода' },
                    { icon: '💳', text: 'Зручні способи оплати' },
                    { icon: '🔄', text: 'Плати частинами' },
                    { icon: '✅', text: 'Гарантія якості' },
                    { icon: '♻️', text: 'Безкоштовні доопрацювання' },
                  ].map((item, i) => (
                    <div key={i} className="flex items-center gap-2.5 text-sm text-[var(--dash-text-muted)]">
                      <span className="text-base">{item.icon}</span> {item.text}
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-[var(--dash-accent-bg)] rounded-2xl p-5">
                <p className="text-sm font-semibold text-[var(--dash-accent)] mb-3">Як це працює?</p>
                <div className="space-y-3">
                  {[
                    { step: '1', text: 'Опишіть завдання' },
                    { step: '2', text: 'Оберіть експерта серед відгуків' },
                    { step: '3', text: 'Отримайте результат з гарантією' },
                  ].map(s => (
                    <div key={s.step} className="flex items-center gap-3">
                      <div className="w-7 h-7 rounded-full bg-[var(--dash-accent)] text-white flex items-center justify-center text-xs font-bold shrink-0">{s.step}</div>
                      <span className="text-sm text-[var(--dash-text)]">{s.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
