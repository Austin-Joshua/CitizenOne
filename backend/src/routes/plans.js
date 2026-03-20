const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { readCollection } = require('../lib/dataStore');

router.get('/', auth, (req, res) => {
  res.json(readCollection('plans'));
});

module.exports = router;
