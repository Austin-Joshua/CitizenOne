const { isDatabaseEnabled } = require('./db/config');
const { isSmtpConfigured } = require('../infrastructure/email/mailer');
const { getJwtSecret } = require('./jwtConfig');
const { logger } = require('../infrastructure/logging/structuredLogger');

/**
 * Validates minimum config for government-style production deploys.
 * Call on process start (fail-fast optional via STRICT_PRODUCTION_CONFIG).
 */
function assertProductionConfig() {
  const isProd = process.env.NODE_ENV === 'production';
  if (!isProd) return;

  const strict = String(process.env.STRICT_PRODUCTION_CONFIG || 'true').toLowerCase() !== 'false';
  const errors = [];

  if (!isDatabaseEnabled()) {
    errors.push('DATABASE_URL must be set in production (PostgreSQL).');
  }

  try {
    const s = getJwtSecret();
    if (!s || s.length < 32) errors.push('JWT_SECRET must be at least 32 characters.');
  } catch {
    errors.push('JWT_SECRET is missing or invalid.');
  }

  if (!process.env.CORS_ORIGIN || !String(process.env.CORS_ORIGIN).trim()) {
    errors.push('CORS_ORIGIN must list allowed browser origins (comma-separated).');
  }

  if (!process.env.PUBLIC_APP_URL || !String(process.env.PUBLIC_APP_URL).trim()) {
    errors.push('PUBLIC_APP_URL must be the HTTPS portal URL used in verification emails.');
  }

  if (!isSmtpConfigured()) {
    errors.push(
      'Outbound email is not configured (set SMTP_HOST, SMTP_PORT, SMTP_FROM, and credentials). Verification and password reset cannot be delivered.'
    );
  }

  if (errors.length) {
    const msg = errors.join(' ');
    if (strict) {
      logger.error('production_config_invalid', { errors });
      throw new Error(`Invalid production configuration: ${msg}`);
    }
    logger.warn('production_config_incomplete', { errors });
  }
}

module.exports = { assertProductionConfig };
