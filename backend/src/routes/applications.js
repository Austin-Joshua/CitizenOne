const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { readCollection, writeCollection, nextId } = require('../lib/dataStore');

router.get('/', auth, (req, res) => {
  const apps = readCollection('applications').filter((a) => a.userId === req.user.id);
  res.json(apps);
});

router.post('/', auth, (req, res) => {
  const { type, targetId, title, status = 'submitted', deadline = null } = req.body || {};
  if (!type || !targetId || !title) {
    return res.status(400).json({ message: 'type, targetId, and title are required' });
  }

  const apps = readCollection('applications');
  const existing = apps.find((a) => a.userId === req.user.id && a.type === type && a.targetId === targetId);
  if (existing) {
    return res.status(409).json({ message: 'Application already exists' });
  }

  const app = {
    id: nextId('app', apps),
    userId: req.user.id,
    type,
    targetId,
    title,
    status,
    deadline,
    updatedAt: new Date().toISOString(),
  };
  apps.unshift(app);
  writeCollection('applications', apps);

  const activities = readCollection('activities');
  activities.unshift({
    id: nextId('act', activities),
    userId: req.user.id,
    type: 'application',
    message: `Submitted ${title}`,
    createdAt: new Date().toISOString(),
  });
  writeCollection('activities', activities);

  return res.status(201).json(app);
});

router.patch('/:id', auth, (req, res) => {
  const { status } = req.body || {};
  if (!status) return res.status(400).json({ message: 'status is required' });

  const apps = readCollection('applications');
  const index = apps.findIndex((a) => a.id === req.params.id && a.userId === req.user.id);
  if (index === -1) return res.status(404).json({ message: 'Application not found' });

  apps[index] = { ...apps[index], status, updatedAt: new Date().toISOString() };
  writeCollection('applications', apps);
  return res.json(apps[index]);
});

module.exports = router;
