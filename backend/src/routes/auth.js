const express = require('express');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');
const { body } = require('express-validator');
const { authenticator } = require('otplib');
const router = express.Router();
const { auth } = require('../middlewares/auth');
const {
  loginLimiter,
  signupLimiter,
  passwordResetLimiter,
  refreshLimiter,
} = require('../middlewares/rateLimits');
const { handleValidation } = require('../middlewares/validate');
const { findUserById, findUserByEmail, createUser, updateUser } = require('../lib/userStore');
const { mergeSchemeProfile } = require('../lib/schemeProfile');
const { normalizeRole, portalMatchesAccount } = require('../lib/roles');
const { createTokenForUser, findValidByToken, markConsumed } = require('../lib/passwordResetStore');
const { hashPassword, verifyPassword } = require('../lib/passwords');
const { appendAudit, clientIp } = require('../lib/auditLog');
const { getJwtSecret, getAccessTokenExpiresIn } = require('../lib/jwtConfig');
const { issueRefreshToken, rotateRefreshToken, revokeRefreshToken, revokeAllForUser } = require('../lib/refreshTokenStore');
const { createEmailVerificationToken, consumeEmailVerificationToken } = require('../lib/emailVerificationStore');
const {
  sendVerificationEmail,
  sendPasswordResetEmail,
  isSmtpConfigured,
  logGovNotificationFallback,
} = require('../infrastructure/email/mailer');
const { logger } = require('../infrastructure/logging/structuredLogger');

authenticator.options = { window: 1 };

function safeUser(user) {
  if (!user) return null;
  const { password, totpSecret, webauthnCredentials, ...rest } = user;
  const role = normalizeRole(rest.role);
  const emailVerified = rest.emailVerified !== false;
  return { ...rest, role, emailVerified };
}

function getPublicAppUrl() {
  const fromEnv = process.env.PUBLIC_APP_URL || process.env.CORS_ORIGIN?.split(',')[0]?.trim();
  return fromEnv || 'http://localhost:5173';
}

function signMfaPending(userId) {
  return jwt.sign({ typ: 'mfa_pend', sub: String(userId) }, getJwtSecret(), { expiresIn: '5m' });
}

function verifyMfaPending(token) {
  const decoded = jwt.verify(String(token || '').trim(), getJwtSecret());
  if (decoded.typ !== 'mfa_pend' || !decoded.sub) {
    throw new Error('invalid_mfa_token');
  }
  return String(decoded.sub);
}

async function sendAuthResponse(res, userRecord) {
  try {
    const user = (await findUserById(userRecord.id)) || userRecord;
    const role = normalizeRole(user.role);
    const accessToken = jwt.sign({ user: { id: user.id, role } }, getJwtSecret(), {
      expiresIn: getAccessTokenExpiresIn(),
    });
    const { plain: refreshToken } = await issueRefreshToken(user.id);
    res.json({
      token: accessToken,
      refreshToken,
      tokenType: 'Bearer',
      user: safeUser(user),
    });
  } catch (e) {
    logger.error('auth_token_issue', { message: e.message });
    res.status(500).json({ message: 'Authentication service misconfigured' });
  }
}

const signupValidators = [
  body('name')
    .trim()
    .customSanitizer((v) => String(v || '').replace(/[<>]/g, ''))
    .isLength({ min: 1, max: 120 })
    .withMessage('Name is required (max 120 characters)'),
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be 8–128 characters'),
  body('role').optional().isIn(['citizen', 'student', 'organization']).withMessage('Invalid role'),
  body('plan').optional().isIn(['free', 'premium']).withMessage('Invalid plan'),
];

const loginValidators = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
  body('password').isLength({ min: 1, max: 200 }).withMessage('Password is required'),
  body('portalRole')
    .optional()
    .isIn(['resident', 'staff', 'organization', 'administrator'])
    .withMessage('Invalid sign-in option'),
];

const resetRequestValidators = [
  body('email').trim().isEmail().normalizeEmail().withMessage('Valid email is required'),
];

const resetValidateValidators = [body('token').trim().isLength({ min: 10, max: 200 }).withMessage('Code is required')];

const resetConfirmValidators = [
  body('token').trim().isLength({ min: 10, max: 200 }).withMessage('Code is required'),
  body('password').isLength({ min: 8, max: 128 }).withMessage('Password must be 8–128 characters'),
];

