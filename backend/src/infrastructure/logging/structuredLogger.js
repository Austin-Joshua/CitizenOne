/**
 * Structured logs for ingestion by Loki, CloudWatch, Datadog, etc.
 * In development, prints readable lines; in production, one JSON object per line.
 */

const isProd = process.env.NODE_ENV === 'production';

function write(level, message, meta = {}) {
  const record = {
    ts: new Date().toISOString(),
    level,
    message,
    ...meta,
  };
  if (isProd) {
    process.stdout.write(`${JSON.stringify(record)}\n`);
  } else {
    const extra = Object.keys(meta).length ? ` ${JSON.stringify(meta)}` : '';
    const fn = level === 'error' ? console.error : level === 'warn' ? console.warn : console.log;
    fn(`[${level}] ${message}${extra}`);
  }
}

const logger = {
  info(message, meta) {
    write('info', message, meta);
  },
  warn(message, meta) {
    write('warn', message, meta);
  },
  error(message, meta) {
    write('error', message, meta);
  },
};

module.exports = { logger };
