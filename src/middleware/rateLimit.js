/**
 * Rate limiting middleware
 * Protects API endpoints from abuse and DoS attacks
 */

const rateLimit = require('express-rate-limit');

const windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '15000');
const maxRequests = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100');

const limiter = rateLimit({
  windowMs,
  max: maxRequests,
  message: 'Too many requests from this IP, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
  skip: (req) => process.env.NODE_ENV === 'development',
});

const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50, // 50 requests per 15 minutes
  message: 'Too many API requests, please try again later',
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = {
  limiter,
  apiLimiter,
};