const mfaLoginValidators = [
  body('mfaPendingToken').trim().isLength({ min: 20, max: 4096 }).withMessage('MFA token is required'),
  body('code').trim().isLength({ min: 6, max: 12 }).withMessage('Code is required'),
];

router.post('/signup', signupLimiter, signupValidators, handleValidation, async (req, res) => {
  try {
    const { name, email, password, role = 'citizen', plan = 'free' } = req.body || {};
    const normalizedEmail = String(email).trim().toLowerCase();
    if (await findUserByEmail(normalizedEmail)) {
      await appendAudit({
        action: 'auth.signup',
        outcome: 'failure',
        actorEmail: normalizedEmail,
        ip: clientIp(req),
        detail: 'Email already registered',
      });
      return res.status(409).json({ message: 'Email already in use' });
    }

    const allowedRole = ['citizen', 'student', 'organization'].includes(String(role).toLowerCase())
      ? String(role).toLowerCase()
      : 'citizen';
    const allowedPlan = ['free', 'premium'].includes(plan) ? plan : 'free';
    const hashed = await hashPassword(password);

    const user = {
      id: crypto.randomUUID(),
      name: String(name).trim(),
      email: normalizedEmail,
      password: hashed,
      role: allowedRole,
      plan: allowedPlan,
      preferences: {
        largeText: false,
        highContrast: false,
        simpleLanguage: false,
        notifyEmailDigest: true,
      },
      mfaEnrolled: false,
      emailVerified: false,
    };
    await createUser(user);

    const { token: verifyToken } = await createEmailVerificationToken(user.id, user.email);
    const verifyUrl = `${getPublicAppUrl().replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(verifyToken)}`;
    if (isSmtpConfigured()) {
      try {
        await sendVerificationEmail(user.email, verifyUrl);
      } catch (e) {
        logger.error('signup_verification_email_failed', { email: user.email, message: e.message });
      }
    } else {
      logGovNotificationFallback('Verify email', user.email, verifyUrl);
      if (process.env.NODE_ENV === 'production') {
        logger.warn('signup_without_smtp', { note: 'Configure SMTP or GOV notify for delivery.' });
      }
    }

    await appendAudit({
      action: 'auth.signup',
      outcome: 'success',
      actorId: user.id,
      actorEmail: user.email,
      ip: clientIp(req),
    });

    return sendAuthResponse(res, user);
  } catch (err) {
    logger.error('auth_signup', { message: err.message });
    return res.status(500).json({ message: 'Registration could not be completed' });
  }
});

router.post('/login', loginLimiter, loginValidators, handleValidation, async (req, res) => {
  try {
    const { email, password, portalRole } = req.body || {};
    const normalizedEmail = String(email || '').trim().toLowerCase();
    const user = await findUserByEmail(normalizedEmail);
    const ok = user && (await verifyPassword(user.password, password));

    if (!ok) {
      await appendAudit({
        action: 'auth.login',
        outcome: 'failure',
        actorEmail: normalizedEmail,
        ip: clientIp(req),
        detail: 'Invalid credentials',
      });
      return res.status(400).json({ message: 'Invalid credentials' });
    }

    if (portalRole && !portalMatchesAccount(portalRole, user.role)) {
      await appendAudit({
        action: 'auth.login',
        outcome: 'failure',
        actorId: user.id,
        actorEmail: user.email,
        ip: clientIp(req),
        detail: 'Portal role mismatch',
      });
      return res.status(400).json({
        message:
          'Sign-in could not be completed. Check your email and password, or choose a different sign-in option that matches your account type.',
      });
    }

    if (user.mfaEnrolled && user.totpSecret) {
      await appendAudit({
        action: 'auth.login_mfa_required',
        outcome: 'success',
        actorId: user.id,
        actorEmail: user.email,
        ip: clientIp(req),
      });
      const mfaPendingToken = signMfaPending(user.id);
      return res.json({
        mfaRequired: true,
        mfaPendingToken,
        message: 'Enter the code from your authenticator app.',
      });
    }

    await appendAudit({
      action: 'auth.login',
      outcome: 'success',
      actorId: user.id,
      actorEmail: user.email,
      ip: clientIp(req),
    });

    return sendAuthResponse(res, user);
  } catch (err) {
    logger.error('auth_login', { message: err.message });
    return res.status(500).json({ message: 'Sign-in could not be completed' });
  }
});

