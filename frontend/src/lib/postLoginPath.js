/**
 * Default `/app/*` route after sign-in. Role comes from the server profile, not UI selection.
 */
export function getPostLoginPath(user) {
  if (!user || typeof user !== 'object') return '/app/dashboard';
  const raw = user.role === 'service_provider' ? 'staff' : String(user.role || 'citizen').toLowerCase();
  if (raw === 'admin') return '/app/admin';
  if (raw === 'staff') return '/app/progress';
  return '/app/dashboard';
}
