const { Pool } = require('pg');
const { logger } = require('../../infrastructure/logging/structuredLogger');

let pool;

function getPool() {
  if (!pool) {
    pool = new Pool({
      connectionString: process.env.DATABASE_URL,
      max: Number(process.env.PG_POOL_MAX || 20),
      idleTimeoutMillis: 30000,
    });
    pool.on('error', (err) => {
      logger.error('pg_pool_error', { message: err.message });
    });
  }
  return pool;
}

async function dbHealthCheck() {
  const p = getPool();
  const r = await p.query('SELECT 1 AS ok');
  return r.rows[0]?.ok === 1;
}

function closePool() {
  if (pool) {
    return pool.end();
  }
  return Promise.resolve();
}

module.exports = { getPool, dbHealthCheck, closePool };
