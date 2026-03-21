#!/usr/bin/env node
/**
 * One-time import from backend/src/data/*.json into PostgreSQL (after migrations).
 * Usage: DATABASE_URL=... node scripts/import-json-to-pg.js
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Client } = require('pg');

const DATA_DIR = path.join(__dirname, '..', 'src', 'data');

const COLLECTION_FILES = [
  'activities',
  'applications',
  'documents',
  'inAppNotifications',
  'plans',
  'schemeSaves',
  'schemes',
  'serviceRequests',
];

function readJsonArray(name) {
  const p = path.join(DATA_DIR, `${name}.json`);
  try {
    const data = JSON.parse(fs.readFileSync(p, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function mapUser(u) {
  return {
    id: String(u.id),
    email: String(u.email).toLowerCase(),
    password_hash: u.password,
    name: u.name,
    role: u.role,
    plan: u.plan || 'free',
    preferences: u.preferences || {},
    scheme_profile: u.schemeProfile || {},
    email_verified: u.emailVerified !== false,
    mfa_enrolled: Boolean(u.mfaEnrolled),
    totp_secret: u.totpSecret || null,
    stripe_customer_id: u.stripeCustomerId || null,
    institution_onboarding_status: u.institutionOnboardingStatus || null,
    webauthn_credentials: u.webauthnCredentials || [],
  };
}

async function main() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  const client = new Client({ connectionString: conn });
  await client.connect();
  try {
    const users = readJsonArray('users');
    for (const u of users) {
      const m = mapUser(u);
      await client.query(
        `INSERT INTO users (id, email, password_hash, name, role, plan, preferences, scheme_profile, email_verified, mfa_enrolled, totp_secret, stripe_customer_id, institution_onboarding_status, webauthn_credentials)
         VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10,$11,$12,$13,$14::jsonb)
         ON CONFLICT (id) DO UPDATE SET
           email = EXCLUDED.email,
           password_hash = EXCLUDED.password_hash,
           name = EXCLUDED.name,
           role = EXCLUDED.role,
           plan = EXCLUDED.plan,
           preferences = EXCLUDED.preferences,
           scheme_profile = EXCLUDED.scheme_profile,
           email_verified = EXCLUDED.email_verified,
           mfa_enrolled = EXCLUDED.mfa_enrolled,
           totp_secret = EXCLUDED.totp_secret,
           webauthn_credentials = EXCLUDED.webauthn_credentials,
           updated_at = now()`,
        [
          m.id,
          m.email,
          m.password_hash,
          m.name,
          m.role,
          m.plan,
          JSON.stringify(m.preferences),
          JSON.stringify(m.scheme_profile),
          m.email_verified,
          m.mfa_enrolled,
          m.totp_secret,
          m.stripe_customer_id,
          m.institution_onboarding_status,
          JSON.stringify(m.webauthn_credentials || []),
        ]
      );
    }
    console.log('Imported users:', users.length);

    const audit = readJsonArray('auditLog');
    for (const row of audit) {
      await client.query(
        `INSERT INTO audit_log (id, ts, actor_id, actor_email, action, resource_type, resource_id, outcome, ip, detail)
         VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)
         ON CONFLICT (id) DO NOTHING`,
        [
          row.id,
          row.ts,
          row.actorId,
          row.actorEmail,
          row.action,
          row.resourceType,
          row.resourceId,
          row.outcome,
          row.ip,
          row.detail,
        ]
      );
    }
    console.log('Imported audit rows:', audit.length);

    for (const name of COLLECTION_FILES) {
      const rows = readJsonArray(name);
      await client.query('DELETE FROM json_collections WHERE collection = $1', [name]);
      for (const row of rows) {
        const docId = String(row.id || `${name}-${Math.random()}`);
        await client.query(
          'INSERT INTO json_collections (collection, doc_id, body) VALUES ($1, $2, $3)',
          [name, docId, row]
        );
      }
      console.log('Imported collection', name, rows.length);
    }
  } finally {
    await client.end();
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
