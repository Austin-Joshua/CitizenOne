function isDatabaseEnabled() {
  return Boolean(process.env.DATABASE_URL && String(process.env.DATABASE_URL).trim());
}

module.exports = { isDatabaseEnabled };
