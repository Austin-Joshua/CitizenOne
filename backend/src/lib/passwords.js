const bcrypt = require('bcryptjs');

const ROUNDS = 12;
const BCRYPT_RE = /^\$2[aby]\$\d{2}\$/;

function isBcryptHash(value) {
  return typeof value === 'string' && BCRYPT_RE.test(value);
}

async function hashPassword(plain) {
  return bcrypt.hash(String(plain), ROUNDS);
}

/**
 * Verifies password against stored hash. Plaintext storage is not accepted after migration.
 */
async function verifyPassword(stored, plain) {
  if (stored == null || plain == null) return false;
  if (!isBcryptHash(stored)) return false;
  return bcrypt.compare(String(plain), stored);
}

module.exports = {
  isBcryptHash,
  hashPassword,
  verifyPassword,
};
