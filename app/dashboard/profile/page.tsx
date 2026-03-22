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
      setMessage({
        type: 'error',
        text: err instanceof Error ? err.message : 'Не вдалося зберегти профіль',
      });
    } finally {
      setSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="animate-spin rounded-full h-8 w-8 border-2 border-blue-600 border-t-transparent" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-lg bg-red-50 border border-red-200 p-4 text-red-700 text-sm">
        Не вдалося завантажити дані користувача.
      </div>
    );
  }

  return (
    <>
      <h1 className="text-xl font-bold text-gray-900 mb-6">Профіль</h1>

      <div className="max-w-lg">
        {message && (
          <div
            className={`mb-4 rounded-lg border p-3 text-sm ${
              message.type === 'success'
                ? 'bg-green-50 border-green-200 text-green-700'
                : 'bg-red-50 border-red-200 text-red-700'
            }`}
          >
            {message.text}
          </div>
        )}

        <form onSubmit={handleSave} className="flex flex-col gap-4">
          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">Ім&apos;я</span>
            <input
              type="text"
              value={name}
              onChange={e => setName(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">Місто</span>
            <input
              type="text"
              value={city}
              onChange={e => setCity(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </label>

          <label className="flex flex-col gap-1 text-sm">
            <span className="font-medium text-gray-700">Про себе</span>
            <textarea
              rows={4}
              value={bio}
              onChange={e => setBio(e.target.value)}
              className="rounded-lg border border-gray-300 px-3 py-2.5 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              placeholder="Розкажіть про свій досвід…"
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="self-start px-6 py-2.5 rounded-lg bg-blue-600 text-white text-sm font-medium hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
          >
            {saving ? 'Збереження…' : 'Зберегти'}
          </button>
        </form>

        {user.is_executor && (
          <div className="mt-8 rounded-xl border border-gray-200 bg-gray-50 p-5">
            <h2 className="font-semibold text-gray-900 text-sm mb-3">Статистика виконавця</h2>
            <dl className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <dt className="text-gray-500">Баланс</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">{user.balance} грн</dd>
              </div>
              <div>
                <dt className="text-gray-500">Бонусний баланс</dt>
                <dd className="font-semibold text-gray-900 mt-0.5">{user.bonus_balance} грн</dd>
              </div>
            </dl>
          </div>
        )}
      </div>
    </>
  );
}
