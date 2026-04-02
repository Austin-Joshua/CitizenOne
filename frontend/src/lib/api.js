/**
 * Base URL for API calls. Empty string uses same origin (Vite dev proxy → backend).
 */
export function getApiBase() {
  const raw = import.meta.env.VITE_API_URL;

  // In production, we *must* have an API URL to avoid 'Failed to fetch' on Vercel.
  // If missing, we'll try to infer it or at least log a clear warning to the console.
  if (raw == null || raw === '') {
    if (typeof window !== 'undefined' && (window.location.hostname.includes('vercel.app') || window.location.hostname.includes('citizen-one'))) {
       console.warn('VITE_API_URL is missing. API calls will likely fail. Set this in Vercel Dashboard.');
    }
    return '';
  }

  return String(raw).replace(/\/$/, '');
}

export function getAuthToken() {
  return localStorage.getItem('citizen-token') || sessionStorage.getItem('citizen-token');
}

function getRefreshToken() {
  return localStorage.getItem('citizen-refresh-token') || sessionStorage.getItem('citizen-refresh-token');
}

function authStorage() {
  return localStorage.getItem('citizen-token') ? localStorage : sessionStorage;
}

let refreshInFlight = null;

async function performTokenRefresh() {
  const refreshToken = getRefreshToken();
  if (!refreshToken) return false;
  const url = `${getApiBase()}/api/auth/refresh`;
  const refreshHeaders = { 'Content-Type': 'application/json' };
  if (globalThis.crypto?.randomUUID) {
    refreshHeaders['X-Request-Id'] = globalThis.crypto.randomUUID();
  }
  const res = await fetch(url, {
    method: 'POST',
    headers: refreshHeaders,
    body: JSON.stringify({ refreshToken }),
  });
  if (!res.ok) return false;
  const data = await res.json().catch(() => ({}));
  if (!data.token) return false;
  const mem = authStorage();
  mem.setItem('citizen-token', data.token);
  if (data.refreshToken) {
    mem.setItem('citizen-refresh-token', data.refreshToken);
  }
  if (data.user) {
    localStorage.setItem('citizen-auth', JSON.stringify(data.user));
  }
  return true;
}

/**
 * Fetch JSON API routes; attaches auth token when present.
 * On 401, attempts one refresh-token rotation and retries the request.
 */
export async function apiFetch(path, options = {}, attempt = 0) {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
  if (!headers.has('X-Request-Id') && !headers.has('x-request-id') && globalThis.crypto?.randomUUID) {
    headers.set('X-Request-Id', globalThis.crypto.randomUUID());
  }
  if (!headers.has('Content-Type') && options.body && typeof options.body === 'string') {
    headers.set('Content-Type', 'application/json');
  }
  if (token) {
    headers.set('x-auth-token', token);
    if (!headers.has('Authorization')) {
      headers.set('Authorization', `Bearer ${token}`);
    }
  }
  const url = `${getApiBase()}${path.startsWith('/') ? path : `/${path}`}`;
  const res = await fetch(url, { ...options, headers });

  if (res.status === 401 && attempt === 0 && getRefreshToken() && path !== '/api/auth/refresh' && path !== '/api/auth/login') {
    if (!refreshInFlight) {
      refreshInFlight = performTokenRefresh().finally(() => {
        refreshInFlight = null;
      });
    }
    const ok = await refreshInFlight;
    if (ok) return apiFetch(path, options, 1);
  }

  return res;
}

/** Parse JSON `{ message }` or return a safe fallback (no response body echo). */
export async function getErrorMessageFromResponse(res) {
  try {
    const data = await res.clone().json();
    if (data && typeof data.message === 'string') return data.message;
  } catch {
    // ignore
  }
  if (res.status === 401) return 'Session expired or not signed in.';
  if (res.status === 403) return 'You do not have permission for this action.';
  if (res.status === 429) return 'Too many requests. Please wait and try again.';
  if (res.status >= 500) return 'Service temporarily unavailable.';
  return `Request failed (${res.status}).`;
}
