const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');

const documents = [
  { id: '1', name: 'Degree Certificate', type: 'PDF', size: '1.2MB', uploadedAt: '2026-03-10' },
  { id: '2', name: 'Passport Copy', type: 'JPG', size: '500KB', uploadedAt: '2026-03-12' }
];

router.get('/', auth, (req, res) => {
  res.json(documents);
});

module.exports = router;
