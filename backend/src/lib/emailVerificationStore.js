const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getJwtSecret } = require('./jwtConfig');
const { isDatabaseEnabled } = require('./db/config');
const { getPool } = require('./db/pool');

const filePath = path.join(__dirname, '../data/emailVerifications.json');

function hashToken(plain) {
  return crypto.createHmac('sha256', getJwtSecret()).update(`emailver:${String(plain)}`).digest('hex');
}

function readAllJson() {
  try {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeAllJson(rows) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), 'utf8');
}

function pruneJson(rows) {
  const now = Date.now();
  return rows.filter((r) => r.expiresAt > now);
}

/**
 * @returns {Promise<{ token: string }>}
 */
async function createEmailVerificationToken(userId, email) {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const expiresAt = Date.now() + 48 * 60 * 60 * 1000;

  if (!isDatabaseEnabled()) {
    const rows = pruneJson(readAllJson().filter((r) => r.userId !== String(userId)));
    rows.push({
      id: crypto.randomUUID(),
      userId: String(userId),
      email: String(email).toLowerCase(),
      tokenHash,
      expiresAt,
      createdAt: new Date().toISOString(),
    });
    writeAllJson(rows);
    return { token };
  }

  await getPool().query(`DELETE FROM email_verification_tokens WHERE user_id = $1`, [String(userId)]);
  await getPool().query(
    `INSERT INTO email_verification_tokens (user_id, email, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [String(userId), String(email).toLowerCase(), tokenHash, new Date(expiresAt).toISOString()]
  );
  return { token };
}

/**
 * @returns {Promise<{ userId: string, email: string } | null>}
 */
async function consumeEmailVerificationToken(token) {
  if (!token || typeof token !== 'string') return null;
  const h = hashToken(token.trim());

  if (!isDatabaseEnabled()) {
    const rows = readAllJson();
    const now = Date.now();
    const t = token.trim();
    const idx = rows.findIndex((r) => r.expiresAt > now && (r.tokenHash === h || r.token === t));
    if (idx === -1) return null;
    const row = rows[idx];
    rows.splice(idx, 1);
    writeAllJson(pruneJson(rows));
    return { userId: row.userId, email: row.email };
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sel = await client.query(
      `SELECT user_id AS "userId", email FROM email_verification_tokens WHERE token_hash = $1 AND expires_at > now()`,
      [h]
    );
    if (!sel.rows.length) {
      await client.query('ROLLBACK');
      return null;
    }
    await client.query(`DELETE FROM email_verification_tokens WHERE token_hash = $1`, [h]);
    await client.query('COMMIT');
    return { userId: String(sel.rows[0].userId), email: sel.rows[0].email };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

module.exports = {
  createEmailVerificationToken,
  consumeEmailVerificationToken,
};
