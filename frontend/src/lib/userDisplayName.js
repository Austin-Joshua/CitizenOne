/**
 * Preferred label for greetings: full name when set, otherwise a readable form of the email local-part.
 */
export function getUserDisplayName(user, fallback = '') {
  const name = (user?.name || '').trim();
  if (name) return name;
  const email = (user?.email || '').trim();
  if (!email.includes('@')) return fallback;
  const local = email.split('@')[0]?.trim();
  if (!local) return fallback;
  return local
    .replace(/[._-]+/g, ' ')
    .split(/\s+/)
    .filter(Boolean)
    .map((w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase())
    .join(' ');
}
