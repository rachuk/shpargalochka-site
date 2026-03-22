const MINIAPP_API = '/miniapp/api/v1';

const TOKEN_KEY = 'shpargalochka_access';
const REFRESH_KEY = 'shpargalochka_refresh';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function getRefreshTokenValue(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(REFRESH_KEY);
}

export function setTokens(access: string, refresh: string) {
  localStorage.setItem(TOKEN_KEY, access);
  localStorage.setItem(REFRESH_KEY, refresh);
  document.cookie = `has_token=1; path=/; max-age=${60 * 60 * 24 * 7}; SameSite=Lax`;
}

export function clearTokens() {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(REFRESH_KEY);
  document.cookie = 'has_token=; path=/; max-age=0';
}

export interface TelegramLoginData {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  auth_date: number;
  hash: string;
}

export interface UserInfo {
  id: number;
  chat_id: string;
  name: string;
  login: string;
  is_executor: boolean;
  is_client: boolean;
  avatar: string | null;
  balance: string;
  bonus_balance: string;
  city: string;
  bio: string;
}

export async function loginWithTelegram(data: TelegramLoginData): Promise<UserInfo> {
  const res = await fetch(`${MINIAPP_API}/auth/telegram-login/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(data),
  });
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: 'Login failed' }));
    throw new Error(err.error || `HTTP ${res.status}`);
  }
  const json = await res.json();
  setTokens(json.access, json.refresh);
  return json.user;
}

async function refreshAccessToken(): Promise<string | null> {
  const refresh = getRefreshTokenValue();
  if (!refresh) return null;

  try {
    const res = await fetch(`${MINIAPP_API}/auth/refresh/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ refresh }),
    });
    if (!res.ok) {
      clearTokens();
      return null;
    }
    const json = await res.json();
    localStorage.setItem(TOKEN_KEY, json.access);
    return json.access;
  } catch {
    clearTokens();
    return null;
  }
}

export async function fetchAuth<T>(path: string, options: RequestInit = {}): Promise<T> {
  let token = getAccessToken();
  if (!token) throw new Error('Not authenticated');

  const headers = new Headers(options.headers);
  headers.set('Authorization', `Bearer ${token}`);

  let res = await fetch(`${MINIAPP_API}${path}`, { ...options, headers });

  if (res.status === 401) {
    const newToken = await refreshAccessToken();
    if (!newToken) throw new Error('Session expired');
    headers.set('Authorization', `Bearer ${newToken}`);
    res = await fetch(`${MINIAPP_API}${path}`, { ...options, headers });
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: `HTTP ${res.status}` }));
    throw new Error(err.error || err.detail || `HTTP ${res.status}`);
  }

  return res.json();
}

export async function fetchMe(): Promise<UserInfo> {
  return fetchAuth<UserInfo>('/auth/me/');
}

export function buildWsUrl(path: string): string {
  const token = getAccessToken();
  const proto = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
  const base = `${proto}//${window.location.host}/miniapp/ws`;
  return `${base}${path}?token=${token}`;
}
