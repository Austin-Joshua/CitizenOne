const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { readCollection, writeCollection } = require('../lib/dataStore');

const SYSTEM_TEMPLATES = [
  {
    stableId: 'system-uptime',
    type: 'system',
    title: 'Service status',
    body: 'Core services are operating normally.',
  },
  {
    stableId: 'benefit-reminder',
    type: 'benefit',
    title: 'Scheme intelligence',
    body: 'Review recommended programmes under Benefit Discovery when your profile changes.',
  },
];

router.get('/', auth, async (req, res) => {
  const userId = req.user.id;
  const allNotes = await readCollection('inAppNotifications');
  const stored = allNotes
    .filter((n) => n.userId === userId)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 40)
    .map((n, i) => ({
      id: n.id,
      stableId: n.id,
      type: n.type,
      title: n.title,
      body: n.body,
      unread: !n.read,
      at: n.createdAt,
      refType: n.refType,
      refId: n.refId,
    }));

  const now = Date.now();
  const systemItems = SYSTEM_TEMPLATES.map((t, offset) => ({
    id: `sys-${now}-${offset}`,
    stableId: t.stableId,
    type: t.type,
    title: t.title,
    body: t.body,
    unread: false,
    at: new Date(now - offset * 3600000).toISOString(),
  }));

  const items = [...stored, ...systemItems].slice(0, 25);
  res.json({ items });
});

router.patch('/:id/read', auth, async (req, res) => {
  const rows = await readCollection('inAppNotifications');
  const index = rows.findIndex((n) => n.id === req.params.id && n.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'Notification not found' });
  rows[index] = { ...rows[index], read: true };
  await writeCollection('inAppNotifications', rows);
  res.json(rows[index]);
});

module.exports = router;
