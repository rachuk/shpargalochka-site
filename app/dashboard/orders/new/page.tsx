'use client';

import { useState, useRef, useEffect, type DragEvent, type ChangeEvent } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { getAccessToken } from '@/lib/auth';

const SUBJECTS = [
  'Математика', 'Фізика', 'Хімія', 'Біологія', 'Історія', 'Філософія',
  'Психологія', 'Соціологія', 'Економіка', 'Менеджмент', 'Маркетинг',
  'Фінанси', 'Бухгалтерський облік', 'Право', 'Політологія',
  'Інформатика', 'Програмування', 'Англійська мова', 'Українська мова',
  'Література', 'Педагогіка', 'Медицина', 'Екологія', 'Географія', 'Інше',
];

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
  const [subjectName, setSubjectName] = useState('');
  const [subjectOpen, setSubjectOpen] = useState(false);
  const [subjectSearch, setSubjectSearch] = useState('');
  const [workType, setWorkType] = useState('');
  const [workTypeOpen, setWorkTypeOpen] = useState(false);
  const [more, setMore] = useState('');
  const [deadline, setDeadline] = useState('');
  const [price, setPrice] = useState('');
  const [files, setFiles] = useState<File[]>([]);
  const [showExtra, setShowExtra] = useState(false);

  useEffect(() => {
    const t = searchParams.get('type');
    if (t) setWorkType(t);
    const d = searchParams.get('desc');
    if (d) setMore(d);
  }, [searchParams]);

  useEffect(() => {
    if (subject || workType) setShowExtra(true);
  }, [subject, workType]);

  function addFiles(newFiles: FileList | null) {
    if (!newFiles) return;
    setFiles(prev => [...prev, ...Array.from(newFiles)]);
  }
  function removeFile(idx: number) { setFiles(prev => prev.filter((_, i) => i !== idx)); }
  function handleDrop(e: DragEvent) { e.preventDefault(); setDragOver(false); addFiles(e.dataTransfer.files); }
  function handleFileChange(e: ChangeEvent<HTMLInputElement>) { addFiles(e.target.files); e.target.value = ''; }

  const filteredSubjects = SUBJECTS.filter(s =>
    !subjectSearch || s.toLowerCase().includes(subjectSearch.toLowerCase())
  );

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
      if (subjectName) fd.append('subject_name', subjectName);
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
    <div className="animate-slide-up -mx-4 md:-mx-6 lg:-mx-8 -mt-4 md:-mt-6 lg:-mt-8">
      {/* Purple header — Author24 style */}
      <div className="bg-gradient-to-r from-[#6c5ce7] via-[#7c6cf0] to-[#8b7bef] px-4 md:px-8 pt-6 pb-5">
        <div className="max-w-4xl mx-auto">
          <button onClick={() => router.back()} className="flex items-center gap-1 text-white/70 hover:text-white text-sm mb-3 transition-colors">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M15.75 19.5L8.25 12l7.5-7.5" /></svg>
            Назад
          </button>
          <h1 className="text-xl md:text-2xl font-bold text-white mb-3">Розкажи детальніше про завдання</h1>
          <div className="flex flex-wrap items-center gap-4 text-xs text-white/80">
            <span className="flex items-center gap-1.5">🔒 Гарантія до результату</span>
            <span className="flex items-center gap-1.5">🛡️ Гроші завжди під захистом</span>
            <span className="flex items-center gap-1.5">💬 Супровід на кожному кроці</span>
          </div>
        </div>
      </div>

      {/* Form body */}
      <div className="max-w-4xl mx-auto px-4 md:px-8 -mt-0">
        <form onSubmit={handleSubmit}>
          <div className="flex flex-col lg:flex-row gap-6 mt-6">
            {/* Left: form fields */}
            <div className="flex-1 min-w-0">
              <div className="bg-white rounded-2xl border border-[var(--dash-border)] p-5 md:p-6 space-y-5">
                {error && <div className="rounded-xl p-3 border border-red-200 bg-red-50 text-red-700 text-sm">{error}</div>}

                {/* Тема роботи */}
                <div>
                  <label className="block text-sm font-semibold text-[var(--dash-text)] mb-2">Тема роботи</label>
                  <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                    placeholder="Назва роботи" maxLength={110} className="dash-input" autoFocus />
                  <p className="text-[10px] text-[var(--dash-text-muted)] mt-1">{subject.length}/110</p>
                </div>

                {/* Предмет — dropdown */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-[var(--dash-text)] mb-2">Предмет</label>
                  <button type="button" onClick={() => setSubjectOpen(!subjectOpen)}
                    className="dash-input text-left flex items-center justify-between">
                    <span className={subjectName ? 'text-[var(--dash-text)]' : 'text-gray-400'}>
                      {subjectName || 'Вибери або введи назву предмета'}
                    </span>
                    <svg className={`w-4 h-4 text-[var(--dash-text-muted)] transition-transform ${subjectOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {subjectOpen && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-[var(--dash-border)] rounded-xl shadow-xl max-h-60 overflow-hidden">
                      <div className="p-2 border-b border-[var(--dash-border)]">
                        <input type="text" value={subjectSearch} onChange={e => setSubjectSearch(e.target.value)}
                          placeholder="Пошук предмета..." className="w-full px-3 py-2 text-sm border border-[var(--dash-border)] rounded-lg outline-none focus:border-[var(--dash-accent)]" autoFocus />
                      </div>
                      <div className="max-h-48 overflow-y-auto">
                        {filteredSubjects.map(s => (
                          <button key={s} type="button" onClick={() => { setSubjectName(s); setSubjectOpen(false); setSubjectSearch(''); }}
                            className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--dash-accent-bg)] transition-colors ${subjectName === s ? 'text-[var(--dash-accent)] font-medium bg-[var(--dash-accent-bg)]' : 'text-[var(--dash-text)]'}`}>
                            {s}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Тип роботи — dropdown */}
                <div className="relative">
                  <label className="block text-sm font-semibold text-[var(--dash-text)] mb-2">Тип роботи</label>
                  <button type="button" onClick={() => setWorkTypeOpen(!workTypeOpen)}
                    className="dash-input text-left flex items-center justify-between">
                    <span className={workType ? 'text-[var(--dash-text)]' : 'text-gray-400'}>
                      {workType || 'Вибери або введи тип роботи'}
                    </span>
                    <svg className={`w-4 h-4 text-[var(--dash-text-muted)] transition-transform ${workTypeOpen ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M19.5 8.25l-7.5 7.5-7.5-7.5" /></svg>
                  </button>
                  {workTypeOpen && (
                    <div className="absolute z-20 left-0 right-0 top-full mt-1 bg-white border border-[var(--dash-border)] rounded-xl shadow-xl max-h-60 overflow-y-auto">
                      {WORK_TYPES.map(wt => (
                        <button key={wt} type="button" onClick={() => { setWorkType(wt); setWorkTypeOpen(false); }}
                          className={`w-full text-left px-4 py-2.5 text-sm hover:bg-[var(--dash-accent-bg)] transition-colors ${workType === wt ? 'text-[var(--dash-accent)] font-medium bg-[var(--dash-accent-bg)]' : 'text-[var(--dash-text)]'}`}>
                          {wt}
                        </button>
                      ))}
                    </div>
                  )}
                </div>

                {/* Progressive extra fields */}
                {showExtra && (
                  <div className="space-y-5 pt-2 border-t border-[var(--dash-border)]">
                    {/* Опис */}
                    <div>
                      <label className="block text-sm font-semibold text-[var(--dash-text)] mb-2">Опис</label>
                      <textarea value={more} onChange={e => setMore(e.target.value)}
                        rows={4} maxLength={1000}
                        placeholder="Уникальність 60%&#10;Обсяг 30 сторінок"
                        className="dash-input resize-y" />
                      <div className="flex justify-between mt-1">
                        <span className="text-[10px] text-[var(--dash-accent)]">Не обов'язково, але допоможе точніше оцінити</span>
                        <span className="text-[10px] text-[var(--dash-text-muted)]">{more.length}/1000</span>
                      </div>
                    </div>

                    {/* Deadline + Budget side by side */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-semibold text-[var(--dash-text)] mb-2">Здати до</label>
                        <input type="date" value={deadline} onChange={e => setDeadline(e.target.value)} className="dash-input" />
                        <p className="text-[10px] text-[var(--dash-text-muted)] mt-1">Заклади час на перевірку та правки</p>
                      </div>
                      <div>
                        <label className="block text-sm font-semibold text-[var(--dash-text)] mb-2">Бюджет, грн</label>
                        <input type="number" value={price} onChange={e => setPrice(e.target.value)} min={0} placeholder="0" className="dash-input" />
                        <p className="text-[10px] text-[var(--dash-text-muted)] mt-1">Можна залишити порожнім</p>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Mobile submit */}
              <div className="lg:hidden mt-4">
                <button type="submit" disabled={submitting || !subject.trim()}
                  className="w-full py-3.5 rounded-xl bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] disabled:opacity-50 text-white font-semibold text-base transition-colors">
                  {submitting ? 'Створюємо...' : 'Розмістити завдання'}
                </button>
              </div>
            </div>

            {/* Right column */}
            <div className="w-full lg:w-72 shrink-0 space-y-4">
              {/* File drop zone — yellow like Author24 */}
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                className={`rounded-2xl p-6 text-center transition-all cursor-pointer ${
                  dragOver ? 'bg-[var(--dash-accent-bg)] border-2 border-[var(--dash-accent)]' : 'bg-amber-50 border-2 border-dashed border-amber-200'
                }`}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="text-3xl mb-2">📎</div>
                <p className="text-sm text-[var(--dash-text-muted)] mb-2">Перетягни сюди файли або</p>
                <span className="inline-flex px-3 py-1.5 rounded-lg bg-[var(--dash-accent)] text-white text-xs font-semibold">
                  ВИБЕРИ З КОМП'ЮТЕРА
                </span>
                <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
                <p className="text-[10px] text-[var(--dash-text-muted)] mt-2">Опис завдання, методичка, сканы</p>
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between rounded-xl bg-[var(--dash-accent-bg)] px-3 py-2">
                      <span className="text-xs text-[var(--dash-text)] truncate">{f.name}</span>
                      <button type="button" onClick={() => removeFile(i)} className="text-[var(--dash-text-muted)] hover:text-red-500 ml-2">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" /></svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Submit sidebar */}
              <div className="hidden lg:block bg-white rounded-2xl border border-[var(--dash-border)] p-5">
                <h3 className="font-bold text-sm text-[var(--dash-text)] mb-1">Розмісти завдання</h3>
                <p className="text-xs text-[var(--dash-text-muted)] mb-4">І отримай відгуки через 5 хвилин — це безкоштовно</p>
                <button type="submit" disabled={submitting || !subject.trim()}
                  className="w-full py-3 rounded-xl bg-[var(--dash-accent)] hover:bg-[var(--dash-accent-hover)] disabled:opacity-50 text-white font-semibold transition-colors">
                  {submitting ? 'Створюємо...' : 'Розмістити завдання'}
                </button>
                <p className="text-[10px] text-[var(--dash-text-muted)] mt-3 flex items-center gap-1.5">
                  <span className="text-base">👀</span> 1265 перевірених експертів готові допомогти прямо зараз
                </p>
              </div>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
