const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { readCollection, writeCollection, nextId } = require('../lib/dataStore');

router.get('/', auth, (req, res) => {
  const docs = readCollection('documents').filter((d) => d.userId === req.user.id);
  res.json(docs);
});

router.post('/', auth, (req, res) => {
  const { name, category = 'General', type = 'PDF', size = '0KB', expiresAt = null } = req.body || {};
  if (!name) return res.status(400).json({ message: 'Document name is required' });

  const docs = readCollection('documents');
  const document = {
    id: nextId('doc', docs),
    userId: req.user.id,
    name,
    category,
    type,
    size,
    expiresAt,
    uploadedAt: new Date().toISOString(),
  };
  docs.push(document);
  writeCollection('documents', docs);

  const activities = readCollection('activities');
  activities.unshift({
    id: nextId('act', activities),
    userId: req.user.id,
    type: 'document',
    message: `Uploaded ${name}`,
    createdAt: new Date().toISOString(),
  });
  writeCollection('activities', activities);

  res.status(201).json(document);
});

router.delete('/:id', auth, (req, res) => {
  const docs = readCollection('documents');
  const nextDocs = docs.filter((d) => !(d.id === req.params.id && d.userId === req.user.id));
  if (nextDocs.length === docs.length) {
    return res.status(404).json({ message: 'Document not found' });
  }
  writeCollection('documents', nextDocs);
  return res.status(204).send();
});

module.exports = router;
