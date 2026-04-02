const fs = require('fs');
const path = require('path');
const { isDatabaseEnabled, isMongoEnabled } = require('./db/config');
const { getPool } = require('./db/pool');
const { getDb } = require('./db/mongoClient');

const DATA_DIR = path.join(__dirname, '..', 'data');

function collectionFile(name) {
  return path.join(DATA_DIR, `${name}.json`);
}

function readCollectionJson(name) {
  try {
    const raw = fs.readFileSync(collectionFile(name), 'utf8');
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeCollectionJson(name, rows) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
  fs.writeFileSync(collectionFile(name), JSON.stringify(rows, null, 2), 'utf8');
}

/**
 * @param {string} name
 * @returns {Promise<any[]>}
 */
async function readCollection(name) {
  if (isMongoEnabled()) {
    const db = await getDb();
    const rows = await db.collection(name).find({}).toArray();
    return rows.map((r) => {
      const doc = { ...r };
      delete doc._id; // remove mongoose internal id
      return doc;
    });
  }
  if (!isDatabaseEnabled()) {
    return readCollectionJson(name);
  }
  const pool = getPool();
  if (name === 'auditLog') {
    const { rows } = await pool.query(`
      SELECT id, ts,
             actor_id AS "actorId",
             actor_email AS "actorEmail",
             action,
             resource_type AS "resourceType",
             resource_id AS "resourceId",
             outcome,
             ip,
             detail
      FROM audit_log
      ORDER BY ts DESC
      LIMIT 100000
    `);
    return rows;
  }
  const { rows } = await pool.query(
    'SELECT doc_id, body FROM json_collections WHERE collection = $1 ORDER BY doc_id',
    [name]
  );
  return rows.map((r) => {
    const body = r.body && typeof r.body === 'object' ? r.body : {};
    return { ...body, id: body.id != null ? body.id : r.doc_id };
  });
}

function auditRowToColumns(row) {
  return [
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
  ];
}

/**
 * @param {string} name
 * @param {any[]} rows
 */
async function writeCollection(name, rows) {
  if (isMongoEnabled()) {
    const db = await getDb();
    const col = db.collection(name);
    await col.deleteMany({});
    if (rows && rows.length > 0) {
      const toInsert = rows.map((r) => ({
        ...r,
        id: String(r.id ?? `${name}-${Math.random()}`),
      }));
      await col.insertMany(toInsert);
    }
    return;
  }
  if (!isDatabaseEnabled()) {
    writeCollectionJson(name, rows);
    return;
  }
  const pool = getPool();
  const client = await pool.connect();
  try {
    await client.query('BEGIN');
    if (name === 'auditLog') {
      await client.query('DELETE FROM audit_log');
      for (const row of rows) {
        await client.query(
          `INSERT INTO audit_log (id, ts, actor_id, actor_email, action, resource_type, resource_id, outcome, ip, detail)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
          auditRowToColumns(row)
        );
      }
    } else {
      await client.query('DELETE FROM json_collections WHERE collection = $1', [name]);
      for (const row of rows) {
        const docId = String(row.id ?? `${name}-${Math.random()}`);
        await client.query(
          'INSERT INTO json_collections (collection, doc_id, body) VALUES ($1, $2, $3::jsonb)',
          [name, docId, JSON.stringify(row)]
        );
      }
    }
    await client.query('COMMIT');
  } catch (e) {
    await client.query('ROLLBACK');
    throw e;
  } finally {
    client.release();
  }
}

function nextId(prefix, rows) {
  return `${prefix}-${rows.length + 1}-${Date.now()}`;
}

module.exports = {
  readCollection,
  writeCollection,
  nextId,
  readCollectionJson,
  writeCollectionJson,
};
