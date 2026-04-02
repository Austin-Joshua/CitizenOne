const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { isDatabaseEnabled, isMongoEnabled } = require('./db/config');
const { getPool } = require('./db/pool');
const { getDb } = require('./db/mongoClient');

const USERS_FILE = path.join(__dirname, '..', 'data', 'users.json');
const USERS_EXAMPLE = path.join(__dirname, '..', 'data', 'users.example.json');

function readUsersJson() {
  try {
    const raw = fs.readFileSync(USERS_FILE, 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    try {
      const seedRaw = fs.readFileSync(USERS_EXAMPLE, 'utf8');
      const seed = JSON.parse(seedRaw);
      if (Array.isArray(seed) && seed.length > 0) {
        writeUsersJson(seed);
        return seed;
      }
    } catch {
      /* no example file */
    }
    return [];
  }
}

function writeUsersJson(users) {
  fs.mkdirSync(path.dirname(USERS_FILE), { recursive: true });
  fs.writeFileSync(USERS_FILE, JSON.stringify(users, null, 2), 'utf8');
}

function mapPgRowToUser(row) {
  if (!row) return null;
  return {
    id: row.id,
    email: row.email,
    phone: row.phone, // Support AgriFlux phone field
    password: row.password_hash || row.password,
    name: row.name,
    role: row.role,
    plan: row.plan,
    preferences: row.preferences || {},
    schemeProfile: row.scheme_profile || {},
    emailVerified: row.email_verified,
    mfaEnrolled: row.mfa_enrolled,
    totpSecret: row.totp_secret || undefined,
    stripeCustomerId: row.stripe_customer_id || undefined,
    institutionOnboardingStatus: row.institution_onboarding_status || undefined,
    webauthnCredentials: row.webauthn_credentials || [],
  };
}

function userToPgParams(u) {
  return [
    u.id,
    u.email,
    u.password,
    u.name,
    u.role,
    u.plan || 'free',
    JSON.stringify(u.preferences || {}),
    JSON.stringify(u.schemeProfile || {}),
    u.emailVerified !== false,
    Boolean(u.mfaEnrolled),
    u.totpSecret || null,
    u.stripeCustomerId || null,
    u.institutionOnboardingStatus || null,
    JSON.stringify(u.webauthnCredentials || []),
  ];
}

async function getUsers() {
  if (!isDatabaseEnabled()) return readUsersJson();
  
  if (isMongoEnabled()) {
    const db = await getDb();
    const rows = await db.collection('users').find({}).sort({ createdAt: 1 }).toArray();
    return rows.map(mapPgRowToUser);
  }

  const { rows } = await getPool().query(
    `SELECT id, email, password_hash, name, role, plan, preferences, scheme_profile,
            email_verified, mfa_enrolled, totp_secret, stripe_customer_id, institution_onboarding_status, webauthn_credentials
     FROM users ORDER BY created_at`
  );
  return rows.map(mapPgRowToUser);
}

async function findUserById(id) {
  if (!isDatabaseEnabled()) {
    return readUsersJson().find((u) => u.id === id) || null;
  }
  
  if (isMongoEnabled()) {
    const db = await getDb();
    const row = await db.collection('users').findOne({ id: String(id) });
    return mapPgRowToUser(row);
  }

  const { rows } = await getPool().query(
    `SELECT id, email, password_hash, name, role, plan, preferences, scheme_profile,
            email_verified, mfa_enrolled, totp_secret, stripe_customer_id, institution_onboarding_status, webauthn_credentials
     FROM users WHERE id = $1`,
    [String(id)]
  );
  return mapPgRowToUser(rows[0]);
}

async function findUserByEmail(email) {
  const normalized = String(email || '').trim().toLowerCase();
  if (!isDatabaseEnabled()) {
    return readUsersJson().find((u) => String(u.email).toLowerCase() === normalized) || null;
  }

  if (isMongoEnabled()) {
    const db = await getDb();
    const row = await db.collection('users').findOne({ email: { $regex: new RegExp(`^${normalized}$`, 'i') } });
    return mapPgRowToUser(row);
  }

  const { rows } = await getPool().query(
    `SELECT id, email, password_hash, name, role, plan, preferences, scheme_profile,
            email_verified, mfa_enrolled, totp_secret, stripe_customer_id, institution_onboarding_status, webauthn_credentials
     FROM users WHERE lower(email) = lower($1)`,
    [normalized]
  );
  return mapPgRowToUser(rows[0]);
}

async function createUser(user) {
  if (!isDatabaseEnabled()) {
    const users = readUsersJson();
    users.push(user);
    writeUsersJson(users);
    return user;
  }

  const u = { ...user };
  if (!u.id) u.id = crypto.randomUUID();

  if (isMongoEnabled()) {
    const db = await getDb();
    const toInsert = {
        ...u,
        emailVerified: u.emailVerified !== undefined ? u.emailVerified : false,
        password_hash: u.password, // Preserve password field name for compatibility
        createdAt: new Date()
    };
    try {
        await db.collection('users').insertOne(toInsert);
    } catch (err) {
        if (err.code === 11000) {
            throw new Error('An account with this email already exists');
        }
        throw err;
    }
    return u;
  }

  await getPool().query(
    `INSERT INTO users (id, email, password_hash, name, role, plan, preferences, scheme_profile, email_verified, mfa_enrolled, totp_secret, stripe_customer_id, institution_onboarding_status, webauthn_credentials)
     VALUES ($1,$2,$3,$4,$5,$6,$7::jsonb,$8::jsonb,$9,$10,$11,$12,$13,$14::jsonb)`,
    userToPgParams({ ...u, password: u.password })
  );
  return u;
}

async function updateUser(id, patch) {
  if (!isDatabaseEnabled()) {
    const users = readUsersJson();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...patch };
    writeUsersJson(users);
    return users[index];
  }

  if (isMongoEnabled()) {
    const db = await getDb();
    const mongoPatch = { ...patch };
    if (patch.password) mongoPatch.password_hash = patch.password;
    mongoPatch.updatedAt = new Date();
    
    await db.collection('users').updateOne(
        { id: String(id) },
        { $set: mongoPatch }
    );
    return findUserById(id);
  }

  const current = await findUserById(id);
  if (!current) return null;
  const next = { ...current, ...patch };
  if (patch.password != null) next.password = patch.password;
  await getPool().query(
    `UPDATE users SET
       email = $2,
       password_hash = $3,
       name = $4,
       role = $5,
       plan = $6,
       preferences = $7::jsonb,
       scheme_profile = $8::jsonb,
       email_verified = $9,
       mfa_enrolled = $10,
       totp_secret = $11,
       stripe_customer_id = $12,
       institution_onboarding_status = $13,
       webauthn_credentials = $14::jsonb,
       updated_at = now()
     WHERE id = $1`,
    [
      next.id,
      next.email,
      next.password,
      next.name,
      next.role,
      next.plan || 'free',
      JSON.stringify(next.preferences || {}),
      JSON.stringify(next.schemeProfile || {}),
      next.emailVerified !== false,
      Boolean(next.mfaEnrolled),
      next.totpSecret || null,
      next.stripeCustomerId || null,
      next.institutionOnboardingStatus || null,
      JSON.stringify(next.webauthnCredentials || []),
    ]
  );
  return next;
}

module.exports = {
  getUsers,
  findUserById,
  findUserByEmail,
  createUser,
  updateUser,
};
