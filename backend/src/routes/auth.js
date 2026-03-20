const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const { auth } = require('../middlewares/auth');
const { getUsers, findUserById, findUserByEmail, createUser, updateUser } = require('../lib/userStore');

function safeUser(user) {
  const { password, ...rest } = user;
  return rest;
}

function signToken(user, res) {
  const payload = { user: { id: user.id, role: user.role } };
  jwt.sign(payload, process.env.JWT_SECRET || 'secret', { expiresIn: '24h' }, (err, token) => {
    if (err) throw err;
    res.json({ token, user: safeUser(user) });
  });
}

router.post('/signup', (req, res) => {
  const { name, email, password, role = 'citizen', plan = 'free' } = req.body || {};

  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Name, email, and password are required' });
  }
  if (String(password).length < 8) {
    return res.status(400).json({ message: 'Password must be at least 8 characters' });
  }

  const normalizedEmail = String(email).trim().toLowerCase();
  if (findUserByEmail(normalizedEmail)) {
    return res.status(409).json({ message: 'Email already in use' });
  }

  const allowedRole = ['citizen', 'organization', 'service_provider', 'admin'].includes(role) ? role : 'citizen';
  const allowedPlan = ['free', 'premium'].includes(plan) ? plan : 'free';

  const user = {
    id: String(getUsers().length + 1),
    name: String(name).trim(),
    email: normalizedEmail,
    password: String(password),
    role: allowedRole,
    plan: allowedPlan,
    preferences: {
      largeText: false,
      highContrast: false,
      simpleLanguage: false,
      notifyEmailDigest: true,
    },
  };
  createUser(user);

  return signToken(user, res);
});

router.post('/login', (req, res) => {
  const { email, password } = req.body || {};

  try {
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = findUserByEmail(normalizedEmail);
    if (!user || user.password !== password) {
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    return signToken(user, res);
  } catch (err) {
    console.error(err.message);
    return res.status(500).send('Server Error');
  }
});

router.get('/me', auth, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(safeUser(user));
});

router.put('/me', auth, (req, res) => {
  const user = findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { name, preferences, plan } = req.body || {};
  const patch = {};

  if (typeof name === 'string' && name.trim()) {
    patch.name = name.trim();
  }
  if (plan && ['free', 'premium'].includes(plan)) {
    patch.plan = plan;
  }
  if (preferences && typeof preferences === 'object') {
    patch.preferences = {
      ...(user.preferences || {}),
      ...preferences,
    };
  }

  const updated = updateUser(user.id, patch);
  return res.json(safeUser(updated));
});

module.exports = router;