router.post('/login/mfa', loginLimiter, mfaLoginValidators, handleValidation, async (req, res) => {
  try {
    let userId;
    try {
      userId = verifyMfaPending(req.body.mfaPendingToken);
    } catch {
      return res.status(401).json({ message: 'This sign-in step has expired. Sign in again.' });
    }
    const user = await findUserById(userId);
    if (!user || !user.totpSecret || !user.mfaEnrolled) {
      return res.status(401).json({ message: 'Multi-factor sign-in is not available for this account.' });
    }
    const valid = authenticator.verify({ token: String(req.body.code).trim(), secret: user.totpSecret });
    if (!valid) {
      await appendAudit({
        action: 'auth.login_mfa',
        outcome: 'failure',
        actorId: user.id,
        actorEmail: user.email,
        ip: clientIp(req),
        detail: 'Invalid TOTP',
      });
      return res.status(400).json({ message: 'Invalid verification code.' });
    }
    await appendAudit({
      action: 'auth.login',
      outcome: 'success',
      actorId: user.id,
      actorEmail: user.email,
      ip: clientIp(req),
      detail: 'mfa_ok',
    });
    return sendAuthResponse(res, user);
  } catch (err) {
    logger.error('auth_login_mfa', { message: err.message });
    return res.status(500).json({ message: 'Sign-in could not be completed' });
  }
});

const GENERIC_RESET_ACK =
  'If the email address matches an account in this system, recovery instructions have been recorded. Follow the guidance you receive.';

router.post(
  '/password-reset/request',
  passwordResetLimiter,
  resetRequestValidators,
  handleValidation,
  async (req, res) => {
    try {
      const email = String(req.body?.email || '').trim().toLowerCase();
      const user = await findUserByEmail(email);

      if (user) {
        const { token } = await createTokenForUser(user.id, user.email);
        const resetUrl = `${getPublicAppUrl().replace(/\/$/, '')}/login/recovery/confirm?token=${encodeURIComponent(token)}`;
        if (isSmtpConfigured()) {
          try {
            await sendPasswordResetEmail(user.email, resetUrl);
          } catch (e) {
            logger.error('password_reset_email_failed', { message: e.message });
            if (process.env.NODE_ENV === 'production') {
              return res.status(503).json({ message: 'Password reset email could not be sent. Try again later.' });
            }
          }
        } else {
          logGovNotificationFallback('Password reset', user.email, resetUrl);
          if (process.env.NODE_ENV === 'production') {
            return res.status(503).json({
              message: 'Password reset is not available until outbound email is configured for this environment.',
            });
          }
        }
        await appendAudit({
          action: 'auth.password_reset_request',
          outcome: 'success',
          actorId: user.id,
          actorEmail: user.email,
          ip: clientIp(req),
        });
      } else {
        await appendAudit({
          action: 'auth.password_reset_request',
          outcome: 'failure',
          actorEmail: email,
          ip: clientIp(req),
          detail: 'Unknown email',
        });
      }

      return res.json({ message: GENERIC_RESET_ACK });
    } catch (err) {
      logger.error('auth_password_reset_request', { message: err.message });
      return res.status(500).json({ message: 'Recovery could not be started. Try again later.' });
    }
  }
);

router.post(
  '/password-reset/validate',
  passwordResetLimiter,
  resetValidateValidators,
  handleValidation,
  async (req, res) => {
    const row = await findValidByToken(req.body.token);
    return res.json({ valid: Boolean(row) });
  }
);

router.post(
  '/password-reset/confirm',
  passwordResetLimiter,
  resetConfirmValidators,
  handleValidation,
  async (req, res) => {
    try {
      const { token, password } = req.body || {};
      const row = await findValidByToken(token);
      if (!row) {
        return res.status(400).json({ message: 'This verification code is invalid or has expired. Request a new recovery link.' });
      }
      const user = await findUserById(row.userId);
      if (!user) {
        return res.status(400).json({ message: 'Recovery could not be completed. Request a new code.' });
      }
      const hashed = await hashPassword(password);
      await updateUser(user.id, { password: hashed });
      await revokeAllForUser(user.id);
      await markConsumed(token);
      await appendAudit({
        action: 'auth.password_reset_confirm',
        outcome: 'success',
        actorId: user.id,
        actorEmail: user.email,
        ip: clientIp(req),
      });
      return res.json({ message: 'Your password has been updated. You can sign in with your new password.' });
    } catch (err) {
      logger.error('auth_password_reset_confirm', { message: err.message });
      return res.status(500).json({ message: 'Password could not be updated. Try again later.' });
    }
  }
);

