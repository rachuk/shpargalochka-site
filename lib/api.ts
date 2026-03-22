const API_BASE = 'https://shpargalochka.org.ua/api/v1/public';
const API_KEY = process.env.PUBLIC_API_KEY || '';

export interface DictItem { id: number; code: string; name: string; name_ru: string; }
export interface SubjectItem extends DictItem { slug: string; category: string; }
export interface WorkTypeItem extends DictItem { slug: string; }
export interface UniversityItem extends DictItem { short_name: string; city: string; slug: string; }
export interface SubjectCategory { code: string; name: string; }

export interface StatsData {
  total_orders: number; completed_orders: number; total_reviews: number;
  average_rating: number; total_executors: number; total_clients: number;
  active_last_24h: number;
}

export interface RegistrationPayload {
  display_name: string; contact_email: string; phone: string; telegram_nick: string;
  country: string; university: string; professional_status: string; activity_type: string;
  work_types: string; languages: string; about: string;
  work_type_ids: number[]; subject_ids: number[];
}

async function fetchApi<T>(path: string, revalidate = 300): Promise<T> {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'X-API-KEY': API_KEY },
    next: { revalidate },
  });
  if (!res.ok) throw new Error(`API ${res.status}: ${path}`);
  return res.json();
}

export const getWorkTypes = () =>
  fetchApi<{ items: WorkTypeItem[] }>('/dictionaries/work-types/').then(d => d.items);

export const getSubjects = () =>
  fetchApi<{ items: SubjectItem[]; categories: SubjectCategory[] }>('/dictionaries/subjects/');

export const getLanguages = () =>
  fetchApi<{ items: DictItem[] }>('/dictionaries/languages/').then(d => d.items);

export const getCountries = () =>
  fetchApi<{ items: DictItem[] }>('/dictionaries/countries/').then(d => d.items);

export const getStats = () => fetchApi<StatsData>('/stats/', 60);

// Client-side only (called from RegistrationForm)
const CLIENT_API = '/api/v1/public';

export async function clientGetWorkTypes(): Promise<WorkTypeItem[]> {
  const res = await fetch(`${CLIENT_API}/dictionaries/work-types/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.items;
}

export async function clientGetSubjects(): Promise<{ items: SubjectItem[]; categories: SubjectCategory[] }> {
  const res = await fetch(`${CLIENT_API}/dictionaries/subjects/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  return res.json();
}

export async function clientGetLanguages(): Promise<DictItem[]> {
  const res = await fetch(`${CLIENT_API}/dictionaries/languages/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.items;
}

export async function clientGetCountries(): Promise<DictItem[]> {
  const res = await fetch(`${CLIENT_API}/dictionaries/countries/`);
  if (!res.ok) throw new Error(`HTTP ${res.status}`);
  const data = await res.json();
  return data.items;
}

export async function submitRegistration(payload: RegistrationPayload) {
  const res = await fetch(`${CLIENT_API}/register/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(payload),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Unknown error' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  return res.json() as Promise<{ id: number; bot_link: string }>;
}
