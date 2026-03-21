#!/usr/bin/env node
/**
 * Applies SQL files in ../migrations in lexical order (once each).
 * Usage: DATABASE_URL=... node scripts/migrate.js
 */
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '..', '.env') });
const { Client } = require('pg');

async function main() {
  const conn = process.env.DATABASE_URL;
  if (!conn) {
    console.error('DATABASE_URL is required');
    process.exit(1);
  }
  const client = new Client({ connectionString: conn });
  await client.connect();
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    );
  `);
  const dir = path.join(__dirname, '..', 'migrations');
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.sql')).sort();
  for (const file of files) {
    const { rows } = await client.query('SELECT 1 FROM schema_migrations WHERE version = $1', [file]);
    if (rows.length) continue;
    const sql = fs.readFileSync(path.join(dir, file), 'utf8');
    await client.query('BEGIN');
    try {
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log('Applied migration:', file);
    } catch (e) {
      await client.query('ROLLBACK');
      throw e;
    }
  }
  await client.end();
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
