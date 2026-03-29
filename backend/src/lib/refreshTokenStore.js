const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { getJwtSecret } = require('./jwtConfig');
const { isDatabaseEnabled } = require('./db/config');
const { getPool } = require('./db/pool');

const filePath = path.join(__dirname, '../data/refreshTokens.json');

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

function hashToken(plain) {
  return crypto.createHmac('sha256', getJwtSecret()).update(String(plain)).digest('hex');
}

function pruneJson(rows) {
  const now = Date.now();
  return rows.filter((r) => r.expiresAt > now);
}

/**
 * @returns {Promise<{ plain: string, record: object }>}
 */
async function issueRefreshToken(userId) {
  const plain = crypto.randomBytes(48).toString('base64url');
  const tokenHash = hashToken(plain);
  const expiresMs =
    (Number(process.env.JWT_REFRESH_DAYS || 7) || 7) * 24 * 60 * 60 * 1000;
  const expiresAt = new Date(Date.now() + expiresMs);

  if (!isDatabaseEnabled()) {
    const record = {
      id: crypto.randomUUID(),
      userId: String(userId),
      tokenHash,
      expiresAt: expiresAt.getTime(),
      createdAt: new Date().toISOString(),
    };
    const rows = pruneJson(readAllJson());
    rows.push(record);
    writeAllJson(rows);
    return { plain, record };
  }

  const { rows } = await getPool().query(
    `INSERT INTO refresh_tokens (user_id, token_hash, expires_at)
     VALUES ($1, $2, $3)
     RETURNING id, user_id AS "userId", token_hash AS "tokenHash", expires_at AS "expiresAt", created_at AS "createdAt"`,
    [String(userId), tokenHash, expiresAt.toISOString()]
  );
  const record = {
    id: rows[0].id,
    userId: rows[0].userId,
    tokenHash: rows[0].tokenHash,
    expiresAt: new Date(rows[0].expiresAt).getTime(),
    createdAt: rows[0].createdAt,
  };
  return { plain, record };
}

/**
 * @returns {Promise<{ userId: string, newPlain: string } | null>}
 */
async function rotateRefreshToken(plain) {
  if (!plain || typeof plain !== 'string') return null;
  const h = hashToken(plain.trim());
  const expiresMs =
    (Number(process.env.JWT_REFRESH_DAYS || 7) || 7) * 24 * 60 * 60 * 1000;
  const newExpires = new Date(Date.now() + expiresMs);

  if (!isDatabaseEnabled()) {
    let rows = pruneJson(readAllJson());
    const now = Date.now();
    const idx = rows.findIndex((r) => r.tokenHash === h && r.expiresAt > now);
    if (idx === -1) return null;
    const { userId } = rows[idx];
    rows.splice(idx, 1);
    const newPlain = crypto.randomBytes(48).toString('base64url');
    const tokenHash = hashToken(newPlain);
    rows.push({
      id: crypto.randomUUID(),
      userId: String(userId),
      tokenHash,
      expiresAt: Date.now() + expiresMs,
      createdAt: new Date().toISOString(),
    });
    writeAllJson(pruneJson(rows));
    return { userId, newPlain };
  }

  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    const sel = await client.query(
      `SELECT id, user_id FROM refresh_tokens
       WHERE token_hash = $1 AND expires_at > now() AND revoked_at IS NULL`,
      [h]
    );
    if (!sel.rows.length) {
      await client.query('ROLLBACK');
      return null;
    }
    const userId = String(sel.rows[0].user_id);
    await client.query(`DELETE FROM refresh_tokens WHERE token_hash = $1`, [h]);
    const newPlain = crypto.randomBytes(48).toString('base64url');
    const newHash = hashToken(newPlain);
    await client.query(
      `INSERT INTO refresh_tokens (user_id, token_hash, expires_at) VALUES ($1, $2, $3)`,
      [userId, newHash, newExpires.toISOString()]
    );
    await client.query('COMMIT');
    return { userId, newPlain };
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

async function revokeRefreshToken(plain) {
  if (!plain) return;
  const h = hashToken(String(plain).trim());
  if (!isDatabaseEnabled()) {
    const rows = readAllJson().filter((r) => r.tokenHash !== h);
    writeAllJson(pruneJson(rows));
    return;
  }
  await getPool().query(`UPDATE refresh_tokens SET revoked_at = now() WHERE token_hash = $1 AND revoked_at IS NULL`, [h]);
}

async function revokeAllForUser(userId) {
  if (!isDatabaseEnabled()) {
    const rows = readAllJson().filter((r) => r.userId !== String(userId));
    writeAllJson(pruneJson(rows));
    return;
  }
  await getPool().query(`DELETE FROM refresh_tokens WHERE user_id = $1`, [String(userId)]);
}

module.exports = {
  issueRefreshToken,
  rotateRefreshToken,
  revokeRefreshToken,
  revokeAllForUser,
};
