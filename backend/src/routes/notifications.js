const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');

const templates = [
  {
    stableId: 'system-api-health',
    type: 'system',
    title: 'API health',
    body: 'All regional gateways responding normally.',
  },
  {
    stableId: 'benefit-scheme-match',
    type: 'benefit',
    title: 'New scheme match',
    body: '12 citizens may qualify for the winter energy credit.',
  },
  {
    stableId: 'security-vault-audit',
    type: 'security',
    title: 'Vault audit',
    body: 'Scheduled document integrity check completed with no issues.',
  },
  {
    stableId: 'ops-deployment',
    type: 'ops',
    title: 'Deployment',
    body: 'Citizen Portal patch v2.4.1 promoted to production.',
  },
];

let tick = 0;

// @route GET /api/notifications
router.get('/', auth, (req, res) => {
  const now = Date.now();
  const items = [0, 1, 2].map((offset) => {
    const t = templates[(tick + offset) % templates.length];
    return {
      id: `${now}-${offset}`,
      stableId: t.stableId,
      type: t.type,
      title: t.title,
      body: t.body,
      unread: offset === 0,
      at: new Date(now - offset * 60000).toISOString(),
    };
  });
  tick += 1;
  res.json({ items });
});

module.exports = router;
