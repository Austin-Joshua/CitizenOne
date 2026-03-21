/**
 * Central JWT secret resolution. Production requires a strong secret via environment.
 */
function getJwtSecret() {
  const s = process.env.JWT_SECRET;
  if (process.env.NODE_ENV === 'production') {
    if (!s || s.length < 32) {
      throw new Error('JWT_SECRET must be set to at least 32 characters in production');
    }
    return s;
  }
  if (s && s.length >= 16) return s;
  return s || 'secret';
}

/** Short-lived access JWT (e.g. 15m). Refresh tokens extend the session without long-lived JWTs. */
function getAccessTokenExpiresIn() {
  const v = process.env.JWT_ACCESS_EXPIRES;
  if (v && String(v).trim()) return String(v).trim();
  return '15m';
}

module.exports = { getJwtSecret, getAccessTokenExpiresIn };
