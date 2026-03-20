const express = require('express');
const router = express.Router();
const { auth, authorize } = require('../middlewares/auth');

// Mock User Data
const users = [
  { id: '1', name: 'John Citizen', email: 'john@example.com', role: 'citizen' },
  { id: '2', name: 'Admin One', email: 'admin@citizenone.gov', role: 'admin' }
];

// @route   GET api/users
// @desc    Get all users (Admin only)
router.get('/', [auth, authorize('admin')], (req, res) => {
  res.json(users);
});

// @route   GET api/users/profile
// @desc    Get my profile
router.get('/profile', auth, (req, res) => {
  const user = users.find(u => u.id === req.user.id);
  res.json(user);
});

module.exports = router;