router.get('/me', auth, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  return res.json(safeUser(user));
});

router.post('/refresh', refreshLimiter, async (req, res) => {
  try {
    const refreshToken = String(req.body?.refreshToken || '').trim();
    if (!refreshToken) {
      return res.status(400).json({ message: 'Refresh token is required' });
    }
    const rotated = await rotateRefreshToken(refreshToken);
    if (!rotated) {
      return res.status(401).json({ message: 'Session is no longer valid. Sign in again.' });
    }
    const user = await findUserById(rotated.userId);
    if (!user) {
      return res.status(401).json({ message: 'Session is no longer valid. Sign in again.' });
    }
    const role = normalizeRole(user.role);
    const accessToken = jwt.sign({ user: { id: user.id, role } }, getJwtSecret(), {
      expiresIn: getAccessTokenExpiresIn(),
    });
    await appendAudit({
      action: 'auth.refresh',
      outcome: 'success',
      actorId: user.id,
      actorEmail: user.email,
      ip: clientIp(req),
    });
    return res.json({
      token: accessToken,
      refreshToken: rotated.newPlain,
      tokenType: 'Bearer',
      user: safeUser(user),
    });
  } catch (err) {
    logger.error('auth_refresh', { message: err.message });
    return res.status(500).json({ message: 'Session could not be renewed' });
  }
});

router.post('/logout', auth, async (req, res) => {
  try {
    const refreshToken = String(req.body?.refreshToken || '').trim();
    if (refreshToken) await revokeRefreshToken(refreshToken);
    await appendAudit({
      action: 'auth.logout',
      outcome: 'success',
      actorId: req.user.id,
      ip: clientIp(req),
    });
    return res.json({ message: 'Signed out' });
  } catch (err) {
    logger.error('auth_logout', { message: err.message });
    return res.status(500).json({ message: 'Sign-out could not be completed' });
  }
});

router.get('/verify-email', async (req, res) => {
  const token = String(req.query.token || '').trim();
  if (!token) {
    return res.status(400).json({ message: 'Verification link is invalid' });
  }
  const row = await consumeEmailVerificationToken(token);
  if (!row) {
    return res.status(400).json({ message: 'This verification link is invalid or has expired' });
  }
  const user = await findUserById(row.userId);
  if (!user) {
    return res.status(400).json({ message: 'Account not found' });
  }
  await updateUser(user.id, { emailVerified: true });
  await appendAudit({
    action: 'auth.email_verified',
    outcome: 'success',
    actorId: user.id,
    actorEmail: user.email,
    ip: clientIp(req),
  });
  const wantsJson = req.accepts(['html', 'json']) === 'json';
  if (wantsJson) {
    return res.json({ message: 'Email address verified. You may sign in.' });
  }
  return res.redirect(302, `${getPublicAppUrl().replace(/\/$/, '')}/login?verified=1`);
});

router.post('/verify-email/resend', auth, refreshLimiter, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  if (user.emailVerified !== false) {
    return res.json({ message: 'This account does not require email verification.' });
  }
  const { token } = await createEmailVerificationToken(user.id, user.email);
  const verifyUrl = `${getPublicAppUrl().replace(/\/$/, '')}/verify-email?token=${encodeURIComponent(token)}`;
  if (isSmtpConfigured()) {
    try {
      await sendVerificationEmail(user.email, verifyUrl);
    } catch (e) {
      logger.error('verify_resend_email_failed', { message: e.message });
      return res.status(503).json({ message: 'Verification email could not be sent. Try again later.' });
    }
  } else {
    logGovNotificationFallback('Verify email (resend)', user.email, verifyUrl);
    if (process.env.NODE_ENV === 'production') {
      return res.status(503).json({ message: 'Outbound email is not configured.' });
    }
  }
  const debug =
    String(process.env.ALLOW_EMAIL_DEBUG_LINKS || '').toLowerCase() === 'true' ? { debugVerificationUrl: verifyUrl } : {};
  return res.json({
    message: 'A new verification message has been sent if email delivery is configured.',
    ...debug,
  });
});

