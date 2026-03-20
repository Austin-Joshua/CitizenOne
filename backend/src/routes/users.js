const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middlewares/auth');
const { getUsers, findUserById } = require('../lib/userStore');
const { readCollection } = require('../lib/dataStore');

router.get('/', [auth, authorize('admin')], (req, res) => {
  const users = getUsers().map(({ password, ...safe }) => safe);
  res.json(users);
});

router.get('/profile', auth, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password, ...safe } = user;
  res.json(safe);
});

router.get('/admin/metrics', [auth, authorize(['admin', 'organization'])], (req, res) => {
  const users = getUsers();
  const applications = readCollection('applications');
  const documents = readCollection('documents');
  const activities = readCollection('activities');
  res.json({
    totalUsers: users.length,
    totalApplications: applications.length,
    totalDocuments: documents.length,
    recentActivity: activities.slice(0, 10),
  });
});

module.exports = router;
