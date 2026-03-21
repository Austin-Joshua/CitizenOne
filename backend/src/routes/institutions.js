const express = require('express');
const crypto = require('crypto');
const { body } = require('express-validator');
const router = express.Router();
const { auth, authorize } = require('../middlewares/auth');
const { handleValidation } = require('../middlewares/validate');
const { normalizeRole } = require('../lib/roles');
const { isDatabaseEnabled } = require('../lib/db/config');
const { getPool } = require('../lib/db/pool');
const { appendAudit, clientIp } = require('../lib/auditLog');

const applyValidators = [
  body('orgName').trim().isLength({ min: 2, max: 200 }).withMessage('Organisation name is required'),
  body('contactEmail').trim().isEmail().normalizeEmail().withMessage('Valid contact email is required'),
  body('metadata').optional().isObject(),
];

router.post('/apply', auth, applyValidators, handleValidation, async (req, res) => {
  if (normalizeRole(req.user.role) !== 'organization') {
    return res.status(403).json({ message: 'Only organisation accounts may submit institutional onboarding.' });
  }
  if (!isDatabaseEnabled()) {
    return res.status(503).json({ message: 'Institutional workflows require PostgreSQL (DATABASE_URL).' });
  }
  const { orgName, contactEmail, metadata = {} } = req.body || {};
  const id = `inst-${crypto.randomUUID()}`;
  const pool = getPool();
  await pool.query(
    `INSERT INTO institution_onboarding (id, org_name, contact_email, applicant_user_id, status, metadata)
     VALUES ($1, $2, $3, $4, 'pending', $5::jsonb)`,
    [id, String(orgName).trim(), String(contactEmail).trim().toLowerCase(), req.user.id, JSON.stringify(metadata)]
  );
  await appendAudit({
    action: 'institution.apply',
    outcome: 'success',
    actorId: req.user.id,
    ip: clientIp(req),
    resourceType: 'institution_onboarding',
    resourceId: id,
    detail: orgName.slice(0, 120),
  });
  return res.status(201).json({
    id,
    status: 'pending',
    message: 'Application received. An administrator will review your organisation details.',
  });
});

router.get('/onboarding', auth, authorize('admin'), async (req, res) => {
  if (!isDatabaseEnabled()) {
    return res.status(503).json({ message: 'Institutional workflows require PostgreSQL.' });
  }
  const limit = Math.min(200, Math.max(1, parseInt(String(req.query.limit || '50'), 10) || 50));
  const { rows } = await getPool().query(
    `SELECT id, org_name AS "orgName", contact_email AS "contactEmail", applicant_user_id AS "applicantUserId",
            status, metadata, created_at AS "createdAt", updated_at AS "updatedAt"
     FROM institution_onboarding ORDER BY created_at DESC LIMIT $1`,
    [limit]
  );
  res.json({ items: rows });
});

const patchValidators = [
  body('status').isIn(['pending', 'approved', 'rejected']).withMessage('Invalid status'),
  body('metadata').optional().isObject(),
];

router.patch('/onboarding/:id', auth, authorize('admin'), patchValidators, handleValidation, async (req, res) => {
  if (!isDatabaseEnabled()) {
    return res.status(503).json({ message: 'Institutional workflows require PostgreSQL.' });
  }
  const { status, metadata } = req.body || {};
  const pool = getPool();
  const hasMeta = metadata !== undefined && metadata !== null;
  const { rows } = await pool.query(
    `UPDATE institution_onboarding SET
       status = $2,
       metadata = CASE WHEN $3 THEN $4::jsonb ELSE metadata END,
       updated_at = now()
     WHERE id = $1
     RETURNING id, org_name AS "orgName", contact_email AS "contactEmail", applicant_user_id AS "applicantUserId",
               status, metadata, created_at AS "createdAt", updated_at AS "updatedAt"`,
    [req.params.id, status, hasMeta, hasMeta ? JSON.stringify(metadata) : null]
  );
  if (!rows.length) return res.status(404).json({ message: 'Record not found' });
  await appendAudit({
    action: 'institution.review',
    outcome: 'success',
    actorId: req.user.id,
    ip: clientIp(req),
    resourceType: 'institution_onboarding',
    resourceId: req.params.id,
    detail: status,
  });
  if (status === 'approved' && rows[0].applicantUserId) {
    await pool.query(`UPDATE users SET institution_onboarding_status = $2, updated_at = now() WHERE id = $1`, [
      rows[0].applicantUserId,
      'approved',
    ]);
  }
  res.json(rows[0]);
});

module.exports = router;