router.post(
  '/mfa/totp/setup',
  auth,
  refreshLimiter,
  async (req, res) => {
    const user = await findUserById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.mfaEnrolled) {
      return res.status(400).json({ message: 'Multi-factor authentication is already enabled. Disable it before re-enrolling.' });
    }
    const secret = authenticator.generateSecret();
    const otpauthUrl = authenticator.keyuri(user.email, 'Citizen One', secret);
    return res.json({
      secret,
      otpauthUrl,
      message: 'Scan the QR or enter the secret in your authenticator app, then call /mfa/totp/enable with a valid code.',
    });
  }
);

const totpEnableValidators = [
  body('secret').trim().isLength({ min: 10, max: 128 }).withMessage('Secret is required'),
  body('code').trim().isLength({ min: 6, max: 12 }).withMessage('Code is required'),
];

router.post('/mfa/totp/enable', auth, refreshLimiter, totpEnableValidators, handleValidation, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const { secret, code } = req.body || {};
  const ok = authenticator.verify({ token: String(code).trim(), secret: String(secret).trim() });
  if (!ok) return res.status(400).json({ message: 'Invalid code. Check the time on your device and try again.' });
  await updateUser(user.id, { totpSecret: String(secret).trim(), mfaEnrolled: true });
  await appendAudit({
    action: 'auth.mfa_totp_enabled',
    outcome: 'success',
    actorId: user.id,
    actorEmail: user.email,
    ip: clientIp(req),
  });
  return res.json({ message: 'Authenticator protection is now enabled for your account.' });
});

const totpDisableValidators = [
  body('password').isLength({ min: 1, max: 200 }).withMessage('Password is required'),
  body('code').trim().isLength({ min: 6, max: 12 }).withMessage('Code is required'),
];

router.post('/mfa/totp/disable', auth, refreshLimiter, totpDisableValidators, handleValidation, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });
  const pwdOk = await verifyPassword(user.password, req.body.password);
  if (!pwdOk) return res.status(400).json({ message: 'Invalid password.' });
  if (!user.totpSecret) {
    return res.json({ message: 'Multi-factor authentication is not enabled.' });
  }
  const ok = authenticator.verify({ token: String(req.body.code).trim(), secret: user.totpSecret });
  if (!ok) return res.status(400).json({ message: 'Invalid authenticator code.' });
  await updateUser(user.id, { totpSecret: null, mfaEnrolled: false });
  await revokeAllForUser(user.id);
  await appendAudit({
    action: 'auth.mfa_totp_disabled',
    outcome: 'success',
    actorId: user.id,
    actorEmail: user.email,
    ip: clientIp(req),
  });
  return res.json({ message: 'Authenticator protection has been disabled. Sign in again on all devices.' });
});

router.get('/security-features', auth, async (req, res) => {
  const user = await findUserById(req.user.id);
  res.json({
    mfa: {
      enrolled: Boolean(user?.mfaEnrolled),
      totpAvailable: true,
      webauthnAvailable: false,
      webauthnNote:
        'Passkeys / WebAuthn can be added with @simplewebauthn/server and credential storage in users.webauthn_credentials.',
    },
    session: {
      accessToken: getAccessTokenExpiresIn(),
      refreshSlidingDays: Number(process.env.JWT_REFRESH_DAYS || 7) || 7,
      note: 'Access tokens are short-lived; refresh tokens rotate on use.',
    },
  });
});

router.put('/me', auth, async (req, res) => {
  const user = await findUserById(req.user.id);
  if (!user) return res.status(404).json({ message: 'User not found' });

  const { name, preferences, plan } = req.body || {};
  const patch = {};

  if (typeof name === 'string' && name.trim()) {
    patch.name = String(name).replace(/[<>]/g, '').trim().slice(0, 120);
  }
  if (plan && ['free', 'premium'].includes(plan)) {
    patch.plan = plan;
  }
  if (preferences && typeof preferences === 'object') {
    patch.preferences = {
      ...(user.preferences || {}),
      ...preferences,
    };
  }
  if (req.body.schemeProfile && typeof req.body.schemeProfile === 'object') {
    patch.schemeProfile = mergeSchemeProfile(user.schemeProfile || {}, req.body.schemeProfile);
  }

  const updated = await updateUser(user.id, patch);
  await appendAudit({
    action: 'profile.update',
    outcome: 'success',
    actorId: user.id,
    actorEmail: user.email,
    resourceType: 'user',
    resourceId: user.id,
    ip: clientIp(req),
  });
  return res.json(safeUser(updated));
});

module.exports = router;
