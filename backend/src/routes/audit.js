const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middlewares/auth');
const { readCollection } = require('../lib/dataStore');
const { isDatabaseEnabled } = require('../lib/db/config');
const { getPool } = require('../lib/db/pool');

router.get('/', auth, authorize('admin'), async (req, res) => {
  const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit || '80'), 10) || 80));
  const rows = await readCollection('auditLog');
  res.json({ items: rows.slice(0, limit), totalReturned: Math.min(rows.length, limit) });
});

/**
 * NDJSON stream for SIEM / long-term archive (admin only).
 * Query: since=ISO8601 (optional), limit (default 50000, max 100000)
 */
router.get('/export', auth, authorize('admin'), async (req, res) => {
  const max = Math.min(100000, Math.max(1, parseInt(String(req.query.limit || '50000'), 10) || 50000));
  const since = req.query.since ? new Date(String(req.query.since)) : null;
  if (since && Number.isNaN(since.getTime())) {
    return res.status(400).json({ message: 'Invalid since date' });
  }

  res.setHeader('Content-Type', 'application/x-ndjson; charset=utf-8');
  res.setHeader('Cache-Control', 'no-store');

  if (isDatabaseEnabled()) {
    const pool = getPool();
    const { rows } = await pool.query(
      `SELECT id, ts, actor_id AS "actorId", actor_email AS "actorEmail", action,
              resource_type AS "resourceType", resource_id AS "resourceId", outcome, ip, detail
       FROM audit_log
       WHERE ($1::timestamptz IS NULL OR ts >= $1)
       ORDER BY ts ASC
       LIMIT $2`,
      [since ? since.toISOString() : null, max]
    );
    for (const row of rows) {
      res.write(`${JSON.stringify(row)}\n`);
    }
    return res.end();
  }

  let rows = await readCollection('auditLog');
  if (since) {
    rows = rows.filter((r) => new Date(r.ts) >= since);
  }
  rows = rows.slice(0, max);
  for (const row of rows) {
    res.write(`${JSON.stringify(row)}\n`);
  }
  return res.end();
});

module.exports = router;
