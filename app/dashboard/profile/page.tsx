'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/providers/AuthProvider';
import { fetchAuth } from '@/lib/auth';

export default function ProfilePage() {
  const { user, isLoading } = useAuth();

  const [name, setName] = useState('');
  const [city, setCity] = useState('');
  const [bio, setBio] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  useEffect(() => {
    if (!user) return;
    setName(user.name ?? '');
    setCity(user.city ?? '');
    setBio(user.bio ?? '');
  }, [user]);

  useEffect(() => {
    if (!message) return;
    const t = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(t);
  }, [message]);

  async function handleSave(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    setMessage(null);
    try {
      await fetchAuth('/clients/update_profile/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ str_name: name, city, bio }),
      });
      setMessage({ type: 'success', text: 'Профіль успішно оновлено!' });
    } catch (err: unknown) {
      setMessage({ type: 'error', text: err instanceof Error ? err.message : 'Не вдалося зберегти профіль' });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-3 border-[var(--dash-accent)] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <div className="dash-card p-5 border-red-200 bg-red-50 text-red-700 text-sm">Не вдалося завантажити дані користувача.</div>;
  }

  const initials = (user.name || 'U').split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <div className="max-w-2xl animate-slide-up">
      <h1 className="text-2xl font-bold text-[var(--dash-text)] mb-6">Профіль</h1>

      <div className="dash-card p-6 mb-6">
        <div className="flex items-center gap-5">
          {user.avatar ? (
            <img src={user.avatar} alt="" className="w-20 h-20 rounded-2xl object-cover" />
          ) : (
            <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-[var(--dash-accent)] to-[var(--dash-accent-hover)] flex items-center justify-center text-white font-bold text-2xl">
              {initials}
            </div>
          )}
          <div>
            <h2 className="text-xl font-bold text-[var(--dash-text)]">{user.name}</h2>
            <p className="text-sm text-[var(--dash-text-muted)] mt-0.5">
              @{user.login || 'telegram'} · {user.is_executor ? 'Виконавець' : 'Замовник'}
            </p>
            {user.city && (
              <p className="text-sm text-[var(--dash-text-muted)] mt-0.5 flex items-center gap-1">
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 0115 0z" />
                </svg>
                {user.city}
              </p>
            )}
          </div>
        </div>
      </div>

      {message && (
        <div className={`dash-card p-4 mb-6 text-sm ${
          message.type === 'success' ? 'bg-emerald-50 border-emerald-200 text-emerald-700' : 'bg-red-50 border-red-200 text-red-700'
        }`}>
          {message.text}
        </div>
      )}

      <div className="dash-card p-6">
        <h3 className="font-bold text-[var(--dash-text)] mb-5">Редагувати профіль</h3>
        <form onSubmit={handleSave} className="space-y-5">
          <div>
            <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">Ім&apos;я</label>
            <input type="text" value={name} onChange={e => setName(e.target.value)} className="dash-input" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">Місто</label>
            <input type="text" value={city} onChange={e => setCity(e.target.value)} className="dash-input" placeholder="Наприклад: Київ" />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--dash-text)] mb-1.5">Про себе</label>
            <textarea rows={4} value={bio} onChange={e => setBio(e.target.value)}
              className="dash-input resize-y" placeholder="Розкажіть про свій досвід та навички..." />
          </div>
          <button type="submit" disabled={saving} className="dash-btn-primary">
            {saving ? (
              <><div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />Збереження...</>
            ) : 'Зберегти зміни'}
          </button>
        </form>
      </div>

      {user.is_executor && (
        <div className="dash-card p-6 mt-6">
          <h3 className="font-bold text-[var(--dash-text)] mb-4">Фінанси</h3>
          <div className="grid grid-cols-2 gap-4">
            <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-100">
              <p className="text-xs font-medium text-emerald-600 uppercase tracking-wide mb-1">Баланс</p>
              <p className="text-2xl font-bold text-emerald-700">{user.balance} ₴</p>
            </div>
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-100">
              <p className="text-xs font-medium text-amber-600 uppercase tracking-wide mb-1">Бонуси</p>
              <p className="text-2xl font-bold text-amber-700">{user.bonus_balance} ₴</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
