const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');

const schemes = [
  { id: '1', name: 'National Scholarship 2026', category: 'Education', status: 'Active', eligibility: 'Students > 85%' },
  { id: '2', name: 'SME Innovation Grant', category: 'Business', status: 'Active', eligibility: 'Registered Businesses' },
  { id: '3', name: 'Rural Connectivity Fund', category: 'Infrastructure', status: 'Active', eligibility: 'Rural Localities' }
];

router.get('/', auth, (req, res) => {
  res.json(schemes);
});

module.exports = router;
