const express = require('express');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { readCollection } = require('../lib/dataStore');
const { getCacheAdapter } = require('../integration/cache/getCacheAdapter');

const CACHE_KEY = 'plans:catalog';

router.get('/', auth, async (req, res) => {
  const cache = getCacheAdapter();
  let hit;
  try {
    hit = await cache.get(CACHE_KEY);
  } catch {
    hit = null;
  }
  if (hit) {
    try {
      return res.json(JSON.parse(hit));
    } catch {
      try {
        await cache.delete(CACHE_KEY);
      } catch {
        /* ignore */
      }
    }
  }
  const data = await readCollection('plans');
  try {
    await cache.set(CACHE_KEY, JSON.stringify(data), Number(process.env.PLANS_CACHE_TTL_SEC || 120));
  } catch {
    // ignore cache write failures
  }
  res.json(data);
});

module.exports = router;
