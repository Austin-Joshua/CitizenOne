function isPostgresEnabled() {
  return Boolean(process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim());
}

function isMongoEnabled() {
  const { isMongoEnabled: clientMongoEnabled } = require('./mongoClient');
  return clientMongoEnabled();
}

function isDatabaseEnabled() {
  return isPostgresEnabled() || isMongoEnabled();
}

module.exports = { isDatabaseEnabled, isPostgresEnabled, isMongoEnabled };
