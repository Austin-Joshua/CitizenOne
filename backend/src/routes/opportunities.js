const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');

const opportunities = [
  { id: '1', title: 'Senior Software Engineer', company: 'TechCorp', type: 'Full-time', location: 'Remote' },
  { id: '2', title: 'Data Analyst', company: 'DataVis', type: 'Contract', location: 'Hybrid' },
  { id: '3', title: 'Frontend Developer', company: 'GlassUI', type: 'Full-time', location: 'Chicago' }
];

router.get('/', auth, (req, res) => {
  res.json(opportunities);
});

module.exports = router;
