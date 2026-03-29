const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getJwtSecret } = require('./jwtConfig');
const { isDatabaseEnabled } = require('./db/config');
const { getPool } = require('./db/pool');

const filePath = path.join(__dirname, '../data/passwordResets.json');

function hashToken(plain) {
  return crypto.createHmac('sha256', getJwtSecret()).update(`pwreset:${String(plain)}`).digest('hex');
}

function readAllJson() {
  try {
    const raw = fs.readFileSync(filePath, 'utf8');
    const data = JSON.parse(raw);
    return Array.isArray(data) ? data : [];
  } catch {
    return [];
  }
}

function writeAllJson(rows) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true });
  fs.writeFileSync(filePath, JSON.stringify(rows, null, 2), 'utf8');
}

function pruneExpiredJson(rows) {
  const now = Date.now();
  return rows.filter((r) => r.expiresAt > now);
}

/**
 * @returns {Promise<{ token: string }>}
 */
async function createTokenForUser(userId, email) {
  const token = crypto.randomBytes(32).toString('base64url');
  const tokenHash = hashToken(token);
  const expiresAt = Date.now() + 60 * 60 * 1000;

  if (!isDatabaseEnabled()) {
    const rows = pruneExpiredJson(readAllJson().filter((r) => !r.consumed));
    rows.push({
      id: crypto.randomUUID(),
      userId: String(userId),
      email: String(email).toLowerCase(),
      tokenHash,
      expiresAt,
      consumed: false,
      createdAt: new Date().toISOString(),
    });
    writeAllJson(rows);
    return { token };
  }

  await getPool().query(
    `INSERT INTO password_reset_tokens (user_id, email, token_hash, expires_at)
     VALUES ($1, $2, $3, $4)`,
    [String(userId), String(email).toLowerCase(), tokenHash, new Date(expiresAt).toISOString()]
  );
  return { token };
}

/**
 * @returns {Promise<{ userId: string, email: string } | null>}
 */
async function findValidByToken(token) {
  if (!token || typeof token !== 'string') return null;
  const h = hashToken(token.trim());

  if (!isDatabaseEnabled()) {
    const rows = readAllJson();
    const now = Date.now();
    const row = rows.find((r) => {
      if (r.consumed || r.expiresAt <= now) return false;
      if (r.tokenHash && r.tokenHash === h) return true;
      if (r.token && String(r.token).trim() === token.trim()) return true;
      return false;
    });
    return row ? { userId: row.userId, email: row.email } : null;
  }

  const { rows } = await getPool().query(
    `SELECT user_id AS "userId", email FROM password_reset_tokens
     WHERE token_hash = $1 AND consumed_at IS NULL AND expires_at > now()`,
    [h]
  );
  return rows[0] ? { userId: String(rows[0].userId), email: rows[0].email } : null;
}

async function markConsumed(token) {
  const h = hashToken(String(token).trim());
  if (!isDatabaseEnabled()) {
    const rows = readAllJson();
    const t = String(token).trim();
    const row = rows.find((r) => r.tokenHash === h || r.token === t);
    if (row) row.consumed = true;
    writeAllJson(pruneExpiredJson(rows));
    return;
  }
  await getPool().query(
    `UPDATE password_reset_tokens SET consumed_at = now() WHERE token_hash = $1 AND consumed_at IS NULL`,
    [h]
  );
}

module.exports = {
  createTokenForUser,
  findValidByToken,
  markConsumed,
};
