/**
 * One-time migration: hash plaintext passwords in users.json with bcrypt.
 * Run from backend: node scripts/migrate-passwords.js
 */
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const USERS = path.join(__dirname, '../src/data/users.json');
const ROUNDS = 12;
const BCRYPT_RE = /^\$2[aby]\$\d{2}\$/;

(async () => {
  const raw = fs.readFileSync(USERS, 'utf8');
  const users = JSON.parse(raw);
  let n = 0;
  for (const u of users) {
    if (typeof u.password === 'string' && !BCRYPT_RE.test(u.password)) {
      u.password = await bcrypt.hash(u.password, ROUNDS);
      n += 1;
    }
  }
  fs.writeFileSync(USERS, JSON.stringify(users, null, 2), 'utf8');
  console.log(`Migrated ${n} password(s).`);
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
