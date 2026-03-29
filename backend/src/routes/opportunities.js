const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { readCollection } = require('../lib/dataStore');

const opportunities = [
  { id: 'opp-1', title: 'Senior Software Engineer', company: 'TechCorp', type: 'Full-time', location: 'Remote' },
  { id: 'opp-2', title: 'Data Analyst', company: 'DataVis', type: 'Contract', location: 'Hybrid' },
  { id: 'opp-3', title: 'Frontend Developer', company: 'GlassUI', type: 'Full-time', location: 'Chicago' }
];

router.get('/', auth, async (req, res) => {
  const allApps = await readCollection('applications');
  const apps = allApps.filter((a) => a.userId === req.user.id && a.type === 'opportunity');
  const enriched = opportunities.map((opp) => {
    const app = apps.find((a) => a.targetId === opp.id);
    return {
      ...opp,
      pursued: Boolean(app),
      applicationStatus: app?.status || 'not_started',
    };
  });
  res.json(enriched);
});

module.exports = router;
