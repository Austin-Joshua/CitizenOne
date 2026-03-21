const nodemailer = require('nodemailer');
const { logger } = require('../logging/structuredLogger');

let transporter;

function isSmtpConfigured() {
  return Boolean(process.env.SMTP_HOST && String(process.env.SMTP_HOST).trim() && process.env.SMTP_FROM);
}

function getTransporter() {
  if (!isSmtpConfigured()) return null;
  if (!transporter) {
    const port = Number(process.env.SMTP_PORT || 587);
    const secure = String(process.env.SMTP_SECURE || '').toLowerCase() === 'true' || port === 465;
    transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port,
      secure,
      auth:
        process.env.SMTP_USER && process.env.SMTP_PASS
          ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS }
          : undefined,
    });
  }
  return transporter;
}

/**
 * @param {{ to: string, subject: string, text: string, html?: string }} opts
 */
async function sendMail(opts) {
  const tx = getTransporter();
  if (!tx) {
    const err = new Error('Email transport is not configured');
    err.code = 'EMAIL_NOT_CONFIGURED';
    throw err;
  }
  const from = process.env.SMTP_FROM;
  await tx.sendMail({
    from,
    to: opts.to,
    subject: opts.subject,
    text: opts.text,
    html: opts.html || opts.text.replace(/\n/g, '<br/>'),
  });
}

async function sendVerificationEmail(to, verifyUrl) {
  await sendMail({
    to,
    subject: 'Verify your email address',
    text: `Verify your Citizen One account by opening this link (one-time use):\n\n${verifyUrl}\n\nIf you did not create an account, you can ignore this message.`,
  });
}

async function sendPasswordResetEmail(to, resetUrl) {
  await sendMail({
    to,
    subject: 'Password reset requested',
    text: `A password reset was requested for your account. Open this link to choose a new password (expires in one hour):\n\n${resetUrl}\n\nIf you did not request this, ignore this email and ensure your password is strong and unique.`,
  });
}

function logGovNotificationFallback(subject, to, bodyPreview) {
  logger.info('email_fallback_log', {
    subject,
    to,
    note: 'Wire GOV_NOTIFY_API_KEY or SMTP_* for real delivery.',
    preview: String(bodyPreview).slice(0, 200),
  });
}

module.exports = {
  isSmtpConfigured,
  sendMail,
  sendVerificationEmail,
  sendPasswordResetEmail,
  logGovNotificationFallback,
};
