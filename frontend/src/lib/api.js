/**
 * Base URL for API calls. Empty string uses same origin (Vite dev proxy → backend).
 */
export function getApiBase() {
  const raw = import.meta.env.VITE_API_URL;
  if (raw == null || raw === '') return '';
  return String(raw).replace(/\/$/, '');
}

export function getAuthToken() {
  return localStorage.getItem('citizen-token') || sessionStorage.getItem('citizen-token');
}

/**
 * Fetch JSON API routes; attaches auth token when present.
 */
export async function apiFetch(path, options = {}) {
  const token = getAuthToken();
  const headers = new Headers(options.headers);
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
  return fetch(url, { ...options, headers });
}
