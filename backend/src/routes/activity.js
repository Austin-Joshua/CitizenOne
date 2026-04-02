const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { readCollection } = require('../lib/dataStore');
const { normalizeRole, canViewApplicationQueue } = require('../lib/roles');

router.get('/', auth, async (req, res) => {
  const all = await readCollection('activities');
  const activities = all
    .filter((a) => a.userId === req.user.id)
    .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
    .slice(0, 25);
  res.json(activities);
});

router.get('/summary', auth, async (req, res) => {
  const userId = req.user.id;
  const role = normalizeRole(req.user.role);
  const activities = (await readCollection('activities')).filter((a) => a.userId === userId);
  const applications = (await readCollection('applications')).filter((a) => a.userId === userId);
  const documents = (await readCollection('documents')).filter((d) => d.userId === userId);
  const serviceRequests = await readCollection('serviceRequests');
  const allApps = await readCollection('applications');

  const completedTasks = applications.filter((a) => a.status === 'approved' || a.status === 'completed').length;
  const myOpenRequests = serviceRequests.filter(
    (r) => r.userId === userId && ['submitted', 'in_review'].includes(r.status)
  ).length;
  const staffQueueCount =
    role === 'staff' || role === 'admin'
      ? serviceRequests.filter((r) => ['submitted', 'in_review'].includes(r.status)).length
      : null;
  const applicationQueueCount = canViewApplicationQueue(role)
    ? allApps.filter((a) => ['submitted', 'in_progress', 'under_review'].includes(a.status)).length
    : null;

  // --- Sub-status breakdowns for insight cards ---
  const pendingApplications = applications.filter((a) =>
    ['submitted', 'in_progress', 'under_review', 'pending'].includes(a.status)
  ).length;
  const approvedApplications = applications.filter((a) =>
    ['approved', 'completed'].includes(a.status)
  ).length;
  const rejectedApplications = applications.filter((a) =>
    ['rejected', 'denied'].includes(a.status)
  ).length;

  const verifiedDocuments = documents.filter((d) =>
    d.verified === true || d.status === 'verified' || d.status === 'approved'
  ).length;
  const pendingDocuments = documents.filter((d) =>
    d.status === 'pending' || d.status === 'under_review' || (!d.verified && !d.status)
  ).length;

  res.json({
    applications: applications.length,
    documents: documents.length,
    completedTasks,
    activities: activities.slice(0, 5),
    myOpenServiceRequests: myOpenRequests,
    staffServiceQueueCount: staffQueueCount,
    applicationQueueCount,
    // insight breakdowns
    pendingApplications,
    approvedApplications,
    rejectedApplications,
    verifiedDocuments,
    pendingDocuments,
  });
});

module.exports = router;
