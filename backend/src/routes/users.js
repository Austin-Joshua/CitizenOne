const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middlewares/auth');
const { getUsers, findUserById } = require('../lib/userStore');
const { readCollection } = require('../lib/dataStore');

router.get('/', [auth, authorize('admin')], async (req, res) => {
  const users = await getUsers();
  res.json(users.map(({ password, totpSecret, webauthnCredentials, ...safe }) => safe));
});

router.get('/profile', auth, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { password, totpSecret, webauthnCredentials, ...safe } = user;
  res.json(safe);
});

router.get('/admin/metrics', [auth, authorize(['admin', 'organization', 'staff'])], async (req, res) => {
  const users = await getUsers();
  const applications = await readCollection('applications');
  const documents = await readCollection('documents');
  const activities = await readCollection('activities');
  const serviceRequests = await readCollection('serviceRequests');
  const pendingServiceRequests = serviceRequests.filter((r) =>
    ['submitted', 'in_review'].includes(r.status)
  ).length;
  const pendingApplicationReviews = applications.filter((a) =>
    ['submitted', 'in_progress', 'under_review'].includes(a.status)
  ).length;
  res.json({
    totalUsers: users.length,
    totalApplications: applications.length,
    totalDocuments: documents.length,
    pendingServiceRequests,
    pendingApplicationReviews,
    recentActivity: activities.slice(0, 10),
  });
});

module.exports = router;
