const jwt = require('jsonwebtoken');
const { normalizeRole } = require('../lib/roles');
const { getJwtSecret } = require('../lib/jwtConfig');

function getTokenFromRequest(req) {
  const bearer = req.header('Authorization');
  if (bearer && bearer.startsWith('Bearer ')) {
    return bearer.slice(7).trim();
  }
  return req.header('x-auth-token');
}

const auth = (req, res, next) => {
  const token = getTokenFromRequest(req);

  if (!token) {
    return res.status(401).json({ message: 'No token, authorization denied' });
  }

  try {
    let secret;
    try {
      secret = getJwtSecret();
    } catch (e) {
      console.error('[auth]', e.message);
      return res.status(503).json({ message: 'Service temporarily unavailable' });
    }
    const decoded = jwt.verify(token, secret);
    const id = decoded?.user?.id;
    const role = normalizeRole(decoded?.user?.role);
    if (!id) {
      return res.status(401).json({ message: 'Token is not valid' });
    }
    req.user = { id: String(id), role };
    next();
  } catch (err) {
    res.status(401).json({ message: 'Token is not valid' });
  }
};

const authorize = (roles = []) => {
  if (typeof roles === 'string') {
    roles = [roles];
  }

  return (req, res, next) => {
    const userRole = normalizeRole(req.user?.role);
    if (roles.length && !roles.includes(userRole)) {
      return res.status(403).json({ message: 'Forbidden: You do not have permission' });
    }
    next();
  };
};

/** SSE clients cannot set Authorization; allow one-time access token in query (HTTPS only in production). */
const authSse = (req, res, next) => {
  const q = req.query?.access_token;
  if (q && typeof q === 'string' && !getTokenFromRequest(req)) {
    req.headers.authorization = `Bearer ${q}`;
  }
  return auth(req, res, next);
};

module.exports = { auth, authorize, authSse };
