const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { readCollection, writeCollection, nextId } = require('../lib/dataStore');
const { sanitizeDocumentPayload } = require('../lib/sanitize');
const { appendAudit, clientIp } = require('../lib/auditLog');
const { findUserById } = require('../lib/userStore');

router.get('/', auth, async (req, res) => {
  const docs = await readCollection('documents');
  res.json(docs.filter((d) => d.userId === req.user.id));
});

router.post('/', auth, async (req, res) => {
  const { name, category, type, size, expiresAt } = sanitizeDocumentPayload(req.body || {});
  if (!name) return res.status(400).json({ message: 'Document name is required' });

  const docs = await readCollection('documents');
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
  await writeCollection('documents', docs);

  const activities = await readCollection('activities');
  activities.unshift({
    id: nextId('act', activities),
    userId: req.user.id,
    type: 'document',
    message: `Uploaded ${name}`,
    createdAt: new Date().toISOString(),
  });
  await writeCollection('activities', activities);

  const actor = await findUserById(req.user.id);
  await appendAudit({
    action: 'document.create',
    outcome: 'success',
    actorId: req.user.id,
    actorEmail: actor?.email,
    resourceType: 'document',
    resourceId: document.id,
    ip: clientIp(req),
    detail: name.slice(0, 120),
  });

  res.status(201).json(document);
});

router.delete('/:id', auth, async (req, res) => {
  const docs = await readCollection('documents');
  const found = docs.find((d) => d.id === req.params.id && d.userId === req.user.id);
  const nextDocs = docs.filter((d) => !(d.id === req.params.id && d.userId === req.user.id));
  if (nextDocs.length === docs.length) {
    return res.status(404).json({ message: 'Document not found' });
  }
  await writeCollection('documents', nextDocs);

  const actor = await findUserById(req.user.id);
  await appendAudit({
    action: 'document.delete',
    outcome: 'success',
    actorId: req.user.id,
    actorEmail: actor?.email,
    resourceType: 'document',
    resourceId: req.params.id,
    ip: clientIp(req),
    detail: found?.name?.slice(0, 120),
  });

  return res.status(204).send();
});

module.exports = router;
