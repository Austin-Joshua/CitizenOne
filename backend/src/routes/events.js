const express = require('express');
const router = express.Router();
const { authSse } = require('../middlewares/auth');
const { eventHub } = require('../lib/eventHub');

/**
 * Server-Sent Events for workspace invalidation (reduces polling).
 * Token via ?access_token= (EventSource cannot send custom headers).
 */
router.get('/stream', authSse, (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream; charset=utf-8');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  if (typeof res.flushHeaders === 'function') res.flushHeaders();

  const send = (obj) => {
    res.write(`data: ${JSON.stringify(obj)}\n\n`);
  };

  const handler = (payload) => {
    send(payload);
  };

  eventHub.on('workspace', handler);
  send({ type: 'connected', at: new Date().toISOString() });

  const ping = setInterval(() => {
    res.write(': ping\n\n');
  }, 25000);

  req.on('close', () => {
    clearInterval(ping);
    eventHub.off('workspace', handler);
  });
});

module.exports = router;
