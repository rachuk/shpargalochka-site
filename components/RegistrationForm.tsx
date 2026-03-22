'use client';

import { useState, useEffect } from 'react';
import {
  clientGetWorkTypes, clientGetSubjects, clientGetLanguages, clientGetCountries,
  submitRegistration,
  type WorkTypeItem, type SubjectItem, type SubjectCategory, type DictItem,
} from '@/lib/api';

const PROFESSIONAL_STATUSES = ['Студент', 'Бакалавр', 'Магістр', 'Спеціаліст', 'Кандидат', 'Професор', 'Інший'];
const ACTIVITY_TYPES = ['Студент', 'Практик (працюю за фахом)', 'Викладач', 'Професійний автор', 'Інший'];

export function RegistrationForm() {
  const [workTypes, setWorkTypes] = useState<WorkTypeItem[]>([]);
  const [subjects, setSubjects] = useState<SubjectItem[]>([]);
  const [categories, setCategories] = useState<SubjectCategory[]>([]);
  const [languages, setLanguages] = useState<DictItem[]>([]);
  const [countries, setCountries] = useState<DictItem[]>([]);
  const [form, setForm] = useState({
    display_name: '', contact_email: '', phone: '', telegram_nick: '',
    country_id: '', university: '', professional_status: '', activity_type: '', about: '',
    selected_work_types: [] as number[], selected_subjects: [] as number[], selected_languages: [] as number[],
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    clientGetWorkTypes().then(setWorkTypes).catch(() => {});
    clientGetSubjects().then(({ items, categories: cats }) => { setSubjects(items); setCategories(cats); }).catch(() => {});
    clientGetLanguages().then(setLanguages).catch(() => {});
    clientGetCountries().then(setCountries).catch(() => {});
  }, []);

  function updateField(field: string, value: string) { setForm(prev => ({ ...prev, [field]: value })); }
  function toggleArrayItem(field: 'selected_work_types' | 'selected_subjects' | 'selected_languages', id: number) {
    setForm(prev => ({ ...prev, [field]: prev[field].includes(id) ? prev[field].filter(x => x !== id) : [...prev[field], id] }));
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(''); setSubmitting(true);
    const selectedCountry = countries.find(c => String(c.id) === form.country_id);
    const selectedLangs = languages.filter(l => form.selected_languages.includes(l.id)).map(l => l.name).join(', ');
    try {
      await submitRegistration({
        display_name: form.display_name, contact_email: form.contact_email, phone: form.phone,
        telegram_nick: form.telegram_nick, country: selectedCountry?.name || '', university: form.university,
        professional_status: form.professional_status, activity_type: form.activity_type,
        work_types: workTypes.filter(wt => form.selected_work_types.includes(wt.id)).map(wt => wt.name).join(', '),
        languages: selectedLangs, about: form.about,
        work_type_ids: form.selected_work_types, subject_ids: form.selected_subjects,
      });
      setSuccess(true);
    } catch (err) { setError(err instanceof Error ? err.message : 'Помилка відправки'); }
    finally { setSubmitting(false); }
  }

  if (success) return (
    <div className="text-center py-12">
      <div className="text-5xl mb-4">🎉</div>
      <h2 className="text-3xl font-bold mb-4">Дякуємо!</h2>
      <p className="text-gray-600 text-lg mb-6">Вашу анкету отримано. Ми зв&#39;яжемося з вами протягом 24 годин.</p>
      <a href="https://t.me/Shpargalochka_bot" target="_blank" rel="noopener noreferrer"
        className="inline-block bg-violet-700 hover:bg-violet-800 text-white px-8 py-3 rounded-xl font-semibold transition-colors">
        Перейти в Telegram-бот
      </a>
    </div>
  );

  const inputCls = "w-full px-4 py-3 border border-gray-200 rounded-xl focus:border-violet-500 focus:ring-1 focus:ring-violet-500 outline-none";
  const selectCls = `${inputCls} bg-white`;

  return (
    <div>
      <h2 className="text-3xl font-bold text-center mb-2">Анкета автора</h2>
      <p className="text-gray-500 text-center mb-8">Заповніть форму — це займе кілька хвилин</p>
      <form onSubmit={handleSubmit} className="space-y-6">
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold mb-2">Контактна інформація</legend>
          <div className="grid md:grid-cols-2 gap-4">
            <input required placeholder="Як до вас звертатись *" value={form.display_name} onChange={e => updateField('display_name', e.target.value)} className={inputCls} />
            <input placeholder="Email" type="email" value={form.contact_email} onChange={e => updateField('contact_email', e.target.value)} className={inputCls} />
            <input placeholder="Telegram нік (@username)" value={form.telegram_nick} onChange={e => updateField('telegram_nick', e.target.value)} className={inputCls} />
            <input placeholder="Телефон" value={form.phone} onChange={e => updateField('phone', e.target.value)} className={inputCls} />
          </div>
        </fieldset>
        <fieldset className="space-y-4">
          <legend className="text-lg font-semibold mb-2">Про вас</legend>
          <div className="grid md:grid-cols-2 gap-4">
            <select value={form.country_id} onChange={e => updateField('country_id', e.target.value)} className={selectCls}>
              <option value="">Країна</option>
              {countries.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
            <input placeholder="Університет / ВНЗ" value={form.university} onChange={e => updateField('university', e.target.value)} className={inputCls} />
            <select value={form.professional_status} onChange={e => updateField('professional_status', e.target.value)} className={selectCls}>
              <option value="">Професійний статус</option>
              {PROFESSIONAL_STATUSES.map(s => <option key={s} value={s}>{s}</option>)}
            </select>
            <select value={form.activity_type} onChange={e => updateField('activity_type', e.target.value)} className={selectCls}>
              <option value="">Вид діяльності</option>
              {ACTIVITY_TYPES.map(a => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-lg font-semibold mb-3">Мови</legend>
          <div className="flex flex-wrap gap-2">
            {languages.map(l => (
              <button type="button" key={l.id} onClick={() => toggleArrayItem('selected_languages', l.id)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors cursor-pointer ${form.selected_languages.includes(l.id) ? 'bg-violet-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{l.name}</button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-lg font-semibold mb-3">Типи робіт <span className="text-sm font-normal text-gray-500 ml-2">(обрано: {form.selected_work_types.length})</span></legend>
          <div className="flex flex-wrap gap-2 max-h-48 overflow-y-auto">
            {workTypes.map(wt => (
              <button type="button" key={wt.id} onClick={() => toggleArrayItem('selected_work_types', wt.id)}
                className={`px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${form.selected_work_types.includes(wt.id) ? 'bg-violet-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{wt.name}</button>
            ))}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-lg font-semibold mb-3">Предмети <span className="text-sm font-normal text-gray-500 ml-2">(обрано: {form.selected_subjects.length})</span></legend>
          <div className="space-y-4 max-h-72 overflow-y-auto">
            {categories.map(cat => {
              const catSubjects = subjects.filter(s => s.category === cat.code);
              if (!catSubjects.length) return null;
              return (
                <div key={cat.code}>
                  <div className="text-sm font-semibold text-gray-500 mb-2 uppercase tracking-wide">{cat.name}</div>
                  <div className="flex flex-wrap gap-2">
                    {catSubjects.map(s => (
                      <button type="button" key={s.id} onClick={() => toggleArrayItem('selected_subjects', s.id)}
                        className={`px-3 py-1.5 rounded-full text-sm transition-colors cursor-pointer ${form.selected_subjects.includes(s.id) ? 'bg-violet-700 text-white' : 'bg-gray-100 text-gray-700 hover:bg-gray-200'}`}>{s.name}</button>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </fieldset>
        <fieldset>
          <legend className="text-lg font-semibold mb-2">Додатково</legend>
          <textarea placeholder="Розкажіть коротко про себе, свій досвід, посилання на портфоліо..." value={form.about}
            onChange={e => updateField('about', e.target.value)} rows={4} className={`${inputCls} resize-none`} />
        </fieldset>
        {error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-xl">{error}</div>}
        <button type="submit" disabled={submitting}
          className="w-full bg-violet-700 hover:bg-violet-800 disabled:bg-violet-400 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-colors cursor-pointer">
          {submitting ? 'Відправляємо...' : 'Відправити анкету'}
        </button>
      </form>
    </div>
  );
}
