const express = require('express');
const stripe = require('stripe');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const { findUserById } = require('../lib/userStore');

function publicUrl() {
  return (process.env.PUBLIC_APP_URL || process.env.CORS_ORIGIN?.split(',')[0] || 'http://localhost:5173').replace(/\/$/, '');
}

router.post('/checkout-session', auth, async (req, res) => {
  const key = process.env.STRIPE_SECRET_KEY;
  const priceId = process.env.STRIPE_PRICE_PREMIUM;
  if (!key || !priceId) {
    return res.status(503).json({ message: 'Stripe billing is not configured (STRIPE_SECRET_KEY, STRIPE_PRICE_PREMIUM).' });
  }
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const client = stripe(key);
  const sessionParams = {
    mode: 'subscription',
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${publicUrl()}/app/billing?checkout=success`,
    cancel_url: `${publicUrl()}/app/billing?checkout=cancel`,
    client_reference_id: user.id,
    metadata: { userId: user.id, plan: 'premium' },
    subscription_data: {
      metadata: { userId: user.id, plan: 'premium' },
    },
  };
  if (user.stripeCustomerId) {
    sessionParams.customer = user.stripeCustomerId;
  } else {
    sessionParams.customer_email = user.email;
  }
  const session = await client.checkout.sessions.create(sessionParams);

  return res.json({ url: session.url, id: session.id });
});

module.exports = router;
