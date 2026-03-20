const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { readCollection } = require('../lib/dataStore');

router.get('/', auth, (req, res) => {
  const activities = readCollection('activities')
    .filter((a) => a.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 25);
  res.json(activities);
});

router.get('/summary', auth, (req, res) => {
  const userId = req.user.id;
  const activities = readCollection('activities').filter((a) => a.userId === userId);
  const applications = readCollection('applications').filter((a) => a.userId === userId);
  const documents = readCollection('documents').filter((d) => d.userId === userId);

  const completedTasks = applications.filter((a) => a.status === 'approved' || a.status === 'completed').length;
  res.json({
    applications: applications.length,
    documents: documents.length,
    completedTasks,
    activities: activities.slice(0, 5),
  });
});

module.exports = router;
