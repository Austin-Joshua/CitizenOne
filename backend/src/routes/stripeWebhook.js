const stripe = require('stripe');
const { getPool } = require('../lib/db/pool');
const { isDatabaseEnabled } = require('../lib/db/config');
const { logger } = require('../infrastructure/logging/structuredLogger');

function planFromStripe(planKey) {
  const p = String(planKey || '').toLowerCase();
  if (p.includes('premium') || p.includes('pro') || p.includes('paid')) return 'premium';
  return 'free';
}

/**
 * Express handler — mount with express.raw({ type: 'application/json' }).
 */
async function stripeWebhook(req, res) {
  const key = process.env.STRIPE_SECRET_KEY;
  const whSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!key || !whSecret) {
    return res.status(503).json({ message: 'Stripe is not configured' });
  }
  if (!isDatabaseEnabled()) {
    return res.status(503).json({ message: 'Billing webhooks require DATABASE_URL' });
  }

  const sig = req.headers['stripe-signature'];
  let event;
  try {
    const client = stripe(key);
    event = client.webhooks.constructEvent(req.body, sig, whSecret);
  } catch (err) {
    logger.warn('stripe_webhook_signature', { message: err.message });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  const pool = getPool();
  const ins = await pool.query(
    'INSERT INTO stripe_processed_events (id) VALUES ($1) ON CONFLICT (id) DO NOTHING RETURNING id',
    [event.id]
  );
  if (!ins.rowCount) {
    return res.json({ received: true, duplicate: true });
  }

  try {
    if (event.type === 'checkout.session.completed') {
      const s = event.data.object;
      const userId = s.metadata?.userId || s.client_reference_id;
      const customerId = typeof s.customer === 'string' ? s.customer : s.customer?.id;
      if (userId) {
        const planKey = s.metadata?.plan || 'premium';
        await pool.query(
          `INSERT INTO billing_subscriptions (user_id, stripe_customer_id, status, plan_key, updated_at)
           VALUES ($1, $2, 'active', $3, now())
           ON CONFLICT (user_id) DO UPDATE SET
             stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, billing_subscriptions.stripe_customer_id),
             status = EXCLUDED.status,
             plan_key = EXCLUDED.plan_key,
             updated_at = now()`,
          [String(userId), customerId || null, planKey]
        );
        await pool.query(`UPDATE users SET plan = $2, stripe_customer_id = COALESCE($3, stripe_customer_id), updated_at = now() WHERE id = $1`, [
          String(userId),
          planFromStripe(planKey),
          customerId || null,
        ]);
      }
    }

    if (event.type === 'customer.subscription.updated' || event.type === 'customer.subscription.deleted') {
      const sub = event.data.object;
      const customerId = typeof sub.customer === 'string' ? sub.customer : sub.customer?.id;
      const userId = sub.metadata?.userId;
      const status = sub.status;
      const planKey = sub.items?.data?.[0]?.price?.metadata?.plan_key || sub.metadata?.plan || 'premium';
      if (userId) {
        const periodEnd =
          sub.current_period_end != null ? new Date(sub.current_period_end * 1000).toISOString() : null;
        await pool.query(
          `INSERT INTO billing_subscriptions (user_id, stripe_customer_id, stripe_subscription_id, status, plan_key, current_period_end, updated_at)
           VALUES ($1, $2, $3, $4, $5, $6::timestamptz, now())
           ON CONFLICT (user_id) DO UPDATE SET
             stripe_customer_id = COALESCE(EXCLUDED.stripe_customer_id, billing_subscriptions.stripe_customer_id),
             stripe_subscription_id = EXCLUDED.stripe_subscription_id,
             status = EXCLUDED.status,
             plan_key = EXCLUDED.plan_key,
             current_period_end = EXCLUDED.current_period_end,
             updated_at = now()`,
          [String(userId), customerId || null, sub.id, status, planKey, periodEnd]
        );
        const effectivePlan = status === 'active' || status === 'trialing' ? planFromStripe(planKey) : 'free';
        await pool.query(`UPDATE users SET plan = $2, updated_at = now() WHERE id = $1`, [String(userId), effectivePlan]);
      }
    }
  } catch (e) {
    logger.error('stripe_webhook_handler', { message: e.message, eventType: event.type });
    return res.status(500).json({ message: 'Webhook processing failed' });
  }

  return res.json({ received: true });
}

module.exports = { stripeWebhook };
