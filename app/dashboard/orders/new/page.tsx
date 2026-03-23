'use client';

import { useState, useRef, type DragEvent, type ChangeEvent } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getAccessToken } from '@/lib/auth';

const WORK_TYPES = [
  'Курсова робота', 'Дипломна робота', 'Реферат', 'Контрольна робота',
  'Есе', 'Звіт з практики', 'Лабораторна робота', 'Презентація',
  'Задачі / Вправи', 'Програмування', 'Креслення', 'Інше',
];

export default function NewOrderPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');
  const [dragOver, setDragOver] = useState(false);
  const [step, setStep] = useState(1);

  const [subject, setSubject] = useState('');
  const [more, setMore] = useState('');
  const [deadline, setDeadline] = useState('');
  const [price, setPrice] = useState('');
  const [workType, setWorkType] = useState('');
  const [files, setFiles] = useState<File[]>([]);

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
    if (!subject.trim()) { setError('Вкажіть тему замовлення'); return; }

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
      setError(e instanceof Error ? e.message : 'Помилка створення замовлення');
    } finally {
      setSubmitting(false);
    }
  }

  const canProceed = step === 1 ? subject.trim().length > 0 : true;

  return (
    <div className="max-w-2xl mx-auto animate-slide-up">
      <div className="flex items-center gap-2 text-sm text-[var(--dash-text-muted)] mb-6">
        <Link href="/dashboard/orders" className="hover:text-[var(--dash-accent)] transition-colors">Мої замовлення</Link>
        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M8.25 4.5l7.5 7.5-7.5 7.5" />
        </svg>
        <span className="text-[var(--dash-text)] font-medium">Нове замовлення</span>
      </div>

      <div className="flex items-center gap-3 mb-8">
        {[1, 2, 3].map(s => (
          <div key={s} className="flex items-center gap-2 flex-1">
            <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold shrink-0 transition-colors ${
              s === step ? 'bg-[var(--dash-accent)] text-white' :
              s < step ? 'bg-emerald-100 text-emerald-600' :
              'bg-[var(--dash-accent-bg)] text-[var(--dash-text-muted)]'
            }`}>
              {s < step ? (
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
                </svg>
              ) : s}
            </div>
            <span className={`text-sm font-medium hidden sm:block ${s === step ? 'text-[var(--dash-text)]' : 'text-[var(--dash-text-muted)]'}`}>
              {s === 1 ? 'Тема' : s === 2 ? 'Деталі' : 'Файли'}
            </span>
            {s < 3 && <div className={`flex-1 h-0.5 rounded-full ${s < step ? 'bg-emerald-200' : 'bg-[var(--dash-border)]'}`} />}
          </div>
        ))}
      </div>

      {error && <div className="dash-card p-4 border-red-200 bg-red-50 text-red-700 text-sm mb-6">{error}</div>}

      <form onSubmit={handleSubmit}>
        <div className="dash-card p-6 space-y-5">
          {step === 1 && (
            <>
              <h2 className="text-lg font-bold text-[var(--dash-text)]">Опишіть вашу задачу</h2>
              <div>
                <label className="block text-sm font-medium text-[var(--dash-text)] mb-2">
                  Тема <span className="text-red-500">*</span>
                </label>
                <input type="text" value={subject} onChange={e => setSubject(e.target.value)}
                  placeholder="Наприклад: Курсова з програмування на C++"
                  className="dash-input" autoFocus />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--dash-text)] mb-2">Тип роботи</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                  {WORK_TYPES.map(wt => (
                    <button key={wt} type="button" onClick={() => setWorkType(wt === workType ? '' : wt)}
                      className={`text-left px-3 py-2.5 rounded-lg text-sm transition-all border ${
                        workType === wt
                          ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-bg)] text-[var(--dash-accent)] font-medium'
                          : 'border-[var(--dash-border)] text-[var(--dash-text-muted)] hover:border-[var(--dash-accent-light)]'
                      }`}>
                      {wt}
                    </button>
                  ))}
                </div>
              </div>
            </>
          )}

          {step === 2 && (
            <>
              <h2 className="text-lg font-bold text-[var(--dash-text)]">Деталі замовлення</h2>
              <div>
                <label className="block text-sm font-medium text-[var(--dash-text)] mb-2">Опис</label>
                <textarea value={more} onChange={e => setMore(e.target.value)} rows={5}
                  placeholder="Детальний опис роботи, вимоги, побажання..."
                  className="dash-input resize-y" />
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--dash-text)] mb-2">Дедлайн</label>
                  <input type="datetime-local" value={deadline} onChange={e => setDeadline(e.target.value)} className="dash-input" />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--dash-text)] mb-2">Бюджет, грн</label>
                  <input type="number" value={price} onChange={e => setPrice(e.target.value)} min={0} placeholder="0" className="dash-input" />
                </div>
              </div>
            </>
          )}

          {step === 3 && (
            <>
              <h2 className="text-lg font-bold text-[var(--dash-text)]">Прикріпіть файли</h2>
              <p className="text-sm text-[var(--dash-text-muted)] -mt-2">Методичка, приклади, шаблони — усе, що допоможе виконавцю</p>
              <div
                onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                onDragLeave={() => setDragOver(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`border-2 border-dashed rounded-xl p-10 text-center cursor-pointer transition-all ${
                  dragOver ? 'border-[var(--dash-accent)] bg-[var(--dash-accent-bg)]' : 'border-[var(--dash-border)] hover:border-[var(--dash-accent-light)]'
                }`}>
                <div className="w-14 h-14 rounded-2xl bg-[var(--dash-accent-bg)] flex items-center justify-center mx-auto mb-3">
                  <svg className="w-6 h-6 text-[var(--dash-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 16.5V9.75m0 0l3 3m-3-3l-3 3M6.75 19.5a4.5 4.5 0 01-1.41-8.775 5.25 5.25 0 0110.338-2.32 3.75 3.75 0 013.182 6.47A4.5 4.5 0 0117.25 19.5H6.75z" />
                  </svg>
                </div>
                <p className="text-sm text-[var(--dash-text-muted)]">
                  Перетягніть файли сюди або <span className="text-[var(--dash-accent)] font-medium">натисніть для вибору</span>
                </p>
                <p className="text-xs text-[var(--dash-text-muted)] mt-1 opacity-60">PDF, DOC, DOCX, JPG, PNG до 50 МБ</p>
                <input ref={fileInputRef} type="file" multiple onChange={handleFileChange} className="hidden" />
              </div>

              {files.length > 0 && (
                <div className="space-y-2">
                  {files.map((f, i) => (
                    <div key={i} className="flex items-center justify-between gap-3 rounded-xl bg-[var(--dash-accent-bg)] border border-[var(--dash-border)] px-4 py-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <div className="w-9 h-9 rounded-lg bg-white flex items-center justify-center shrink-0">
                          <svg className="w-4 h-4 text-[var(--dash-accent)]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                            <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5a3.375 3.375 0 00-3.375-3.375H8.25m2.25 0H5.625c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z" />
                          </svg>
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-[var(--dash-text)] truncate">{f.name}</p>
                          <p className="text-xs text-[var(--dash-text-muted)]">{(f.size / 1024).toFixed(0)} КБ</p>
                        </div>
                      </div>
                      <button type="button" onClick={() => removeFile(i)}
                        className="text-[var(--dash-text-muted)] hover:text-red-500 transition-colors shrink-0 p-1">
                        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
                        </svg>
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <div className="flex items-center justify-between mt-6">
          <div>
            {step > 1 && (
              <button type="button" onClick={() => setStep(s => s - 1)} className="dash-btn-secondary">← Назад</button>
            )}
          </div>
          <div className="flex gap-3">
            <button type="button" onClick={() => router.back()} className="dash-btn-secondary">Скасувати</button>
            {step < 3 ? (
              <button type="button" onClick={() => setStep(s => s + 1)} disabled={!canProceed} className="dash-btn-primary">Далі →</button>
            ) : (
              <button type="submit" disabled={submitting} className="dash-btn-primary">
                {submitting ? (
                  <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Створення...</>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                    </svg>
                    Створити замовлення
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
