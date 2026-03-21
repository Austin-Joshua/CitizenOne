const rateLimit = require('express-rate-limit');

const loginLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 12,
  message: { message: 'Too many sign-in attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
  skipSuccessfulRequests: false,
});

const signupLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 8,
  message: { message: 'Registration limit reached for this period. Try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 600,
  standardHeaders: true,
  legacyHeaders: false,
});

const passwordResetLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 8,
  message: { message: 'Too many recovery attempts. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const refreshLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 80,
  message: { message: 'Too many session requests. Please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { loginLimiter, signupLimiter, apiLimiter, passwordResetLimiter, refreshLimiter };
