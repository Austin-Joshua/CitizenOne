const crypto = require('crypto');
const { readCollection, nextId, readCollectionJson, writeCollectionJson } = require('./dataStore');
const { isDatabaseEnabled } = require('./db/config');
const { getPool } = require('./db/pool');

/**
 * Append an audit record for security-relevant actions. Never store secrets or raw credentials.
 * @returns {Promise<Record<string, unknown>|null>}
 */
async function appendAudit(entry) {
  try {
    const rows = isDatabaseEnabled() ? [] : readCollectionJson('auditLog');
    const row = {
      id: isDatabaseEnabled() ? `aud-${crypto.randomUUID()}` : nextId('aud', rows),
      ts: new Date().toISOString(),
      actorId: entry.actorId != null ? String(entry.actorId) : null,
      actorEmail: entry.actorEmail != null ? String(entry.actorEmail).slice(0, 320) : null,
      action: String(entry.action || 'unknown').slice(0, 120),
      resourceType: entry.resourceType != null ? String(entry.resourceType).slice(0, 64) : null,
      resourceId: entry.resourceId != null ? String(entry.resourceId).slice(0, 128) : null,
      outcome: ['success', 'failure', 'denied'].includes(entry.outcome) ? entry.outcome : 'success',
      ip: entry.ip != null ? String(entry.ip).slice(0, 64) : null,
      detail: entry.detail != null ? String(entry.detail).slice(0, 500) : null,
    };

    if (isDatabaseEnabled()) {
      const pool = getPool();
      await pool.query(
        `INSERT INTO audit_log (id, ts, actor_id, actor_email, action, resource_type, resource_id, outcome, ip, detail)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
        [
          row.id,
          row.ts,
          row.actorId,
          row.actorEmail,
          row.action,
          row.resourceType,
          row.resourceId,
          row.outcome,
          row.ip,
          row.detail,
        ]
      );
      return row;
    }

    rows.unshift(row);
    const capped = rows.slice(0, 5000);
    writeCollectionJson('auditLog', capped);
    return row;
  } catch (e) {
    console.error('[audit] write failed', e.message);
    return null;
  }
}

function clientIp(req) {
  const xf = req.headers['x-forwarded-for'];
  if (typeof xf === 'string' && xf.length) return xf.split(',')[0].trim().slice(0, 64);
  return (req.ip || req.socket?.remoteAddress || '').slice(0, 64);
}

module.exports = { appendAudit, clientIp };
