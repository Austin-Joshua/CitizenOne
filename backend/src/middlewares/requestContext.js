const crypto = require('crypto');

/**
 * Correlates logs and downstream calls. Accepts inbound X-Request-Id or generates one.
 */
function requestContext(req, res, next) {
  const raw = req.get('X-Request-Id') || req.get('x-request-id');
  const trimmed = raw != null ? String(raw).trim().slice(0, 128) : '';
  const id = trimmed.length > 0 ? trimmed : crypto.randomUUID();
  req.requestId = id;
  res.setHeader('X-Request-Id', id);
  next();
}

module.exports = { requestContext };
