const express = require('express');

/**
 * All versioned API routes mounted under `/api` and `/api/v1` (identical behaviour).
 */
function createApiRouter() {
  const router = express.Router();

  router.use('/auth', require('../../routes/auth'));
  router.use('/users', require('../../routes/users'));
  router.use('/ai', require('../../routes/ai'));
  router.use('/schemes', require('../../routes/schemes'));
  router.use('/opportunities', require('../../routes/opportunities'));
  router.use('/documents', require('../../routes/documents'));
  router.use('/notifications', require('../../routes/notifications'));
  router.use('/applications', require('../../routes/applications'));
  router.use('/plans', require('../../routes/plans'));
  router.use('/activity', require('../../routes/activity'));
  router.use('/service-requests', require('../../routes/serviceRequests'));
  router.use('/audit', require('../../routes/audit'));
  router.use('/events', require('../../routes/events'));
  router.use('/institutions', require('../../routes/institutions'));
  router.use('/billing', require('../../routes/billing'));
  router.use('/life-events', require('../../routes/lifeEvents'));
  router.use('/women', require('../../routes/womenRoutes'));
  router.use('/student', require('../../routes/studentRoutes'));
  router.use('/farmer', require('../../routes/farmerRoutes'));

  return router;
}

module.exports = { createApiRouter };
